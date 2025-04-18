// 'use client';

// import { useUser, useAuth } from '@clerk/nextjs';
// import { useRouter } from 'next/navigation';
// import { useEffect, useState } from 'react';
// import toast, { Toaster } from 'react-hot-toast';
// import ScrollToTop from '../components/ScrollToTop';
// import clsx from 'clsx';

// export default function DashboardPage() {
//   const router = useRouter();
//   const { isLoaded, isSignedIn } = useUser();
//   const { getToken } = useAuth();

//   const [portfolios, setPortfolios] = useState<any[]>([]);
//   const [analyses, setAnalyses] = useState<any[]>([]);
//   const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
//   const [tab, setTab] = useState<'portfolios' | 'analyses'>('portfolios');
//   const [searchTerm, setSearchTerm] = useState('');

//   const toggle = (id: number) =>
//     setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

//   const matchesSearch = (item: any) =>
//     item.name.toLowerCase().includes(searchTerm.toLowerCase());

//   useEffect(() => {
//     if (!isLoaded) return;
//     if (!isSignedIn) router.push('/login');

//     const fetchData = async () => {
//       const token = await getToken();

//       const [portfolioRes, analysisRes] = await Promise.all([
//         fetch('http://localhost:8000/api/load-portfolios', {
//           headers: { Authorization: `Bearer ${token}` },
//         }),
//         fetch('http://localhost:8000/api/load-analyses', {
//           headers: { Authorization: `Bearer ${token}` },
//         }),
//       ]);

//       const portfolios = await portfolioRes.json();
//       const analyses = await analysisRes.json();
//       setPortfolios(portfolios);
//       setAnalyses(analyses);
//     };

//     fetchData();
//   }, [isLoaded, isSignedIn, router, getToken]);

//   // ==== actions trimmed for brevity ====

//   const handleExport = async (id: number, format: 'pdf' | 'html') => {
//     const token = await getToken();
//     const res = await fetch(`http://localhost:8000/api/export-analysis-${format}/${id}`, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     const blob = await res.blob();
//     const url = window.URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.href = url;
//     link.download = `analysis-${id}.${format}`;
//     link.click();
//     link.remove();
//     window.URL.revokeObjectURL(url);
//   };

//   if (!isLoaded || !isSignedIn) return <p className="text-white p-6">Loading...</p>;

//   const items = tab === 'portfolios' ? portfolios : analyses;
//   const filtered = items.filter(matchesSearch);

//   const handleDeletePortfolio = async (id: number) => {
//     try {
//       const token = await getToken();
//       const res = await fetch(`http://localhost:8000/api/delete-portfolio/${id}`, {
//         method: 'DELETE',
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (!res.ok) throw new Error("Failed to delete portfolio");
//       setPortfolios((prev) => prev.filter((p) => p.id !== id));
//       toast.success("Portfolio deleted");
//     } catch (err) {
//       console.error("❌ Failed to delete portfolio:", err);
//       toast.error("Could not delete portfolio");
//     }
//   };
  
//   const handleDeleteAnalysis = async (id: number) => {
//     try {
//       const token = await getToken();
//       const res = await fetch(`http://localhost:8000/api/delete-analysis/${id}`, {
//         method: 'DELETE',
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (!res.ok) throw new Error("Failed to delete analysis");
//       setAnalyses((prev) => prev.filter((a) => a.id !== id));
//       toast.success("Analysis deleted");
//     } catch (err) {
//       console.error("❌ Failed to delete analysis:", err);
//       toast.error("Could not delete analysis");
//     }
//   };
  

//   return (
//     <main className="p-6 max-w-5xl mx-auto">
//       <Toaster position="top-right" />
//       <h1 className="text-3xl font-bold text-[#9D4EDD] mb-6">My Account</h1>

//       {/* Tabs */}
//       <div className="mb-4 flex gap-4">
//         <button
//           onClick={() => setTab('portfolios')}
//           className={clsx(
//             'px-4 py-2 rounded-full text-sm font-semibold',
//             tab === 'portfolios'
//               ? 'bg-[#45AFFF] text-white'
//               : 'bg-gray-800 text-gray-300'
//           )}
//         >
//           📂 Portfolios
//         </button>
//         <button
//           onClick={() => setTab('analyses')}
//           className={clsx(
//             'px-4 py-2 rounded-full text-sm font-semibold',
//             tab === 'analyses'
//               ? 'bg-[#E041D1] text-white'
//               : 'bg-gray-800 text-gray-300'
//           )}
//         >
//           📊 Analyses
//         </button>
//       </div>

//       {/* Search Bar */}
//       <input
//         type="text"
//         placeholder={`Search saved ${tab}...`}
//         value={searchTerm}
//         onChange={(e) => setSearchTerm(e.target.value)}
//         className="w-full mb-6 px-4 py-2 rounded border border-gray-600 bg-[#1A1A40] text-white"
//       />

//       {/* Results */}
//       <div className="space-y-4">
//         {filtered.length === 0 ? (
//           <p className="text-gray-400">No saved {tab} found.</p>
//         ) : (
//           filtered.map((item: angggy) => (
//             <div
//               key={item.id}
//               className={clsx(
//                 'bg-[#1A1A40] text-white rounded shadow border transition-all duration-300 overflow-hidden',
//                 tab === 'portfolios' ? 'border-[#9D4EDD]' : 'border-[#E041D1]'
//               )}
//             >
//               <div className="flex justify-between items-center p-4">
//                 <div>
//                   <strong>{item.name}</strong>
//                   <p className="text-sm text-gray-400">
//                     Saved: {new Date(item.created_at).toLocaleString()}
//                   </p>
//                 </div>
//                 <button
//                   onClick={() => toggle(item.id)}
//                   className="text-sm text-blue-300 underline"
//                 >
//                   {expanded[item.id] ? 'Hide Details' : 'Show Details'}
//                 </button>
//               </div>

//               <div
//                 className={clsx(
//                   'transition-all duration-300 px-4 pb-4',
//                   expanded[item.id] ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
//                 )}
//               >
//                 {tab === 'portfolios' ? (
//                   <>
//                     <p><strong>Tickers:</strong> {item.tickers.join(', ')}</p>
//                     <p><strong>Weights:</strong> {item.weights.join(', ')}</p>
//                     <p><strong>Start:</strong> {item.startDate}</p>
//                     <p><strong>End:</strong> {item.endDate}</p>
//                     <button
//                       onClick={() => handleDeletePortfolio(item.id)}
//                       className="mt-3 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
//                     >
//                       Delete
//                     </button>
//                   </>
//                 ) : (
//                   <>
//                     <p><strong>Tickers:</strong> {item.tickers.join(', ')}</p>
//                     <p><strong>Weights:</strong> {item.weights.join(', ')}</p>
//                     <p><strong>Start:</strong> {item.start_date}</p>
//                     <p><strong>End:</strong> {item.end_date}</p>
//                     <p><strong>VaR (95%):</strong> {item.var_95?.toFixed(4)}</p>
//                     <p><strong>CVaR (95%):</strong> {item.cvar_95?.toFixed(4)}</p>
//                     <p><strong>Sharpe Ratio:</strong> {item.sharpe_ratio?.toFixed(4)}</p>
//                     <p><strong>Sortino Ratio:</strong> {item.sortino_ratio?.toFixed(4)}</p>
//                     <p><strong>Max Drawdown:</strong> {(item.max_drawdown * 100).toFixed(2)}%</p>
//                     <p><strong>Standard Deviation:</strong> {item.stddev?.toFixed(4)}</p>
//                     <div className="flex gap-2 mt-3">
//                       <button
//                         onClick={() => handleExport(item.id, 'pdf')}
//                         className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm"
//                       >
//                         Export PDF
//                       </button>
//                       <button
//                         onClick={() => handleExport(item.id, 'html')}
//                         className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded text-sm"
//                       >
//                         Export HTML
//                       </button>
//                       <button
//                         onClick={() => handleDeleteAnalysis(item.id)}
//                         className="ml-auto px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
//                       >
//                         Delete
//                       </button>
//                     </div>
//                   </>
//                 )}
//               </div>
//             </div>
//           ))
//         )}
//       </div>

//       <ScrollToTop />
//     </main>
//   );
// }

'use client';

import { useUser, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import ScrollToTop from '../components/ScrollToTop';
import clsx from 'clsx';

export default function DashboardPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();

  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [tab, setTab] = useState<'portfolios' | 'analyses'>('portfolios');
  const [searchTerm, setSearchTerm] = useState('');

  const toggle = (id: number) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const matchesSearch = (item: any) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase());

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) router.push('/login');

    const fetchData = async () => {
      const token = await getToken();

      const [portfolioRes, analysisRes] = await Promise.all([
        fetch('http://localhost:8000/api/load-portfolios', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('http://localhost:8000/api/load-analyses', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const portfolios = await portfolioRes.json();
      const analyses = await analysisRes.json();
      setPortfolios(portfolios);
      setAnalyses(analyses);
    };

    fetchData();
  }, [isLoaded, isSignedIn, router, getToken]);

  const handleDeletePortfolio = async (id: number) => {
    const token = await getToken();
    await fetch(`http://localhost:8000/api/delete-portfolio/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setPortfolios((prev) => prev.filter((p) => p.id !== id));
    toast.success("Portfolio deleted");
  };

  const handleDeleteAnalysis = async (id: number) => {
    const token = await getToken();
    await fetch(`http://localhost:8000/api/delete-analysis/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setAnalyses((prev) => prev.filter((a) => a.id !== id));
    toast.success("Analysis deleted");
  };

  const handleUpdatePortfolioName = async (id: number, name: string) => {
    const token = await getToken();
    await fetch(`http://localhost:8000/api/update-portfolio-name`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, name }),
    });
    toast.success("Portfolio name updated!");
  };

  const handleUpdateAnalysisName = async (id: number, name: string) => {
    const token = await getToken();
    await fetch(`http://localhost:8000/api/update-analysis-name`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, name }),
    });
    toast.success("Analysis name updated!");
  };

  const handleExport = async (id: number, format: 'pdf' | 'html') => {
    const token = await getToken();
    const res = await fetch(`http://localhost:8000/api/export-analysis-${format}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analysis-${id}.${format}`;
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  if (!isLoaded || !isSignedIn) return <p className="text-white p-6">Loading...</p>;

  const items = tab === 'portfolios' ? portfolios : analyses;
  const filtered = items.filter(matchesSearch);

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <Toaster position="top-right" />
      <h1 className="text-3xl font-bold text-[#9D4EDD] mb-6">Analysis Dashboard</h1>

      {/* Tabs */}
      <div className="mb-4 flex gap-4">
        <button
          onClick={() => setTab('portfolios')}
          className={clsx(
            'px-4 py-2 rounded-full text-sm font-semibold',
            tab === 'portfolios'
              ? 'bg-[#45AFFF] text-white'
              : 'bg-gray-800 text-gray-300'
          )}
        >
          📂 Portfolios
        </button>
        <button
          onClick={() => setTab('analyses')}
          className={clsx(
            'px-4 py-2 rounded-full text-sm font-semibold',
            tab === 'analyses'
              ? 'bg-[#E041D1] text-white'
              : 'bg-gray-800 text-gray-300'
          )}
        >
          📊 Analyses
        </button>
      </div>

      {/* Search Bar */}
      <input
        type="text"
        placeholder={`Search saved ${tab}...`}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full mb-6 px-4 py-2 rounded border border-gray-600 bg-[#1A1A40] text-white"
      />

      {/* Results */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <p className="text-gray-400">No saved {tab} found.</p>
        ) : (
          filtered.map((item: any) => (
            <div
              key={item.id}
              className={clsx(
                'bg-[#1A1A40] text-white rounded shadow border transition-all duration-300 overflow-hidden',
                tab === 'portfolios' ? 'border-[#9D4EDD]' : 'border-[#E041D1]'
              )}
            >
              <div className="flex justify-between items-center p-4">
                <div className="w-full">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const updater = tab === 'portfolios' ? setPortfolios : setAnalyses;
                      updater((prev) =>
                        prev.map((i) =>
                          i.id === item.id ? { ...i, name } : i
                        )
                      );
                    }}
                    className="w-full px-2 py-1 text-white bg-[#1A1A40] border border-gray-600 rounded"
                  />
                  <button
                    onClick={() =>
                      tab === 'portfolios'
                        ? handleUpdatePortfolioName(item.id, item.name)
                        : handleUpdateAnalysisName(item.id, item.name)
                    }
                    className="mt-2 text-sm px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
                  >
                    Save Name
                  </button>
                  <p className="text-sm text-gray-400 mt-1">
                    Saved: {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => toggle(item.id)}
                  className="text-sm text-blue-300 underline ml-4"
                >
                  {expandedId === item.id ? 'Hide Details' : 'Show Details'}
                </button>
              </div>

              <div
                className={clsx(
                  'transition-all duration-300 px-4 pb-4',
                  expandedId === item.id
                    ? 'max-h-screen opacity-100'
                    : 'max-h-0 opacity-0 overflow-hidden'
                )}
              >
                {tab === 'portfolios' ? (
                  <>
                    <p><strong>Tickers:</strong> {item.tickers.join(', ')}</p>
                    <p><strong>Weights:</strong> {item.weights.join(', ')}</p>
                    <p><strong>Start:</strong> {item.startDate}</p>
                    <p><strong>End:</strong> {item.endDate}</p>
                    <button
                      onClick={() => handleDeletePortfolio(item.id)}
                      className="mt-3 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <>
                    <p><strong>Tickers:</strong> {item.tickers.join(', ')}</p>
                    <p><strong>Weights:</strong> {item.weights.join(', ')}</p>
                    <p><strong>Start:</strong> {item.start_date}</p>
                    <p><strong>End:</strong> {item.end_date}</p>
                    <p><strong>VaR (95%):</strong> {item.var_95?.toFixed(4)}</p>
                    <p><strong>CVaR (95%):</strong> {item.cvar_95?.toFixed(4)}</p>
                    <p><strong>Sharpe Ratio:</strong> {item.sharpe_ratio?.toFixed(4)}</p>
                    <p><strong>Sortino Ratio:</strong> {item.sortino_ratio?.toFixed(4)}</p>
                    <p><strong>Max Drawdown:</strong> {(item.max_drawdown * 100).toFixed(2)}%</p>
                    <p><strong>Standard Deviation:</strong> {item.stddev?.toFixed(4)}</p>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleExport(item.id, 'pdf')}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm"
                      >
                        Export PDF
                      </button>
                      <button
                        onClick={() => handleExport(item.id, 'html')}
                        className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded text-sm"
                      >
                        Export HTML
                      </button>
                      <button
                        onClick={() => handleDeleteAnalysis(item.id)}
                        className="ml-auto px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <ScrollToTop />
    </main>
  );
}

