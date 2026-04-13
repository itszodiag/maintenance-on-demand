import { useEffect, useMemo, useState } from 'react';
import { Building2, Plus, Search, Trash2, Users } from 'lucide-react';
import { adminApi } from '../api/modules.js';
import { DashboardLayout } from '../components/dashboard/DashboardLayout.jsx';
import { extractCollection } from '../lib/dashboard.js';

export function AdminCompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const response = await adminApi.companies();
      setCompanies(extractCollection(response));
    } catch (error) {
      setFeedback(error.message || 'Unable to load companies.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const filteredCompanies = useMemo(() => {
    if (!searchQuery.trim()) return companies;
    const query = searchQuery.toLowerCase();
    return companies.filter((company) => {
      const name = (company.name || '').toLowerCase();
      const userName = (
        company.user?.display_name ||
        company.user?.name ||
        ''
      ).toLowerCase();
      return name.includes(query) || userName.includes(query);
    });
  }, [companies, searchQuery]);

  const removeCompany = async (companyId) => {
    if (!window.confirm('Are you sure you want to remove this company?')) {
      return;
    }
    try {
      setFeedback('');
      await adminApi.removeCompany(companyId);
      setFeedback('Company removed successfully.');
      await loadCompanies();
    } catch (error) {
      setFeedback(error.message || 'Unable to remove company.');
    }
  };

  return (
    <DashboardLayout
      title="Company Management"
      subtitle="Oversee all registered companies and their operations."
    >
      <div className="space-y-6">
        {feedback && (
          <div
            className={`rounded-[28px] px-6 py-4 text-sm font-semibold ${
              feedback.includes('Error')
                ? 'bg-rose-50 text-rose-700'
                : 'bg-emerald-50 text-emerald-700'
            }`}
          >
            {feedback}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-blue-100">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Total Companies
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {companies.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                All Companies
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Search and manage registered companies
              </p>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search companies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-[18px] border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {loading ? (
              <div className="py-8 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
                <p className="mt-4 text-sm text-slate-500">
                  Loading companies...
                </p>
              </div>
            ) : filteredCompanies.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                {searchQuery.trim()
                  ? 'No companies match your search.'
                  : 'No companies registered yet.'}
              </p>
            ) : (
              filteredCompanies.map((company) => (
                <div
                  key={company.id}
                  className="flex flex-col gap-3 rounded-[24px] border border-slate-100 bg-slate-50/80 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      {company.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      {company.user?.email || '-'}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        {company.services_count || 0} services
                      </span>
                      <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        {company.technicians_count || 0} technicians
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => removeCompany(company.id)}
                      className="flex items-center gap-2 rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
