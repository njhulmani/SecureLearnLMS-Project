import './App.css';
import React, { useEffect, useState } from 'react';
import api from './api';
import { Routes, Route, Navigate } from 'react-router-dom';

/* Pages */
import Home from './pages/Home';
import Login from './Login';
import WatchCourse from './pages/WatchCourse';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VideoManagement from './pages/VideoManagement';
import About from './pages/About';

import AdminDashboard from './AdminDashboard';
import TrainerDashboard from './TrainerDashboard';
import StudentDashboard from './StudentDashboard';

import CreateUser from './CreateUser';
import CreateCourse from './CreateCourse';
import AddVideo from './AddVideo';
import EnrollStudent from './EnrollStudent';
import ManageCourses from './ManageCourses';


function App() {


  const [user, setUser] = useState(
    JSON.parse(
      localStorage.getItem(
        'user'
      )
    )
  );


  /* ========================= Security Controls ========================= */
  useEffect(() => {

    const disableRightClick = (e) => {
      e.preventDefault();
    };


    const blockShortcuts = (e) => {

      if (
        (e.ctrlKey || e.metaKey)
        &&
        (
          e.key.toLowerCase() === 'c' ||
          e.key.toLowerCase() === 's' ||
          e.key.toLowerCase() === 'u' ||
          e.key.toLowerCase() === 'p' ||
          e.key.toLowerCase() === 'a'
        )
      ) {

        e.preventDefault();
        alert('Action restricted');

      }

      if (e.key === 'F12') {
        e.preventDefault();
        alert(
          'Developer tools disabled'
        );
      }

    };


    const detectPrintScreen = (e) => {

      if (
        e.key === 'PrintScreen'
        ||
        (
          e.metaKey &&
          e.shiftKey &&
          (
            e.key === '3' ||
            e.key === '4' ||
            e.key === '5'
          )
        )
      ) {

        e.preventDefault();
        alert(
          'Screen capture restricted'
        );

      }

    };


    /* inactivity logout */
    let inactivityTimer;

    const logoutUser = () => {

      alert(
        'Session expired due to inactivity'
      );

      localStorage.clear();
      setUser(null);
      window.location.href = '/';

    };


    const resetTimer = () => {

      clearTimeout(
        inactivityTimer
      );

      inactivityTimer = setTimeout(
        logoutUser,
        30 * 60 * 1000
      );

    };


    /* listeners */
    document.addEventListener('contextmenu', disableRightClick);
    document.addEventListener('keydown', blockShortcuts);
    document.addEventListener('keydown', detectPrintScreen);
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keypress', resetTimer);
    window.addEventListener('click', resetTimer);
    window.addEventListener('scroll', resetTimer);

    resetTimer();


    return () => {

      clearTimeout(inactivityTimer);

      document.removeEventListener('contextmenu', disableRightClick);
      document.removeEventListener('keydown', blockShortcuts);
      document.removeEventListener('keydown', detectPrintScreen);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keypress', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('scroll', resetTimer);

    };

  }, []);


  /* ========================= Logout========================= */
  const handleLogout = () => {
    (async () => {
      try {
        await api.post('/api/logout/');
      } catch (e) {
        // ignore
      } finally {
        localStorage.clear();
        setUser(null);
        window.location.href = '/';
      }
    })();
  };


  /* =========================Protected Route========================= */
  const ProtectedRoute = ({
    children,
    role
  }) => {

    if (!user) {
      return <Navigate to='/login' />;
    }

    if (role && user.role !== role) {
      return <Navigate to='/' />;
    }

    return children;

  };


  /* multi-role route */
  const MultiRoleRoute = ({ children, roles }) => {

    if (!user) {
      return <Navigate to='/login' />;
    }

    if (!roles.includes(user.role)) {
      return <Navigate to='/' />;
    }

    return children;

  };


  return (

    <Routes>


      {/* HOME */}
      <Route path='/' element={<Home />} />


      {/* LOGIN */}
      <Route path='/login' element={<Login setUser={setUser} />} />

      {/* Forgot Password */}
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Reset Password */}
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* ADMIN DASHBOARD */}
      <Route path='/admin' element={<ProtectedRoute role='admin'> <AdminDashboard /> </ProtectedRoute>} />

      {/* TRAINER */}
      <Route path='/trainer' element={<ProtectedRoute role='trainer'> <TrainerDashboard /> </ProtectedRoute>} />


      {/* STUDENT */}
      <Route path='/student' element={<ProtectedRoute role='student'> <StudentDashboard /> </ProtectedRoute>} />
  

      {/* ADMIN ONLY */}
      <Route path='/create-user' element={<ProtectedRoute role='admin'> <CreateUser /> </ProtectedRoute>} />

      {/* ENROLL STUDENT */}
      <Route path='/enroll' element={<ProtectedRoute role='admin'> <EnrollStudent /> </ProtectedRoute>} />

      {/* MANAGE COURSES */}
      <Route path='/manage-courses' element={<ProtectedRoute role='admin'> <ManageCourses /> </ProtectedRoute>} />

      {/* VIDEO MANAGEMENT */}
      <Route path="/video-management" element={<VideoManagement />} />
      <Route path="/video-management/:courseId" element={<VideoManagement />} />

      {/* ADMIN ONLY */}
      <Route path='/create-course' element={<ProtectedRoute role='admin'> <CreateCourse /> </ProtectedRoute>} />

      {/* ADD VIDEO */}
      <Route path='/add-video' element={<MultiRoleRoute roles={['admin', 'trainer']}> <AddVideo /> </MultiRoleRoute>} />

      <Route path="/add-video/:videoId" element={<AddVideo />} />

      {/* LOGOUT */}
      <Route
        path='/logout'
        element={
          <div className='min-h-screen bg-slate-950 flex items-center justify-center'>

            <div className='text-center space-y-6'>

              <h1 className='text-4xl font-bold'>
                <span className='bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent'>
                  Logout
                </span>
              </h1>

              <p className='text-slate-400'>
                Are you sure you want to logout?
              </p>

              <button
                onClick={handleLogout}
                className='px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-semibold'
              >
                Confirm Logout
              </button>

            </div>

          </div>
        }
      />

        {/* WATCH COURSE */}
        <Route path="/watch-course/:courseId/:videoId?" element={<WatchCourse />}/>

      {/* ABOUT */}
      <Route path="/about" element={<About />} />

      {/* fallback */}
      <Route path='*' element={<Navigate to='/' />}/>

    </Routes>

  );

}

export default App;