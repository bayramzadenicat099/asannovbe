import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Lock, User, ShieldCheck, ArrowRight } from 'lucide-react';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { username, password });
      localStorage.setItem('asan_token', res.data.token);
      toast.success('Xoş gəldiniz, Admin!');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error('Giriş məlumatları yanlışdır. Yenidən cəhd edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="asan-card w-full max-w-lg p-10 border border-gray-100 shadow-2xl shadow-gray-200/50 relative overflow-hidden group">
        {/* Background Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-asan-blue/10 rounded-full blur-3xl transition-transform group-hover:scale-150 duration-700"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col items-center mb-10">
            <div className="w-20 h-20 bg-asan-blue rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-asan-blue/20 rotate-3 group-hover:rotate-0 transition-transform">
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">ADMİN GİRİŞİ</h2>
            <p className="text-gray-500 font-medium mt-2">Sistemə daxil olmaq üçün məlumatları daxil edin</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">İstifadəçi Adı</label>
              <div className="relative">
                <User className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-16 pr-6 py-5 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-asan-blue transition-all font-bold text-gray-700 shadow-inner"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">Şifrə</label>
              <div className="relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-16 pr-6 py-5 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-asan-blue transition-all font-bold text-gray-700 shadow-inner"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-6 bg-asan-blue text-white rounded-2xl font-black text-xl hover:bg-blue-700 transition-all shadow-2xl shadow-asan-blue/20 active:scale-95 mt-4 flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>SİSTEMƏ DAXİL OL <ArrowRight className="w-6 h-6" /></>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-gray-400 text-sm font-bold">Məlumatları unutmusunuz? <span className="text-asan-blue cursor-pointer hover:underline">Sistem administratoru ilə əlaqə saxlayın</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
