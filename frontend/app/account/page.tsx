'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AccountPage() {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [analyses, setAnalyses] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      router.push('/login');
    } else {
      setPortfolios((user?.publicMetadata?.savedPortfolios as any[]) || []);
      setAnalyses((user?.publicMetadata?.savedAnalyses as any[]) || []);
    }
  }, [isLoaded, isSignedIn, router, user]);

  if (!isLoaded) return <p className="text-white p-6">Loading...</p>;

  if (!isSignedIn) return null;

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-[#9D4EDD] mb-6">My Account</h1>

      {/* 📂 Saved Portfolios */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-[#45AFFF] mb-4">
          📂 Saved Portfolios
        </h2>
        {portfolios.length === 0 ? (
          <p className="text-gray-400">You haven't saved any portfolios yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {portfolios.map((p, i) => (
              <div
                key={i}
                className="bg-[#1A1A40] text-white p-4 rounded shadow border border-[#9D4EDD]"
              >
                <h3 className="font-semibold text-lg mb-2">
                  {p.name || `Portfolio ${i + 1}`}
                </h3>
                <p>
                  <strong>Tickers:</strong> {p.tickers.join(", ")}
                </p>
                <p>
                  <strong>Weights:</strong> {p.weights.join(", ")}
                </p>
                <p>
                  <strong>Start:</strong> {p.startDate}
                </p>
                <p>
                  <strong>End:</strong> {p.endDate}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 📊 Saved Analyses */}
      <section>
        <h2 className="text-2xl font-semibold text-[#E041D1] mb-4">
          📊 Saved Analyses
        </h2>
        {analyses.length === 0 ? (
          <p className="text-gray-400">You haven't saved any analyses yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analyses.map((a, i) => (
              <div
                key={i}
                className="bg-[#1A1A40] text-white p-4 rounded shadow border border-[#E041D1]"
              >
                <h3 className="font-semibold text-lg mb-2">
                  {a.portfolio?.name || `Analysis ${i + 1}`}
                </h3>
                <p>
                  <strong>Tickers:</strong> {a.portfolio?.tickers?.join(", ")}
                </p>
                <p>
                  <strong>Weights:</strong> {a.portfolio?.weights?.join(", ")}
                </p>
                <p>
                  <strong>Start:</strong> {a.portfolio?.startDate}
                </p>
                <p>
                  <strong>End:</strong> {a.portfolio?.endDate}
                </p>
                <p>
                  <strong>VaR:</strong> {a.result?.var}
                </p>
                <p>
                  <strong>StDev:</strong> {a.result?.stdev}
                </p>
                <p>
                  <strong>Saved:</strong>{" "}
                  {new Date(a.result?.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
