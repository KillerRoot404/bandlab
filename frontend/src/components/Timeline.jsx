import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { ZoomIn, ZoomOut, Grid3X3 } from 'lucide-react';
import AudioClip from './AudioClip';

const subdivisions = ['1/1','1/2','1/4','1/8'];

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
  onClipMoveEnd,
  isMobile = false,
  // New props for grid/loop
  bpm = 120,
  loopEnabled = false,
  loopStart = 0,
  loopEnd = 4,
  onLoopChange,
  snapEnabled = true,
  gridDivision = '1/4',
  onSnapToggle,
  onDivisionChange,
  // New props for BandLab-like track controls
  onTrackMuteToggle,
  onTrackSoloToggle,
  onTrackVolumeChange,
  onAddTrack,
}) => {
  const [zoomLevel, setZoomLevel] = useState(isMobile ? 30 : 50); // pixels per second
  const [selectedClip, setSelectedClip] = useState(null);
  const [viewportStart, setViewportStart] = useState(0);
  const [isLoopDragging, setIsLoopDragging] = useState(false);
  const [loopDragType, setLoopDragType] = useState(null); // 'start' | 'end' | 'region'
  const timelineRef = useRef(null);
  const rulerRef = useRef(null);

  const timelineDuration = 60; // seconds visible
  const pixelsPerSecond = zoomLevel;
  const totalWidth = timelineDuration * pixelsPerSecond;

  const beatSeconds = 60 / Math.max(1, bpm);
  const divisionFactor = {
    '1/1': 1,
    '1/2': 0.5,
    '1/4': 0.25,
    '1/8': 0.125,
  }[gridDivision] || 0.25;
  const gridStepSeconds = beatSeconds * divisionFactor;

  const snapTime = useCallback((t) => {
    if (!snapEnabled) return Math.max(0, t);
    const snapped = Math.round(t / gridStepSeconds) * gridStepSeconds;
    return Math.max(0, snapped);
  }, [snapEnabled, gridStepSeconds]);

  const timeFromClientX = (clientX, element) => {
    const rect = element.getBoundingClientRect();
    const x = clientX - rect.left;
    const t = (x + viewportStart) / pixelsPerSecond;
    return Math.max(0, t);
  };

  const handleTimelineClick = (e) => {
    if (!onSeek) return;
    // If we are dragging loop, ignore click seek
    if (isLoopDragging) return;
    const newTime = snapTime(timeFromClientX(e.clientX, timelineRef.current));
    onSeek(newTime);
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

  // Loop drag handlers (on ruler)
  const onRulerMouseDown = (e) => {
    if (!loopEnabled) return;
    e.preventDefault();
    const t = snapTime(timeFromClientX(e.clientX, rulerRef.current));
    // Detect near start/end handle (within 8px)
    const startX = loopStart * pixelsPerSecond;
    const endX = loopEnd * pixelsPerSecond;
    const rect = rulerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;

    if (Math.abs(x - startX) <= 8) {
      setLoopDragType('start');
    } else if (Math.abs(x - endX) <= 8) {
      setLoopDragType('end');
    } else {
      setLoopDragType('region');
      onLoopChange && onLoopChange({ start: t, end: t + gridStepSeconds });
    }
    setIsLoopDragging(true);
  };

  const onRulerMouseMove = (e) => {
    if (!isLoopDragging) return;
    const t = snapTime(timeFromClientX(e.clientX, rulerRef.current));
    if (loopDragType === 'start') {
      const newStart = Math.min(t, loopEnd - gridStepSeconds);
      onLoopChange && onLoopChange({ start: newStart, end: loopEnd });
    } else if (loopDragType === 'end') {
      const newEnd = Math.max(t, loopStart + gridStepSeconds);
      onLoopChange && onLoopChange({ start: loopStart, end: newEnd });
    } else if (loopDragType === 'region') {
      const start = Math.min(t, loopEnd);
      const end = Math.max(t, start + gridStepSeconds);
      onLoopChange && onLoopChange({ start, end });
    }
  };

  const onRulerMouseUp = () => {
    setIsLoopDragging(false);
    setLoopDragType(null);
  };

  useEffect(() => {
    if (!isLoopDragging) return;
    const move = (e) => onRulerMouseMove(e);
    const up = () => onRulerMouseUp();
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
    return () => {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
    };
  }, [isLoopDragging]);

  // Wrapped moveClip to apply snapping
  const moveClipWithSnap = useCallback((clipId, newStartTime) => {
    const t = snapTime(newStartTime);
    moveClip && moveClip(clipId, t);
  }, [moveClip, snapTime]);

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
          {/* Add Track button for parity */}
          <Button onClick={() => onAddTrack && onAddTrack()} variant="ghost" size="sm" className="ml-2 text-gray-300 hover:text-white">+ Add Track</Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => onSnapToggle && onSnapToggle(!snapEnabled)}
            variant={snapEnabled ? 'default' : 'ghost'}
            size="sm"
            className="text-xs"
          >
            <Grid3X3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            Snap {snapEnabled ? 'On' : 'Off'}
          </Button>
          <div className="hidden sm:flex items-center space-x-1">
            {subdivisions.map((s) => (
              <Button
                key={s}
                onClick={() => onDivisionChange && onDivisionChange(s)}
                variant={gridDivision === s ? 'default' : 'ghost'}
                size="sm"
                className="text-xs"
              >
                {s}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline Ruler */}
      <div className="bg-[#2a2a2e] border-b border-gray-800 relative overflow-x-auto">
        <div className="h-6 sm:h-8 relative" style={{ width: `${totalWidth}px` }}
             ref={rulerRef}
             onMouseDown={onRulerMouseDown}
        >
          {/* Time markers every 5s */}
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
          
          {/* Beat/Grid markers */}
          {Array.from({ length: Math.ceil(timelineDuration / gridStepSeconds) + 1 }, (_, i) => i * gridStepSeconds).map((t, idx) => (
            <div
              key={`grid-${idx}`}
              className="absolute top-0 bottom-0 border-l border-gray-700"
              style={{ left: `${t * pixelsPerSecond}px`, opacity: (idx % 4 === 0) ? 0.6 : 0.3 }}
            />
          ))}

          {/* Loop region overlay */}
          {loopEnabled && (
            <div
              className="absolute top-0 bottom-0 bg-[#ff4500]/20 pointer-events-none"
              style={{ left: `${loopStart * pixelsPerSecond}px`, width: `${Math.max(0, (loopEnd - loopStart) * pixelsPerSecond)}px` }}
            >
              {/* Handles */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ff4500]" />
              <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#ff4500]" />
            </div>
          )}
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
            {/* Faint grid lines every second for baseline */}
            {Array.from({ length: timelineDuration + 1 }, (_, i) => i).map((second) => (
              <div
                key={`sec-${second}`}
                className="absolute top-0 bottom-0 border-l border-gray-800 opacity-20"
                style={{ left: `${second * pixelsPerSecond}px` }}
              />
            ))}
          </div>

          {/* Tracks */}
          {tracks.map((track) => (
            <div
              key={track.id}
              className={`relative border-b border-gray-800 ${
                selectedTrack === track.id ? 'bg-[#2a2a2e]/50' : 'hover:bg-[#2a2a2e]/30'
              }`}
              style={{ height: isMobile ? '80px' : '72px' }}
              onClick={() => onTrackSelect && onTrackSelect(track.id)}
            >
              {/* Track header (BandLab-like) */}
              <div className="absolute left-0 top-0 bottom-0 w-44 bg-[#242529] border-r border-gray-800 flex items-center px-3 z-10">
                <div className="w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: track.color || '#3b82f6' }} />
                <div className="flex-1">
                  <div className="text-xs text-white font-medium truncate">{track.name}</div>
                  <div className="text-[10px] text-gray-400 truncate">{track.instrument}</div>
                </div>
                <div className="flex items-center space-x-1 ml-2">
                  <button
                    title="Mute"
                    onClick={(e) => { e.stopPropagation(); onTrackMuteToggle && onTrackMuteToggle(track.id); }}
                    className={`px-1.5 py-0.5 rounded text-[10px] border ${track.muted ? 'bg-gray-700 text-white border-gray-600' : 'text-gray-300 border-gray-700 hover:bg-gray-700'}`}
                  >M</button>
                  <button
                    title="Solo"
                    onClick={(e) => { e.stopPropagation(); onTrackSoloToggle && onTrackSoloToggle(track.id); }}
                    className={`px-1.5 py-0.5 rounded text-[10px] border ${track.solo ? 'bg-gray-700 text-white border-gray-600' : 'text-gray-300 border-gray-700 hover:bg-gray-700'}`}
                  >S</button>
                  <button
                    title="Record"
                    className={`px-1.5 py-0.5 rounded text-[10px] border ${track.isRecording ? 'bg-red-600/70 text-white border-red-500' : 'text-gray-300 border-gray-700 hover:bg-gray-700'}`}
                  >R</button>
                </div>
              </div>
              
              {/* Track clips */}
              <div className={`absolute inset-0 ml-44`}>
                {/* Volume lane (thin) */}
                <div className="absolute left-2 top-1 bottom-1 w-24 flex items-center">
                  <Slider defaultValue={[track.volume || 75]} max={100} step={1} onValueChange={(v) => onTrackVolumeChange && onTrackVolumeChange(track.id, v)} className="w-24" />
                </div>
                {getTrackClips && getTrackClips(track.id).map((clip) => (
                  <AudioClip
                    key={clip.id}
                    clip={clip}
                    pixelsPerSecond={pixelsPerSecond}
                    trackHeight={isMobile ? 80 : 72}
                    isSelected={selectedClip === clip.id}
                    onSelect={setSelectedClip}
                    onDelete={() => deleteClip && deleteClip(clip.id)}
                    onMove={(newStartTime) => moveClipWithSnap(clip.id, newStartTime)}
                    onMoveEnd={() => onClipMoveEnd && onClipMoveEnd()}
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