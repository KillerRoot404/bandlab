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
  generateWaveform,
  isMobile = false
}) => {
  const [zoomLevel, setZoomLevel] = useState(isMobile ? 30 : 50); // pixels per second
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
    setZoomLevel(Math.min(200, zoomLevel + (isMobile ? 5 : 10)));
  };

  const handleZoomOut = () => {
    setZoomLevel(Math.max(isMobile ? 15 : 20, zoomLevel - (isMobile ? 5 : 10)));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex-1 bg-[#1a1a1b] flex flex-col overflow-hidden ${isMobile ? 'h-full' : ''}`}>
      {/* Timeline Header */}
      <div className="bg-[#242529] border-b border-gray-800 p-2 sm:p-3 flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <h3 className="text-sm font-medium text-gray-300">TIMELINE</h3>
          <Button
            onClick={handleZoomOut}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white w-6 h-6 sm:w-8 sm:h-8 p-0"
          >
            <ZoomOut className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
          <span className="text-xs text-gray-500">{Math.round(zoomLevel)}px/s</span>
          <Button
            onClick={handleZoomIn}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white w-6 h-6 sm:w-8 sm:h-8 p-0"
          >
            <ZoomIn className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white w-6 h-6 sm:w-8 sm:h-8 p-0"
          >
            <Grid3X3 className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        </div>
      </div>

      {/* Timeline Ruler */}
      <div className="bg-[#2a2a2e] border-b border-gray-800 relative overflow-x-auto">
        <div className="h-6 sm:h-8 relative" style={{ width: `${totalWidth}px` }}>
          {/* Time markers */}
          {Array.from({ length: Math.ceil(timelineDuration / 5) + 1 }, (_, i) => i * 5).map((second) => (
            <div
              key={second}
              className="absolute top-0 bottom-0 border-l border-gray-600 flex items-center"
              style={{ left: `${second * pixelsPerSecond}px` }}
            >
              <span className="text-xs text-gray-400 ml-1 select-none">
                {formatTime(second)}
              </span>
            </div>
          ))}
          
          {/* Beat markers (every second) */}
          {Array.from({ length: timelineDuration + 1 }, (_, i) => i).map((second) => (
            <div
              key={`beat-${second}`}
              className="absolute top-0 bottom-0 border-l border-gray-700 opacity-50"
              style={{ left: `${second * pixelsPerSecond}px` }}
            />
          ))}
        </div>
      </div>

      {/* Timeline Content */}
      <div className="flex-1 overflow-auto">
        <div className="relative" style={{ width: `${totalWidth}px` }}>
          {/* Timeline background */}
          <div 
            ref={timelineRef}
            className="absolute inset-0 cursor-pointer"
            onClick={handleTimelineClick}
          >
            {/* Grid lines */}
            {Array.from({ length: timelineDuration + 1 }, (_, i) => i).map((second) => (
              <div
                key={`grid-${second}`}
                className="absolute top-0 bottom-0 border-l border-gray-800 opacity-30"
                style={{ left: `${second * pixelsPerSecond}px` }}
              />
            ))}
          </div>

          {/* Tracks */}
          {tracks.map((track, trackIndex) => (
            <div
              key={track.id}
              className={`relative border-b border-gray-800 ${
                selectedTrack === track.id ? 'bg-[#2a2a2e]/50' : 'hover:bg-[#2a2a2e]/30'
              }`}
              style={{ height: isMobile ? '80px' : '60px' }}
              onClick={() => onTrackSelect && onTrackSelect(track.id)}
            >
              {/* Track label - Mobile optimized */}
              {isMobile && (
                <div className="absolute left-0 top-0 bottom-0 w-20 bg-[#242529] border-r border-gray-800 flex flex-col justify-center px-2 z-10">
                  <div className="text-xs text-white font-medium truncate">{track.name}</div>
                  <div className="text-xs text-gray-400 truncate">{track.instrument}</div>
                </div>
              )}
              
              {/* Track clips */}
              <div className={`absolute inset-0 ${isMobile ? 'ml-20' : ''}`}>
                {getTrackClips && getTrackClips(track.id).map((clip) => (
                  <AudioClip
                    key={clip.id}
                    clip={clip}
                    pixelsPerSecond={pixelsPerSecond}
                    trackHeight={isMobile ? 80 : 60}
                    isSelected={selectedClip === clip.id}
                    onSelect={setSelectedClip}
                    onDelete={() => deleteClip && deleteClip(clip.id)}
                    onMove={(newStartTime) => moveClip && moveClip(clip.id, newStartTime)}
                    generateWaveform={generateWaveform}
                    isMobile={isMobile}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-[#ff4500] z-20 pointer-events-none"
            style={{ left: `${currentTime * pixelsPerSecond}px` }}
          >
            <div className="w-3 h-3 bg-[#ff4500] rounded-full -ml-1 -mt-1" />
          </div>
        </div>
      </div>

      {/* Timeline Footer - Mobile info */}
      {isMobile && (
        <div className="bg-[#242529] border-t border-gray-800 p-2 text-xs text-gray-400 text-center">
          Pinch to zoom • Drag to scroll • Tap clip to select
        </div>
      )}
    </div>
  );
};

export default Timeline;