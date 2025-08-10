import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Trash2, Volume2, MoreHorizontal } from 'lucide-react';

const AudioClip = ({ 
  clip, 
  pixelsPerSecond, 
  trackHeight, 
  isSelected, 
  onSelect, 
  onDelete, 
  onMove,
  onMoveEnd,
  generateWaveform,
  isMobile = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, time: 0 });
  const [waveformData, setWaveformData] = useState([]);
  const clipRef = useRef(null);

  const clipWidth = (clip.duration || 3) * pixelsPerSecond;
  const clipLeft = (clip.start_time || 0) * pixelsPerSecond;

  // Generate waveform data
  useEffect(() => {
    if (generateWaveform && clip.audio_data) {
      const waveform = generateWaveform(clip.audio_data);
      setWaveformData(waveform);
    } else {
      // Generate fake waveform for demo
      const fakeWaveform = Array.from({ length: 50 }, () => Math.random() * 0.8 + 0.1);
      setWaveformData(fakeWaveform);
    }
  }, [clip, generateWaveform]);

  const handleMouseDown = (e) => {
    if (isMobile) return; // Use touch events on mobile
    
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ 
      x: e.clientX, 
      time: clip.start_time || 0 
    });
    onSelect && onSelect(clip.id);
  };

  const handleTouchStart = (e) => {
    if (!isMobile) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ 
      x: touch.clientX, 
      time: clip.start_time || 0 
    });
    onSelect && onSelect(clip.id);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || isMobile) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaTime = deltaX / pixelsPerSecond;
    const newStartTime = Math.max(0, dragStart.time + deltaTime);
    
    if (onMove) {
      onMove(newStartTime);
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !isMobile) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStart.x;
    const deltaTime = deltaX / pixelsPerSecond;
    const newStartTime = Math.max(0, dragStart.time + deltaTime);
    
    if (onMove) {
      onMove(newStartTime);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (onMoveEnd) onMoveEnd();
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (onMoveEnd) onMoveEnd();
  };

  useEffect(() => {
    if (isDragging) {
      if (isMobile) {
        document.addEventListener('touchmove', handleTouchMove);
        document.addEventListener('touchend', handleTouchEnd);
        return () => {
          document.removeEventListener('touchmove', handleTouchMove);
          document.removeEventListener('touchend', handleTouchEnd);
        };
      } else {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };
      }
    }
  }, [isDragging, dragStart, isMobile]);

  return (
    <div
      ref={clipRef}
      className={`absolute bg-gradient-to-r from-blue-600 to-blue-500 rounded border cursor-move transition-all select-none ${
        isSelected 
          ? 'border-[#ff4500] shadow-lg ring-1 ring-[#ff4500]' 
          : 'border-blue-400 hover:border-blue-300'
      } ${isDragging ? 'opacity-80' : ''}`}
      style={{
        left: `${clipLeft}px`,
        width: `${clipWidth}px`,
        height: `${trackHeight - (isMobile ? 16 : 8)}px`,
        top: `${isMobile ? 8 : 4}px`,
        minWidth: isMobile ? '60px' : '40px'
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Clip Content */}
      <div className="relative h-full overflow-hidden rounded">
        {/* Waveform Background */}
        <div className="absolute inset-0 flex items-center px-1">
          <div className="flex items-center justify-center w-full h-full">
            {waveformData.slice(0, Math.floor(clipWidth / 4)).map((amplitude, i) => (
              <div
                key={i}
                className="bg-white/30 mx-px"
                style={{
                  height: `${amplitude * 100}%`,
                  width: `${Math.max(1, 4 - 1)}px`
                }}
              />
            ))}
          </div>
        </div>

        {/* Clip Info */}
        <div className="absolute inset-0 p-1 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className={`text-white font-medium truncate ${
                isMobile ? 'text-xs' : 'text-sm'
              }`}>
                {clip.name}
              </div>
              {!isMobile && (
                <div className="text-xs text-blue-100 opacity-75 truncate">
                  {Math.round((clip.duration || 3) * 10) / 10}s
                </div>
              )}
            </div>
            
            {/* Clip Controls */}
            {(isSelected || isMobile) && (
              <div className="flex items-center space-x-1 ml-1">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete && onDelete();
                  }}
                  variant="ghost"
                  size="sm"
                  className={`text-white hover:text-red-400 hover:bg-red-600/20 ${
                    isMobile ? 'w-5 h-5 p-0' : 'w-4 h-4 p-0'
                  }`}
                >
                  <Trash2 className={isMobile ? 'w-3 h-3' : 'w-2.5 h-2.5'} />
                </Button>
              </div>
            )}
          </div>
          
          {/* Mobile Duration Display */}
          {isMobile && (
            <div className="text-xs text-blue-100 opacity-75">
              {Math.round((clip.duration || 3) * 10) / 10}s
            </div>
          )}
        </div>

        {/* Resize Handles */}
        {isSelected && !isMobile && (
          <>
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ff4500] cursor-ew-resize" />
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#ff4500] cursor-ew-resize" />
          </>
        )}
      </div>
    </div>
  );
};

export default AudioClip;