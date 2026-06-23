import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMsg('');
        setLoading(true);

        try {
            const res = await api.post('/api/forgot-password/', {
                email: email.trim(),
            });
            setMsg(res.data.message || 'Reset link sent');
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
            return;
        }
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-950 relative overflow-hidden flex flex-col items-center justify-center px-4">
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

            {/* Content Card */}
            <div className="relative z-10 w-full max-w-md">
                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 md:p-10 shadow-2xl shadow-cyan-950/40">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold">
                            <span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
                                SecureLearn
                            </span>
                        </h1>
                        <p className="text-slate-400 text-sm mt-2">Reset Password Request</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-cyan-400/50 focus:outline-none transition-all duration-300"
                            />
                        </div>

                        {msg && (
                            <div className="px-4 py-3 rounded-xl border border-green-500/30 bg-green-500/10 text-green-300 text-sm">
                                {msg}
                            </div>
                        )}
                        {error && (
                            <div className="px-4 py-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-4 py-3 bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link
                            to="/login"
                            className="text-cyan-400 font-medium hover:text-cyan-300 text-sm transition-colors"
                        >
                            Back to Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}