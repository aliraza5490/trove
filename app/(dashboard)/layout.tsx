import Image from 'next/image';
import Link from 'next/link';
import NewConversation from '@/app/(dashboard)/dashboard/components/NewConversation';
import RecentChats from '@/app/(dashboard)/dashboard/components/RecentChats';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { NavUser } from '@/app/(dashboard)/dashboard/components/NavUser';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Link href="/dashboard" className="flex items-center px-2 w-full">
            <Image src="/logo-cropped.png" alt="Trove" width={120} height={120} className="mx-auto block my-3" />
          </Link>
          <NewConversation />
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Recent chats</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <RecentChats />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarSeparator />
        <SidebarFooter>
          <NavUser user={{ name: 'John Doe', email: 'john@example.com', avatar: '/images/max.jpg' }} />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <div className="flex h-12 items-center gap-2 border-b px-3">
          <SidebarTrigger />
          <div className="text-sm text-muted-foreground">Dashboard</div>
        </div>
        <div className="min-h-[calc(100dvh-3rem)]">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}