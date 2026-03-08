import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password, isAdmin);
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/member/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed';
      const status = err.response?.data?.status;
      if (status === 'PENDING_APPROVAL') {
        setError('Your account is pending admin approval. Please wait.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="w-20 h-20 gym-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/20">
            <span className="text-white text-4xl font-bold">G</span>
          </div>
          <h1 className="text-4xl font-bold text-white">GYMFIT</h1>
          <p className="text-gray-400 mt-2">Premium Fitness Management</p>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-2xl p-8">
          {/* Role Toggle */}
          <div className="flex mb-6 bg-dark rounded-xl p-1">
            <button
              onClick={() => setIsAdmin(false)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${!isAdmin ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Member Login
            </button>
            <button
              onClick={() => setIsAdmin(true)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${isAdmin ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Admin Login
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full bg-dark border border-dark-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="w-full bg-dark border border-dark-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full gym-gradient py-3 rounded-xl text-white font-bold text-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {!isAdmin && (
            <p className="text-center text-gray-400 mt-6 text-sm">
              New member?{' '}
              <Link to="/signup" className="text-orange-400 hover:text-orange-300 font-medium">
                Register here
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
