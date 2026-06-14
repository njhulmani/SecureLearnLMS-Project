import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function LoginRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/registration-requests/');
      setRequests(response.data || []);
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error?.response?.data?.error || 'Unable to load registration requests.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (requestId, action) => {
    setActionId(requestId);
    setFeedback({ type: '', text: '' });

    try {
      await api.post(`/api/registration-requests/${requestId}/${action}/`);
      setFeedback({
        type: 'success',
        text: action === 'approve'
          ? 'Registration request approved successfully.'
          : 'Registration request rejected successfully.'
      });
      await fetchRequests();
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error?.response?.data?.error || 'Unable to update request.'
      });
    } finally {
      setActionId(null);
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(236,72,153,0.16),_transparent_28%),linear-gradient(180deg,_#0f172a_0%,_#020617_100%)]" />
      <div className="pointer-events-none absolute left-1/2 top-[-8rem] h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-400/20 blur-3xl" />

      <div className="relative z-10 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <div className="mb-8 flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/40 px-4 py-2 text-sm font-semibold text-slate-300 backdrop-blur-xl transition hover:border-cyan-400/30 hover:text-cyan-400"
            >
              <span aria-hidden="true">←</span>
              Back
            </button>

            <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
              Admin approval queue
            </span>
          </div>

          <header className="rounded-[2rem] border border-white/10 bg-white/8 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-xl sm:p-8">
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/80">Login Requests</p>
            <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Pending Registration Requests</h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
              Review new student and trainer registrations, then approve or reject each request to control who can log in.
            </p>
          </header>

          {feedback.text && (
            <div className={`mt-6 rounded-xl border px-4 py-3 ${feedback.type === 'success'
              ? 'border-green-500/30 bg-green-500/10 text-green-300'
              : 'border-red-500/30 bg-red-500/10 text-red-300'
              }`}>
              {feedback.text}
            </div>
          )}

          <main className="mt-6 rounded-[2rem] border border-white/10 bg-slate-900/40 p-4 shadow-xl shadow-slate-950/20 backdrop-blur-xl sm:p-6">
            {loading ? (
              <div className="py-20 text-center text-slate-400">Loading registration requests...</div>
            ) : requests.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-lg font-semibold text-white">No registration requests found.</p>
                <p className="mt-2 text-sm text-slate-400">New student and trainer requests will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-[0.25em] text-slate-400">
                      <th className="px-4 py-2">Name</th>
                      <th className="px-4 py-2">Email</th>
                      <th className="px-4 py-2">Role</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Request Date</th>
                      <th className="px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((item) => (
                      <tr key={item.id} className="rounded-2xl bg-white/5 align-middle text-sm text-slate-200">
                        <td className="px-4 py-4 font-semibold text-white">{item.name || `${item.first_name} ${item.last_name}`}</td>
                        <td className="px-4 py-4">{item.email}</td>
                        <td className="px-4 py-4 capitalize">{item.role}</td>
                        <td className="px-4 py-4">
                          <StatusPill status={item.status} />
                        </td>
                        <td className="px-4 py-4 text-slate-300">
                          {item.request_date ? new Date(item.request_date).toLocaleString() : '—'}
                        </td>
                        <td className="px-4 py-4">
                          {item.status === 'pending' ? (
                            <div className="flex flex-wrap gap-3">
                              <button
                                type="button"
                                onClick={() => handleAction(item.id, 'approve')}
                                disabled={actionId === item.id}
                                className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {actionId === item.id ? 'Working...' : 'Approve'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAction(item.id, 'reject')}
                                disabled={actionId === item.id}
                                className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-400">Reviewed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const statusStyles = {
    pending: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
    approved: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
    rejected: 'border-rose-400/30 bg-rose-400/10 text-rose-300',
  };

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${statusStyles[status] || 'border-slate-400/30 bg-slate-400/10 text-slate-300'}`}>
      {status}
    </span>
  );
}

export default LoginRequests;
