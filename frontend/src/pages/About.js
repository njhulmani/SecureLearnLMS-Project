import React from 'react';
import { useNavigate } from 'react-router-dom';

function About() {

    const navigate = useNavigate();

    return (
        <section className="min-h-screen bg-slate-950 text-white overflow-hidden relative">

            {/* BACKGROUND GLOW */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/10 blur-3xl rounded-full" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/10 blur-3xl rounded-full" />
            </div>


            {/* HEADER */}
            <div className="relative z-10 border-b border-white/10 bg-slate-900/40 backdrop-blur-xl">

                <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

                    <div>
                        <p className="text-cyan-300 uppercase tracking-[0.25em] text-xs mb-2">
                            SecureLearn LMS
                        </p>

                        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
                            About The Project
                        </h1>
                    </div>

                    <button
                        onClick={() => navigate(-1)}
                        className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 px-5 py-3 transition"
                    >
                        ← Back
                    </button>

                </div>

            </div>


            {/* HERO SECTION */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-16 items-center">

                <div>

                    <p className="text-cyan-300 uppercase tracking-[0.25em] text-sm mb-5">
                        Modern E-Learning Platform
                    </p>

                    <h2 className="text-5xl md:text-6xl font-black leading-tight mb-8">
                        Secure & Interactive
                        <span className="block bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
                            Learning Experience
                        </span>
                    </h2>

                    <p className="text-slate-300 text-lg leading-8 mb-8">
                        SecureLearn LMS is a modern Learning Management System designed to provide secure, scalable, and interactive online education experiences for students, trainers, and administrators.
                    </p>

                    <p className="text-slate-400 leading-8">
                        The platform enables course management, secure video learning, student enrollment, progress tracking, continue watching system, session management, watermark-based security, and role-based access control.
                    </p>

                </div>


                {/* FEATURES CARD */}
                <div className="grid gap-6">

                    <div className="rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-xl p-7 hover:border-cyan-400/30 transition">
                        <div className="text-4xl mb-4">🎓</div>
                        <h3 className="text-2xl font-bold mb-3">Course Management</h3>
                        <p className="text-slate-400 leading-7">
                            Admins and trainers can create, organize, update, and manage courses with interactive learning content.
                        </p>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-xl p-7 hover:border-cyan-400/30 transition">
                        <div className="text-4xl mb-4">🔒</div>
                        <h3 className="text-2xl font-bold mb-3">Secure Learning</h3>
                        <p className="text-slate-400 leading-7">
                            Dynamic watermarking, session management, and protected access improve content security and prevent unauthorized sharing.
                        </p>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-xl p-7 hover:border-cyan-400/30 transition">
                        <div className="text-4xl mb-4">📈</div>
                        <h3 className="text-2xl font-bold mb-3">Progress Tracking</h3>
                        <p className="text-slate-400 leading-7">
                            Students can monitor learning progress, continue watching videos, and access personalized course dashboards.
                        </p>
                    </div>

                </div>

            </div>


            {/* TECH STACK */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 pb-20">

                <div className="rounded-[2rem] border border-white/10 bg-slate-900/40 backdrop-blur-xl p-10">

                    <div className="mb-12 text-center">
                        <p className="text-cyan-300 uppercase tracking-[0.25em] text-sm mb-3">
                            Technology Stack
                        </p>

                        <h2 className="text-4xl font-bold">
                            Built With Modern Technologies
                        </h2>
                    </div>


                    <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

                        <div className="rounded-3xl bg-slate-950/60 border border-white/10 p-7 text-center">
                            <div className="text-5xl mb-4">⚛️</div>
                            <h3 className="text-2xl font-bold mb-2">React</h3>
                            <p className="text-slate-400 text-sm leading-6">
                                Frontend UI development with modern component-based architecture.
                            </p>
                        </div>

                        <div className="rounded-3xl bg-slate-950/60 border border-white/10 p-7 text-center">
                            <div className="text-5xl mb-4">🐍</div>
                            <h3 className="text-2xl font-bold mb-2">Django REST</h3>
                            <p className="text-slate-400 text-sm leading-6">
                                Secure backend APIs with authentication and role-based access.
                            </p>
                        </div>

                        <div className="rounded-3xl bg-slate-950/60 border border-white/10 p-7 text-center">
                            <div className="text-5xl mb-4">🐘</div>
                            <h3 className="text-2xl font-bold mb-2">PostgreSQL</h3>
                            <p className="text-slate-400 text-sm leading-6">
                                Reliable relational database for course and user management.
                            </p>
                        </div>

                        <div className="rounded-3xl bg-slate-950/60 border border-white/10 p-7 text-center">
                            <div className="text-5xl mb-4">☁️</div>
                            <h3 className="text-2xl font-bold mb-2">Render + Vercel</h3>
                            <p className="text-slate-400 text-sm leading-6">
                                Cloud deployment for scalable frontend and backend hosting.
                            </p>
                        </div>

                    </div>

                </div>

            </div>


            {/* FOOTER */}
            <div className="relative z-10 border-t border-white/10 bg-slate-900/30 backdrop-blur-xl">

                <div className="max-w-7xl mx-auto px-6 py-8 text-center">

                    <div className="border-t border-white/10 pt-8">
                        <div className="text-center text-slate-400 text-sm space-y-2">
                            <p>© 2026 SecureLearn LMS. All rights reserved.</p>
                            <p>Secure Learning Platform Developed By @NagarajHulmani </p>
                        </div>
                    </div>

                </div>

            </div>

        </section>
    );
}

export default About;