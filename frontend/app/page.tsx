'use client';

import { useState } from 'react';

type TickerInput = {
  ticker: string;
  weight: number;
};

type RiskResult = {
  var_95: number;
  stddev: number;
};

export default function Home() {
  const [portfolio, setPortfolio] = useState<TickerInput[]>([
    { ticker: 'AAPL', weight: 0.5 },
    { ticker: 'MSFT', weight: 0.5 },
  ]);
  const [startDate, setStartDate] = useState('2020-01-01');
  const [endDate, setEndDate] = useState('2024-01-01');
  const [result, setResult] = useState<RiskResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (index: number, field: keyof TickerInput, value: string) => {
    const updated = [...portfolio];
    if (field === 'weight') {
      updated[index][field] = parseFloat(value);
    } else {
      updated[index][field] = value;
    }
    setPortfolio(updated);
  };

  const addRow = () => setPortfolio([...portfolio, { ticker: '', weight: 0 }]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portfolio,
          start_date: startDate,
          end_date: endDate,
          analysis_type: ['var', 'stddev'],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
      } else {
        alert('Error from backend');
      }
    } catch (err) {
      console.error(err);
      alert('Network or server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#1A1A40] text-[#F4F4F4] p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-[#9D4EDD] text-center">Beta Boogie</h1>
        <p className="text-center text-[#45AFFF]">Grooving with your portfolio’s risk</p>

        <div className="space-y-4">
          {portfolio.map((row, idx) => (
            <div key={idx} className="flex gap-4">
              <input
                value={row.ticker}
                placeholder="Ticker"
                // className="flex-1 rounded-lg p-2 text-black"
                className="flex-1 rounded-lg p-2 bg-[#1A1A40] text-white border border-[#45AFFF]"
                onChange={(e) => handleChange(idx, 'ticker', e.target.value.toUpperCase())}
              />
              <input
                type="number"
                step="0.01"
                value={row.weight}
                placeholder="Weight"
                // className="w-24 rounded-lg p-2 text-black"
                className="flex-1 rounded-lg p-2 bg-[#1A1A40] text-white border border-[#45AFFF]"
                onChange={(e) => handleChange(idx, 'weight', e.target.value)}
              />
            </div>
          ))}
          <button
            onClick={addRow}
            className="text-sm bg-[#45AFFF] text-[#1A1A40] px-3 py-1 rounded-xl font-bold hover:opacity-90"
          >
            + Add Ticker
          </button>
        </div>

        <div className="flex gap-4">
          <div className="flex flex-col flex-1">
            <label className="mb-1 text-sm text-[#E041D1]">Start Date</label>
            <input
              type="date"
              // className="rounded-lg p-2 text-black"
              className="rounded-lg p-2 bg-[#1A1A40] text-white border border-[#45AFFF]"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col flex-1">
            <label className="mb-1 text-sm text-[#E041D1]">End Date</label>
            <input
              type="date"
              // className="rounded-lg p-2 text-black"
               className="rounded-lg p-2 bg-[#1A1A40] text-white border border-[#45AFFF]"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-[#9D4EDD] text-white py-2 rounded-xl font-semibold text-lg hover:bg-[#7c3ed6]"
        >
          {loading ? 'Crunching the numbers...' : 'Calculate Risk'}
        </button>

        {result && (
          <div className="bg-[#F4F4F4] text-[#1A1A40] p-6 rounded-xl mt-6 shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-[#9D4EDD]">Results</h2>
            <p>
              <strong>VaR (95%):</strong> {result.var_95.toFixed(4)}
            </p>
            <p>
              <strong>Standard Deviation:</strong> {result.stddev.toFixed(4)}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
