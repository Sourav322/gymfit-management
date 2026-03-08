import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import Modal from '../../components/shared/Modal';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

export default function PendingApprovalsPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [approveModal, setApproveModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [membersRes, plansRes] = await Promise.all([
        api.get('/admin/members?status=PENDING_APPROVAL&limit=50'),
        api.get('/admin/membership-plans'),
      ]);
      setMembers(membersRes.data.members);
      setPlans(plansRes.data.plans);
    } catch (err) {
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedMember) return;
    setProcessing(true);
    try {
      await api.put(`/admin/members/${selectedMember.id}/approve`, {
        membership_plan_id: selectedPlan || null,
        start_date: startDate,
      });
      setApproveModal(false);
      setSelectedMember(null);
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Approval failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedMember) return;
    setProcessing(true);
    try {
      await api.put(`/admin/members/${selectedMember.id}/reject`, { reason: rejectReason });
      setRejectModal(false);
      setSelectedMember(null);
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Rejection failed');
    } finally {
      setProcessing(false);
    }
  };

  const openApproveModal = (member) => {
    setSelectedMember(member);
    setSelectedPlan('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setApproveModal(true);
  };

  const openRejectModal = (member) => {
    setSelectedMember(member);
    setRejectReason('');
    setRejectModal(true);
  };

  const photoUrl = (url) => url ? (url.startsWith('http') ? url : `http://localhost:5000${url}`) : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading pending members..." />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Pending Approvals</h1>
        <p className="text-gray-400 text-sm mt-1">{members.length} member{members.length !== 1 ? 's' : ''} waiting for approval</p>
      </div>

      {members.length === 0 ? (
        <div className="bg-dark-card border border-dark-border rounded-2xl p-16 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-xl font-bold text-white mb-2">All caught up!</h3>
          <p className="text-gray-400">No pending member approvals at this time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {members.map(member => (
            <div key={member.id} className="bg-dark-card border border-dark-border rounded-2xl p-5 hover:border-orange-500/30 transition-all">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                  {photoUrl(member.photo_url) ? (
                    <img src={photoUrl(member.photo_url)} alt={member.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-orange-400 text-2xl font-bold">{member.full_name?.charAt(0)}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-lg truncate">{member.full_name}</h3>
                  <p className="text-gray-400 text-sm truncate">{member.email}</p>
                  <p className="text-gray-500 text-xs">{member.phone}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm mb-4">
                {member.address && (
                  <div className="flex gap-2">
                    <span className="text-gray-500 flex-shrink-0">📍</span>
                    <span className="text-gray-400 text-xs">{member.address}</span>
                  </div>
                )}
                {member.date_of_birth && (
                  <div className="flex gap-2">
                    <span className="text-gray-500">🎂</span>
                    <span className="text-gray-400 text-xs">{new Date(member.date_of_birth).toLocaleDateString()}</span>
                  </div>
                )}
                {member.gender && (
                  <div className="flex gap-2">
                    <span className="text-gray-500">👤</span>
                    <span className="text-gray-400 text-xs">{member.gender}</span>
                  </div>
                )}
                <div className="flex gap-2">
                  <span className="text-gray-500">📅</span>
                  <span className="text-gray-400 text-xs">Applied: {new Date(member.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => openApproveModal(member)}
                  className="flex-1 bg-green-500/20 border border-green-500/30 text-green-400 py-2.5 rounded-xl text-sm font-bold hover:bg-green-500/30 transition-all">
                  ✓ Approve
                </button>
                <button
                  onClick={() => openRejectModal(member)}
                  className="flex-1 bg-red-500/20 border border-red-500/30 text-red-400 py-2.5 rounded-xl text-sm font-bold hover:bg-red-500/30 transition-all">
                  ✗ Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Approve Modal */}
      <Modal isOpen={approveModal} onClose={() => setApproveModal(false)} title="Approve Member">
        {selectedMember && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 p-4 bg-dark rounded-xl">
              <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-xl">
                {selectedMember.full_name?.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-white">{selectedMember.full_name}</div>
                <div className="text-gray-400 text-sm">{selectedMember.email}</div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Membership Plan</label>
              <select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                className="w-full bg-dark border border-dark-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500">
                <option value="">Select a plan (optional)</option>
                {plans.map(plan => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} — ₹{plan.price} / {plan.duration_months} month{plan.duration_months > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Membership Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-dark border border-dark-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500" />
            </div>

            <button
              onClick={handleApprove}
              disabled={processing}
              className="w-full bg-green-500 py-3 rounded-xl text-white font-bold hover:bg-green-600 disabled:opacity-50 transition-all">
              {processing ? 'Approving...' : 'Confirm Approval'}
            </button>
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal isOpen={rejectModal} onClose={() => setRejectModal(false)} title="Reject Member">
        {selectedMember && (
          <div className="space-y-5">
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-red-400 font-medium">You are rejecting: <span className="text-white">{selectedMember.full_name}</span></p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Reason (optional)</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                placeholder="Reason for rejection..."
                className="w-full bg-dark border border-dark-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 resize-none" />
            </div>
            <button
              onClick={handleReject}
              disabled={processing}
              className="w-full bg-red-500 py-3 rounded-xl text-white font-bold hover:bg-red-600 disabled:opacity-50 transition-all">
              {processing ? 'Rejecting...' : 'Confirm Rejection'}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
