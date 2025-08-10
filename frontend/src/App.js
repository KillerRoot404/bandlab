import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import { AuthProvider } from './hooks/useAuth';
import Homepage from './pages/Homepage';
import Studio from './pages/Studio';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import Track from './pages/Track';
import Navbar from './components/Navbar';
import './App.css';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <AuthProvider>
      <div className="App min-h-screen bg-black text-white">
        <BrowserRouter>
          <Navbar />
          {/* ErrorBoundary envolve as rotas para capturar erros de UI (ex: insertBefore) */}
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Homepage />} />
              <Route path="/studio" element={<Studio />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/profile/:username" element={<Profile />} />
              <Route path="/track/:id" element={<Track />} />
            </Routes>
          </ErrorBoundary>
          <Toaster />
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App;