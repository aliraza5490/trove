"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function NewConversation() {
	const router = useRouter();

	const handleNewChat = () => {
		// TODO: Replace with API call to create a chat, then navigate to that chat.
		const ts = Date.now();
		router.push(`/dashboard?new=${ts}`);
	};

	return (
		<Button onClick={handleNewChat} className="w-full" size="lg">
			<Plus className="size-4" />
			New chat
		</Button>
	);
}
