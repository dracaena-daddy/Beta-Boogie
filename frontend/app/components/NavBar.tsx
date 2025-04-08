// // navigation component
// 'use client';

// import Link from 'next/link';
// import Image from 'next/image';
// import { usePathname } from 'next/navigation';
// import clsx from 'clsx';
// import { UserButton, SignedIn, SignedOut } from '@clerk/nextjs';

// const links = [
//   { href: '/', label: 'Home' },
//   { href: '/analyze', label: 'Analyze' },
//   { href: '/dashboard', label: 'Dashboard' },
//   { href: '/docs', label: 'Docs' },
//   { href: '/login', label: 'Login' },
// ];

// export default function NavBar() {
//   const pathname = usePathname();

//   return (
//     <nav className="flex justify-between p-4 bg-[#1A1A40] text-white shadow-md">
//       {/* <div className="text-xl font-bold text-[#9D4EDD]">Beta Boogie</div> */}
//       <div className="text-xl font-bold text-[#9D4EDD]">
//         <Image
//           src="/favicon.ico"
//           width={40}
//           height={40}
//         />
//       </div>
//       <div className="flex gap-4 text-sm">
//         {links.map((link) => (
//           <Link
//             key={link.href}
//             href={link.href}
//             className={clsx(
//               'transition-colors hover:text-[#45AFFF]',
//               pathname === link.href ? 'text-[#45AFFF] font-semibold underline' : 'text-white'
//             )}
//           >
//             {link.label}
//           </Link>
//         ))}
//       </div>
//     </nav>
//   );
// }

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import clsx from 'clsx';

const links = [
  { href: '/', label: 'Home' },
  { href: '/analyze', label: 'Analyze' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/docs', label: 'Docs' },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="flex justify-between items-center p-4 bg-[#1A1A40] text-white shadow-md">
      {/* <div className="text-xl font-bold text-[#9D4EDD]">Beta Boogie</div> */}
      <div>
      <Image
           src="/favicon.ico"
           width={40}
           height={40}
         />
        </div>

      <div className="flex items-center gap-6">
        <div className="flex gap-4 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                'transition-colors hover:text-[#45AFFF]',
                pathname === link.href ? 'text-[#45AFFF] font-semibold underline' : 'text-white'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* If the user is signed in, show the Clerk avatar */}
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>

        {/* If the user is signed out, show Login and Signup */}
        <SignedOut>
          <Link href="/login" className="text-sm hover:text-[#45AFFF]">Login</Link>
          <Link href="/signup" className="text-sm hover:text-[#45AFFF]">Sign Up</Link>
        </SignedOut>
      </div>
    </nav>
  );
}

