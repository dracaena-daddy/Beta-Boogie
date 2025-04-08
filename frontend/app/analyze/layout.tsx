export default function AnalyzeLayout({ children }: { children: React.ReactNode }) {
    return (
      <section className="p-6 min-h-screen bg-[#1A1A40] text-white">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-[#9D4EDD] mb-4">🔍 Portfolio Analyzer</h1>
          <div className="bg-[#F4F4F4] text-[#1A1A40] p-6 rounded-xl shadow-lg">
            {children}
          </div>
        </div>
      </section>
    );
  }
  