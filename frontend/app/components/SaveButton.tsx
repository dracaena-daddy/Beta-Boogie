
"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";

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
  const {getToken} = useAuth();

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setError(null);

    try {
      // fetch Clerk session token 
      const token = await getToken();
      console.log("Token being sent:", token);
      if (!token) throw new Error("No token returned from Clerk");

      const response = await fetch("http://localhost:8000/api/save-portfolio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,    // include my token
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
