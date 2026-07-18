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
import { ThemeToggle } from '@/components/theme-toggle';
import { auth } from '@/auth';
import Logo from "@/components/logo";
import { redirect } from "next/navigation";

import { TopNav } from '@/app/(dashboard)/dashboard/components/TopNav';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return redirect('/login');
  }


  const avatar = '/images/max.jpg';

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo link="/dashboard" className="justify-start px-2" />
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
          <NavUser user={{ name: user?.name ?? 'User', email: (user as any)?.email ?? 'user@example.com', avatar }} />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <TopNav />
        <div className="min-h-[calc(100dvh-3.25rem)]">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}