import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from './api';

function Login({ setUser }) {

  // ==========================Navigation==========================
  const navigate = useNavigate();

  // ==========================State==========================
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });



  // =========================Login Handler==========================
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password || !role) {
      setFeedback({
        type: 'error',
        text: 'Please fill in username/mobile number, password, and role.'
      });
      return;
    }

    setLoading(true);
    setFeedback({ type: '', text: '' });

    // ✅ Clear old tokens
    localStorage.removeItem('access_token');
    localStorage.removeItem('session_token');

    try {

      const response = await api.post('/api/login/', {
        identifier: username,
        password,
        role
      });

      // ✅ Store ALL tokens FIRST
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('session_token', response.data.session_token);
      localStorage.setItem('user', JSON.stringify(response.data));

      // ✅ Update state
      setUser(response.data);

      if (response.data.role === 'admin') {
        navigate('/admin');
      }
      else if (response.data.role === 'trainer') {
        navigate('/trainer');
      }
      else {
        navigate('/student');
      }


    } catch (error) {

      setFeedback({
        type: 'error',
        text: error?.response?.data?.error || 'Invalid username/mobile number or password.'
      });

    } finally {
      setLoading(false);

    }
  };

  // ==========================Back Handler==========================
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate('/');
  };



  // ==========================UI==========================
  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden flex flex-col items-center justify-center">
      {/* Background gradients */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(236,72,153,0.16),_transparent_28%),linear-gradient(180deg,_#0f172a_0%,_#020617_100%)]" />
      <div className="pointer-events-none absolute left-1/2 top-[-8rem] h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-400/20 blur-3xl" />

      {/* Back button */}
      <div className="absolute top-8 left-8 z-20">
        <button
          onClick={handleBack}
          className="px-4 py-2 text-slate-300 hover:text-cyan-400 transition-colors duration-300 flex items-center gap-2"
        >
          ← Back
        </button>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 md:p-10 shadow-2xl shadow-cyan-950/40">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
                SecureLearn
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-2">LMS Login</p>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleLogin}>
            {/* Username Input */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Username or Email
              </label>
              <input
                type="text"
                placeholder="Enter your Username/Email/Mobile"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-cyan-400/50 focus:outline-none transition-all duration-300"
              />
            </div>



            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-cyan-400/50 focus:outline-none transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:border-cyan-400/50 focus:outline-none transition-all duration-300"
              >
                <option value="">Select role</option>
                <option value="admin">Admin</option>
                <option value="trainer">Trainer</option>
                <option value="student">Student</option>
              </select>
            </div>

            {feedback.text && (
              <div
                className={`px-4 py-3 rounded-xl border ${feedback.type === 'success'
                  ? 'bg-green-500/10 border-green-500/30 text-green-300'
                  : 'bg-red-500/10 border-red-500/30 text-red-300'
                  }`}
              >
                {feedback.text}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 mt-6 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link
              to="/forgot-password"
              className="text-slate-400 hover:text-cyan-400 text-sm font-medium transition-colors duration-300"
            >
              Forgot Password?
            </Link>
          </div>

          <div className="mt-3 text-center">
            <p className="text-slate-400 text-sm">
              Don't have an account?{' '}
              <Link to="/signup" className="text-cyan-400 font-medium hover:text-cyan-300 transition-colors">
                Sign Up
              </Link>
            </p>
          </div>

          {/* Footer Text */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-slate-400 text-sm">
              Secure Learning Management System
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-6">
          <p className="text-slate-400 text-sm">
            Demo Credentials:
            <br />
            <span className="text-cyan-400 font-medium">student / password123 / student</span>
          </p>
        </div>
      </div>
    </div>
  );

}

export default Login;