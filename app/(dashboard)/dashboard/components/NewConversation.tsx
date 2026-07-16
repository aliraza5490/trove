"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function NewConversation() {
	const router = useRouter();

	const handleNewChat = () => {
		router.push('/dashboard');
		router.refresh();
	};

	return (
		<Button onClick={handleNewChat} className="w-full" size="lg">
			<Plus className="size-4" />
			New chat
		</Button>
	);
}
