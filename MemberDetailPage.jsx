import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../context/AuthContext';
import Badge from '../../components/shared/Badge';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

export default function MemberDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMember();
  }, [id]);

  const loadMember = async () => {
    try {
      const res = await api.get(`/admin/members/${id}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action) => {
    if (!window.confirm(`${action} this member?`)) return;
    try {
      await api.put(`/admin/members/${id}/${action}`);
      loadMember();
    } catch (err) {
      alert(err.response?.data?.error || 'Action failed');
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner size="lg" /></div>;
  if (!data) return <div className="p-6 text-gray-400">Member not found</div>;

  const { member, attendance, payments } = data;
  const photoUrl = member.photo_url ? (member.photo_url.startsWith('http') ? member.photo_url : `http://localhost:5000${member.photo_url}`) : null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition-colors">← Back</button>
        <h1 className="text-3xl font-bold text-white">Member Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
          <div className="text-center mb-6">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-orange-500/20 flex items-center justify-center mx-auto mb-4 border-4 border-orange-500/30">
              {photoUrl ? (
                <img src={photoUrl} alt={member.full_name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-orange-400 text-4xl font-bold">{member.full_name?.charAt(0)}</span>
              )}
            </div>
            <h2 className="text-xl font-bold text-white">{member.full_name}</h2>
            <p className="text-orange-400 font-mono text-sm mt-1">{member.member_id}</p>
            <div className="mt-2"><Badge status={member.status} /></div>
          </div>

          <div className="space-y-3 text-sm">
            {[
              { label: 'Email', value: member.email },
              { label: 'Phone', value: member.phone },
              { label: 'Gender', value: member.gender },
              { label: 'Address', value: member.address },
              { label: 'Joined', value: new Date(member.created_at).toLocaleDateString() },
            ].map(item => item.value && (
              <div key={item.label} className="flex justify-between">
                <span className="text-gray-500">{item.label}</span>
                <span className="text-gray-300 text-right max-w-[60%] break-words">{item.value}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-6 space-y-2">
            {member.status === 'ACTIVE' && (
              <button onClick={() => handleAction('deactivate')}
                className="w-full bg-red-500/20 border border-red-500/30 text-red-400 py-2.5 rounded-xl text-sm font-medium hover:bg-red-500/30 transition-all">
                Deactivate Member
              </button>
            )}
            {member.status === 'INACTIVE' && (
              <button onClick={() => handleAction('reactivate')}
                className="w-full bg-green-500/20 border border-green-500/30 text-green-400 py-2.5 rounded-xl text-sm font-medium hover:bg-green-500/30 transition-all">
                Reactivate Member
              </button>
            )}
          </div>
        </div>

        {/* Membership & Attendance */}
        <div className="lg:col-span-2 space-y-5">
          {/* Membership Info */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Membership</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-dark rounded-xl p-4">
                <p className="text-gray-500 text-xs mb-1">Current Plan</p>
                <p className="text-white font-bold">{member.plan_name || 'No Plan'}</p>
              </div>
              <div className="bg-dark rounded-xl p-4">
                <p className="text-gray-500 text-xs mb-1">Plan Price</p>
                <p className="text-orange-400 font-bold">{member.plan_price ? `₹${member.plan_price}` : '-'}</p>
              </div>
              <div className="bg-dark rounded-xl p-4">
                <p className="text-gray-500 text-xs mb-1">Start Date</p>
                <p className="text-white font-medium">{member.membership_start_date ? new Date(member.membership_start_date).toLocaleDateString() : '-'}</p>
              </div>
              <div className="bg-dark rounded-xl p-4">
                <p className="text-gray-500 text-xs mb-1">Expiry Date</p>
                <p className={`font-medium ${member.membership_end_date && new Date(member.membership_end_date) < new Date() ? 'text-red-400' : 'text-white'}`}>
                  {member.membership_end_date ? new Date(member.membership_end_date).toLocaleDateString() : '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Attendance History */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">
              Attendance History
              <span className="text-gray-400 text-sm font-normal ml-2">({attendance.length} sessions)</span>
            </h3>
            {attendance.length === 0 ? (
              <p className="text-gray-500 text-center py-6">No attendance records yet</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {attendance.map(a => (
                  <div key={a.id} className="flex items-center justify-between py-2.5 px-3 bg-dark rounded-lg">
                    <span className="text-white text-sm">{new Date(a.date).toLocaleDateString('en', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    <span className="text-green-400 text-xs">{new Date(a.checkin_time).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payments */}
          {payments.length > 0 && (
            <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Payment History</h3>
              <div className="space-y-2">
                {payments.map(p => (
                  <div key={p.id} className="flex items-center justify-between py-2.5 px-3 bg-dark rounded-lg">
                    <div>
                      <span className="text-white text-sm font-medium">₹{parseFloat(p.amount).toLocaleString()}</span>
                      <span className="text-gray-500 text-xs ml-2">via {p.payment_method}</span>
                    </div>
                    <span className="text-gray-400 text-xs">{new Date(p.payment_date).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
