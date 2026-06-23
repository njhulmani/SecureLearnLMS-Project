import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';

function VideoManagement() {

    const navigate = useNavigate();
    const { courseId } = useParams();

    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [courseName, setCourseName] = useState('');


    // ================= GET YOUTUBE THUMBNAIL =================
    const getYoutubeThumbnail = (url) => {
        if (!url) return '';
        const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        const videoId = match && match[2].length === 11 ? match[2] : null;
        return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';
    };

    // ================= FETCH COURSES =================
    const fetchCourses = async () => {

        try {

            const res = await api.get('/api/all-courses/');
            setCourses(res.data || []);

        } catch (error) {
            console.error('Error fetching courses:', error);
        }

    };


    // ================= FETCH VIDEOS =================
    const fetchVideos = async (courseId) => {

        try {

            setLoading(true);

            const res = await api.get(`/api/course-videos/${courseId}/`);

            setVideos(res.data || []);
            setSelectedCourse(courseId);

            // Get course name from the first video's course title or from the courses list
            if (res.data && res.data.length > 0) {
                setCourseName(res.data[0].course_title || 'Course Videos');
            }

        } catch (error) {
            console.error('Error fetching videos:', error);
        } finally {
            setLoading(false);
        }

    };


    // ================= DELETE VIDEO =================
    const handleDeleteVideo = async (videoId) => {

        const confirmDelete = window.confirm(
            'Are you sure you want to delete this video?'
        );

        if (!confirmDelete) {
            return;
        }

        try {

            await api.delete(`/api/delete-video/${videoId}/`);

            alert('Video deleted successfully');

            fetchVideos(selectedCourse);

        } catch (error) {
            console.error('Error deleting video:', error);
            alert('Failed to delete video');
        }

    };



    useEffect(() => {
        fetchCourses();
    }, []);


    // ================= LOAD COURSE VIDEOS IF COURSEid EXISTS =================
    useEffect(() => {
        if (courseId) {
            fetchVideos(courseId);
        }
    }, [courseId]);


    return (
        <div className="min-h-screen bg-slate-950 text-white">
            
            {/* BACKGROUND */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(236,72,153,0.16),_transparent_28%),linear-gradient(180deg,_#0f172a_0%,_#020617_100%)]" />

            <div className="pointer-events-none absolute left-1/2 top-[-8rem] h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-400/20 blur-3xl" />

            <div className="relative">

                {/* HEADER */}
                <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">

                            {/* LEFT */}
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 text-sm font-bold text-white">
                                    V
                                </div>
                                <div>
                                    <h1 className="text-sm font-semibold text-white">
                                        {courseId ? 'Manage Videos' : 'Video Management'}
                                    </h1>
                                    <p className="text-xs text-cyan-300/80 uppercase tracking-wider">
                                        Admin Panel
                                    </p>
                                </div>
                            </div>

                            {/* RIGHT */}
                            <button
                                onClick={() => courseId ? navigate('/video-management') : navigate('/admin')}
                                className="rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/30 px-3 py-2 text-sm font-medium text-rose-300 hover:text-rose-200 transition"
                            >
                                {courseId ? '← Back to Courses' : '← Back'}
                            </button>
                        </div>
                    </div>
                </header>

                {/* MAIN CONTENT */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                    {/* If courseId exists, show videos. Otherwise show courses */}
                    {courseId ? (
                        // ================= VIDEOS VIEW =================
                        <div>
                            <div className="mb-8">
                                <h2 className="text-4xl sm:text-5xl font-bold text-white mb-2">
                                    {courseName || 'Course Videos'}
                                </h2>
                                <p className="text-slate-400 text-lg">
                                    Manage {videos.length} video{videos.length !== 1 ? 's' : ''} for this course
                                </p>
                            </div>

                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="inline-flex flex-col items-center gap-4">
                                        <div className="animate-spin">
                                            <div className="h-12 w-12 border-4 border-cyan-400 border-t-transparent rounded-full"></div>
                                        </div>
                                        <p className="text-slate-400">Loading videos...</p>
                                    </div>
                                </div>
                            ) : videos.length === 0 ? (
                                <div className="rounded-2xl border-2 border-dashed border-white/15 bg-slate-950/40 p-12 text-center">
                                    <p className="text-xl font-semibold text-white mb-2">No Videos Yet</p>
                                    <p className="text-slate-400 mb-6">Add videos to this course to get started.</p>
                                    <button
                                        onClick={() => navigate('/add-video')}
                                        className="inline-block rounded-lg bg-cyan-500 hover:bg-cyan-600 px-6 py-2 font-semibold text-white transition"
                                    >
                                        Add Video
                                    </button>
                                </div>
                            ) : (
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {videos.map((video, index) => (
                                        <div
                                            key={video.id}
                                            className="group rounded-xl border border-white/10 bg-slate-900/50 overflow-hidden shadow-lg hover:shadow-2xl hover:border-cyan-300/20 transition-all duration-300 hover:-translate-y-1 flex flex-col"
                                        >
                                            {/* TOP BAR */}
                                            <div className="h-1 bg-gradient-to-r from-fuchsia-400 to-pink-500"></div>

                                            {/* THUMBNAIL */}
                                            <img
                                                src={getYoutubeThumbnail(video.link)}
                                                alt={video.title}
                                                className="w-full h-48 object-cover group-hover:brightness-75 transition"
                                            />

                                            {/* CONTENT */}
                                            <div className="p-6 flex flex-col flex-1">
                                                <p className="text-fuchsia-400 text-sm mb-2 font-semibold">Video {index + 1}</p>

                                                <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-cyan-300 transition">
                                                    {video.title}
                                                </h3>

                                                <p className="text-sm text-slate-400 mb-4 line-clamp-3 leading-relaxed flex-1">
                                                    {video.description || 'No description available'}
                                                </p>

                                                {/* ACTION BUTTONS */}
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => navigate(`/add-video/${video.id}`)}
                                                        className="flex-1 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 px-4 py-2 font-semibold text-white transition-all duration-200 text-sm shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteVideo(video.id)}
                                                        className="flex-1 rounded-lg bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 px-4 py-2 font-semibold text-white transition-all duration-200 text-sm shadow-lg shadow-red-500/20 hover:shadow-red-500/40"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        // ================= COURSES LIST VIEW =================
                        <>
                            {/* PAGE HEADER */}
                            <div className="mb-8">
                                <h2 className="text-4xl sm:text-5xl font-bold text-white mb-2">All Courses</h2>
                                <p className="text-slate-400 text-lg">Select a course to view and manage its videos</p>
                            </div>

                            {/* COURSES GRID */}
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
                                {courses.map((course) => (
                                    <div
                                        key={course.id}
                                        className="group rounded-xl border border-white/10 bg-slate-900/50 overflow-hidden shadow-lg hover:shadow-2xl hover:border-cyan-300/20 transition-all duration-300 hover:-translate-y-1 flex flex-col"
                                    >
                                        {/* TOP BAR */}
                                        <div className="h-1 bg-gradient-to-r from-cyan-400 to-blue-500"></div>

                                        <div className="p-6 flex flex-col flex-1">
                                            {/* TITLE */}
                                            <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-cyan-300 transition">
                                                {course.title}
                                            </h3>

                                            {/* DESCRIPTION */}
                                            <p className="text-sm text-slate-400 mb-4 line-clamp-3 leading-relaxed">
                                                {course.description || 'No description available'}
                                            </p>

                                            {/* META */}
                                            <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-slate-400 flex-1">
                                                {course.category && (
                                                    <div>
                                                        <p className="text-slate-500">Category</p>
                                                        <p className="font-medium text-white truncate">{course.category}</p>
                                                    </div>
                                                )}
                                                {course.level && (
                                                    <div>
                                                        <p className="text-slate-500">Level</p>
                                                        <p className="font-medium text-white truncate">{course.level}</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* BUTTON */}
                                            <button
                                                onClick={() => navigate(`/video-management/${course.id}`)}
                                                className="w-full mt-auto rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 px-4 py-3 font-semibold text-white transition-all duration-200 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
                                            >
                                                View Videos →
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                </main>

            </div>
        </div>
    );
}

export default VideoManagement;