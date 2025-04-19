// analyze page
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import TickerInputRow from "../components/TickerInputRow";
import WeightSummary from "../components/WeightSummary";
import DateRangePicker from "../components/DateRangePicker";
import ResultCard from "../components/ResultCard";
import SaveButton from "../components/SaveButton";
import toast, { Toaster } from "react-hot-toast";
import UploadPortfolioCSV from "../components/UploadPortfolioCSV";
import TickerWarning from "../components/TickerWarning";
import VolatilityMethodSelector from "../components/VolatilityMethodSelector";
import ScrollToTop from "../components/ScrollToTop";

const popularTickers = ["AAPL", "MSFT", "AMZN", "NVDA", "GOOGL"];

type TickerInput = {
  ticker: string;
  weight: number;
};

// TODO: May need to update this with the methods
type RiskResult = {
  results: {
    method: string;
    stddev?: number;
    var_95?: number;
    cvar_95?: number;
    sharpe_ratio?: number;
    sortino_ratio?: number;
    max_drawdown?: number;
    message?: string;
  }[];
  returns: number[];
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
  const [selectedMethods, setSelectedMethods] = useState<string[]>(["historical"]);
  const [result, setResult] = useState<RiskResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [invalidTickers, setInvalidTickers] = useState<string[]>([]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

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

  const handleClearForm = () => {
    const confirmed = window.confirm("Clear the entire form?");
    if (!confirmed) return;
    setPortfolio([{ ticker: "", weight: 0 }]);
    setPortfolioName("My Portfolio");
    setAnalysisName("My Analysis");
    setStartDate("2020-01-01");
    setEndDate("2024-01-01");
    setResult(null);
    setInvalidTickers([]);
    toast.success("Form cleared.");
  };

  const handleSubmit = async () => {
    if (!isWeightValid) return;

    const hasInvalid = portfolio.some((p) => !p.ticker || isNaN(p.weight));
    if (hasInvalid) {
      toast.error("Please fill in all tickers and weights.");
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
          methods: selectedMethods,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);

        if (data.invalid_tickers?.length > 0) {
          setInvalidTickers(data.invalid_tickers);
          toast.error(`Invalid tickers: ${data.invalid_tickers.join(", ")}`);
        } else {
          setInvalidTickers([]);
          toast.success("✅ Risk analysis complete!");
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("✅ Analysis Complete", {
              body: "Your portfolio risk analysis has finished!",
            });
          }
        }
      } else {
        toast.error("Backend error during analysis.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network/server error.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAnalysis = async () => {
    if (!result || !result.results?.[0]) return;
    const r = result.results[0];

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
          method: r.method,
          stddev: r.stddev ?? null,
          var_95: r.var_95 ?? null,
          cvar_95: r.cvar_95 ?? null,
          sharpe_ratio: r.sharpe_ratio ?? null,
          sortino_ratio: r.sortino_ratio ?? null,
          max_drawdown: r.max_drawdown ?? null,
          returns: result.returns ?? [],
          // methods: result.results
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
            Build, save, and analyze the risk of your investment portfolio.
          </p>
        </section>

        <section className="border-t border-[#333366] pt-6">
          <h3 className="text-lg font-semibold mb-2 text-[#9D4EDD]">📊 Portfolio Builder</h3>
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
          <div className="text-right">
            <button onClick={handleClearForm} className="text-sm text-red-500 hover:underline">
              🗑️ Clear Form
            </button>
          </div>
          <WeightSummary totalWeight={totalWeight} isValid={isWeightValid} />
          <UploadPortfolioCSV onLoad={(data) => setPortfolio(data)} />
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
        </section>

        <section className="border-t border-[#333366] pt-6">
          <h3 className="text-lg font-semibold mb-2 text-[#9D4EDD]">📌 Select Volatility Methods</h3>
          <VolatilityMethodSelector
            selected={selectedMethods}
            onChange={setSelectedMethods}
          />
        </section>

        <section className="border-t border-[#333366] pt-6">
          <h3 className="text-lg font-semibold mb-2 text-[#9D4EDD]">📈 Risk Analysis</h3>
          <button
            onClick={handleSubmit}
            disabled={!isWeightValid || loading}
            className={`w-full py-2 rounded-xl font-semibold text-lg transition ${
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
      <ScrollToTop />
    </main>
  );
}
