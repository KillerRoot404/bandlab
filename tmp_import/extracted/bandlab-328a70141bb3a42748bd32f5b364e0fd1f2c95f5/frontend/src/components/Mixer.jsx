import React from 'react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';

import { Volume2, VolumeX, Mic, Minus, Plus, Power, Gauge } from 'lucide-react';

const ChannelStrip = ({
  track,
  isSelected,
  onSelect,
  onMute,
  onSolo,
  onRecord,
  onVolumeChange,
  onPanChange,
  level = 0,
}) => {
  const volume = typeof track.volume === 'number' ? track.volume : 75;
  const pan = typeof track.pan === 'number' ? track.pan : 0; // -100 .. 100

  return (
    <div className={`flex flex-col items-center w-40 min-w-[10rem] px-2 py-3 rounded border ${isSelected ? 'border-[#ff4500]/60 bg-[#2a2a2e]/40' : 'border-gray-800 bg-[#1a1a1b] hover:bg-[#222227]/80'}`}
         onClick={() => onSelect && onSelect(track.id)}>
      <div className="flex items-center w-full mb-2">
        <div className="w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: track.color || '#3b82f6' }} />
        <div className="truncate text-sm text-white font-medium" title={track.name}>{track.name}</div>
      </div>

      <div className="text-[10px] text-gray-400 mb-2">{track.instrument || 'Audio'}</div>

      <div className="flex items-center space-x-1 mb-3">
        <button
          title="Mute"
          onClick={(e) => { e.stopPropagation(); onMute && onMute(track.id); }}
          className={`px-2 py-0.5 rounded text-[10px] border ${track.muted ? 'bg-gray-700 text-white border-gray-600' : 'text-gray-300 border-gray-700 hover:bg-gray-700'}`}
        >M</button>
        <button
          title="Solo"
          onClick={(e) => { e.stopPropagation(); onSolo && onSolo(track.id); }}
          className={`px-2 py-0.5 rounded text-[10px] border ${track.solo ? 'bg-gray-700 text-white border-gray-600' : 'text-gray-300 border-gray-700 hover:bg-gray-700'}`}
        >S</button>
        <button
          title="Record Arm"
          onClick={(e) => { e.stopPropagation(); onRecord && onRecord(track.id); }}
          className={`px-2 py-0.5 rounded text-[10px] border ${track.isRecording ? 'bg-red-600/70 text-white border-red-500' : 'text-gray-300 border-gray-700 hover:bg-gray-700'}`}
        >R</button>
      </div>

      {/* Pan */}
      <div className="w-full mb-2">
        <div className="text-[10px] text-gray-400 mb-1 text-center">Pan</div>
        <Slider max={100} min={-100} value={[pan]} onValueChange={(v) => onPanChange && onPanChange(track.id, v)} step={1} />
        <div className="text-[10px] text-gray-500 mt-1 text-center">{pan > 0 ? `R${pan}` : pan < 0 ? `L${Math.abs(pan)}` : 'C'}</div>
      </div>

      {/* Volume */}
      <div className="w-full mb-2">
        <div className="text-[10px] text-gray-400 mb-1 text-center">Vol</div>
        <Slider max={100} min={0} value={[volume]} onValueChange={(v) => onVolumeChange && onVolumeChange(track.id, v)} step={1} />
        <div className="text-[10px] text-gray-500 mt-1 text-center">{Math.round(volume)}</div>
      </div>

      {/* Meter */}
      <div className="w-full h-2 bg-gray-800 rounded overflow-hidden mt-1">
        <div className="h-full bg-[#ff4500]/60 transition-all" style={{ width: `${Math.round(level * 100)}%` }} />
      </div>
    </div>
  );
};

const MasterStrip = ({ volume, onVolumeChange, level = 0 }) => {
  return (
    <div className="flex flex-col items-center w-40 min-w-[10rem] px-2 py-3 rounded border border-gray-800 bg-[#18181b]">
      <div className="text-sm text-white font-medium mb-2">Master</div>
      <div className="text-[10px] text-gray-400 mb-1">Vol</div>
      <Slider max={100} min={0} value={[volume]} onValueChange={(v) => onVolumeChange && onVolumeChange(v[0])} step={1} />
      <div className="text-[10px] text-gray-500 mt-1">{Math.round(volume)}</div>
      <div className="w-full h-2 bg-gray-800 rounded overflow-hidden mt-3">
        <div className="h-full bg-[#ff4500] transition-all" style={{ width: `${Math.round(level * 100)}%` }} />
      </div>
    </div>
  );
};

const Mixer = ({
  tracks = [],
  selectedTrack,
  onTrackSelect,
  onTrackMuteToggle,
  onTrackSoloToggle,
  onTrackRecordToggle,
  onTrackVolumeChange,
  onTrackPanChange,
  masterVolume = 80,
  onMasterVolumeChange,
  masterLevel = 0,
}) => {
  return (
    <div className="border-t border-gray-800 bg-[#0f0f11]">
      <div className="px-3 py-2 text-xs text-gray-400 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="uppercase tracking-wider">Mixer</span>
          <span className="hidden sm:inline">• Arraste os sliders para ajustar Volume e Pan</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="flex gap-3 px-3 pb-3">
          {tracks.map((t) => (
            <ChannelStrip
              key={t.id}
              track={t}
              isSelected={selectedTrack === t.id}
              onSelect={onTrackSelect}
              onMute={onTrackMuteToggle}
              onSolo={onTrackSoloToggle}
              onRecord={onTrackRecordToggle}
              onVolumeChange={onTrackVolumeChange}
              onPanChange={onTrackPanChange}
              level={Math.min(1, Math.max(0, (t.id && t.level) ? t.level : 0))}
            />
          ))}
          <MasterStrip volume={masterVolume} onVolumeChange={onMasterVolumeChange} level={masterLevel} />
        </div>
      </div>
    </div>
  );
};

export default Mixer;