
import React, {useEffect, useState, useCallback} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import api from '../api';
import ReadMoreText from '../components/ReadMoreText';

function CourseDetail() {

  const { courseId } = useParams();
  const id = courseId;
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ================= FETCH COURSE =================
  const fetchCourseDetail = useCallback(async () => {

    try {

      setLoading(true);
      setError(null);

      // ================= COURSE DETAILS =================
      try {
        const courseRes = await api.get(`/api/course-details/${id}/`);
        setCourse(courseRes.data);

        // ================= COURSE VIDEOS =================
        try {
          const videosRes = await api.get(`/api/course-videos/${id}/`);
          setVideos(videosRes.data || []);
        } catch (e) {
          console.error('Error loading videos:', e);
          setVideos([]);
        }

      } catch (e) {

        // ================= FALLBACK =================
        const enrolled = await api.get(
          '/api/student-courses/'
        );

        const found = (enrolled.data || []).find(
          (c) =>
            String(c.id) === String(id) ||
            String(c.course_id) === String(id)
        );

        if (found) {

          setCourse({
            id: found.id,
            title: found.course,
            description: found.description,
            category: found.category,
            level: found.level,
            duration: found.duration,
          });

          setVideos(found.videos || []);

        } else {

          throw e;

        }
      }

    } catch (err) {

      console.error(
        'Error fetching course details:',
        err
      );

      setError(
        'Failed to load course details. Please try again.'
      );

    } finally {

      setLoading(false);

    }

  }, [id]);

  // ================= LOAD DATA =================
  useEffect(() => {

    fetchCourseDetail();

  }, [fetchCourseDetail]);

  // ================= MARK COMPLETE =================
  const handleMarkComplete = async (videoId) => {

    try {

      await api.post('/api/mark-complete/', {
        video_id: videoId
      });

      // Refresh course data
      await fetchCourseDetail();

    } catch (error) {

      console.error(
        'Error marking video complete:',
        error
      );

    }
  };

  // ================= LOADING =================
  if (loading) {

    return (

      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">

        <div className="text-center">

          <div className="animate-spin mb-4">

            <div className="h-12 w-12 border-4 border-cyan-400 border-t-transparent rounded-full mx-auto"></div>

          </div>

          <p className="text-slate-400">
            Loading course details...
          </p>

        </div>

      </div>
    );
  }

  // ================= ERROR =================
  if (error || !course) {

    return (

      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">

        <div className="text-center">

          <p className="text-rose-400 text-lg mb-4">
            {error || 'Course not found'}
          </p>

          <button
            onClick={() => navigate('/student')}
            className="inline-block rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-white hover:bg-cyan-600 transition"
          >
            Back to Dashboard
          </button>

        </div>

      </div>
    );
  }

  // ================= MAIN UI =================
  return (

    <div className="min-h-screen bg-slate-950 text-slate-100">

      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(236,72,153,0.16),_transparent_28%),linear-gradient(180deg,_#0f172a_0%,_#020617_100%)]" />

      <div className="pointer-events-none absolute left-1/2 top-[-8rem] h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-400/20 blur-3xl" />

      <div className="relative">

        {/* ================= HEADER ================= */}
        <div className="border-b border-white/10 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-10">

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">

            <button
              onClick={() => navigate('/student')}
              className="inline-flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/20 px-4 py-2 text-sm font-medium text-white transition"
            >
              ← Back
            </button>

            <h1 className="text-2xl font-bold text-white">
              Course Details
            </h1>

            <div className="w-20"></div>

          </div>

        </div>

        {/* ================= CONTENT ================= */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* ================= COURSE HEADER ================= */}
          <div className="rounded-2xl border border-white/10 bg-white/8 p-8 shadow-xl shadow-slate-950/20 backdrop-blur-xl mb-8">

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">

              <div className="flex-1">

                <p className="text-cyan-300/80 text-sm font-semibold uppercase tracking-wider mb-3">
                  📚 Course
                </p>

                <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                  {course.title || 'Untitled Course'}
                </h2>

                <ReadMoreText
                  text={
                    course.description ||
                    'No description available.'
                  }
                  className="text-slate-300 text-lg leading-relaxed max-w-3xl"
                />

              </div>

              <div className="flex flex-col gap-3 lg:text-right">

                {course.category && (
                  <div>
                    <p className="text-slate-400 text-sm">
                      Category
                    </p>

                    <p className="text-white font-semibold">
                      {course.category}
                    </p>
                  </div>
                )}

                {course.level && (
                  <div>
                    <p className="text-slate-400 text-sm">
                      Level
                    </p>

                    <p className="text-white font-semibold">
                      {course.level}
                    </p>
                  </div>
                )}

                {course.duration && (
                  <div>
                    <p className="text-slate-400 text-sm">
                      Duration
                    </p>

                    <p className="text-white font-semibold">
                      {course.duration}
                    </p>
                  </div>
                )}

              </div>

            </div>

          </div>

          {/* ================= VIDEOS ================= */}
          <div>

            <div className="mb-6">

              <p className="text-cyan-300/80 text-sm font-semibold uppercase tracking-wider mb-2">
                🎬 Course Videos
              </p>

              <h3 className="text-2xl font-bold text-white">
                {videos.length}{' '}
                {videos.length === 1
                  ? 'video'
                  : 'videos'}
              </h3>

            </div>

            {videos.length === 0 ? (

              <div className="rounded-2xl border-2 border-dashed border-white/15 bg-slate-950/40 p-12 text-center">

                <p className="text-lg font-semibold text-white mb-2">
                  No Videos Yet
                </p>

                <p className="text-slate-400">
                  Videos for this course will be available soon.
                </p>

              </div>

            ) : (

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

                {videos.map((video) => (

                  <VideoCard
                    key={video.id}
                    video={video}
                    courseId={course.id}
                    onMarkComplete={() =>
                      handleMarkComplete(video.id)
                    }
                  />

                ))}

              </div>

            )}

          </div>

        </main>

      </div>

    </div>
  );
}


// ================= VIDEO CARD =================

function VideoCard({
  video,
  courseId,
  onMarkComplete
}) {

  const navigate = useNavigate();

  const [showFullDesc, setShowFullDesc] =
    useState(false);

  // ================= THUMBNAIL =================
  const getYouTubeThumbnail = (url) => {

    if (!url) return null;

    let videoId = '';

    try {

      if (url.includes('youtu.be/')) {

        videoId = url
          .split('youtu.be/')[1]
          .split('?')[0];

      } else if (url.includes('watch?v=')) {

        videoId = url
          .split('v=')[1]
          .split('&')[0];

      }

      return videoId
        ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
        : null;

    } catch {

      return null;

    }
  };

  const thumbnail = getYouTubeThumbnail(video.link);

  return (

    <div className="group rounded-xl border border-white/10 bg-slate-900/50 overflow-hidden shadow-lg hover:shadow-xl hover:border-cyan-300/20 transition-all duration-300">

      {/* ================= THUMBNAIL ================= */}
      <div className="relative aspect-video bg-slate-950 overflow-hidden">

        {thumbnail ? (

          <img
            src={thumbnail}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

        ) : (

          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950">

            <span className="text-4xl">
              🎬
            </span>

          </div>

        )}

        {/* ================= PLAY BUTTON ================= */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">

          <button
            onClick={() =>
              navigate(
                `/watch-course/${courseId}/${video.id}`
              )
            }
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >

            <div className="rounded-full bg-white p-3 shadow-lg hover:bg-gray-100 transition">

              <svg
                className="w-6 h-6 text-slate-900"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>

            </div>

          </button>

        </div>

        {/* ================= COMPLETED BADGE ================= */}
        {video.completed && (

          <div className="absolute top-2 right-2 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
            ✓ Completed
          </div>

        )}

      </div>

      {/* ================= CONTENT ================= */}
      <div className="p-5">

        <h4 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-cyan-300 transition">
          {video.title || 'Untitled Video'}
        </h4>

        {video.description && (

          <p className={`text-sm text-slate-400 leading-relaxed mb-4 ${showFullDesc
              ? ''
              : 'line-clamp-2'
            }`}>
            {video.description}
          </p>

        )}

        {video.description &&
          video.description.length > 100 && (

            <button
              onClick={() =>
                setShowFullDesc(!showFullDesc)
              }
              className="text-xs text-cyan-400 hover:text-cyan-300 mb-4 transition"
            >
              {showFullDesc
                ? 'Show less'
                : 'Show more'}
            </button>

          )}

        {/* ================= ACTIONS ================= */}
        <div className="flex flex-col gap-3 pt-4 border-t border-white/10">

          <div className="flex items-center gap-2">

            {video.completed ? (

              <span className="inline-flex items-center gap-1 text-emerald-400 text-sm font-medium">
                ✓ Completed
              </span>

            ) : (

              <span className="inline-flex items-center gap-1 text-amber-400 text-sm font-medium">
                ⏱ Not Started
              </span>

            )}

          </div>

          <div className="flex gap-2">

            {/* WATCH */}
            <button
              onClick={() =>
                navigate(
                  `/watch-course/${courseId}/${video.id}`
                )
              }
              className="flex-1 rounded-lg bg-cyan-500 hover:bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition"
            >
              Watch Video
            </button>

            {/* MARK COMPLETE */}
            {!video.completed && (

              <button
                onClick={onMarkComplete}
                className="rounded-lg border border-white/20 hover:border-emerald-400 hover:bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-white transition"
              >
                Mark Done
              </button>

            )}

          </div>

        </div>

      </div>

    </div>
  );
}

export default CourseDetail;
