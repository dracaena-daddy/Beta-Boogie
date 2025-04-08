export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
      <div className="p-4 bg-[#1A1A40] text-white min-h-screen">
        <h2 className="text-2xl font-bold text-[#E041D1] mb-4">📊 Dashboard</h2>
        <div className="bg-[#F4F4F4] text-[#1A1A40] p-4 rounded-xl shadow-lg">
          {children}
        </div>
      </div>
    );
  }
  