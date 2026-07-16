import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new NextResponse('Bad Request: File is required', { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true });

    // Generate a unique safe filename
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const safeFileName = `${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(uploadDir, safeFileName);

    // Save the file
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${safeFileName}`;

    // Upload to Google GenAI immediately if api key is available
    const googleApiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    let googleUri: string | null = null;
    
    if (googleApiKey) {
      try {
        console.log(`Uploading file to Google via API upload route: ${filePath}`);
        const ai = new GoogleGenAI({ apiKey: googleApiKey });
        const uploadResult = await ai.files.upload({
          file: filePath,
          config: {
            mimeType: file.type || undefined,
          },
        });

        if (uploadResult.name) {
          let fileState = await ai.files.get({ name: uploadResult.name });
          while (fileState.state === 'PROCESSING') {
            console.log(`File is processing at Google, waiting 1.5s...`);
            await new Promise((resolve) => setTimeout(resolve, 1500));
            fileState = await ai.files.get({ name: uploadResult.name });
          }
          googleUri = uploadResult.uri || null;
          console.log(`File uploaded successfully to Google via API upload route. URI: ${googleUri}`);
        }
      } catch (err) {
        console.error("Failed to upload file to Google GenAI in upload route:", err);
      }
    }

    return NextResponse.json({
      name: file.name,
      url: fileUrl,
      googleUri,
      mimeType: file.type,
      size: file.size,
    });
  } catch (error: any) {
    console.error("Upload API route error:", error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}
