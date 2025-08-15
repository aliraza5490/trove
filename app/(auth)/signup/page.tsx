import { auth } from "@/auth";
import { SignupForm } from "./components/SignupForm";
import { redirect } from "next/dist/client/components/navigation";

const SignupPage = async () => {
    const session = await auth()
    if (session?.user) return redirect('/dashboard')
  
  return (
    <div>
        <SignupForm />
    </div>
  );
}

export default SignupPage;