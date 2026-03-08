import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { api } from '../../context/AuthContext';
import StatCard from '../../components/shared/StatCard';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dark-card border border-dark-border rounded-lg p-3 text-sm">
        <p className="text-gray-400">{label}</p>
        <p className="text-orange-400 font-bold">{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expiringMembers, setExpiringMembers] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [dashRes, expiringRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/members/expiring?days=7'),
      ]);
      setStats(dashRes.data.stats);
      setCharts(dashRes.data.charts);
      setExpiringMembers(expiringRes.data.members || []);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  const attendanceData = charts?.attendanceTrend?.slice(-14).map(d => ({
    date: new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    count: parseInt(d.count),
  })) || [];

  const revenueData = charts?.revenueByMonth?.map(d => ({
    month: new Date(d.month).toLocaleDateString('en', { month: 'short' }),
    revenue: parseFloat(d.total) || 0,
  })) || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">{new Date().toLocaleDateString('en', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <Link to="/admin/qr-code"
          className="gym-gradient px-5 py-2.5 rounded-xl text-white font-bold text-sm hover:opacity-90 flex items-center gap-2 shadow-lg shadow-orange-500/20">
          📱 Show QR Code
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Total Members" value={stats?.totalMembers || 0} icon="👥" color="blue" />
        <StatCard title="Active Members" value={stats?.activeMembers || 0} icon="💪" color="green" />
        <StatCard title="Pending Approval" value={stats?.pendingMembers || 0} icon="⏳" color="yellow" />
        <StatCard title="Today Attendance" value={stats?.todayAttendance || 0} icon="✅" color="orange" />
        <StatCard title="Monthly Revenue" value={`₹${(stats?.monthlyRevenue || 0).toLocaleString()}`} icon="💰" color="purple" />
        <StatCard title="Expiring Soon" value={stats?.expiringMembers || 0} icon="⚠️" color="red" subtitle="Within 7 days" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Attendance (Last 14 Days)</h3>
          {attendanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="count" stroke="#f97316" strokeWidth={2} dot={{ fill: '#f97316', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-500">No attendance data yet</div>
          )}
        </div>

        <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Monthly Revenue (₹)</h3>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" fill="#f97316" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-500">No revenue data yet</div>
          )}
        </div>
      </div>

      {/* Expiring Memberships */}
      {expiringMembers.length > 0 && (
        <div className="bg-dark-card border border-red-500/20 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span>⚠️</span> Memberships Expiring Soon
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-dark-border">
                  <th className="text-left pb-3">Member</th>
                  <th className="text-left pb-3">Plan</th>
                  <th className="text-left pb-3">Expiry</th>
                  <th className="text-left pb-3">Days Left</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {expiringMembers.map(m => (
                  <tr key={m.id} className="hover:bg-white/2">
                    <td className="py-3">
                      <div className="font-medium text-white">{m.full_name}</div>
                      <div className="text-gray-500 text-xs">{m.phone}</div>
                    </td>
                    <td className="py-3 text-gray-300">{m.plan_name || 'N/A'}</td>
                    <td className="py-3 text-gray-300">{m.membership_end_date ? new Date(m.membership_end_date).toLocaleDateString() : '-'}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${m.days_remaining <= 3 ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {m.days_remaining} days
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {stats?.pendingMembers > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-yellow-400 font-bold">Pending Approvals</p>
            <p className="text-gray-400 text-sm">{stats.pendingMembers} member{stats.pendingMembers > 1 ? 's' : ''} waiting for approval</p>
          </div>
          <Link to="/admin/pending"
            className="bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 px-5 py-2 rounded-xl text-sm font-bold hover:bg-yellow-500/30 transition-all">
            Review Now →
          </Link>
        </div>
      )}
    </div>
  );
}
