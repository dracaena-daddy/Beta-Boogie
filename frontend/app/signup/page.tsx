// // signup page
// export default function SignupPage() {
//     return (
//         <main className="p-6">
//             <h1 className="text-3x1 font-bold text-[#9D4EDD]">Sign Up</h1>
//             <p>Create an account</p>
//         </main>
//     );
// }

import { SignUp } from '@clerk/nextjs';

export default function SignupPage() {
  return (
    <main className="flex justify-center items-center min-h-screen">
      <SignUp />
    </main>
  );
}
