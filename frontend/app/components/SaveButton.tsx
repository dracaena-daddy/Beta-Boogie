// "use client";

// import { useState } from "react";
// import { useClerk, useUser } from "@clerk/nextjs";

// type Portfolio = {
//   name: string;
//   tickers: string[];
//   weights: number[];
//   startDate: string;
//   endDate: string;
//   createdAt?: string;
// };

// type Props = {
//   portfolio: Portfolio;
// };

// export default function SaveButton({ portfolio }: Props) {
//   const [saving, setSaving] = useState(false);
//   const [saved, setSaved] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const { user } = useUser();

//   const handleSave = async () => {
//     if (!user) return;
  
//     setSaving(true);
//     setError(null);
  
//     try {
//       const response = await fetch("http://localhost:8000/api/save-portfolio", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           userId: user.id,
//           ...portfolio, // includes name, tickers, weights, startDate, endDate
//         }),
//       });
  
//       if (!response.ok) {
//         const errData = await response.json();
//         throw new Error(errData.detail || "Unknown error");
//       }
  
//       const data = await response.json();
//       console.log("✅ Portfolio saved:", data);
//       setSaved(true);
//     } catch (err: any) {
//       console.error("❌ Failed to save portfolio:", err);
//       setError("Failed to save portfolio. Please try again.");
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
//             ? "bg-green-600"
//             : saving
//             ? "bg-[#7d3bcc] opacity-50 cursor-wait"
//             : "bg-[#9D4EDD] hover:bg-[#7d3bcc]"
//         }`}
//       >
//         {saved ? "Portfolio Saved ✓" : saving ? "Saving..." : "Save Portfolio"}
//       </button>
//       {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
//     </div>
//   );
// }





"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";

type Portfolio = {
  name: string;
  tickers: string[];
  weights: number[];
  startDate: string;
  endDate: string;
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
      const response = await fetch("http://localhost:8000/api/save-portfolio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          ...portfolio,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Unknown error");
      }

      setSaved(true);
    } catch (err: any) {
      console.error("Failed to save portfolio:", err);
      setError("Failed to save portfolio. Please try again.");
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
            ? "bg-green-600"
            : saving
            ? "bg-[#7d3bcc] opacity-50 cursor-wait"
            : "bg-[#9D4EDD] hover:bg-[#7d3bcc]"
        }`}
      >
        {saved ? "Portfolio Saved ✓" : saving ? "Saving..." : "Save Portfolio"}
      </button>
      {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
    </div>
  );
}
