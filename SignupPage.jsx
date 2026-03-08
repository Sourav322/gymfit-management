import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    full_name: '', email: '', phone: '', password: '', confirmPassword: '',
    address: '', date_of_birth: '', gender: ''
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (key !== 'confirmPassword' && formData[key]) {
          data.append(key, formData[key]);
        }
      });
      if (photo) data.append('photo', photo);

      await signup(data);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl">✓</div>
          <h2 className="text-3xl font-bold text-white mb-3">Registration Successful!</h2>
          <p className="text-gray-400 mb-6">Your account is pending admin approval. You will be able to login once approved.</p>
          <Link to="/login" className="gym-gradient px-8 py-3 rounded-xl text-white font-bold inline-block hover:opacity-90">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white">Join <span className="text-orange-400">GYMFIT</span></h1>
          <p className="text-gray-400 mt-2">Create your member account</p>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}

            {/* Photo Upload */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-dashed border-dark-border flex items-center justify-center bg-dark cursor-pointer relative"
                onClick={() => document.getElementById('photoInput').click()}>
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl">📷</span>
                )}
              </div>
              <div>
                <input id="photoInput" type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                <button type="button" onClick={() => document.getElementById('photoInput').click()}
                  className="text-orange-400 text-sm font-medium hover:text-orange-300">
                  Upload Photo
                </button>
                <p className="text-gray-500 text-xs mt-1">JPG, PNG up to 5MB</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name *</label>
                <input name="full_name" type="text" value={formData.full_name} onChange={handleChange} required
                  placeholder="John Doe"
                  className="w-full bg-dark border border-dark-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-all" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                <input name="email" type="email" value={formData.email} onChange={handleChange} required
                  placeholder="john@example.com"
                  className="w-full bg-dark border border-dark-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-all" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number *</label>
                <input name="phone" type="tel" value={formData.phone} onChange={handleChange} required
                  placeholder="+91 9999999999"
                  className="w-full bg-dark border border-dark-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-all" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Date of Birth</label>
                <input name="date_of_birth" type="date" value={formData.date_of_birth} onChange={handleChange}
                  className="w-full bg-dark border border-dark-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-all" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange}
                  className="w-full bg-dark border border-dark-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-all">
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Address</label>
                <textarea name="address" value={formData.address} onChange={handleChange} rows={2}
                  placeholder="Your full address"
                  className="w-full bg-dark border border-dark-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-all resize-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password *</label>
                <input name="password" type="password" value={formData.password} onChange={handleChange} required
                  placeholder="Min. 6 characters"
                  className="w-full bg-dark border border-dark-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-all" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password *</label>
                <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required
                  placeholder="Confirm your password"
                  className="w-full bg-dark border border-dark-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-all" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full gym-gradient py-3 rounded-xl text-white font-bold text-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20 mt-4">
              {loading ? 'Registering...' : 'Create Account'}
            </button>

            <p className="text-center text-gray-400 text-sm">
              Already a member?{' '}
              <Link to="/login" className="text-orange-400 hover:text-orange-300 font-medium">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
