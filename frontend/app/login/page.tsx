// login page
import { SignIn } from '@clerk/nextjs';

export default function LoginPage() {
  return (
    <main className="flex justify-center items-center min-h-screen">
      <SignIn />
    </main>
  );
}
