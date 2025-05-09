// account page
'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AccountPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/login');
    }
  }, [isLoaded, isSignedIn]);

  if (!isLoaded || !isSignedIn) {
    return <div className="p-6">Loading...</div>; // Optional loader while auth is being checked
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#45AFFF]">Welcome to your account page!</h1>
      <p>You are logged in and can adjust your account settings here.</p>
    </div>
  );
}
