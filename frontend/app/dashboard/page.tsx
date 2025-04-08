// dashboard page
'use client';

import { useUser, useAuth } from '@clerk/nextjs'; 
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();

  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      router.push('/login');
    } else {
      const fetchPortfolios = async () => {
        try {
          const token = await getToken();
          const res = await fetch('http://localhost:8000/api/load-portfolios', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error("Failed to load portfolios");
          const data = await res.json();
          setPortfolios(data);
        } catch (err) {
          console.error("Error loading portfolios:", err);
          setError("Could not load portfolios.");
        }
      };

      const fetchAnalyses = async () => {
        try {
          const token = await getToken();
          const res = await fetch('http://localhost:8000/api/load-analyses', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error("Failed to load analyses");
          const data = await res.json();
          setAnalyses(data);
        } catch (err) {
          console.error("Error loading analyses:", err);
          setError("Could not load analyses.");
        }
      };

      fetchPortfolios();
      fetchAnalyses();
    }
  }, [isLoaded, isSignedIn, router, getToken]);

  const handleDeletePortfolio = async (portfolioId: number) => {
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:8000/api/delete-portfolio/${portfolioId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete portfolio");
      setPortfolios((prev) => prev.filter((p) => p.id !== portfolioId));
    } catch (err) {
      console.error("❌ Failed to delete portfolio:", err);
      alert("Could not delete portfolio.");
    }
  };

  const handleDeleteAnalysis = async (analysisId: number) => {
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:8000/api/delete-analysis/${analysisId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete analysis");
      setAnalyses((prev) => prev.filter((a) => a.id !== analysisId));
    } catch (err) {
      console.error("❌ Failed to delete analysis:", err);
      alert("Could not delete analysis.");
    }
  };

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
                <p><strong>Tickers:</strong> {p.tickers.join(", ")}</p>
                <p><strong>Weights:</strong> {p.weights.join(", ")}</p>
                <p><strong>Start:</strong> {p.startDate}</p>
                <p><strong>End:</strong> {p.endDate}</p>
                <button
                  onClick={() => handleDeletePortfolio(p.id)}
                  className="mt-3 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                >
                  Delete
                </button>
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
                  {a.name || `Analysis ${i + 1}`}
                </h3>
                <p><strong>Tickers:</strong> {a.tickers.join(", ")}</p>
                <p><strong>Weights:</strong> {a.weights.join(", ")}</p>
                <p><strong>Start:</strong> {a.start_date}</p>
                <p><strong>End:</strong> {a.end_date}</p>
                <p><strong>VaR:</strong> {a.var}</p>
                <p><strong>StDev:</strong> {a.stdev}</p>
                <p><strong>Saved:</strong> {new Date(a.created_at).toLocaleString()}</p>
                <button
                  onClick={() => handleDeleteAnalysis(a.id)}
                  className="mt-3 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
