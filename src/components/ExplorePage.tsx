import React, { useState } from 'react';
import {
  Search,
  Filter,
  MapPin,
  Clock,
  Sparkles,
  GitBranch,
  ChevronRight,
  Eye,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { Challenge } from '../types';

interface ExplorePageProps {
  challenges: Challenge[];
  onSelectChallenge: (challenge: Challenge) => void;
  onOpenReport: () => void;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({
  challenges,
  onSelectChallenge,
  onOpenReport
}) => {
  const [category, setCategory] = useState<string>('All');
  const [priority, setPriority] = useState<string>('All');
  const [status, setStatus] = useState<string>('All');
  const [district, setDistrict] = useState<string>('All');
  const [routing, setRouting] = useState<string>('All');
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const pageSize = 12;

  const districts = Array.from(new Set(challenges.map(c => c.district))).sort();

  const filtered = challenges.filter(c => {
    if (category !== 'All' && c.category !== category) return false;
    if (priority !== 'All' && c.priority !== priority) return false;
    if (status !== 'All' && c.status !== status) return false;
    if (district !== 'All' && c.district !== district) return false;
    if (routing !== 'All' && c.assignedTo?.type !== routing) return false;
    if (search) {
      const q = search.toLowerCase();
      const match =
        c.id.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.village.toLowerCase().includes(q) ||
        c.mandal.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  const resetFilters = () => {
    setCategory('All');
    setPriority('All');
    setStatus('All');
    setDistrict('All');
    setRouting('All');
    setSearch('');
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Civic Challenge Explorer ({filtered.length})
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse and filter through all crowdsourced challenges across Jharkhand districts.
          </p>
        </div>

        <button
          onClick={onOpenReport}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow"
        >
          + Report New Problem
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-8 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by ID, keyword, village or issue description..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
            >
              <option value="All">All Categories</option>
              <option value="Water">Water</option>
              <option value="Waste Management">Waste Management</option>
              <option value="Roads & Infrastructure">Roads & Infrastructure</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => { setPriority(e.target.value); setPage(1); }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Routing Entity</label>
            <select
              value={routing}
              onChange={(e) => { setRouting(e.target.value); setPage(1); }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
            >
              <option value="All">All Entities</option>
              <option value="Panchayat">Panchayat</option>
              <option value="University">University</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">District</label>
            <select
              value={district}
              onChange={(e) => { setDistrict(e.target.value); setPage(1); }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
            >
              <option value="All">All Districts</option>
              {districts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      {paginated.length === 0 ? (
        <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-xs">
          No challenges found matching the current filter criteria. Try clicking "Reset" to clear filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginated.map(challenge => (
            <div
              key={challenge.id}
              onClick={() => onSelectChallenge(challenge)}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 cursor-pointer transition-all hover:shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    {challenge.id}
                  </span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                    challenge.priority === 'Critical' ? 'bg-red-500/20 text-red-300' :
                    challenge.priority === 'High' ? 'bg-amber-500/20 text-amber-300' :
                    'bg-blue-500/20 text-blue-300'
                  }`}>
                    {challenge.priority}
                  </span>
                </div>

                <h3 className="font-bold text-base text-white line-clamp-2 mb-2">
                  {challenge.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                  {challenge.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    <span>{challenge.village}, {challenge.district}</span>
                  </span>
                  <span>{new Date(challenge.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                    challenge.status.includes('Resolved') ? 'bg-emerald-500/20 text-emerald-300' :
                    challenge.status.includes('Panchayat') ? 'bg-sky-500/20 text-sky-300' :
                    'bg-purple-500/20 text-purple-300'
                  }`}>
                    {challenge.status}
                  </span>
                  <span className="text-xs text-blue-400 font-medium flex items-center gap-1">
                    Open Dossier <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8 text-xs text-slate-400">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-40"
          >
            Previous
          </button>
          <span>Page {page} of {totalPages}</span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
