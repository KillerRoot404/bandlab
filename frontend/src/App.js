import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import Homepage from './pages/Homepage';
import Studio from './pages/Studio';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import Track from './pages/Track';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  return (
    <div className="App min-h-screen bg-black text-white">
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/studio" element={<Studio />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/track/:id" element={<Track />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </div>
  );
}

export default App;