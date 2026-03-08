import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

export default function AdminAttendancePage() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [exporting, setExporting] = useState(false);

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ start_date: startDate, end_date: endDate });
      const res = await api.get(`/admin/attendance/report?${params}`);
      setAttendance(res.data.attendance || []);
    } catch (err) {
      console.error('Load attendance error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAttendance(); }, [startDate, endDate]);

  const exportCSV = () => {
    setExporting(true);
    const headers = ['Name', 'Member ID', 'Email', 'Date', 'Check-in Time'];
    const rows = attendance.map(a => [
      a.full_name, a.member_code, a.email,
      new Date(a.date).toLocaleDateString(),
      new Date(a.checkin_time).toLocaleTimeString(),
    ]);
    const csv = [headers, ...rows].map(row => row.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${startDate}-to-${endDate}.csv`;
    a.click();
    setExporting(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Attendance Report</h1>
          <p className="text-gray-400 text-sm mt-1">{attendance.length} records found</p>
        </div>
        <button onClick={exportCSV} disabled={exporting || attendance.length === 0}
          className="bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-500/30 disabled:opacity-40 transition-all">
          📥 Export CSV
        </button>
      </div>

      {/* Date Filters */}
      <div className="flex gap-4 flex-wrap">
        <div>
          <label className="block text-xs text-gray-400 mb-1">From Date</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
            className="bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">To Date</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
            className="bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 text-sm" />
        </div>
        <div className="flex items-end">
          <button onClick={() => { setStartDate(new Date().toISOString().split('T')[0]); setEndDate(new Date().toISOString().split('T')[0]); }}
            className="bg-orange-500/20 border border-orange-500/30 text-orange-400 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-orange-500/30">
            Today
          </button>
        </div>
      </div>

      <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-border text-gray-400 text-xs uppercase tracking-wide">
                <th className="text-left px-5 py-4">Member</th>
                <th className="text-left px-5 py-4">Member ID</th>
                <th className="text-left px-5 py-4">Date</th>
                <th className="text-left px-5 py-4">Check-in Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {loading ? (
                <tr><td colSpan={4} className="py-16 text-center"><LoadingSpinner /></td></tr>
              ) : attendance.length === 0 ? (
                <tr><td colSpan={4} className="py-16 text-center text-gray-500">No attendance records found</td></tr>
              ) : attendance.map(record => (
                <tr key={record.id} className="hover:bg-white/2">
                  <td className="px-5 py-4">
                    <div className="font-medium text-white">{record.full_name}</div>
                    <div className="text-gray-500 text-xs">{record.email}</div>
                  </td>
                  <td className="px-5 py-4 text-orange-400 font-mono text-sm">{record.member_code}</td>
                  <td className="px-5 py-4 text-gray-300">{new Date(record.date).toLocaleDateString('en', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</td>
                  <td className="px-5 py-4 text-gray-300">{new Date(record.checkin_time).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
