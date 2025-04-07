'use client';

import { useState } from 'react';
import TickerInputRow from './components/TickerInputRow';
import WeightSummary from './components/WeightSummary';
import DateRangePicker from './components/DateRangePicker';
import ResultCard from './components/ResultCard';

const popularTickers = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META',
  'BRK.B', 'JPM', 'V', 'JNJ', 'UNH', 'XOM', 'PG', 'MA'
];

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

  const totalWeight = portfolio.reduce((acc, item) => acc + item.weight, 0);
  const isWeightValid = Math.abs(totalWeight - 1.0) < 0.0001;

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

  const removeRow = (index: number) => {
    const updated = [...portfolio];
    updated.splice(index, 1);
    setPortfolio(updated);
  };

  const handleSubmit = async () => {
    if (!isWeightValid) return;

    const hasInvalid = portfolio.some(p => !p.ticker || isNaN(p.weight));
    if (hasInvalid) {
      alert('Please make sure all tickers and weights are filled in.');
      return;
    }

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

        <button
          onClick={handleSubmit}
          disabled={!isWeightValid || loading}
          className={`w-full py-2 rounded-xl font-semibold text-lg transition
            ${isWeightValid ? 'bg-[#9D4EDD] hover:bg-[#7c3ed6] text-white' : 'bg-gray-500 cursor-not-allowed text-gray-300'}`}
        >
          {loading ? 'Crunching the numbers...' : 'Calculate Risk'}
        </button>

        {result && <ResultCard result={result} />}
      </div>
    </main>
  );
}
