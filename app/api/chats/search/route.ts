import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim() || "";

    const chats = await prisma.chat.findMany({
      where: {
        userId,
        ...(query
          ? {
              OR: [
                { title: { contains: query, mode: "insensitive" } },
                {
                  messages: {
                    some: {
                      content: { contains: query, mode: "insensitive" },
                    },
                  },
                },
              ],
            }
          : {}),
      },
      orderBy: { updatedAt: "desc" },
      take: 20,
      select: {
        id: true,
        title: true,
        updatedAt: true,
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            content: true,
            createdAt: true,
          },
        },
      },
    });

    const formattedChats = chats.map((chat) => ({
      id: chat.id,
      title: chat.title,
      updatedAt: chat.updatedAt.toISOString(),
      lastMessage: chat.messages[0]?.content || null,
    }));

    return NextResponse.json({ chats: formattedChats });
  } catch (error: any) {
    console.error("Failed to search chats:", error);
    return NextResponse.json({ error: "Failed to search chats" }, { status: 500 });
  }
}
