import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import WatermarkOverlay from '../components/WatermarkOverlay';

function WatchCourse() {

    const { courseId, videoId } = useParams();
    const navigate = useNavigate();

    const [isScreenBlocked, setIsScreenBlocked] = useState(false);

    const [showSidebar, setShowSidebar] = useState(true);



    // ================= STATES =================
    const [course, setCourse] = useState(null);
    const [videos, setVideos] = useState([]);
    const [currentVideo, setCurrentVideo] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMarkingComplete, setIsMarkingComplete] = useState(false);


    const getYoutubeThumbnail = (url) => {
        if (!url) return '';

        const regExp =
            /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;

        const match = url.match(regExp);

        const videoId =
            match && match[2].length === 11
                ? match[2]
                : null;

        return videoId
            ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
            : '';
    };

    // ================= CURRENT INDEX =================
    const currentIndex = videos.findIndex((v) => String(v.id) === String(videoId));

    const nextVideo =
        currentIndex >= 0
            ? videos[currentIndex + 1]
            : null;

    // ================= FETCH DATA =================
    const fetchWatchData = useCallback(async () => {

        try {
            setLoading(true);
            setError(null);

            // ================= VIDEOS =================
            const videosRes = await api.get(`/api/course-videos/${courseId}/`);
            const allVideos = videosRes.data || [];

            setVideos(allVideos);

            const studentCoursesRes = await api.get('/api/student-courses/');

            const matchedCourse = studentCoursesRes.data.find(
                (c) => String(c.id) === String(courseId)
            );

            if (matchedCourse) {
                setCourse({
                    title: matchedCourse.course
                });

            }

            // ================= CURRENT VIDEO =================
            let selectedVideo;

            if (videoId) {
                selectedVideo = allVideos.find(
                    (v) =>
                        String(v.id) === String(videoId)
                );

            } else {

                // OPEN FIRST VIDEO AUTOMATICALLY
                selectedVideo = allVideos[0];

            }

            if (!selectedVideo) {
                setError('Video not found');
                return;
            }

            setCurrentVideo(selectedVideo);

            // ================= TRACK WATCH =================
            try {
                await api.post(
                    '/api/track-video-watch/', { course_id: courseId, video_id: selectedVideo.id });

                console.log('Tracking saved');

            } catch (trackError) {
                console.error('Tracking failed:', trackError);
            }

        } catch (err) {
            console.error('Error loading watch page:', err);
            setError('Failed to load video');
        } finally {
            setLoading(false);
        }

    }, [courseId, videoId]);

    // ================= MARK AS COMPLETED =================
    const handleMarkComplete = async () => {
        if (!currentVideo || currentVideo.completed) return;

        try {
            setIsMarkingComplete(true);

            await api.post('/api/mark-complete/', {
                video_id: currentVideo.id,
                course_id: courseId
            });

            // Update currentVideo state
            setCurrentVideo((prev) => ({
                ...prev,
                completed: true
            }));

            // Update videos list in sidebar
            setVideos((prevVideos) =>
                prevVideos.map((video) =>
                    video.id === currentVideo.id
                        ? { ...video, completed: true }
                        : video
                )
            );

        } catch (err) {
            console.error('Error marking video complete:', err);
        } finally {
            setIsMarkingComplete(false);
        }
    };

    // ================= SCREEN BLOCKING =================
    useEffect(() => {

        const handleKeyDown = (e) => {
            // ================= WINDOWS SCREENSHOT SHORTCUTS =================
            const isWindowsPrintScreen = e.key === 'PrintScreen';
            const isWindowsAltPrintScreen = e.altKey && e.key === 'PrintScreen';
            const isWindowsShiftPrintScreen = e.shiftKey && e.key === 'PrintScreen';
            const isWindowsSnipTool = e.metaKey && e.shiftKey && e.key === 's';

            // ================= MAC SCREENSHOT SHORTCUTS =================
            const isMacScreenshot =
                e.metaKey &&
                e.shiftKey &&
                (
                    e.key === '3' ||
                    e.key === '4' ||
                    e.key === '5' ||
                    e.key === '6'
                );

            // ================= COMBINED CHECK =================
            const isScreenshotAttempt =
                isWindowsPrintScreen ||
                isWindowsAltPrintScreen ||
                isWindowsShiftPrintScreen ||
                isWindowsSnipTool ||
                isMacScreenshot;

            if (isScreenshotAttempt) {
                e.preventDefault();

                // ================= BLOCK SCREEN =================
                setIsScreenBlocked(true);

                // ================= RESTORE AFTER 3 SECONDS =================
                setTimeout(() => { setIsScreenBlocked(false); }, 3000);
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };

    }, []);

    // ================= LOAD PAGE =================
    useEffect(() => {
        fetchWatchData();
    }, [fetchWatchData]);

    // ================= LOADING =================
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin mb-4">
                        <div className="h-12 w-12 border-4 border-cyan-400 border-t-transparent rounded-full mx-auto"></div>
                    </div>
                    <p className="text-slate-400">Loading lesson...</p>
                </div>
            </div>
        );
    }

    // ================= ERROR =================
    if (error || !course || !currentVideo) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
                <div className="text-center">
                    <p className="text-rose-400 text-lg mb-4">{error || 'Video not found'}</p>
                    <button
                        onClick={() => navigate('/student')}
                        className="rounded-xl bg-cyan-500 hover:bg-cyan-600 px-6 py-3 font-semibold transition"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // ================= MAIN UI =================
    return (
        <>
            <WatermarkOverlay />
            <div className="min-h-screen bg-slate-950 text-white flex relative">

                {/* ================= SIDEBAR ================= */}
                <div className={` ${showSidebar ? 'w-80' : 'w-0'} overflow-hidden border-r border-white/10 bg-slate-900/60 backdrop-blur-xl transition-all duration-300`}>
                    <button
                        onClick={() => navigate('/student')}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/40 px-4 py-2 text-sm font-semibold text-slate-300 backdrop-blur-xl transition hover:border-cyan-400/30 hover:text-cyan-400"
                    >
                        ← Back
                    </button>

                    <div className="flex items-center justify-between mb-6 p-4">

                        {/* COURSE TITLE */}
                        <h2 className="text-xl font-bold text-white"> {course.title} Tutorials </h2>

                        <button
                            onClick={() => setShowSidebar(false)}
                            className="rounded-lg bg-white/10 hover:bg-white/20 px-3 py-2 text-sm transition"
                        >
                            ‹
                        </button>

                    </div>


                    {/* PLAYLIST */}
                    <div className="space-y-2">
                        {videos.map((video, index) => (
                            <div key={video.id}
                                onClick={() => navigate(`/watch-course/${courseId}/${video.id}`)}
                                className={`cursor-pointer rounded-xl p-4 transition border ${currentVideo.id === video.id
                                    ? 'bg-cyan-500/20 border-cyan-400'
                                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                                    }`}
                            >

                                <p className="font-semibold"> Video {index + 1}: {video.title} </p>

                                {video.completed && (
                                    <p className="text-xs text-emerald-400 mt-1"> ✓ Completed </p>
                                )}

                            </div>
                        ))}
                    </div>
                </div>


                {!showSidebar && (
                    <button
                        onClick={() => setShowSidebar(true)}
                        className="fixed top-5 left-5 z-50 rounded-xl bg-slate-900/90 border border-white/10 px-4 py-3 text-white hover:bg-slate-800 transition"
                    >
                        ›
                    </button>
                )}

                {/* ================= CONTENT ================= */}
                <div className="flex-1 overflow-y-auto w-full">

                    {/* HEADER */}
                    <div className="border-b border-white/10 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-10">
                        <div className="px-8 py-5 text-center">
                            <p className="text-cyan-300 text-sm uppercase tracking-wider mb-2"> Current Lesson </p>
                            <h1 className="text-4xl font-bold"> {currentVideo.title} </h1>
                        </div>
                    </div>

                    {/* BODY */}
                    <div className="p-8">
                        {/* DESCRIPTION */}
                        <div className="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl p-6 mb-8 w-full">
                            <h3 className="text-xl font-semibold mb-4"> Lesson Description </h3>
                            <p className="text-slate-300 leading-relaxed"> {currentVideo.description || 'No description available'}</p>
                        </div>


                        {/* CENTER VIDEO CARD */}
                        <div className="flex justify-center mb-8">
                            <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-[#0b1220] shadow-2xl">
                                {/* THUMBNAIL */}
                                <div className="relative">
                                    <img
                                        src={getYoutubeThumbnail(currentVideo.link)}
                                        alt={currentVideo.title}
                                        className="w-full h-[340px] object-cover"
                                    />

                                    {/* COMPLETED BADGE */}
                                    {currentVideo.completed && (
                                        <div className="absolute top-4 right-4 rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-white shadow-lg">
                                            ✓ Completed
                                        </div>
                                    )}

                                </div>

                                {/* CONTENT */}
                                <div className="p-6">
                                    <h2 className="mb-3 text-2xl font-bold text-white"> {currentVideo.title} </h2>
                                    <div className="mb-4 h-[1px] bg-white/10"></div>
                                    <p className="mb-6 text-sm text-gray-300"> {currentVideo.description} </p>

                                    {/* ACTION BUTTONS */}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => window.open(currentVideo.link, '_blank')}
                                            className="flex-1 rounded-xl bg-cyan-500 hover:bg-cyan-600 px-4 py-3 font-semibold text-white transition"
                                        >
                                            ▶ Watch Video
                                        </button>

                                        {!currentVideo.completed && (
                                            <button
                                                onClick={handleMarkComplete}
                                                disabled={isMarkingComplete}
                                                className="flex-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 disabled:cursor-not-allowed px-4 py-3 font-semibold text-white transition"
                                            >
                                                {isMarkingComplete ? '✓ Marking...' : '✓ Mark as Completed'}
                                            </button>
                                        )}

                                        {nextVideo && (
                                            <button
                                                onClick={() => navigate(`/watch-course/${courseId}/${nextVideo.id}`)}
                                                className="flex-1 rounded-xl border border-cyan-400 hover:bg-cyan-500/20 px-4 py-3 font-semibold text-cyan-300 transition"
                                            >
                                                Next Lesson →
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ================= SCREEN BLOCK OVERLAY ================= */}
                {isScreenBlocked && (
                    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
                        <div className="text-center">
                            <h1 className="text-white text-4xl font-bold mb-4"> Screenshot Blocked </h1>
                            <p className="text-gray-400"> Screen capture is restricted. </p>
                        </div>
                    </div>

                )}

            </div>
        </>
    );
}

            export default WatchCourse;