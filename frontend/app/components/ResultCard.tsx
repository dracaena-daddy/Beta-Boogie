'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Tooltip,
  PointElement,
  Legend,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Bar } from 'react-chartjs-2';
import { useMemo } from 'react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Tooltip,
  Legend,
  annotationPlugin,
  PointElement
);

type Props = {
  result: {
    var_95: number;
    stddev: number;
    returns: number[];
  };
};

export default function ResultCard({ result }: Props) {
  const { var_95, stddev, returns } = result;

  const { data, options } = useMemo(() => {
    const bins = Array(30).fill(0);
    const min = Math.min(...returns);
    const max = Math.max(...returns);
    const binWidth = (max - min) / bins.length;

    for (const r of returns) {
      const idx = Math.min(bins.length - 1, Math.floor((r - min) / binWidth));
      bins[idx]++;
    }

    const labels = bins.map((_, i) => `${((min + i * binWidth) * 100).toFixed(2)}%`);
    const binEdges = bins.map((_, i) => min + i * binWidth);
    const varBinIndex = binEdges.findIndex(edge => edge >= var_95);
    const varLabel = `${(var_95 * 100).toFixed(2)}%`;

    // Simple smoothing using moving average
    const smooth = bins.map((_, i) => {
      const prev = bins[i - 1] ?? bins[i];
      const next = bins[i + 1] ?? bins[i];
      return (prev + bins[i] + next) / 3;
    });

    const chartData = {
      labels,
      datasets: [
        {
          type: 'bar' as const,
          label: 'Return Frequency',
          data: bins,
          backgroundColor: '#9D4EDD',
        },
        {
          type: 'line' as const,
          label: 'Smoothed Curve',
          data: smooth,
          borderColor: '#45AFFF',
          backgroundColor: 'transparent',
          tension: 0.3,
          pointRadius: 0,
          borderWidth: 2,
        },
        {
          type: 'line' as const,
          label: 'VaR Threshold',
          data: Array(bins.length).fill(null), // dummy line
          borderColor: '#FF0000',
          // borderDash: [6, 6],
          pointRadius: 0,
          borderWidth: 2
        }
      ]
    };

    const chartOptions = {
      responsive: true,
      plugins: {
        legend: { display: true },
        annotation: {
          annotations: {
            varLine: {
              type: 'line',
              borderColor: '#FF0000',
              borderWidth: 2,
              label: {
                enabled: true,
                content: `VaR: ${varLabel}`,
                backgroundColor: '#E041D1',
                color: '#fff',
                position: 'start',
                font: { weight: 'bold' },
              },
              xMin: varBinIndex,
              xMax: varBinIndex,
            },
          },
        },
      },
      scales: {
        x: { ticks: { color: '#1A1A40' } },
        y: { ticks: { color: '#1A1A40' } },
      },
    };

    return { data: chartData, options: chartOptions };
  }, [returns, var_95]);

  return (
    <div className="bg-[#F4F4F4] text-[#1A1A40] p-6 rounded-xl mt-6 shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-[#9D4EDD]">Results</h2>
      <p>
        <strong>VaR (95%):</strong> {var_95.toFixed(4)}
      </p>
      <p>
        <strong>Standard Deviation:</strong> {stddev.toFixed(4)}
      </p>

      {returns.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2 text-[#1A1A40]">Return Distribution</h3>
          <Bar data={data} options={options} />
        </div>
      )}
    </div>
  );
}
