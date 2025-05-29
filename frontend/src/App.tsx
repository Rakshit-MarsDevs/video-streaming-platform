import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.tsx';
import Navbar from './components/Navbar.tsx';
import Home from './pages/Home.tsx';
import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';
import VideoUpload from './pages/VideoUpload.tsx';
import VideoPlayer from './pages/VideoPlayer.tsx';
import MyVideos from './pages/MyVideos.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import DocumentHead from './components/DocumentHead.tsx';
import './css/App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <DocumentHead />
        <div className="App">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/video/:id" element={<VideoPlayer />} />
              <Route
                path="/upload"
                element={
                  <ProtectedRoute>
                    <VideoUpload />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-videos"
                element={
                  <ProtectedRoute>
                    <MyVideos />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
