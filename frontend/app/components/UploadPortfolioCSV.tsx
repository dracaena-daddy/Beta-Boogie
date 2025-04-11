// "use client";

// import { useState } from "react";
// import Papa from "papaparse";

// interface PortfolioEntry {
//   ticker: string;
//   weight: number;
// }

// export default function UploadPortfolioCSV({ onLoad }: { onLoad: (data: PortfolioEntry[]) => void }) {
//   const [error, setError] = useState<string | null>(null);
//   const [preview, setPreview] = useState<PortfolioEntry[] | null>(null);

//   const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     Papa.parse(file, {
//       header: true,
//       skipEmptyLines: true,
//       transformHeader: (header) => header.toLowerCase().trim(),
//       complete: (results) => {
//         const data = results.data as any[];
//         try {
//           const parsed: PortfolioEntry[] = data.map((row, i) => {
//             if (!row.ticker || !row.weight) throw new Error(`Missing data on row ${i + 1}`);
//             const ticker = row.ticker.toString().toUpperCase().trim();
//             const weight = parseFloat(row.weight);
//             if (isNaN(weight) || weight < 0 || weight > 1) throw new Error(`Invalid weight on row ${i + 1}`);
//             return { ticker, weight };
//           });

//           const totalWeight = parsed.reduce((sum, item) => sum + item.weight, 0);
//           if (Math.abs(totalWeight - 1) > 0.01) throw new Error("Total weight must sum to approximately 1.0");

//           setPreview(parsed);
//           setError(null);
//           onLoad(parsed);
//         } catch (err: any) {
//           setError(err.message);
//           setPreview(null);
//         }
//       },
//       error: (err) => setError(err.message)
//     });
//   };

//   const downloadSampleCSV = () => {
//     const csvContent = "ticker,weight\nAAPL,0.4\nMSFT,0.35\nGOOGL,0.25";
//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = "sample-portfolio.csv";
//     link.click();
//   };

//   return (
//     <div className="space-y-4">
//       <div>
//         <h2 className="text-lg font-bold">Upload Your Portfolio CSV</h2>
//         <p className="text-sm text-gray-600 mb-2">
//           Upload a CSV file with two columns: <code>ticker</code> and <code>weight</code>. Ticker case doesn’t matter. Total weight should sum to 1.
//         </p>
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//           <input
//             type="file"
//             accept=".csv"
//             onChange={handleFileUpload}
//             className="block w-full md:w-auto text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
//           />

//           <button
//             onClick={downloadSampleCSV}
//             className="px-3 py-2 bg-purple-100 text-purple-800 rounded hover:bg-purple-200 text-sm"
//           >
//             Download Sample CSV
//           </button>
//         </div>
//       </div>

//       {error && <p className="text-red-500">Error: {error}</p>}

//       {preview && (
//         <div>
//           <h3 className="font-semibold">Parsed Portfolio Preview:</h3>
//           <table className="w-full text-sm border">
//             <thead>
//               <tr>
//                 <th className="border px-2 py-1">Ticker</th>
//                 <th className="border px-2 py-1">Weight</th>
//               </tr>
//             </thead>
//             <tbody>
//               {preview.map((entry, idx) => (
//                 <tr key={idx}>
//                   <td className="border px-2 py-1">{entry.ticker}</td>
//                   <td className="border px-2 py-1">{entry.weight}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// }


// File: app/components/UploadPortfolioCSV.tsx

"use client";

import { useState } from "react";
import Papa from "papaparse";

interface PortfolioEntry {
  ticker: string;
  weight: number;
}

export default function UploadPortfolioCSV({ onLoad }: { onLoad: (data: PortfolioEntry[]) => void }) {
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<PortfolioEntry[] | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.toLowerCase().trim(),
      complete: (results) => {
        const data = results.data as any[];
        try {
          const parsed: PortfolioEntry[] = data.map((row, i) => {
            if (!row.ticker || !row.weight) throw new Error(`Missing data on row ${i + 1}`);
            const ticker = row.ticker.toString().toUpperCase().trim();
            const weight = parseFloat(row.weight);
            if (isNaN(weight) || weight < 0 || weight > 1) throw new Error(`Invalid weight on row ${i + 1}`);
            return { ticker, weight };
          });

          const totalWeight = parsed.reduce((sum, item) => sum + item.weight, 0);
          if (Math.abs(totalWeight - 1) > 0.01) throw new Error("Total weight must sum to approximately 1.0");

          setPreview(parsed.slice(0, 5)); // limit preview to first 5 rows
          setError(null);
          onLoad(parsed);
        } catch (err: any) {
          setError(err.message);
          setPreview(null);
        }
      },
      error: (err) => setError(err.message)
    });
  };

  const downloadSampleCSV = () => {
    const csvContent = "ticker,weight\nAAPL,0.4\nMSFT,0.35\nGOOGL,0.25";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "sample-portfolio.csv";
    link.click();
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold">Upload Your Portfolio CSV</h2>
        <p className="text-sm text-gray-600 mb-2">
          Upload a CSV file with two columns: <code>ticker</code> and <code>weight</code>. Ticker case doesn’t matter. Total weight should sum to 1.
        </p>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="block w-full md:w-auto text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
          />

          <button
            onClick={downloadSampleCSV}
            className="px-3 py-2 bg-purple-100 text-purple-800 rounded hover:bg-purple-200 text-sm"
          >
            Download Sample CSV
          </button>
        </div>
      </div>

      {error && <p className="text-red-500">Error: {error}</p>}

      {preview && (
        <div>
          <h3 className="font-semibold">Parsed Portfolio Preview (showing first 5 rows):</h3>
          <table className="w-full text-sm border">
            <thead>
              <tr>
                <th className="border px-2 py-1">Ticker</th>
                <th className="border px-2 py-1">Weight</th>
              </tr>
            </thead>
            <tbody>
              {preview.map((entry, idx) => (
                <tr key={idx}>
                  <td className="border px-2 py-1">{entry.ticker}</td>
                  <td className="border px-2 py-1">{entry.weight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
