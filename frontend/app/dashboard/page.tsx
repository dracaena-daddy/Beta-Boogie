// // dashboard page
// 'use client';

// import { useUser, useAuth } from '@clerk/nextjs'; 
// import { useRouter } from 'next/navigation';
// import { useEffect, useState } from 'react';

// type Portfolio = {
//   id: number;
//   name: string;
//   tickers: string[];
//   weights: number[];
//   startDate: string;
//   endDate: string;
//   createdAt: string;
// };

// type Analysis = any; // placeholder for now

// export default function DashboardPage() {
//   const router = useRouter();
//   const { user, isLoaded, isSignedIn } = useUser();
//   const { getToken } = useAuth();

//   const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
//   const [analyses, setAnalyses] = useState<Analysis[]>([]); // same placeholder
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (!isLoaded) return;

//     if (!isSignedIn) {
//       router.push('/login');
//     } else {
//       // Load from FastAPI backend
//       const fetchPortfolios = async () => {
//         try {
//           const token = await getToken();
//           const res = await fetch('http://localhost:8000/api/load-portfolios', {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           });

//           if (!res.ok) throw new Error("Failed to load portfolios");

//           const data = await res.json();
//           setPortfolios(data);
//         } catch (err) {
//           console.error("Error loading portfolios:", err);
//           setError("Could not load portfolios.");
//         }
//       };

//       fetchPortfolios();

//       // TODO: Replace this with real backend analysis loading later
//       setAnalyses((user?.publicMetadata?.savedAnalyses as any[]) || []);
//     }
//   }, [isLoaded, isSignedIn, router, user, getToken]);


//   // Render logic
//   if (!isLoaded) return <p className="text-white p-6">Loading...</p>;

//   if (!isSignedIn) return null;

//   return (
//     <main className="p-6 max-w-5xl mx-auto">
//       <h1 className="text-3xl font-bold text-[#9D4EDD] mb-6">My Account</h1>

//       {/* 📂 Saved Portfolios */}
//       <section className="mb-10">
//         <h2 className="text-2xl font-semibold text-[#45AFFF] mb-4">
//           📂 Saved Portfolios
//         </h2>
//         {portfolios.length === 0 ? (
//           <p className="text-gray-400">You haven't saved any portfolios yet.</p>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {portfolios.map((p, i) => (
//               <div
//                 key={i}
//                 className="bg-[#1A1A40] text-white p-4 rounded shadow border border-[#9D4EDD]"
//               >
//                 <h3 className="font-semibold text-lg mb-2">
//                   {p.name || `Portfolio ${i + 1}`}
//                 </h3>
//                 <p>
//                   <strong>Tickers:</strong> {p.tickers.join(", ")}
//                 </p>
//                 <p>
//                   <strong>Weights:</strong> {p.weights.join(", ")}
//                 </p>
//                 <p>
//                   <strong>Start:</strong> {p.startDate}
//                 </p>
//                 <p>
//                   <strong>End:</strong> {p.endDate}
//                 </p>
//               </div>
//             ))}
//           </div>
//         )}
//       </section>

//       {/* 📊 Saved Analyses */}
//       <section>
//         <h2 className="text-2xl font-semibold text-[#E041D1] mb-4">
//           📊 Saved Analyses
//         </h2>
//         {analyses.length === 0 ? (
//           <p className="text-gray-400">You haven't saved any analyses yet.</p>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {analyses.map((a, i) => (
//               <div
//                 key={i}
//                 className="bg-[#1A1A40] text-white p-4 rounded shadow border border-[#E041D1]"
//               >
//                 <h3 className="font-semibold text-lg mb-2">
//                   {a.portfolio?.name || `Analysis ${i + 1}`}
//                 </h3>
//                 <p>
//                   <strong>Tickers:</strong> {a.portfolio?.tickers?.join(", ")}
//                 </p>
//                 <p>
//                   <strong>Weights:</strong> {a.portfolio?.weights?.join(", ")}
//                 </p>
//                 <p>
//                   <strong>Start:</strong> {a.portfolio?.startDate}
//                 </p>
//                 <p>
//                   <strong>End:</strong> {a.portfolio?.endDate}
//                 </p>
//                 <p>
//                   <strong>VaR:</strong> {a.result?.var}
//                 </p>
//                 <p>
//                   <strong>StDev:</strong> {a.result?.stdev}
//                 </p>
//                 <p>
//                   <strong>Saved:</strong>{" "}
//                   {new Date(a.result?.createdAt).toLocaleString()}
//                 </p>
//               </div>
//             ))}
//           </div>
//         )}
//       </section>
//     </main>
//   );
// }

'use client';

import { useUser, useAuth } from '@clerk/nextjs'; 
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Portfolio = {
  id: number;
  name: string;
  tickers: string[];
  weights: number[];
  startDate: string;
  endDate: string;
  createdAt: string;
};

type Analysis = any; // placeholder for now

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();

  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
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
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!res.ok) throw new Error("Failed to load portfolios");

          const data = await res.json();
          setPortfolios(data);
        } catch (err) {
          console.error("Error loading portfolios:", err);
          setError("Could not load portfolios.");
        }
      };

      fetchPortfolios();
      setAnalyses((user?.publicMetadata?.savedAnalyses as any[]) || []);
    }
  }, [isLoaded, isSignedIn, router, user, getToken]);

  // 👇 Delete handler
  const handleDelete = async (portfolioId: number) => {
    try {
      const token = await getToken();

      const res = await fetch(`http://localhost:8000/api/delete-portfolio/${portfolioId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to delete portfolio");
      }

      setPortfolios((prev) => prev.filter((p) => p.id !== portfolioId));
    } catch (err) {
      console.error("❌ Failed to delete portfolio:", err);
      alert("Could not delete portfolio.");
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
                <button
                  onClick={() => handleDelete(p.id)}
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
