import { Bot } from "lucide-react";
import Meeples from './_components/Meeples';
import Link from "next/link";
import Logo from "@/components/logo";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative flex h-screen">
      <div className="w-full lg:w-1/2 h-full grid place-items-center px-12">
        <div className="w-full">
          <Logo />
          <main className="w-full gap-10 max-w-xl mx-auto">
            {children}
          </main>
        </div>
      </div>
      <div className="hidden w-1/2 h-full lg:block bg-gray-100">
        <Meeples />
      </div>
    </div>
  );
};

export default AuthLayout;
