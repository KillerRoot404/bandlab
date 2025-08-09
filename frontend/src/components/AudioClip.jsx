import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Trash2, Volume2, Copy } from 'lucide-react';

const AudioClip = ({ 
  clip, 
  trackColor, 
  pixelsPerSecond = 50, 
  onMove, 
  onDelete, 
  onSelect, 
  isSelected,
  generateWaveform 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [waveformData, setWaveformData] = useState([]);
  const clipRef = useRef(null);

  const clipWidth = clip.duration * pixelsPerSecond;
  const clipLeft = clip.startTime * pixelsPerSecond;

  // Generate waveform on mount
  useEffect(() => {
    if (clip.buffer && generateWaveform) {
      const waveform = generateWaveform(clip.buffer, Math.floor(clipWidth / 2));
      setWaveformData(waveform);
    }
  }, [clip.buffer, clipWidth, generateWaveform]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onSelect) {
      onSelect(clip.id);
    }
    
    setIsDragging(true);
    const rect = clipRef.current.getBoundingClientRect();
    setDragOffset(e.clientX - rect.left);
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !onMove) return;
    
    const timeline = clipRef.current.closest('[data-timeline]');
    if (!timeline) return;
    
    const timelineRect = timeline.getBoundingClientRect();
    const newLeft = e.clientX - timelineRect.left - dragOffset;
    const newStartTime = Math.max(0, newLeft / pixelsPerSecond);
    
    // Snap to grid (0.25 second intervals)
    const snappedTime = Math.round(newStartTime * 4) / 4;
    onMove(clip.id, snappedTime);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(clip.id);
    }
  };

  return (
    <div
      ref={clipRef}
      className={`absolute h-full rounded border-2 flex items-center px-2 cursor-move select-none transition-all ${
        isSelected ? 'border-orange-500 shadow-lg' : 'border-gray-600 hover:border-gray-500'
      } ${isDragging ? 'opacity-80 z-50' : 'hover:brightness-110'}`}
      style={{
        backgroundColor: trackColor + '60',
        borderColor: isSelected ? '#f97316' : trackColor,
        left: `${clipLeft}px`,
        width: `${clipWidth}px`,
        minWidth: '40px'
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Clip Name */}
      <span className="text-xs text-white font-medium truncate pointer-events-none">
        {clip.name}
      </span>
      
      {/* Waveform Visualization */}
      <div className="absolute inset-0 overflow-hidden p-1 pointer-events-none">
        <div className="flex items-center h-full opacity-40">
          {waveformData.map((amplitude, i) => (
            <div
              key={i}
              className="w-px bg-white mx-px"
              style={{ height: `${Math.max(2, amplitude * 80)}%` }}
            />
          ))}
        </div>
      </div>
      
      {/* Duration indicator */}
      <div className="absolute top-1 right-1 text-xs text-white/70 bg-black/30 px-1 rounded pointer-events-none">
        {clip.duration.toFixed(1)}s
      </div>
      
      {/* Resize handles */}
      <div className="absolute left-0 top-0 w-1 h-full bg-white/20 cursor-ew-resize opacity-0 hover:opacity-100" />
      <div className="absolute right-0 top-0 w-1 h-full bg-white/20 cursor-ew-resize opacity-0 hover:opacity-100" />
      
      {/* Controls (show on hover/select) */}
      {(isSelected || isDragging) && (
        <div className="absolute -top-8 right-0 flex items-center space-x-1 bg-gray-800 border border-gray-600 rounded px-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-6 h-6 p-0 text-gray-300 hover:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <Copy className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-6 h-6 p-0 text-gray-300 hover:text-red-400"
            onClick={handleDelete}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default AudioClip;