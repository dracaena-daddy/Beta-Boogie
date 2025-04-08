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

// TODO: Add ALOT more of these tickers, they got deleted on accident.
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
          returns: result.returns || [],  // ✅ include the return distribution
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
        <p className="text-center text-[#45AFFF]">
          Grooving with your portfolio’s risk
        </p>

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
        </div>

        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
        />

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

        {result && (
          <>
            <ResultCard result={result} />
            <input
              type="text"
              value={analysisName}
              onChange={(e) => setAnalysisName(e.target.value)}
              placeholder="Enter analysis name"
              className="w-full p-2 rounded border border-gray-300 bg-[#1A1A40] text-white mt-4"
            />
            <button
              onClick={handleSaveAnalysis}
              className="w-full mt-2 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold text-lg"
            >
              Save Analysis
            </button>
          </>
        )}
      </div>
    </main>
  );
}
