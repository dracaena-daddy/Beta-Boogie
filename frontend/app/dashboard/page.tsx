// dashboard page
'use client';

import { useUser, useAuth } from '@clerk/nextjs'; 
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import ScrollToTop from '../components/ScrollToTop';

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
      toast.success("Portfolio deleted");
    } catch (err) {
      console.error("❌ Failed to delete portfolio:", err);
      toast.error("Could not delete portfolio");
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
      toast.success("Analysis deleted");
    } catch (err) {
      console.error("❌ Failed to delete analysis:", err);
      toast.error("Could not delete analysis");
    }
  };

  const handleUpdatePortfolioName = async (id: number, name: string) => {
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:8000/api/update-portfolio-name`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, name }),
      });
      if (!res.ok) throw new Error("Failed to update portfolio name");
      toast.success("Portfolio name updated!");
    } catch (err) {
      console.error("❌ Failed to update portfolio name:", err);
      toast.error("Error updating portfolio name");
    }
  };

  const handleUpdateAnalysisName = async (id: number, name: string) => {
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:8000/api/update-analysis-name`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, name }),
      });
      if (!res.ok) throw new Error("Failed to update analysis name");
      toast.success("Analysis name updated!");
    } catch (err) {
      console.error("❌ Failed to update analysis name:", err);
      toast.error("Error updating analysis name");
    }
  };

  const handleExport = async (id: number, format: 'pdf' | 'html') => {
    try {
      const token = await getToken();
      const response = await fetch(`http://localhost:8000/api/export-analysis-${format}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error(`Failed to export analysis as ${format}`);

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analysis-${id}.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(`Error exporting analysis as ${format}:`, err);
      toast.error(`Failed to export as ${format}`);
    }
  };

  if (!isLoaded) return <p className="text-white p-6">Loading...</p>;
  if (!isSignedIn) return null;

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <Toaster position="top-right" />
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
                <input
                  type="text"
                  value={p.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setPortfolios((prev) =>
                      prev.map((item) =>
                        item.id === p.id ? { ...item, name } : item
                      )
                    );
                  }}
                  className="w-full mb-2 px-2 py-1 text-white bg-[#1A1A40] border border-[#9D4EDD] rounded"
                />
                <button
                  onClick={() => handleUpdatePortfolioName(p.id, p.name)}
                  className="mb-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                >
                  Save Name
                </button>
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
                <input
                  type="text"
                  value={a.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setAnalyses((prev) =>
                      prev.map((item) =>
                        item.id === a.id ? { ...item, name } : item
                      )
                    );
                  }}
                  className="w-full mb-2 px-2 py-1 text-white bg-[#1A1A40] border border-[#E041D1] rounded"
                />
                <button
                  onClick={() => handleUpdateAnalysisName(a.id, a.name)}
                  className="mb-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                >
                  Save Name
                </button>
                <p><strong>Tickers:</strong> {a.tickers.join(", ")}</p>
                <p><strong>Weights:</strong> {a.weights.join(", ")}</p>
                <p><strong>Start:</strong> {a.start_date}</p>
                <p><strong>End:</strong> {a.end_date}</p>
                <p><strong>VaR:</strong> {a.var}</p>
                <p><strong>StDev:</strong> {a.stdev}</p>
                <p><strong>Saved:</strong> {new Date(a.created_at).toLocaleString()}</p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleExport(a.id, 'pdf')}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm"
                  >
                    Export as PDF
                  </button>
                  <button
                    onClick={() => handleExport(a.id, 'html')}
                    className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded text-sm"
                  >
                    Export as HTML
                  </button>
                  <button
                    onClick={() => handleDeleteAnalysis(a.id)}
                    className="ml-auto px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      <ScrollToTop/>
    </main>
  );
}
