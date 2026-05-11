import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

function WatchCourse() {

    const { courseId, videoId } = useParams();
    const navigate = useNavigate();

    const currentUser = JSON.parse(localStorage.getItem('user'));
    const [isScreenBlocked, setIsScreenBlocked] = useState(false);

    const [currentTime, setCurrentTime] = useState(
        new Date().toLocaleString()
    );

    useEffect(() => {
        const interval = setInterval(() => { setCurrentTime(new Date().toLocaleString()); }, 1000);
        return () => clearInterval(interval);
    }, []);

    const fullName = `${currentUser?.first_name || ''} ${currentUser?.last_name || ''}`.trim() || 'Student';

    const watermarkText = `${fullName} • ${currentUser?.email || ''} • ${currentTime}`;

    // ================= STATES =================
    const [course, setCourse] = useState(null);
    const [videos, setVideos] = useState([]);
    const [currentVideo, setCurrentVideo] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


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

            if (allVideos.length > 0) {
                setCourse({ title: allVideos[0].course_title || 'Course' });
            }

            // ================= CURRENT VIDEO =================
            const selectedVideo = allVideos.find(
                (v) =>
                    String(v.id) === String(videoId)
            );

            if (!selectedVideo) {
                setError('Video not found');
                return;
            }

            setCurrentVideo(selectedVideo);

            // ================= TRACK WATCH =================
            try {
                await api.post(
                    '/api/track-video-watch/', { course_id: courseId, video_id: videoId, });

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

    // ================= SCREEN BLOCKING =================
    useEffect(() => {

        const handleKeyDown = (e) => {
            const isPrintScreen = e.key === 'PrintScreen';
            const isMacScreenshot =
                e.metaKey &&
                e.shiftKey &&
                (
                    e.key === '3' ||
                    e.key === '4' ||
                    e.key === '5'
                );

            if (isPrintScreen || isMacScreenshot) {

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
        <div className="min-h-screen bg-slate-950 text-white flex">
            {/* ================= SIDEBAR ================= */}
            <div className="w-80 border-r border-white/10 bg-slate-900/60 backdrop-blur-xl p-4 overflow-y-auto">
                <button
                    onClick={() => navigate('/student')}
                    className="mb-6 rounded-lg bg-white/10 hover:bg-white/20 px-4 py-2 text-sm transition"
                >
                    ← Back to Dashboard
                </button>

                {/* COURSE TITLE */}
                <h2 className="text-2xl font-bold mb-6"> {course.title} </h2>

                {/* PLAYLIST */}
                <div className="space-y-2">
                    {videos.map((video) => (
                        <div key={video.id}
                            onClick={() => navigate(`/watch-course/${courseId}/${video.id}`)}
                            className={`cursor-pointer rounded-xl p-4 transition border ${currentVideo.id === video.id
                                ? 'bg-cyan-500/20 border-cyan-400'
                                : 'bg-white/5 border-white/10 hover:bg-white/10'
                                }`}
                        >

                            <p className="font-semibold"> {video.title} </p>

                            {video.completed && (
                                <p className="text-xs text-emerald-400 mt-1"> ✓ Completed </p>
                            )}

                        </div>
                    ))}
                </div>
            </div>

            {/* ================= CONTENT ================= */}
            <div className="flex-1 overflow-y-auto">

                {/* HEADER */}
                <div className="border-b border-white/10 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-10">
                    <div className="px-8 py-5">
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

            {/* ================= WATERMARK ================= */}
            <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">

                <div className="absolute top-20 left-10 rotate-[-25deg] text-white/5 text-3xl font-bold whitespace-nowrap">{watermarkText}</div>
                <div className="absolute top-1/2 left-1/3 rotate-[-25deg] text-white/5 text-3xl font-bold whitespace-nowrap">{watermarkText}</div>
                <div className="absolute bottom-20 right-10 rotate-[-25deg] text-white/5 text-3xl font-bold whitespace-nowrap">{watermarkText}</div>

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
    );
}

export default WatchCourse;