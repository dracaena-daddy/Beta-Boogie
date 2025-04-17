// 'use client';

// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   LineElement,
//   Tooltip,
//   PointElement,
//   Legend,
// } from 'chart.js';
// import annotationPlugin from 'chartjs-plugin-annotation';
// import { Bar } from 'react-chartjs-2';
// import { useMemo } from 'react';

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   LineElement,
//   Tooltip,
//   Legend,
//   annotationPlugin,
//   PointElement
// );

// type MethodResult = {
//   method: string;
//   stddev?: number;
//   var_95?: number;
//   message?: string;
// };

// type Props = {
//   result: {
//     results: MethodResult[];
//     returns: number[];
//   };
// };

// export default function ResultCard({ result }: Props) {
//   const { results, returns } = result;

//   const chartConfig = useMemo(() => {
//     const bins = Array(30).fill(0);
//     const min = Math.min(...returns);
//     const max = Math.max(...returns);
//     const binWidth = (max - min) / bins.length;

//     for (const r of returns) {
//       const idx = Math.min(bins.length - 1, Math.floor((r - min) / binWidth));
//       bins[idx]++;
//     }

//     const labels = bins.map((_, i) => `${((min + i * binWidth) * 100).toFixed(2)}%`);
//     const binEdges = bins.map((_, i) => min + i * binWidth);

//     // Smooth histogram
//     const smooth = bins.map((_, i) => {
//       const prev = bins[i - 1] ?? bins[i];
//       const next = bins[i + 1] ?? bins[i];
//       return (prev + bins[i] + next) / 3;
//     });

//     return { bins, labels, binEdges, smooth };
//   }, [returns]);

//   return (
//     <div className="space-y-6 mt-6">
//       {results.map((res) => {
//         const varBinIndex = res.var_95 !== undefined
//           ? chartConfig.binEdges.findIndex(edge => edge >= res.var_95!)
//           : null;

//         const varLabel = res.var_95 !== undefined
//           ? `${(res.var_95 * 100).toFixed(2)}%`
//           : null;

//         const data = {
//           labels: chartConfig.labels,
//           datasets: [
//             {
//               type: 'bar' as const,
//               label: 'Return Frequency',
//               data: chartConfig.bins,
//               backgroundColor: '#9D4EDD',
//             },
//             {
//               type: 'line' as const,
//               label: 'Smoothed Curve',
//               data: chartConfig.smooth,
//               borderColor: '#45AFFF',
//               backgroundColor: 'transparent',
//               tension: 0.3,
//               pointRadius: 0,
//               borderWidth: 2,
//             },
//           ],
//         };

//         if (varBinIndex !== null) {
//           data.datasets.push({
//             type: 'line' as const,
//             label: 'VaR Threshold',
//             data: Array(chartConfig.bins.length).fill(null),
//             borderColor: '#FF0000',
//             pointRadius: 0,
//             borderWidth: 2,
//           });
//         }

//         const options = {
//           responsive: true,
//           plugins: {
//             legend: { display: true },
//             annotation: {
//               annotations: varBinIndex !== null
//                 ? {
//                     varLine: {
//                       type: 'line',
//                       borderColor: '#FF0000',
//                       borderWidth: 2,
//                       label: {
//                         enabled: true,
//                         content: `VaR: ${varLabel}`,
//                         backgroundColor: '#E041D1',
//                         color: '#fff',
//                         position: 'start',
//                         font: { weight: 'bold' },
//                       },
//                       xMin: varBinIndex,
//                       xMax: varBinIndex,
//                     },
//                   }
//                 : {},
//           },
//           },
//           scales: {
//             x: { ticks: { color: '#1A1A40' } },
//             y: { ticks: { color: '#1A1A40' } },
//           },
//         };

//         return (
//           <div
//             key={res.method}
//             className="bg-[#F4F4F4] text-[#1A1A40] p-6 rounded-xl shadow-md"
//           >
//             <h2 className="text-2xl font-bold mb-2 text-[#9D4EDD]">
//               {res.method.toUpperCase()} Results
//             </h2>

//             {res.message ? (
//               <p className="italic text-gray-600">{res.message}</p>
//             ) : (
//               <>
//                 <p>
//                   <strong>VaR (95%):</strong> {res.var_95?.toFixed(4)}
//                 </p>
//                 <p>
//                   <strong>Standard Deviation:</strong> {res.stddev?.toFixed(4)}
//                 </p>
//                 {returns.length > 0 && (
//                   <div className="mt-6">
//                     <h3 className="text-lg font-semibold mb-2 text-[#1A1A40]">
//                       Return Distribution
//                     </h3>
//                     <Bar data={data} options={options} />
//                   </div>
//                 )}
//               </>
//             )}
//           </div>
//         );
//       })}
//     </div>
//   );
// }

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

type MethodResult = {
  method: string;
  stddev?: number;
  var_95?: number;
  cvar_95?: number;
  sharpe_ratio?: number;
  sortino_ratio?: number;
  max_drawdown?: number;
  message?: string;
};

type Props = {
  result: {
    results: MethodResult[];
    returns: number[];
  };
};

export default function ResultCard({ result }: Props) {
  const { results, returns } = result;

  const chartConfig = useMemo(() => {
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

    const smooth = bins.map((_, i) => {
      const prev = bins[i - 1] ?? bins[i];
      const next = bins[i + 1] ?? bins[i];
      return (prev + bins[i] + next) / 3;
    });

    return { bins, labels, binEdges, smooth };
  }, [returns]);

  return (
    <div className="space-y-6 mt-6">
      {results.map((res) => {
        const varBinIndex = res.var_95 !== undefined
          ? chartConfig.binEdges.findIndex(edge => edge >= res.var_95!)
          : null;

        const varLabel = res.var_95 !== undefined
          ? `${(res.var_95 * 100).toFixed(2)}%`
          : null;

        const data = {
          labels: chartConfig.labels,
          datasets: [
            {
              type: 'bar' as const,
              label: 'Return Frequency',
              data: chartConfig.bins,
              backgroundColor: '#9D4EDD',
            },
            {
              type: 'line' as const,
              label: 'Smoothed Curve',
              data: chartConfig.smooth,
              borderColor: '#45AFFF',
              backgroundColor: 'transparent',
              tension: 0.3,
              pointRadius: 0,
              borderWidth: 2,
            },
          ],
        };

        if (varBinIndex !== null) {
          data.datasets.push({
            type: 'line' as const,
            label: 'VaR Threshold',
            data: Array(chartConfig.bins.length).fill(null),
            borderColor: '#FF0000',
            pointRadius: 0,
            borderWidth: 2,
          });
        }

        const options = {
          responsive: true,
          plugins: {
            legend: { display: true },
            annotation: {
              annotations: varBinIndex !== null
                ? {
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
                  }
                : {},
          },
          },
          scales: {
            x: { ticks: { color: '#1A1A40' } },
            y: { ticks: { color: '#1A1A40' } },
          },
        };

        return (
          <div
            key={res.method}
            className="bg-[#F4F4F4] text-[#1A1A40] p-6 rounded-xl shadow-md"
          >
            <h2 className="text-2xl font-bold mb-2 text-[#9D4EDD]">
              {res.method.toUpperCase()} Results
            </h2>

            {res.message ? (
              <p className="italic text-gray-600">{res.message}</p>
            ) : (
              <>
                <p><strong>VaR (95%):</strong> {res.var_95?.toFixed(4)}</p>
                <p><strong>CVaR (95%):</strong> {res.cvar_95?.toFixed(4)}</p>
                <p><strong>Standard Deviation:</strong> {res.stddev?.toFixed(4)}</p>
                <p><strong>Sharpe Ratio:</strong> {res.sharpe_ratio?.toFixed(4)}</p>
                <p><strong>Sortino Ratio:</strong> {res.sortino_ratio?.toFixed(4)}</p>
                <p><strong>Max Drawdown:</strong> {(res.max_drawdown !== undefined ? (res.max_drawdown * 100).toFixed(2) + '%' : '—')}</p>

                {returns.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2 text-[#1A1A40]">
                      Return Distribution
                    </h3>
                    <Bar data={data} options={options} />
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
