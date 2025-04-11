import React from "react";

type TickerWarningProps = {
  invalidTickers: string[];
  onClose: () => void;
};

export default function TickerWarning({ invalidTickers, onClose }: TickerWarningProps) {
  if (invalidTickers.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 w-80 bg-yellow-100 text-yellow-900 border border-yellow-400 rounded-lg p-4 shadow-md">
      <div className="font-semibold">⚠️ Invalid Tickers</div>
      <p className="mt-2 text-sm">The following tickers were invalid and skipped:</p>
      <ul className="mt-2 text-sm list-disc list-inside">
        {invalidTickers.map((ticker, index) => (
          <li key={index}>{ticker}</li>
        ))}
      </ul>
      <p className="mt-2 text-sm">The analysis results are based on a reweighting of the valid tickers ONLY.</p>
      <p className="mt-2 text-sm">Fix/remove invalid tickers before saving analysis if needed.</p>
      <button
        onClick={onClose}
        className="mt-3 text-sm text-blue-700 hover:underline"
      >
        Dismiss
      </button>
    </div>
  );
}
