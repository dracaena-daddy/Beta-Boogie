type Props = {
    result: {
      var_95: number;
      stddev: number;
    };
  };
  
  export default function ResultCard({ result }: Props) {
    return (
      <div className="bg-[#F4F4F4] text-[#1A1A40] p-6 rounded-xl mt-6 shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-[#9D4EDD]">Results</h2>
        <p>
          <strong>VaR (95%):</strong> {result.var_95.toFixed(4)}
        </p>
        <p>
          <strong>Standard Deviation:</strong> {result.stddev.toFixed(4)}
        </p>
      </div>
    );
  }
  