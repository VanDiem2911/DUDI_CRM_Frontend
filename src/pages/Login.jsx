import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, AlertCircle, LogIn, Search } from 'lucide-react';
import api from '../services/api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Lookup Modal State
  const [isLookupOpen, setIsLookupOpen] = useState(false);
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupResults, setLookupResults] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');

  const handleQuickLogin = async (quickUsername, quickPassword) => {
    setUsername(quickUsername);
    setPassword(quickPassword);
    setError('');
    setLoading(true);
    try {
      const user = await login(quickUsername, quickPassword);
      if (user.role === 'ROLE_ADMIN') {
        navigate('/admin');
      } else {
        navigate('/employee');
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        'Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản và mật khẩu.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const user = await login(username, password);
      if (user.role === 'ROLE_ADMIN') {
        navigate('/admin');
      } else {
        navigate('/employee');
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        'Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản và mật khẩu.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLookup = async () => {
    if (!lookupQuery.trim()) {
      setLookupError('Vui lòng nhập tên hoặc số điện thoại.');
      return;
    }
    setLookupError('');
    setLookupLoading(true);
    setLookupResults(null);
    try {
      const response = await api.get(`/auth/lookup`, {
        params: { query: lookupQuery.trim() }
      });
      setLookupResults(response.data);
    } catch (err) {
      console.error(err);
      setLookupError(err.response?.data?.message || 'Có lỗi xảy ra khi tra cứu.');
    } finally {
      setLookupLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 py-12 relative overflow-hidden space-y-6">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />

      <div className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden relative z-10">
        <div className="bg-gradient-to-b from-[#ff3b46] to-[#e51b23] text-white pt-10 pb-8 px-8 text-center rounded-b-[2.5rem] shadow-lg relative overflow-hidden">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          
          <h1 className="text-2xl font-black tracking-wider text-white">DUDISOFTWARE</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/80 mt-1">Công nghệ tiên phong - Giải pháp tối ưu</p>
          <div className="mt-6 text-xl font-extrabold uppercase tracking-wide border-t border-white/20 pt-5 leading-snug">
            Hệ thống CRM thông minh
          </div>
        </div>

        <form className="p-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="flex items-center p-3.5 bg-red-50 rounded-xl text-red-700 text-xs border border-red-100">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                Mã nhân viên
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#e51b23]/20 focus:border-[#e51b23] transition duration-200 shadow-sm"
                placeholder="Nhập mã nhân viên..."
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                Mật khẩu
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#e51b23]/20 focus:border-[#e51b23] transition duration-200 shadow-sm"
                placeholder="Nhập mật khẩu..."
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              defaultChecked
              className="h-4 w-4 text-[#e51b23] focus:ring-[#e51b23] border-slate-300 rounded cursor-pointer accent-[#e51b23]"
            />
            <label htmlFor="remember-me" className="ml-2 block text-xs font-semibold text-slate-600 cursor-pointer select-none">
              Ghi nhớ đăng nhập
            </label>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-[#e51b23] hover:bg-[#d0151c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e51b23] disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 shadow-red-500/20"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Đăng nhập</span>
                </>
              )}
            </button>
          </div>

          <div className="text-center">
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                setIsLookupOpen(true);
              }} 
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Quên mã nhân viên? Tra cứu tại đây
            </a>
          </div>

          {/* Quick Login Section */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-[10px] font-bold uppercase tracking-wider">Đăng nhập nhanh</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('admin', 'admin123')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 disabled:opacity-50 transition duration-200"
            >
              🔑 Admin
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('2026061535', '1234')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 disabled:opacity-50 transition duration-200"
            >
              👤 Nhân viên
            </button>
          </div>
        </form>
      </div>

      {/* Lookup Modal */}
      {isLookupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl border border-slate-100 space-y-5">
            <h2 className="text-lg font-black text-[#e51b23] text-center uppercase tracking-wide">
              Tra cứu mã nhân viên
            </h2>
            
            <div className="space-y-4">
              <input
                type="text"
                value={lookupQuery}
                onChange={(e) => setLookupQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleLookup();
                }}
                className="block w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition duration-200 shadow-sm"
                placeholder="Nhập tên hoặc số điện thoại"
              />

              <button
                type="button"
                onClick={handleLookup}
                disabled={lookupLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-white bg-[#e51b23] hover:bg-[#d0151c] transition duration-200 shadow-md shadow-red-500/10 disabled:opacity-50"
              >
                {lookupLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Tìm kiếm</span>
                  </>
                )}
              </button>

              {lookupError && (
                <p className="text-center text-xs font-bold text-red-600 bg-red-50 p-2 rounded-lg">{lookupError}</p>
              )}

              {lookupResults && lookupResults.length > 0 && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 max-h-40 overflow-y-auto">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kết quả tìm thấy (Click để chọn):</p>
                  {lookupResults.map((emp) => (
                    <div 
                      key={emp.username} 
                      onClick={() => {
                        setUsername(emp.username);
                        setIsLookupOpen(false);
                        setLookupResults(null);
                        setLookupQuery('');
                      }}
                      className="flex justify-between items-center p-2.5 hover:bg-red-50 rounded-lg cursor-pointer transition border border-transparent hover:border-red-100"
                      title="Click để chọn mã nhân viên này"
                    >
                      <span className="text-xs font-bold text-slate-700">{emp.fullName}</span>
                      <span className="text-xs font-extrabold text-[#e51b23] bg-red-50 px-2.5 py-1 rounded-md">{emp.username}</span>
                    </div>
                  ))}
                </div>
              )}

              {lookupResults && lookupResults.length === 0 && (
                <p className="text-center text-xs font-bold text-slate-500">Không tìm thấy kết quả phù hợp</p>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsLookupOpen(false);
                  setLookupResults(null);
                  setLookupQuery('');
                  setLookupError('');
                }}
                className="w-full py-3 px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-sm transition duration-200"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="text-center text-[10px] text-slate-400 font-bold tracking-wider relative z-10 uppercase">
        © 2026 Dudisoftware - Hệ thống CRM thông minh
      </div>
    </div>
  );
};

export default Login;
