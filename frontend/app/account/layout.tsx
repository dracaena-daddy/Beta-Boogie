export default function AccountLayout({ children }: { children: React.ReactNode }) {
    return (
      <section className="p-6 min-h-screen bg-[#1A1A40] text-white">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-[#E041D1] mb-4">👤 Account Settings</h1>
          <div className="bg-[#F4F4F4] text-[#1A1A40] p-6 rounded-xl shadow-lg">
            {children}
          </div>
        </div>
      </section>
    );
  }
  