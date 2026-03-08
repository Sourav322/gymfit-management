import React, { useState, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';
import { api } from '../../context/AuthContext';

export default function QRCodePage() {
  const [qrData, setQrData] = useState(null);
  const [qrImageUrl, setQrImageUrl] = useState('');
  const [timeLeft, setTimeLeft] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [todayCount, setTodayCount] = useState(0);

  const generateNewQR = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/qr/generate');
      const data = res.data;
      setQrData(data);
      setTimeLeft(data.expirySeconds || 20);

      const qrPayload = JSON.stringify({
        token: data.token,
        gymId: data.gymId,
        expiresAt: data.expiresAt,
      });

      const imgUrl = await QRCode.toDataURL(qrPayload, {
        width: 320,
        margin: 2,
        color: { dark: '#f97316', light: '#12121a' },
        errorCorrectionLevel: 'M',
      });
      setQrImageUrl(imgUrl);
    } catch (err) {
      setError('Failed to generate QR code');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load today attendance count
  const loadTodayCount = useCallback(async () => {
    try {
      const res = await api.get('/admin/attendance/report?start_date=' + new Date().toISOString().split('T')[0] + '&end_date=' + new Date().toISOString().split('T')[0]);
      setTodayCount(res.data.attendance?.length || 0);
    } catch {}
  }, []);

  useEffect(() => {
    generateNewQR();
    loadTodayCount();
  }, [generateNewQR, loadTodayCount]);

  // Countdown timer
  useEffect(() => {
    if (!qrData || loading) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          generateNewQR();
          return 20;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [qrData, loading, generateNewQR]);

  // Refresh attendance count every 10s
  useEffect(() => {
    const interval = setInterval(loadTodayCount, 10000);
    return () => clearInterval(interval);
  }, [loadTodayCount]);

  const progressPercent = (timeLeft / (qrData?.expirySeconds || 20)) * 100;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">QR Code Station</h1>
        <p className="text-gray-400 text-sm mt-1">Members scan this to mark attendance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Code Display */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-8 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 font-medium text-sm">Live — Auto-refreshes every 20 seconds</span>
          </div>

          {loading ? (
            <div className="w-80 h-80 flex items-center justify-center border-2 border-dashed border-dark-border rounded-2xl">
              <div className="text-center">
                <div className="w-10 h-10 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-gray-400 text-sm">Generating...</p>
              </div>
            </div>
          ) : error ? (
            <div className="w-80 h-80 flex items-center justify-center border-2 border-dashed border-red-500/30 rounded-2xl">
              <div className="text-center">
                <p className="text-red-400 mb-3">{error}</p>
                <button onClick={generateNewQR} className="gym-gradient px-4 py-2 rounded-lg text-white text-sm font-medium">
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <div className="relative qr-pulse rounded-2xl p-2 border-2 border-orange-500/40">
              <img src={qrImageUrl} alt="Attendance QR Code" className="rounded-xl" style={{ width: 280, height: 280 }} />
            </div>
          )}

          {/* Timer */}
          <div className="mt-6 w-full max-w-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Expires in</span>
              <span className={`font-bold text-lg ${timeLeft <= 5 ? 'text-red-400' : timeLeft <= 10 ? 'text-yellow-400' : 'text-green-400'}`}>
                {timeLeft}s
              </span>
            </div>
            <div className="w-full bg-dark rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-1000 ${timeLeft <= 5 ? 'bg-red-500' : timeLeft <= 10 ? 'bg-yellow-500' : 'bg-green-500'}`}
                style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          <button
            onClick={generateNewQR}
            disabled={loading}
            className="mt-5 gym-gradient px-6 py-2.5 rounded-xl text-white font-medium text-sm hover:opacity-90 disabled:opacity-50 transition-all">
            🔄 Refresh Now
          </button>
        </div>

        {/* Instructions & Stats */}
        <div className="space-y-5">
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              📊 Today Statistics
            </h3>
            <div className="text-center py-4">
              <div className="text-6xl font-bold text-orange-400 mb-2">{todayCount}</div>
              <div className="text-gray-400">Members checked in today</div>
            </div>
          </div>

          <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">How It Works</h3>
            <div className="space-y-4">
              {[
                { icon: '📱', step: '1', text: 'Member opens the app on their phone' },
                { icon: '📷', step: '2', text: 'Taps the "Scan QR" button on their dashboard' },
                { icon: '🔍', step: '3', text: 'Points camera at the QR code on this screen' },
                { icon: '✅', step: '4', text: 'Attendance is instantly recorded in the system' },
              ].map(item => (
                <div key={item.step} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-sm flex-shrink-0">
                    {item.step}
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <span>{item.icon}</span> {item.text}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-5">
            <h4 className="text-orange-400 font-bold mb-2">🔒 Security Features</h4>
            <ul className="text-gray-400 text-sm space-y-1.5">
              <li>• QR tokens expire after 20 seconds</li>
              <li>• AES encrypted tokens prevent forgery</li>
              <li>• Gym ID embedded in every token</li>
              <li>• One attendance per member per day</li>
              <li>• Backend verification on every scan</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
