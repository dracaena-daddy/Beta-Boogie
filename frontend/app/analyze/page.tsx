// // analyze page
// "use client";

// import { useState } from "react";
// import { useAuth } from "@clerk/nextjs";
// import TickerInputRow from "../components/TickerInputRow";
// import WeightSummary from "../components/WeightSummary";
// import DateRangePicker from "../components/DateRangePicker";
// import ResultCard from "../components/ResultCard";
// import SaveButton from "../components/SaveButton";
// import toast, { Toaster } from "react-hot-toast";
// import UploadPortfolioCSV from "../components/UploadPortfolioCSV";
// import TickerWarning from "../components/TickerWarning";



// const popularTickers = [
//   "AAPL", "MSFT", "AMZN", "NVDA", "GOOGL", "TSLA", "META", "BRK.B", "UNH", "JNJ",
// ];

// type TickerInput = {
//   ticker: string;
//   weight: number;
// };

// type RiskResult = {
//   var_95: number;
//   stddev: number;
//   returns?: number[];
// };

// export default function AnalyzePage() {
//   const { getToken } = useAuth();

//   const [portfolioName, setPortfolioName] = useState("My Portfolio");
//   const [analysisName, setAnalysisName] = useState("My Analysis");
//   const [portfolio, setPortfolio] = useState<TickerInput[]>([
//     { ticker: "AAPL", weight: 0.5 },
//     { ticker: "MSFT", weight: 0.5 },
//   ]);
//   const [startDate, setStartDate] = useState("2020-01-01");
//   const [endDate, setEndDate] = useState("2024-01-01");
//   const [result, setResult] = useState<RiskResult | null>(null);
//   const [loading, setLoading] = useState(false);

//   const totalWeight = portfolio.reduce((acc, item) => acc + item.weight, 0);
//   const isWeightValid = Math.abs(totalWeight - 1.0) < 0.0001;

//   const handleChange = (
//     index: number,
//     field: keyof TickerInput,
//     value: string
//   ) => {
//     const updated = [...portfolio];
//     if (field === "weight") {
//       updated[index][field] = parseFloat(value);
//     } else {
//       updated[index][field] = value;
//     }
//     setPortfolio(updated);
//   };

//   const addRow = () => setPortfolio([...portfolio, { ticker: "", weight: 0 }]);

//   const removeRow = (index: number) => {
//     const updated = [...portfolio];
//     updated.splice(index, 1);
//     setPortfolio(updated);
//   };

//   const handleSubmit = async () => {
//     if (!isWeightValid) return;

//     const hasInvalid = portfolio.some((p) => !p.ticker || isNaN(p.weight));
//     if (hasInvalid) {
//       toast.error("Please make sure all tickers and weights are filled in.");
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await fetch("http://localhost:8000/api/risk", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           portfolio,
//           start_date: startDate,
//           end_date: endDate,
//           analysis_type: ["var", "stddev"],
//         }),
//       });

//       if (response.ok) {
//         const data = await response.json();
//         setResult(data);
//       } else {
//         toast.error("Error from backend");
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error("Network or server error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSaveAnalysis = async () => {
//     if (!result) return;

//     try {
//       const token = await getToken();

//       const response = await fetch("http://localhost:8000/api/save-analysis", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           name: analysisName,
//           tickers: portfolio.map((p) => p.ticker),
//           weights: portfolio.map((p) => p.weight),
//           startDate,
//           endDate,
//           var: result.var_95,
//           stdev: result.stddev,
//           returns: result.returns || [],
//         }),
//       });

//       if (!response.ok) {
//         const err = await response.json();
//         throw new Error(err.detail || "Failed to save analysis");
//       }

//       toast.success("Analysis saved!");
//     } catch (err) {
//       console.error("❌ Failed to save analysis:", err);
//       toast.error("Failed to save analysis.");
//     }
//   };

//   return (
//     <main className="min-h-screen bg-[#1A1A40] text-[#F4F4F4] p-6">
//       <Toaster position="top-right" />
//       <div className="max-w-2xl mx-auto space-y-8">
//         <p className="text-center text-[#45AFFF] text-xl font-semibold">
//           Grooving with your portfolio’s risk
//         </p>

//         <section className="bg-[#2A2A50] p-4 rounded-xl shadow-sm">
//           <h2 className="text-lg font-bold mb-2">Welcome to the Portfolio Analyzer</h2>
//           <p className="text-sm text-gray-300">
//             Use this page to build, save, and analyze the risk of your investment portfolio. Enter your tickers and their weights below, or upload a CSV to get started faster.
//           </p>
//           <ul className="list-disc list-inside text-sm text-gray-400 mt-2">
//             <li>Add your assets and their weights (should sum to 1).</li>
//             <li>Choose a date range for historical analysis.</li>
//             <li>Click "Calculate Risk" to see your portfolio's Value-at-Risk and volatility.</li>
//             <li>Optionally save your portfolio or analysis for later.</li>
//           </ul>
//         </section>

//         <section className="border-t border-[#333366] pt-6">
//           <h3 className="text-lg font-semibold mb-2 text-[#9D4EDD]">📊 Portfolio Builder</h3>
//           <div className="space-y-4">
//             {portfolio.map((row, idx) => (
//               <TickerInputRow
//                 key={idx}
//                 index={idx}
//                 ticker={row.ticker}
//                 weight={row.weight}
//                 onChange={handleChange}
//                 onRemove={removeRow}
//                 popularTickers={popularTickers}
//               />
//             ))}
//             <button
//               onClick={addRow}
//               className="text-sm bg-[#45AFFF] text-[#1A1A40] px-3 py-1 rounded-xl font-bold hover:opacity-90"
//             >
//               + Add Ticker
//             </button>
//             <WeightSummary totalWeight={totalWeight} isValid={isWeightValid} />
//             <UploadPortfolioCSV onLoad={(data) => setPortfolio(data)} />
//           </div>
//         </section>

//         <section className="border-t border-[#333366] pt-6">
//           <h3 className="text-lg font-semibold mb-2 text-[#9D4EDD]">📅 Select Date Range</h3>
//           <DateRangePicker
//             startDate={startDate}
//             endDate={endDate}
//             setStartDate={setStartDate}
//             setEndDate={setEndDate}
//           />
//         </section>

//         <section className="border-t border-[#333366] pt-6">
//           <h3 className="text-lg font-semibold mb-2 text-[#9D4EDD]">💾 Save Portfolio</h3>
//           <div className="space-y-2">
//             <input
//               type="text"
//               value={portfolioName}
//               onChange={(e) => setPortfolioName(e.target.value)}
//               placeholder="Enter portfolio name"
//               className="w-full p-2 rounded border border-gray-300 bg-[#1A1A40] text-white"
//             />
//             <SaveButton
//               portfolio={{
//                 name: portfolioName,
//                 tickers: portfolio.map((p) => p.ticker),
//                 weights: portfolio.map((p) => p.weight),
//                 startDate,
//                 endDate,
//               }}
//             />
//             <p className="text-sm text-gray-400">
//               Save this portfolio setup to reuse later
//             </p>
//           </div>
//         </section>

//         <section className="border-t border-[#333366] pt-6">
//           <h3 className="text-lg font-semibold mb-2 text-[#9D4EDD]">📈 Risk Analysis</h3>
//           <button
//             onClick={handleSubmit}
//             disabled={!isWeightValid || loading}
//             className={`w-full py-2 rounded-xl font-semibold text-lg transition
//               ${
//                 isWeightValid
//                   ? "bg-[#9D4EDD] hover:bg-[#7c3ed6] text-white"
//                   : "bg-gray-500 cursor-not-allowed text-gray-300"
//               }`}
//           >
//             {loading ? "Crunching the numbers..." : "Calculate Risk"}
//           </button>

//           {result && (
//             <div className="mt-6 space-y-4">
//               <ResultCard result={result} />
//               <input
//                 type="text"
//                 value={analysisName}
//                 onChange={(e) => setAnalysisName(e.target.value)}
//                 placeholder="Enter analysis name"
//                 className="w-full p-2 rounded border border-gray-300 bg-[#1A1A40] text-white"
//               />
//               <button
//                 onClick={handleSaveAnalysis}
//                 className="w-full py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold text-lg"
//               >
//                 Save Analysis
//               </button>
//             </div>
//           )}
//         </section>
//       </div>
//     </main>
//   );
// }

// analyze page
"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import TickerInputRow from "../components/TickerInputRow";
import WeightSummary from "../components/WeightSummary";
import DateRangePicker from "../components/DateRangePicker";
import ResultCard from "../components/ResultCard";
import SaveButton from "../components/SaveButton";
import toast, { Toaster } from "react-hot-toast";
import UploadPortfolioCSV from "../components/UploadPortfolioCSV";
import TickerWarning from "../components/TickerWarning";

const popularTickers = [
  "AAPL", "MSFT", "AMZN", "NVDA", "GOOGL", "TSLA", "META", "BRK.B", "UNH", "JNJ",
];

type TickerInput = {
  ticker: string;
  weight: number;
};

type RiskResult = {
  var_95: number;
  stddev: number;
  returns?: number[];
};

export default function AnalyzePage() {
  const { getToken } = useAuth();

  const [portfolioName, setPortfolioName] = useState("My Portfolio");
  const [analysisName, setAnalysisName] = useState("My Analysis");
  const [portfolio, setPortfolio] = useState<TickerInput[]>([
    { ticker: "AAPL", weight: 0.5 },
    { ticker: "MSFT", weight: 0.5 },
  ]);
  const [startDate, setStartDate] = useState("2020-01-01");
  const [endDate, setEndDate] = useState("2024-01-01");
  const [result, setResult] = useState<RiskResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [invalidTickers, setInvalidTickers] = useState<string[]>([]);

  const totalWeight = portfolio.reduce((acc, item) => acc + item.weight, 0);
  const isWeightValid = Math.abs(totalWeight - 1.0) < 0.0001;

  const handleChange = (
    index: number,
    field: keyof TickerInput,
    value: string
  ) => {
    const updated = [...portfolio];
    if (field === "weight") {
      updated[index][field] = parseFloat(value);
    } else {
      updated[index][field] = value;
    }
    setPortfolio(updated);
  };

  const addRow = () => setPortfolio([...portfolio, { ticker: "", weight: 0 }]);

  const removeRow = (index: number) => {
    const updated = [...portfolio];
    updated.splice(index, 1);
    setPortfolio(updated);
  };

  const handleSubmit = async () => {
    if (!isWeightValid) return;

    const hasInvalid = portfolio.some((p) => !p.ticker || isNaN(p.weight));
    if (hasInvalid) {
      toast.error("Please make sure all tickers and weights are filled in.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          portfolio,
          start_date: startDate,
          end_date: endDate,
          analysis_type: ["var", "stddev"],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);

        if (data.invalid_tickers?.length > 0) {
          setInvalidTickers(data.invalid_tickers);
        } else {
          setInvalidTickers([]);
        }
      } else {
        toast.error("Error from backend");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network or server error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAnalysis = async () => {
    if (!result) return;

    try {
      const token = await getToken();

      const response = await fetch("http://localhost:8000/api/save-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: analysisName,
          tickers: portfolio.map((p) => p.ticker),
          weights: portfolio.map((p) => p.weight),
          startDate,
          endDate,
          var: result.var_95,
          stdev: result.stddev,
          returns: result.returns || [],
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Failed to save analysis");
      }

      toast.success("Analysis saved!");
    } catch (err) {
      console.error("❌ Failed to save analysis:", err);
      toast.error("Failed to save analysis.");
    }
  };

  return (
    <main className="min-h-screen bg-[#1A1A40] text-[#F4F4F4] p-6">
      <Toaster position="top-right" />
      <div className="max-w-2xl mx-auto space-y-8">
        <p className="text-center text-[#45AFFF] text-xl font-semibold">
          Grooving with your portfolio’s risk
        </p>

        <section className="bg-[#2A2A50] p-4 rounded-xl shadow-sm">
          <h2 className="text-lg font-bold mb-2">Welcome to the Portfolio Analyzer</h2>
          <p className="text-sm text-gray-300">
            Use this page to build, save, and analyze the risk of your investment portfolio. Enter your tickers and their weights below, or upload a CSV to get started faster.
          </p>
          <ul className="list-disc list-inside text-sm text-gray-400 mt-2">
            <li>Add your assets and their weights (should sum to 1).</li>
            <li>Choose a date range for historical analysis.</li>
            <li>Click "Calculate Risk" to see your portfolio's Value-at-Risk and volatility.</li>
            <li>Optionally save your portfolio or analysis for later.</li>
          </ul>
        </section>

        <section className="border-t border-[#333366] pt-6">
          <h3 className="text-lg font-semibold mb-2 text-[#9D4EDD]">📊 Portfolio Builder</h3>
          <div className="space-y-4">
            {portfolio.map((row, idx) => (
              <TickerInputRow
                key={idx}
                index={idx}
                ticker={row.ticker}
                weight={row.weight}
                onChange={handleChange}
                onRemove={removeRow}
                popularTickers={popularTickers}
              />
            ))}
            <button
              onClick={addRow}
              className="text-sm bg-[#45AFFF] text-[#1A1A40] px-3 py-1 rounded-xl font-bold hover:opacity-90"
            >
              + Add Ticker
            </button>
            <WeightSummary totalWeight={totalWeight} isValid={isWeightValid} />
            <UploadPortfolioCSV onLoad={(data) => setPortfolio(data)} />
          </div>
        </section>

        <section className="border-t border-[#333366] pt-6">
          <h3 className="text-lg font-semibold mb-2 text-[#9D4EDD]">📅 Select Date Range</h3>
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
          />
        </section>

        <section className="border-t border-[#333366] pt-6">
          <h3 className="text-lg font-semibold mb-2 text-[#9D4EDD]">💾 Save Portfolio</h3>
          <div className="space-y-2">
            <input
              type="text"
              value={portfolioName}
              onChange={(e) => setPortfolioName(e.target.value)}
              placeholder="Enter portfolio name"
              className="w-full p-2 rounded border border-gray-300 bg-[#1A1A40] text-white"
            />
            <SaveButton
              portfolio={{
                name: portfolioName,
                tickers: portfolio.map((p) => p.ticker),
                weights: portfolio.map((p) => p.weight),
                startDate,
                endDate,
              }}
            />
            <p className="text-sm text-gray-400">
              Save this portfolio setup to reuse later
            </p>
          </div>
        </section>

        <section className="border-t border-[#333366] pt-6">
          <h3 className="text-lg font-semibold mb-2 text-[#9D4EDD]">📈 Risk Analysis</h3>
          <button
            onClick={handleSubmit}
            disabled={!isWeightValid || loading}
            className={`w-full py-2 rounded-xl font-semibold text-lg transition
              ${
                isWeightValid
                  ? "bg-[#9D4EDD] hover:bg-[#7c3ed6] text-white"
                  : "bg-gray-500 cursor-not-allowed text-gray-300"
              }`}
          >
            {loading ? "Crunching the numbers..." : "Calculate Risk"}
          </button>
          <TickerWarning
        invalidTickers={invalidTickers}
        onClose={() => setInvalidTickers([])}
      />
          {result && (
            <div className="mt-6 space-y-4">
              <ResultCard result={result} />
              <input
                type="text"
                value={analysisName}
                onChange={(e) => setAnalysisName(e.target.value)}
                placeholder="Enter analysis name"
                className="w-full p-2 rounded border border-gray-300 bg-[#1A1A40] text-white"
              />
              <button
                onClick={handleSaveAnalysis}
                className="w-full py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold text-lg"
              >
                Save Analysis
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}