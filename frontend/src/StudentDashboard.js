
import React, {useEffect, useState, useCallback} from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';
import ReadMoreText from './components/ReadMoreText';

function StudentDashboard() {

  const navigate = useNavigate();

  const currentUser = JSON.parse(
    localStorage.getItem('user')
  );

  // ================= STATES =================
  const [continueWatching, setContinueWatching] =
    useState([]);

  const [courses, setCourses] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [showProfile, setShowProfile] =
    useState(false);

  const [profile, setProfile] =
    useState(currentUser || {});

  const [stats, setStats] = useState({
    courses: 0,
    completed: 0,
    total_videos: 0,
    progress: 0,
  });

  // ================= INITIALS =================
  const initials = (
    currentUser?.first_name?.[0] ||
    currentUser?.username?.[0] ||
    'S'
  ).toUpperCase();

  // ================= FETCH COURSES =================
  const fetchCourses = async () => {

    try {

      setLoading(true);

      const response = await api.get(
        '/api/student-courses/'
      );

      setCourses(response.data || []);

    } catch (error) {

      console.error(
        'Error fetching courses:',
        error
      );

      setCourses([]);

    } finally {

      setLoading(false);

    }
  };

  // ================= FETCH STATS =================
  const fetchStats = async () => {

    try {

      const res = await api.get(
        '/api/student-stats/'
      );

      setStats(res.data);

    } catch (error) {

      console.error(
        'Error fetching stats:',
        error
      );

    }
  };

  // ================= FETCH CONTINUE WATCHING =================
  const fetchContinueWatching =
    useCallback(async () => {

      try {

        const response = await api.get(
          '/api/continue-watching/'
        );

        setContinueWatching(
          response.data || []
        );

      } catch (error) {

        console.error(
          'Error fetching continue watching:',
          error
        );

        setContinueWatching([]);

      }

    }, []);

  // ================= INITIAL LOAD =================
  useEffect(() => {

    fetchCourses();
    fetchStats();
    fetchContinueWatching();

  }, [fetchContinueWatching]);

  // ================= PROFILE FETCH =================
  useEffect(() => {

    if (!showProfile) {
      return;
    }

    let mounted = true;

    const fetchProfile = async () => {

      try {

        const response = await api.get(
          '/api/current-user/'
        );

        if (mounted && response?.data) {

          setProfile(response.data);

        }

      } catch (error) {

        if (mounted) {

          setProfile(currentUser || {});

        }

      }
    };

    fetchProfile();

    return () => {

      mounted = false;

    };

  }, [showProfile, currentUser]);

  // ================= LOGOUT =================
  const handleLogout = async () => {

    try {

      await api.post('/api/logout/');

    } catch (e) {

      // ignore

    } finally {

      localStorage.removeItem(
        'access_token'
      );

      localStorage.removeItem(
        'session_token'
      );

      localStorage.removeItem('user');

      window.location.href = '/';

    }
  };

  // ================= VIEW COURSE =================
  const handleViewCourse = (courseId) => {

    navigate(`/course/${courseId}`);

  };

  // ================= CONTINUE DATA =================
  const getContinueData = (courseId) => {

    return continueWatching.find(
      (item) =>
        String(item.course_id) ===
        String(courseId)
    );
  };

  // ================= MAIN UI =================
  return (

    <div className="min-h-screen bg-slate-950 text-slate-100">

      {/* BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(236,72,153,0.16),_transparent_28%),linear-gradient(180deg,_#0f172a_0%,_#020617_100%)]" />

      <div className="pointer-events-none absolute left-1/2 top-[-8rem] h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-400/20 blur-3xl" />

      <div className="relative">

        {/* ================= HEADER ================= */}
        <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">

            <div className="flex items-center justify-between">

              {/* LEFT */}
              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 text-sm font-bold text-white">
                  S
                </div>

                <div>

                  <h1 className="text-sm font-semibold text-white">
                    Student Dashboard
                  </h1>

                  <p className="text-xs text-cyan-300/80 uppercase tracking-wider">
                    Student
                  </p>

                </div>

              </div>

              {/* RIGHT */}
              <div className="flex items-center gap-4">

                {/* PROFILE */}
                <div className="hidden sm:flex items-center gap-2">

                  <button
                    onClick={() =>
                      setShowProfile(true)
                    }
                    className="text-left hover:underline"
                    aria-label="View profile"
                  >

                    <div>

                      <p className="text-sm font-medium text-white">
                        {currentUser?.first_name ||
                          currentUser?.username ||
                          'Student'}
                      </p>

                      <p className="text-xs text-slate-400">
                        {currentUser?.email ||
                          'learner'}
                      </p>

                    </div>

                  </button>

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-xs font-semibold text-white">
                    {initials}
                  </div>

                </div>

                {/* LOGOUT */}
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/30 px-3 py-2 text-sm font-medium text-rose-300 hover:text-rose-200 transition"
                >

                  <span>🚪</span>

                  <span className="hidden sm:inline">
                    Logout
                  </span>

                </button>

              </div>

            </div>

          </div>

        </header>

        {/* ================= MAIN CONTENT ================= */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* PAGE HEADER */}
          <div className="mb-8">

            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-2">
              My Courses
            </h2>

            <p className="text-slate-400 text-lg">
              Access your enrolled courses and track your learning progress
            </p>

          </div>

          {/* ================= STATS ================= */}
          <div className="grid gap-4 md:grid-cols-4 mb-8">

            <StatCard
              icon="📚"
              label="Enrolled Courses"
              value={stats.courses}
            />

            <StatCard
              icon="✓"
              label="Videos Completed"
              value={`${stats.completed}/${stats.total_videos}`}
            />

            <StatCard
              icon="📈"
              label="Overall Progress"
              value={`${stats.progress}%`}
            />

            <StatCard
              icon="⏱️"
              label="Time Spent"
              value="--:--"
            />

          </div>

          {/* ================= COURSES ================= */}
          <div>

            {loading ? (

              <div className="text-center py-12">

                <div className="inline-flex flex-col items-center gap-4">

                  <div className="animate-spin">

                    <div className="h-12 w-12 border-4 border-cyan-400 border-t-transparent rounded-full"></div>

                  </div>

                  <p className="text-slate-400">
                    Loading your courses...
                  </p>

                </div>

              </div>

            ) : courses.length === 0 ? (

              <div className="rounded-2xl border-2 border-dashed border-white/15 bg-slate-950/40 p-12 text-center">

                <p className="text-xl font-semibold text-white mb-2">
                  No Courses Yet
                </p>

                <p className="text-slate-400 mb-6">
                  Your admin will assign courses to you when they're available.
                </p>

                <button
                  onClick={() =>
                    window.location.href = '/'
                  }
                  className="inline-block rounded-lg bg-cyan-500 hover:bg-cyan-600 px-6 py-2 font-semibold text-white transition"
                >
                  Go to Home
                </button>

              </div>

            ) : (

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

                {courses.map((course) => (

                  <CourseCard
                    key={
                      course.id ||
                      course.course_id
                    }
                    course={course}
                    continueData={getContinueData(
                      course.id ||
                        course.course_id
                    )}
                    onViewCourse={
                      handleViewCourse
                    }
                  />

                ))}

              </div>

            )}

          </div>

        </main>

      </div>

      {/* ================= PROFILE MODAL ================= */}
      {showProfile && (

        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/75 px-4 backdrop-blur-sm">

          <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl shadow-cyan-950/40">

            <div className="h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500" />

            {/* HEADER */}
            <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">

              <div>

                <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">
                  Student Profile
                </p>

                <h3 className="mt-1 text-2xl font-bold text-white">
                  {profile?.first_name ||
                    profile?.username ||
                    'Student'}
                </h3>

                <p className="text-sm text-slate-400">
                  Your account details at a glance
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowProfile(false)
                }
                className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                Close
              </button>

            </div>

            {/* CONTENT */}
            <div className="grid gap-4 px-6 py-6 sm:grid-cols-2">

              <ProfileField
                label="First Name"
                value={profile?.first_name}
              />

              <ProfileField
                label="Last Name"
                value={profile?.last_name}
              />

              <ProfileField
                label="Username"
                value={profile?.username}
              />

              <ProfileField
                label="Email"
                value={profile?.email}
              />

              <ProfileField
                label="Role"
                value={profile?.role}
              />

              <ProfileField
                label="Date Joined"
                value={
                  profile?.date_joined
                    ? new Date(
                        profile.date_joined
                      ).toLocaleDateString()
                    : '-'
                }
              />

            </div>

          </div>

        </div>

      )}

    </div>
  );
}


// ================= PROFILE FIELD =================

function ProfileField({
  label,
  value
}) {

  return (

    <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4">

      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
        {label}
      </p>

      <p className="mt-2 break-words text-base font-medium text-white">
        {value || '-'}
      </p>

    </div>
  );
}


// ================= COURSE CARD =================

function CourseCard({
  course,
  continueData,
  onViewCourse
}) {

  const courseId =
    course.id || course.course_id;

  const courseTitle =
    course.course ||
    course.title ||
    'Untitled Course';

  const progress =
    course.progress || 0;

  return (

    <div className="group rounded-xl border border-white/10 bg-slate-900/50 overflow-hidden shadow-lg hover:shadow-2xl hover:border-cyan-300/20 transition-all duration-300 hover:-translate-y-1 flex flex-col">

      {/* TOP BAR */}
      <div className="h-1 bg-gradient-to-r from-cyan-400 to-blue-500"></div>

      <div className="p-6 flex flex-col flex-1">

        {/* TITLE */}
        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-cyan-300 transition">
          {courseTitle}
        </h3>

        {/* PROGRESS */}
        <div className="mb-4">

          <div className="flex items-center justify-between mb-2">

            <span className="text-sm text-slate-400">
              Progress
            </span>

            <span className="text-sm font-semibold text-cyan-400">
              {progress}%
            </span>

          </div>

          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">

            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300"
              style={{
                width: `${progress}%`
              }}
            ></div>

          </div>

        </div>

        {/* DESCRIPTION */}
        {course.description && (

          <ReadMoreText
            text={course.description}
            className="text-sm text-slate-400 mb-4 line-clamp-3 leading-relaxed"
          />

        )}

        {/* META */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-slate-400 flex-1">

          {course.category && (

            <div>

              <p className="text-slate-500">
                Category
              </p>

              <p className="font-medium text-white truncate">
                {course.category}
              </p>

            </div>

          )}

          {course.level && (

            <div>

              <p className="text-slate-500">
                Level
              </p>

              <p className="font-medium text-white truncate">
                {course.level}
              </p>

            </div>

          )}

        </div>

        {/* CONTINUE LEARNING */}
        {continueData ? (

          <div className="mt-auto">

            <div className="mb-3 rounded-lg border border-cyan-400/20 bg-cyan-500/10 p-3">

              <p className="text-xs uppercase tracking-wider text-cyan-300 mb-1">
                Continue Learning
              </p>

              <p className="text-sm font-medium text-white line-clamp-1">
                {continueData.video_title}
              </p>

            </div>

            <button
              onClick={() =>
                window.location.href =
                  `/watch-course/${courseId}/${continueData.video_id}`
              }
              className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 px-4 py-3 font-semibold text-white transition-all duration-200 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
            >
              Continue Learning →
            </button>

          </div>

        ) : (

          <button
            onClick={() =>
              onViewCourse(courseId)
            }
            className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 px-4 py-3 font-semibold text-white transition-all duration-200 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
          >
            View Course →
          </button>

        )}

      </div>

    </div>
  );
}


// ================= STATS CARD =================

function StatCard({
  icon,
  label,
  value
}) {

  return (

    <div className="rounded-lg border border-white/10 bg-white/5 p-4 shadow-md hover:shadow-lg transition">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm text-slate-400 mb-1">
            {label}
          </p>

          <p className="text-2xl font-bold text-white">
            {value}
          </p>

        </div>

        <span className="text-3xl">
          {icon}
        </span>

      </div>

    </div>
  );
}

export default StudentDashboard;