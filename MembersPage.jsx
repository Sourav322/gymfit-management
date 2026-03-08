import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../context/AuthContext';
import Badge from '../../components/shared/Badge';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [exporting, setExporting] = useState(false);

  const loadMembers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      const res = await api.get(`/admin/members?${params}`);
      setMembers(res.data.members);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error('Load members error:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    const timer = setTimeout(loadMembers, 300);
    return () => clearTimeout(timer);
  }, [loadMembers]);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const res = await api.get('/admin/members/export-csv', { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `members-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setExporting(false);
    }
  };

  const handleDeactivate = async (id, currentStatus) => {
    const action = currentStatus === 'ACTIVE' ? 'deactivate' : 'reactivate';
    if (!window.confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} this member?`)) return;
    try {
      await api.put(`/admin/members/${id}/${action}`);
      loadMembers();
    } catch (err) {
      alert(err.response?.data?.error || 'Action failed');
    }
  };

  const photoUrl = (url) => url ? (url.startsWith('http') ? url : `http://localhost:5000${url}`) : null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Members</h1>
          <p className="text-gray-400 text-sm mt-1">{total} total members</p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={exporting}
          className="bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-500/30 transition-all flex items-center gap-2">
          {exporting ? '...' : '📥 Export CSV'}
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <input
          type="text"
          placeholder="Search by name, email, phone, ID..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 min-w-48 bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 text-sm"
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 text-sm">
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="PENDING_APPROVAL">Pending</option>
          <option value="INACTIVE">Inactive</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-border text-gray-400 text-xs uppercase tracking-wide">
                <th className="text-left px-5 py-4">Member</th>
                <th className="text-left px-5 py-4">Contact</th>
                <th className="text-left px-5 py-4">Plan</th>
                <th className="text-left px-5 py-4">Membership</th>
                <th className="text-left px-5 py-4">Status</th>
                <th className="text-left px-5 py-4">Joined</th>
                <th className="text-left px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {loading ? (
                <tr><td colSpan={7} className="py-16 text-center"><LoadingSpinner /></td></tr>
              ) : members.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center text-gray-500">No members found</td></tr>
              ) : members.map(member => (
                <tr key={member.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                        {photoUrl(member.photo_url) ? (
                          <img src={photoUrl(member.photo_url)} alt={member.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-orange-400 font-bold">{member.full_name?.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-white">{member.full_name}</div>
                        <div className="text-gray-500 text-xs">{member.member_id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-gray-300 text-xs">{member.email}</div>
                    <div className="text-gray-500 text-xs">{member.phone}</div>
                  </td>
                  <td className="px-5 py-4 text-gray-300 text-xs">{member.plan_name || <span className="text-gray-600">No plan</span>}</td>
                  <td className="px-5 py-4">
                    {member.membership_end_date ? (
                      <div>
                        <div className="text-gray-300 text-xs">{new Date(member.membership_end_date).toLocaleDateString()}</div>
                        {new Date(member.membership_end_date) < new Date() && (
                          <div className="text-red-400 text-xs">Expired</div>
                        )}
                      </div>
                    ) : <span className="text-gray-600 text-xs">-</span>}
                  </td>
                  <td className="px-5 py-4"><Badge status={member.status} /></td>
                  <td className="px-5 py-4 text-gray-400 text-xs">{new Date(member.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Link to={`/admin/members/${member.id}`}
                        className="text-blue-400 hover:text-blue-300 text-xs font-medium bg-blue-500/10 px-3 py-1.5 rounded-lg">
                        View
                      </Link>
                      {member.status === 'ACTIVE' && (
                        <button onClick={() => handleDeactivate(member.id, member.status)}
                          className="text-red-400 hover:text-red-300 text-xs font-medium bg-red-500/10 px-3 py-1.5 rounded-lg">
                          Deactivate
                        </button>
                      )}
                      {member.status === 'INACTIVE' && (
                        <button onClick={() => handleDeactivate(member.id, member.status)}
                          className="text-green-400 hover:text-green-300 text-xs font-medium bg-green-500/10 px-3 py-1.5 rounded-lg">
                          Activate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-dark-border">
            <span className="text-gray-400 text-sm">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-4 py-2 rounded-lg bg-dark border border-dark-border text-gray-400 hover:text-white disabled:opacity-30 text-sm">
                ← Prev
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-4 py-2 rounded-lg bg-dark border border-dark-border text-gray-400 hover:text-white disabled:opacity-30 text-sm">
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
