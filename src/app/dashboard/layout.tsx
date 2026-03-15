import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import Header from '@/components/layout/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Fixed sidebar — desktop only */}
      <Sidebar />

      {/* Mobile top header */}
      <Header />

      {/* Main content — offset by sidebar on desktop, header/nav on mobile */}
      <main className="md:ml-64 min-h-screen bg-slate-50">
        <div className="pt-14 md:pt-0 pb-16 md:pb-0 p-6">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  );
}
