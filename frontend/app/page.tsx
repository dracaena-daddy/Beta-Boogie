// landing page
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#1A1A40] text-white flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-4xl font-bold text-[#9D4EDD] mb-4">🎧 Welcome to Beta Boogie</h1>

      <Image 
        src="/beta-new-tagline.png"
        alt="Beta Boogie Visual"
        width={400}
        height={600}
        className='rounded-xl shadow-lg mb-6'
        priority
      />

      <p className="text-lg mb-6 max-w-xl">
        Groove with your portfolio’s risk. Analyze historical volatility, Value at Risk, and more —
        all in one fun and powerful financial analytics platform.
      </p>
      <Link
        href="/analyze"
        className="px-6 py-3 bg-[#45AFFF] text-[#1A1A40] rounded-xl font-semibold hover:bg-[#2fa0ff]"
      >
        Start Analyzing →
      </Link>
    </main>
  );
}

