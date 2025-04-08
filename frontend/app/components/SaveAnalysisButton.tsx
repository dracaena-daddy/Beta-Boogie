// 'use client';

// import { useUser } from '@clerk/nextjs';
// import { useState } from 'react';

// type AnalysisResult = {
//   name: string;
//   tickers: string[];
//   weights: number[];
//   startDate: string;
//   endDate: string;
//   var: number;
//   returns: number[];
//   createdAt?: string;
// };

// type Props = {
//   result: AnalysisResult;
// };

// export default function SaveAnalysisButton({ result }: Props) {
//   const { user } = useUser();
//   const [saving, setSaving] = useState(false);
//   const [saved, setSaved] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const handleSave = async () => {
//     if (!user) return;

//     setSaving(true);
//     setError(null);

//     try {
//       const existing = (user.publicMetadata?.savedAnalyses as AnalysisResult[]) || [];

//       const updated = [
//         ...existing,
//         {
//           ...result,
//           createdAt: new Date().toISOString(),
//         },
//       ];

//       await user.update({
//         publicMetadata: {
//           savedAnalyses: updated,
//         },
//       });

//       setSaved(true);
//     } catch (err) {
//       console.error('Failed to save analysis:', err);
//       setError('Failed to save analysis. Try again.');
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="mt-4">
//       <button
//         onClick={handleSave}
//         disabled={saving || saved}
//         className={`px-4 py-2 rounded text-white transition ${
//           saved
//             ? 'bg-green-600'
//             : saving
//             ? 'bg-[#7d3bcc] opacity-50 cursor-wait'
//             : 'bg-[#E041D1] hover:bg-[#c02cb3]'
//         }`}
//       >
//         {saved ? 'Analysis Saved ✓' : saving ? 'Saving...' : 'Save Analysis'}
//       </button>
//       {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
//     </div>
//   );
// }

'use client';

import { useUser } from '@clerk/nextjs';
import { useState } from 'react';

type Portfolio = {
  tickers: string[];
  weights: number[];
  startDate: string;
  endDate: string;
};

type AnalysisResult = {
  var: number;
  stdev: number;
  returns: number[];
  createdAt?: string;
};

type Props = {
  portfolio: Portfolio;
  result: AnalysisResult;
};

export default function SaveAnalysisButton({ portfolio, result }: Props) {
  const { user } = useUser();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setError(null);

    try {
      const existingAnalyses = (user.publicMetadata?.savedAnalyses as { portfolio: Portfolio; result: AnalysisResult }[]) || [];

      const updatedAnalyses = [
        ...existingAnalyses,
        {
          portfolio,
          result: {
            ...result,
            createdAt: new Date().toISOString(),
          },
        },
      ];

      // save user analysis to clerk metadata
      await user.update({
        publicMetadata: {
          savedAnalyses: updatedAnalyses,
        },
      });

      setSaved(true);
    } catch (err) {
      console.error('Failed to save analysis:', err);
      setError('Failed to save analysis. Please try again.');
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
            ? 'bg-blue-400 opacity-50 cursor-wait'
            : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        {saved ? 'Analysis Saved ✓' : saving ? 'Saving...' : 'Save Analysis'}
      </button>
      {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
    </div>
  );
}

