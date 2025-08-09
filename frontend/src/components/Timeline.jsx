import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { ZoomIn, ZoomOut, Grid3X3 } from 'lucide-react';
import AudioClip from './AudioClip';

const Timeline = ({ 
  tracks, 
  currentTime, 
  isPlaying, 
  onSeek, 
  selectedTrack,
  onTrackSelect,
  getTrackClips,
  deleteClip,
  moveClip,
  generateWaveform 
}) => {
  const [zoomLevel, setZoomLevel] = useState(50); // pixels per second
  const [selectedClip, setSelectedClip] = useState(null);
  const [viewportStart, setViewportStart] = useState(0);
  const timelineRef = useRef(null);

  const timelineDuration = 60; // 60 seconds visible
  const pixelsPerSecond = zoomLevel;
  const totalWidth = timelineDuration * pixelsPerSecond;

  const handleTimelineClick = (e) => {
    if (!onSeek) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX + viewportStart) / pixelsPerSecond;
    onSeek(Math.max(0, newTime));
  };

  const handleZoomIn = () => {
    setZoomLevel(Math.min(200, zoomLevel + 10));
  };

  const handleZoomOut = () => {
    setZoomLevel(Math.max(20, zoomLevel - 10));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col bg-[#1a1a1b]">
      {/* Timeline Header */}
      <div className="bg-[#242529] border-b border-gray-800 p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-300">Timeline</span>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleZoomOut}
              className="text-gray-400 hover:text-white w-8 h-8 p-0"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-xs text-gray-400 w-16 text-center">{zoomLevel}px/s</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleZoomIn}
              className="text-gray-400 hover:text-white w-8 h-8 p-0"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white w-8 h-8 p-0">
              <Grid3X3 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Time Ruler */}
        <div 
          className="relative h-8 bg-[#2a2a2e] rounded overflow-hidden border border-gray-700 cursor-pointer"
          onClick={handleTimelineClick}
          ref={timelineRef}
        >
          {/* Timeline markers */}
          <div className="absolute inset-0">
            {Array.from({ length: Math.ceil(timelineDuration / 4) + 1 }).map((_, i) => {
              const time = i * 4;
              const left = time * pixelsPerSecond;
              
              return (
                <div
                  key={i}
                  className="absolute top-0 h-full border-l border-gray-600 flex items-center justify-start pl-1"
                  style={{ left: `${left}px` }}
                >
                  <span className="text-xs text-gray-500">{formatTime(time)}</span>
                </div>
              );
            })}
          </div>
          
          {/* Playhead */}
          <div 
            className="absolute top-0 w-0.5 h-full bg-[#ff4500] z-20 pointer-events-none"
            style={{ left: `${currentTime * pixelsPerSecond}px` }}
          />
          
          {/* Loop regions, markers, etc. can be added here */}
        </div>
      </div>
      
      {/* Track Timeline */}
      <div className="flex-1 overflow-y-auto" data-timeline>
        <div 
          className="relative"
          style={{ width: `${totalWidth}px`, minHeight: '100%' }}
        >
          {tracks.map((track, index) => {
            const trackClips = getTrackClips ? getTrackClips(track.id) : [];
            
            return (
              <div 
                key={track.id}
                className={`h-16 border-b border-gray-800 flex items-center px-3 relative ${
                  selectedTrack === track.id ? 'bg-[#242529]/50' : 'hover:bg-[#242529]/30'
                }`}
                onClick={() => onTrackSelect && onTrackSelect(track.id)}
              >
                {/* Track lane background */}
                <div className="absolute inset-0 left-0 right-0">
                  <div className="h-full bg-[#2a2a2e] border border-gray-700 relative overflow-visible">
                    {/* Grid lines */}
                    {Array.from({ length: Math.ceil(timelineDuration / 4) }).map((_, i) => (
                      <div
                        key={i}
                        className="absolute top-0 w-px h-full bg-gray-700/50"
                        style={{ left: `${i * 4 * pixelsPerSecond}px` }}
                      />
                    ))}
                    
                    {/* Audio clips */}
                    {trackClips.map((clip) => (
                      <AudioClip
                        key={clip.id}
                        clip={clip}
                        trackColor={track.color}
                        pixelsPerSecond={pixelsPerSecond}
                        onMove={moveClip}
                        onDelete={deleteClip}
                        onSelect={setSelectedClip}
                        isSelected={selectedClip === clip.id}
                        generateWaveform={generateWaveform}
                      />
                    ))}
                    
                    {/* Recording indicator */}
                    {track.isRecording && (
                      <div 
                        className="absolute h-full bg-red-500/20 border-2 border-red-500 animate-pulse"
                        style={{
                          left: `${currentTime * pixelsPerSecond}px`,
                          width: '4px'
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Timeline;