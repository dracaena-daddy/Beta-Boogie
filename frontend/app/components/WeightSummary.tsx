type Props = {
    totalWeight: number;
    isValid: boolean;
  };
  
  export default function WeightSummary({ totalWeight, isValid }: Props) {
    return (
      <div className="mt-2 text-sm">
        <p className={`font-medium ${isValid ? 'text-green-400' : 'text-red-400'}`}>
          Total Weight: {totalWeight.toFixed(4)} {isValid ? '(Valid)' : '(Must equal 1.0)'}
        </p>
      </div>
    );
  }
  