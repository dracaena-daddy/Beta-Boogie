'use client';

import { useUser } from '@clerk/nextjs';
import { useState } from 'react';

type Portfolio = {
  name: string;
  tickers: string[];
  weights: number[];
  startDate: string;
  endDate: string;
  createdAt?: string;
};

type Props = {
  portfolio: Portfolio;
};

export default function SaveButton({ portfolio }: Props) {
  const { user } = useUser();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setError(null);

    try {
      const existing = (user.publicMetadata?.savedPortfolios as Portfolio[]) || [];

      const updated = [
        ...existing,
        {
          ...portfolio,
          createdAt: new Date().toISOString(),
        },
      ];

      await user.update({
        publicMetadata: {
          savedPortfolios: updated,
        },
      });

      setSaved(true);
    } catch (err) {
      console.error('Failed to save portfolio:', err);
      setError('Failed to save portfolio. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={handleSave}
        disabled={saving || saved}
        className={`px-4 py-2 rounded text-white transition ${
          saved
            ? 'bg-green-600'
            : saving
            ? 'bg-[#7d3bcc] opacity-50 cursor-wait'
            : 'bg-[#9D4EDD] hover:bg-[#7d3bcc]'
        }`}
      >
        {saved ? 'Portfolio Saved ✓' : saving ? 'Saving...' : 'Save Portfolio'}
      </button>
      {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
    </div>
  );
}
