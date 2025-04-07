type Props = {
    startDate: string;
    endDate: string;
    setStartDate: (val: string) => void;
    setEndDate: (val: string) => void;
  };
  
  export default function DateRangePicker({ startDate, endDate, setStartDate, setEndDate }: Props) {
    return (
      <div className="flex gap-4">
        <div className="flex flex-col flex-1">
          <label className="mb-1 text-sm text-[#E041D1]">Start Date</label>
          <input
            type="date"
            className="rounded-lg p-2 bg-[#1A1A40] text-white border border-[#45AFFF]"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="flex flex-col flex-1">
          <label className="mb-1 text-sm text-[#E041D1]">End Date</label>
          <input
            type="date"
            className="rounded-lg p-2 bg-[#1A1A40] text-white border border-[#45AFFF]"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>
    );
  }
  