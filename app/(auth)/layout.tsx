import Meeples from './_components/Meeples';

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative flex h-screen">
      <div className="w-full lg:w-1/2 h-full grid place-items-center px-12">
        <div className="w-full">
          <img
            src="/logo.png"
            alt="Image"
            className="mx-auto h-30 w-60 rounded-full object-cover"
          />
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
