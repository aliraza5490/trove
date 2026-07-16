import { FileAttachment } from '../types';

export function formatAttachments(attachments: FileAttachment[]): string {
  if (!attachments || attachments.length === 0) return "";
  return "Attached Document Contents:\n" + attachments.map((a) => `[File Name: ${a.name}]\n${a.content}`).join("\n\n");
}
