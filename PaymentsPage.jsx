import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import Modal from '../../components/shared/Modal';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

export default function PaymentsPage() {
  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ member_id: '', membership_plan_id: '', amount: '', payment_method: 'cash', notes: '' });
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [membersRes, plansRes] = await Promise.all([
        api.get('/admin/members?status=ACTIVE&limit=100'),
        api.get('/admin/membership-plans'),
      ]);
      setMembers(membersRes.data.members || []);
      setPlans(plansRes.data.plans || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanChange = (planId) => {
    const plan = plans.find(p => p.id === planId);
    setForm(prev => ({
      ...prev,
      membership_plan_id: planId,
      amount: plan ? plan.price.toString() : '',
    }));
  };

  const handleSubmit = async () => {
    if (!form.member_id || !form.amount) {
      alert('Member and amount are required');
      return;
    }
    setProcessing(true);
    try {
      await api.post('/admin/payments', form);
      setSuccess(true);
      setTimeout(() => {
        setShowModal(false);
        setSuccess(false);
        setForm({ member_id: '', membership_plan_id: '', amount: '', payment_method: 'cash', notes: '' });
      }, 2000);
    } catch (err) {
      alert(err.response?.data?.error || 'Payment recording failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Payments</h1>
          <p className="text-gray-400 text-sm mt-1">Record and manage membership payments</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="gym-gradient px-5 py-2.5 rounded-xl text-white font-bold text-sm hover:opacity-90 shadow-lg shadow-orange-500/20">
          + Record Payment
        </button>
      </div>

      <div className="bg-dark-card border border-dark-border rounded-2xl p-8 text-center">
        <div className="text-5xl mb-4">💳</div>
        <h3 className="text-xl font-bold text-white mb-2">Payment Management</h3>
        <p className="text-gray-400 mb-6">Use the button above to record new membership payments for active members.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
          {plans.map(plan => (
            <div key={plan.id} className="bg-dark border border-dark-border rounded-xl p-4">
              <div className="font-bold text-white mb-1">{plan.name}</div>
              <div className="text-orange-400 text-xl font-bold">₹{plan.price}</div>
              <div className="text-gray-500 text-sm">{plan.duration_months} month{plan.duration_months > 1 ? 's' : ''}</div>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Record Payment">
        {success ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-bold text-white">Payment Recorded!</h3>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Member *</label>
              <select value={form.member_id} onChange={e => setForm(prev => ({ ...prev, member_id: e.target.value }))}
                className="w-full bg-dark border border-dark-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500">
                <option value="">Select member</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.full_name} ({m.member_id})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Membership Plan</label>
              <select value={form.membership_plan_id} onChange={e => handlePlanChange(e.target.value)}
                className="w-full bg-dark border border-dark-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500">
                <option value="">Select plan (optional)</option>
                {plans.map(p => (
                  <option key={p.id} value={p.id}>{p.name} — ₹{p.price}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Amount (₹) *</label>
              <input type="number" value={form.amount} onChange={e => setForm(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
                className="w-full bg-dark border border-dark-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Payment Method</label>
              <select value={form.payment_method} onChange={e => setForm(prev => ({ ...prev, payment_method: e.target.value }))}
                className="w-full bg-dark border border-dark-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500">
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
              <input type="text" value={form.notes} onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Optional notes..."
                className="w-full bg-dark border border-dark-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500" />
            </div>
            <button onClick={handleSubmit} disabled={processing}
              className="w-full gym-gradient py-3 rounded-xl text-white font-bold hover:opacity-90 disabled:opacity-50">
              {processing ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
