// // login page
// export default function LoginPage() {
//     return (
//         <main className="p-6">
//             <h1 className="text-3x1 font-bold text-[#9D4EDD]">Login</h1>
//             <p>Login to your account</p>
//         </main>
//     );
// }

import { SignIn } from '@clerk/nextjs';

export default function LoginPage() {
  return (
    <main className="flex justify-center items-center min-h-screen">
      <SignIn />
    </main>
  );
}
