'use server';

import prisma from '@/lib/db';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function renameChat(chatId: string, title: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
  });

  if (!chat || chat.userId !== userId) {
    throw new Error("Chat not found or unauthorized");
  }

  await prisma.chat.update({
    where: { id: chatId },
    data: { title },
  });

  revalidatePath('/dashboard');
}

export async function deleteChat(chatId: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
  });

  if (!chat || chat.userId !== userId) {
    throw new Error("Chat not found or unauthorized");
  }

  await prisma.chat.delete({
    where: { id: chatId },
  });

  revalidatePath('/dashboard');
}
