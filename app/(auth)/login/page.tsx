import { auth } from '@/auth';
import { LoginForm } from './components/LoginForm';
import { redirect } from 'next/navigation';

const LoginPage = async () => {
  const session = await auth();
  if (session?.user) return redirect('/dashboard');

  return <LoginForm />;
};

export default LoginPage;
