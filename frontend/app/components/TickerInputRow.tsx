'use client';

type Props = {
  ticker: string;
  weight: number;
  index: number;
  onChange: (index: number, field: 'ticker' | 'weight', value: string) => void;
  onRemove: (index: number) => void;
  showRemove?: boolean;
  popularTickers: string[];
};

export default function TickerInputRow({
  ticker,
  weight,
  index,
  onChange,
  onRemove,
  showRemove = true,
  popularTickers,
}: Props) {
  return (
    <div className="flex gap-4 items-center">
      <input
        list="ticker-options"
        value={ticker}
        placeholder="Ticker"
        className="flex-1 rounded-lg p-2 bg-[#1A1A40] text-white border border-[#45AFFF]"
        onChange={(e) => onChange(index, 'ticker', e.target.value.toUpperCase())}
      />
      <input
        type="number"
        step="0.01"
        value={weight}
        placeholder="Weight"
        className="w-24 rounded-lg p-2 bg-[#1A1A40] text-white border border-[#45AFFF]"
        onChange={(e) => onChange(index, 'weight', e.target.value)}
      />
      {showRemove && (
        <button
          onClick={() => onRemove(index)}
          className="text-sm bg-[#E041D1] text-white px-2 py-1 rounded-lg hover:opacity-90"
        >
          ✕
        </button>
      )}

      <datalist id="ticker-options">
        {popularTickers.map((symbol) => (
          <option key={symbol} value={symbol} />
        ))}
      </datalist>
    </div>
  );
}
