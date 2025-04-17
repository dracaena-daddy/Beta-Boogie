"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";

type Method = {
  name: string;
  key: string;
  description: string;
  category: "Standard" | "Experimental";
};

const methods: Method[] = [
  {
    name: "Historical Volatility",
    key: "historical",
    description: "Based on standard deviation of past returns over a selected window.",
    category: "Standard",
  },
  {
    name: "EWMA Volatility",
    key: "ewma",
    description: "Recent returns are weighted more heavily using exponential decay.",
    category: "Standard",
  },
  {
    name: "GARCH(1,1)",
    key: "garch",
    description: "Volatility is forecast using past shocks and variances.",
    category: "Standard",
  },
  {
    name: "LSTM Forecast",
    key: "lstm",
    description: "Deep learning model trained on historical return patterns.",
    category: "Standard",
  },
  {
    name: "CNN Forecast",
    key: "cnn",
    description: "Convolutional neural network modeling volatility with time-series filters.",
    category: "Standard",
  },
  {
    name: "Text/News Embedding Volatility",
    key: "text_embeddings",
    description: "Extracts volatility signals from financial news using NLP embeddings.",
    category: "Experimental",
  },
  {
    name: "LLM Volatility Narrative",
    key: "llm_narrative",
    description: "Generates narrative explanations of volatility using a large language model.",
    category: "Experimental",
  },
];

export default function VolatilityMethodSelector({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (updated: string[]) => void;
}) {
  const [activeTab, setActiveTab] = useState<"Standard" | "Experimental">("Standard");

  const toggleMethod = (key: string) => {
    onChange(
      selected.includes(key)
        ? selected.filter((k) => k !== key)
        : [...selected, key]
    );
  };

  return (
    <div className="bg-[#2A2A50] p-4 rounded-xl shadow-sm space-y-4">
      {/* Segmented tabs */}
      <div className="flex space-x-2">
        {["Standard", "Experimental"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as "Standard" | "Experimental")}
            className={`px-4 py-1 rounded-full text-sm font-semibold transition ${
              activeTab === tab
                ? "bg-[#9D4EDD] text-white"
                : "bg-[#1A1A40] text-gray-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Method list */}
      <div className="space-y-2">
        {methods
          .filter((m) => m.category === activeTab)
          .map((method) => (
            <label key={method.key} className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={selected.includes(method.key)}
                onChange={() => toggleMethod(method.key)}
                className="mt-1"
              />
              <div className="flex-1">
                <span className="font-medium">{method.name}</span>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <button
                      type="button"
                      className="ml-1 text-xs text-gray-400 hover:text-white align-middle"
                    >
                      <Info size={16} />
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Content
                    side="right"
                    className="bg-black text-white text-xs rounded p-2 shadow-lg z-50 max-w-xs"
                  >
                    {method.description}
                  </Tooltip.Content>
                </Tooltip.Root>
              </div>
            </label>
          ))}
      </div>
    </div>
  );
}
