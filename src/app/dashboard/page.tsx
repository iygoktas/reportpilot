import { BarChart3 } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <BarChart3 className="w-12 h-12 text-slate-300 mb-4" />
      <h2 className="text-lg font-medium text-slate-700 mb-2">No clients yet</h2>
      <p className="text-sm text-slate-500 mb-6">
        Add your first client to start generating reports
      </p>
      <button className="bg-blue-500 text-white hover:bg-blue-600 rounded-lg px-4 py-2 font-medium text-sm transition-colors">
        Add Client
      </button>
    </div>
  );
}
