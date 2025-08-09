import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Slider } from '../components/ui/slider';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Separator } from '../components/ui/separator';
import { Progress } from '../components/ui/progress';
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Volume2,
  VolumeX,
  Mic,
  Piano,
  Headphones,
  Settings,
  Save,
  Share,
  Plus,
  Trash2,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Users,
  Upload,
  Download,
  MessageSquare,
  Clock,
  Grid3X3,
  Music,
  Waves,
  Zap,
  Filter,
  Edit,
  Copy,
  Scissors,
  Move,
  MoreHorizontal,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Target,
  Volume1,
  Sliders,
  Activity,
  Radio,
  Disc,
  FileAudio,
  Waveform,
  GitBranch,
  Layers,
  PenTool,
  MousePointer,
  Hand,
  RotateCw,
  FlipHorizontal,
  Crop,
  Mixer,
  Mic2,
  Speaker,
  MonitorSpeaker,
  Keyboard,
  Drum,
  Guitar,
  Violin
} from 'lucide-react';
import { mockStudioData } from '../data/mock';

const Studio = () => {
  const [studioData, setStudioData] = useState(mockStudioData);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [selectedTrack, setSelectedTrack] = useState('1');
  const [selectedClip, setSelectedClip] = useState(null);
  const [masterVolume, setMasterVolume] = useState([85]);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [showPianoRoll, setShowPianoRoll] = useState(false);
  const [showMixer, setShowMixer] = useState(false);
  const [showAutomation, setShowAutomation] = useState(false);
  const [activeView, setActiveView] = useState('arrange'); // arrange, edit, mix
  const [selectedTool, setSelectedTool] = useState('select');
  const [loopStart, setLoopStart] = useState(0);
  const [loopEnd, setLoopEnd] = useState(16);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordingLevel, setRecordingLevel] = useState(0);
  const [collaborators, setCollaborators] = useState([
    { id: 1, name: 'Alex Producer', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face', online: true, editing: 'Track 2' },
    { id: 2, name: 'Maya Vocals', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b7d0a6f1?w=32&h=32&fit=crop&crop=face', online: true, editing: null }
  ]);

  // Enhanced instruments library
  const [instrumentsLibrary] = useState([
    { id: 1, name: 'Grand Piano', category: 'Piano', icon: Piano, color: 'bg-blue-500', samples: 128, polyphony: 64 },
    { id: 2, name: 'Analog Synth', category: 'Synth', icon: Radio, color: 'bg-purple-500', samples: 64, polyphony: 16 },
    { id: 3, name: 'Acoustic Guitar', category: 'Guitar', icon: Guitar, color: 'bg-orange-500', samples: 32, polyphony: 6 },
    { id: 4, name: 'Electric Bass', category: 'Bass', icon: Waves, color: 'bg-green-500', samples: 24, polyphony: 1 },
    { id: 5, name: 'Drum Machine', category: 'Drums', icon: Drum, color: 'bg-red-500', samples: 48, polyphony: 16 },
    { id: 6, name: 'Strings Ensemble', category: 'Orchestra', icon: Violin, color: 'bg-yellow-500', samples: 96, polyphony: 32 },
    { id: 7, name: 'Lead Synth', category: 'Lead', icon: Zap, color: 'bg-cyan-500', samples: 32, polyphony: 8 },
    { id: 8, name: 'Pad Synth', category: 'Pad', icon: Layers, color: 'bg-pink-500', samples: 16, polyphony: 12 }
  ]);

  // Enhanced effects rack
  const [effectsRack] = useState([
    { 
      id: 1, 
      name: 'Vintage Reverb', 
      type: 'Reverb', 
      category: 'Spatial',
      active: false, 
      params: { 
        roomSize: 50, 
        decay: 40, 
        damping: 60,
        predelay: 20,
        mix: 25 
      } 
    },
    { 
      id: 2, 
      name: 'Tape Delay', 
      type: 'Delay', 
      category: 'Spatial',
      active: false, 
      params: { 
        time: 250, 
        feedback: 30, 
        highCut: 80,
        lowCut: 20,
        mix: 20 
      } 
    },
    { 
      id: 3, 
      name: 'Pro Compressor', 
      type: 'Compressor', 
      category: 'Dynamics',
      active: true, 
      params: { 
        threshold: -12, 
        ratio: 4, 
        attack: 5,
        release: 100,
        makeup: 2 
      } 
    },
    { 
      id: 4, 
      name: 'Parametric EQ', 
      type: 'EQ', 
      category: 'Filter',
      active: true, 
      params: { 
        lowGain: 0, 
        midGain: 2, 
        highGain: 1,
        lowFreq: 100,
        midFreq: 1000,
        highFreq: 8000
      } 
    },
    { 
      id: 5, 
      name: 'Vintage Chorus', 
      type: 'Chorus', 
      category: 'Modulation',
      active: false, 
      params: { 
        rate: 0.5, 
        depth: 30, 
        feedback: 10,
        delay: 7,
        mix: 40 
      } 
    },
    { 
      id: 6, 
      name: 'Tube Distortion', 
      type: 'Distortion', 
      category: 'Drive',
      active: false, 
      params: { 
        drive: 20, 
        tone: 50, 
        bias: 60,
        output: 80 
      } 
    }
  ]);

  // Sample packs
  const [samplePacks] = useState([
    {
      id: 1,
      name: 'Lo-Fi Hip Hop',
      category: 'Hip Hop',
      samples: [
        { name: 'Vinyl Drums', bpm: 85, duration: '0:08', key: 'Am' },
        { name: 'Jazz Chord', bpm: 85, duration: '0:16', key: 'Dm' },
        { name: 'Nostalgic Lead', bpm: 85, duration: '0:32', key: 'C' }
      ]
    },
    {
      id: 2,
      name: 'Future Bass',
      category: 'Electronic',
      samples: [
        { name: 'Supersonic Drop', bpm: 150, duration: '0:16', key: 'E' },
        { name: 'Wobble Bass', bpm: 150, duration: '0:08', key: 'E' },
        { name: 'Atmospheric Pad', bpm: 150, duration: '0:32', key: 'G#m' }
      ]
    },
    {
      id: 3,
      name: 'Trap Essentials',
      category: 'Trap',
      samples: [
        { name: '808 Sub', bpm: 140, duration: '0:04', key: 'C' },
        { name: 'Hi-Hat Roll', bpm: 140, duration: '0:02', key: '-' },
        { name: 'Snare Snap', bpm: 140, duration: '0:01', key: '-' }
      ]
    }
  ]);

  // Simulate playback timer
  useEffect(() => {
    let interval;
    if (studioData.isPlaying) {
      interval = setInterval(() => {
        setPlaybackTime(prev => {
          const newTime = prev + 0.1;
          // Loop if loop is enabled
          if (studioData.loopEnabled && newTime >= loopEnd) {
            return loopStart;
          }
          return newTime;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [studioData.isPlaying, studioData.loopEnabled, loopStart, loopEnd]);

  // Simulate recording level
  useEffect(() => {
    let interval;
    if (isRecordingAudio) {
      interval = setInterval(() => {
        setRecordingLevel(Math.random() * 100);
      }, 100);
    } else {
      setRecordingLevel(0);
    }
    return () => clearInterval(interval);
  }, [isRecordingAudio]);

  const togglePlay = () => {
    setStudioData(prev => ({
      ...prev,
      isPlaying: !prev.isPlaying
    }));
  };

  const stopPlayback = () => {
    setStudioData(prev => ({
      ...prev,
      isPlaying: false
    }));
    setPlaybackTime(loopStart);
  };

  const toggleRecord = () => {
    setStudioData(prev => ({
      ...prev,
      isRecording: !prev.isRecording
    }));
    setIsRecordingAudio(!isRecordingAudio);
  };

  const tapTempo = () => {
    // Mock tempo tapping
    const newBpm = Math.floor(Math.random() * 60) + 90; // 90-150 BPM
    setStudioData(prev => ({
      ...prev,
      currentProject: {
        ...prev.currentProject,
        bpm: newBpm
      }
    }));
  };

  const toggleTrackMute = (trackId) => {
    setStudioData(prev => ({
      ...prev,
      tracks: prev.tracks.map(track => 
        track.id === trackId 
          ? { ...track, muted: !track.muted }
          : track
      )
    }));
  };

  const toggleTrackSolo = (trackId) => {
    setStudioData(prev => ({
      ...prev,
      tracks: prev.tracks.map(track => 
        track.id === trackId 
          ? { ...track, solo: !track.solo }
          : track
      )
    }));
  };

  const updateTrackVolume = (trackId, volume) => {
    setStudioData(prev => ({
      ...prev,
      tracks: prev.tracks.map(track => 
        track.id === trackId 
          ? { ...track, volume: volume[0] }
          : track
      )
    }));
  };

  const addNewTrack = () => {
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];
    const newTrack = {
      id: String(studioData.tracks.length + 1),
      name: `Track ${studioData.tracks.length + 1}`,
      instrument: 'Synth',
      volume: 75,
      muted: false,
      solo: false,
      armed: false,
      color: colors[studioData.tracks.length % colors.length],
      clips: [],
      sends: { reverb: 0, delay: 0 },
      eq: { low: 0, mid: 0, high: 0 },
      pan: 0
    };
    
    setStudioData(prev => ({
      ...prev,
      tracks: [...prev.tracks, newTrack]
    }));
  };

  const AdvancedTransportControls = () => (
    <div className="bg-gray-900 border-b border-gray-800 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Loop Section */}
          <div className="flex items-center space-x-2 px-3 py-1 bg-gray-800 rounded border border-gray-700">
            <span className="text-xs text-gray-400">LOOP</span>
            <Input 
              value={loopStart}
              onChange={(e) => setLoopStart(Number(e.target.value))}
              className="w-12 h-6 text-xs bg-transparent border-none p-0 text-center"
            />
            <span className="text-xs text-gray-500">-</span>
            <Input 
              value={loopEnd}
              onChange={(e) => setLoopEnd(Number(e.target.value))}
              className="w-12 h-6 text-xs bg-transparent border-none p-0 text-center"
            />
          </div>
          
          {/* Quantize */}
          <Select defaultValue="1/16">
            <SelectTrigger className="w-20 h-8 bg-gray-800 border-gray-700 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1/32">1/32</SelectItem>
              <SelectItem value="1/16">1/16</SelectItem>
              <SelectItem value="1/8">1/8</SelectItem>
              <SelectItem value="1/4">1/4</SelectItem>
              <SelectItem value="off">Off</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Snap to Grid */}
          <Button
            variant={snapToGrid ? "default" : "ghost"}
            size="sm"
            onClick={() => setSnapToGrid(!snapToGrid)}
            className={!snapToGrid ? "text-gray-400 hover:text-white" : ""}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
        </div>

        {/* Main Transport */}
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => setPlaybackTime(Math.max(0, playbackTime - 4))}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <SkipBack className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={stopPlayback}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <Square className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={togglePlay}
            variant="ghost"
            size="lg"
            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-full w-12 h-12"
          >
            {studioData.isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>
          
          <Button
            onClick={toggleRecord}
            variant="ghost"
            size="sm"
            className={studioData.isRecording ? "text-red-500" : "text-gray-400 hover:text-white"}
          >
            <div className={`w-3 h-3 rounded-full ${studioData.isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
          </Button>
          
          <Button
            onClick={() => setPlaybackTime(Math.min(64, playbackTime + 4))}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <SkipForward className="w-4 h-4" />
          </Button>
          
          <div className="mx-4 font-mono text-lg bg-gray-800 px-4 py-1 rounded border border-gray-700">
            {Math.floor(playbackTime / 60)}:{String(Math.floor(playbackTime % 60)).padStart(2, '0')}:{String(Math.floor((playbackTime % 1) * 100)).padStart(2, '0')}
          </div>
          
          <Button
            variant={studioData.loopEnabled ? "default" : "ghost"}
            size="sm"
            className={!studioData.loopEnabled ? "text-gray-400 hover:text-white" : ""}
            onClick={() => setStudioData(prev => ({ ...prev, loopEnabled: !prev.loopEnabled }))}
          >
            <Repeat className="w-4 h-4" />
          </Button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-4">
          {/* BPM Tap */}
          <Button
            onClick={tapTempo}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white px-2"
          >
            <Activity className="w-4 h-4 mr-1" />
            {studioData.currentProject.bpm}
          </Button>
          
          {/* Metronome */}
          <div className="flex items-center space-x-2">
            <Switch 
              checked={studioData.metronomeEnabled}
              onCheckedChange={(checked) => setStudioData(prev => ({ ...prev, metronomeEnabled: checked }))}
            />
            <Clock className="w-4 h-4 text-gray-400" />
            <Select defaultValue="4/4">
              <SelectTrigger className="w-16 h-8 bg-gray-800 border-gray-700 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4/4">4/4</SelectItem>
                <SelectItem value="3/4">3/4</SelectItem>
                <SelectItem value="6/8">6/8</SelectItem>
                <SelectItem value="2/4">2/4</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );

  const EnhancedTrackPanel = () => (
    <div className="w-72 bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-300">TRACKS ({studioData.tracks.length})</h3>
          <div className="flex items-center space-x-1">
            <Button 
              onClick={addNewTrack} 
              variant="ghost" 
              size="sm"
              className="text-gray-400 hover:text-white w-6 h-6 p-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-gray-400 hover:text-white w-6 h-6 p-0"
              onClick={() => setShowMixer(!showMixer)}
            >
              <Mixer className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Tools */}
        <div className="flex items-center space-x-1 mb-4">
          {[
            { tool: 'select', icon: MousePointer, label: 'Select' },
            { tool: 'draw', icon: PenTool, label: 'Draw' },
            { tool: 'cut', icon: Scissors, label: 'Cut' },
            { tool: 'move', icon: Move, label: 'Move' }
          ].map(({ tool, icon: Icon, label }) => (
            <Button
              key={tool}
              variant={selectedTool === tool ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedTool(tool)}
              className={`w-8 h-8 p-0 ${selectedTool !== tool ? 'text-gray-400 hover:text-white' : ''}`}
              title={label}
            >
              <Icon className="w-3 h-3" />
            </Button>
          ))}
        </div>
      </div>
      
      {/* Tracks List */}
      <div className="flex-1 overflow-y-auto">
        {studioData.tracks.map((track, index) => (
          <div 
            key={track.id}
            className={`p-4 border-b border-gray-800 hover:bg-gray-800 cursor-pointer transition-colors ${
              selectedTrack === track.id ? 'bg-gray-800 border-l-2 border-l-orange-500' : ''
            }`}
            onClick={() => setSelectedTrack(track.id)}
          >
            {/* Track Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full border border-white/20"
                  style={{ backgroundColor: track.color }}
                />
                <Input
                  value={track.name}
                  onChange={(e) => {
                    setStudioData(prev => ({
                      ...prev,
                      tracks: prev.tracks.map(t => 
                        t.id === track.id ? { ...t, name: e.target.value } : t
                      )
                    }));
                  }}
                  className="bg-transparent border-none p-0 h-auto text-sm font-medium text-white w-20"
                />
                {track.armed && <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
              </div>
              <div className="flex items-center space-x-1">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="w-6 h-6 p-0 text-gray-400 hover:text-white"
                >
                  <Copy className="w-3 h-3" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="w-6 h-6 p-0 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            <div className="text-xs text-gray-400 mb-3">{track.instrument}</div>
            
            {/* Track Controls */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-1">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTrackMute(track.id);
                  }}
                  variant={track.muted ? "destructive" : "ghost"}
                  size="sm"
                  className="w-6 h-6 p-0 text-xs font-bold"
                >
                  M
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTrackSolo(track.id);
                  }}
                  variant={track.solo ? "default" : "ghost"}
                  size="sm"
                  className="w-6 h-6 p-0 text-xs font-bold"
                >
                  S
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setStudioData(prev => ({
                      ...prev,
                      tracks: prev.tracks.map(t => 
                        t.id === track.id ? { ...t, armed: !t.armed } : t
                      )
                    }));
                  }}
                  variant={track.armed ? "destructive" : "ghost"}
                  size="sm"
                  className="w-6 h-6 p-0 text-xs font-bold"
                >
                  R
                </Button>
              </div>
              
              {/* Input/Output */}
              <div className="flex items-center space-x-1">
                <Button variant="ghost" size="sm" className="w-6 h-6 p-0 text-gray-400">
                  <Mic2 className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="sm" className="w-6 h-6 p-0 text-gray-400">
                  <MonitorSpeaker className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            {/* Volume and Pan */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Volume2 className="w-3 h-3 text-gray-400" />
                <Slider
                  value={[track.volume]}
                  onValueChange={(value) => updateTrackVolume(track.id, value)}
                  max={100}
                  step={1}
                  className="flex-1"
                  onClick={(e) => e.stopPropagation()}
                />
                <span className="text-xs text-gray-400 w-7">{track.volume}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Target className="w-3 h-3 text-gray-400" />
                <Slider
                  value={[track.pan || 0]}
                  max={50}
                  min={-50}
                  step={1}
                  className="flex-1"
                  onClick={(e) => e.stopPropagation()}
                />
                <span className="text-xs text-gray-400 w-7">{track.pan || 0}</span>
              </div>
              
              {/* Recording Level */}
              {track.armed && isRecordingAudio && (
                <div className="flex items-center space-x-2">
                  <Activity className="w-3 h-3 text-red-400" />
                  <Progress value={recordingLevel} className="flex-1 h-1" />
                </div>
              )}
            </div>
            
            {/* Send Effects */}
            <div className="mt-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">SENDS</span>
                <Button variant="ghost" size="sm" className="w-4 h-4 p-0 text-gray-400">
                  <Plus className="w-2 h-2" />
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-400 w-8">Rev</span>
                <Slider
                  value={[track.sends?.reverb || 0]}
                  max={100}
                  step={1}
                  className="flex-1 h-1"
                />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-400 w-8">Del</span>
                <Slider
                  value={[track.sends?.delay || 0]}
                  max={100}
                  step={1}
                  className="flex-1 h-1"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const EnhancedTimeline = () => (
    <div className="flex-1 flex flex-col bg-gray-950">
      {/* Timeline Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-400">Timeline</span>
            <div className="flex items-center space-x-2">
              <Button 
                variant={activeView === 'arrange' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('arrange')}
                className="text-xs"
              >
                Arrange
              </Button>
              <Button 
                variant={activeView === 'edit' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('edit')}
                className="text-xs"
              >
                Edit
              </Button>
              <Button 
                variant={activeView === 'mix' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('mix')}
                className="text-xs"
              >
                Mix
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setZoomLevel(Math.max(25, zoomLevel - 25))}
              className="text-gray-400 hover:text-white"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-xs text-gray-400 w-12 text-center">{zoomLevel}%</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setZoomLevel(Math.min(400, zoomLevel + 25))}
              className="text-gray-400 hover:text-white"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            
            <Separator orientation="vertical" className="h-6 bg-gray-700 mx-2" />
            
            <Button 
              variant={showAutomation ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setShowAutomation(!showAutomation)}
              className={!showAutomation ? 'text-gray-400 hover:text-white' : ''}
            >
              <Activity className="w-4 h-4" />
            </Button>
            
            <Button 
              variant={showPianoRoll ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setShowPianoRoll(!showPianoRoll)}
              className={!showPianoRoll ? 'text-gray-400 hover:text-white' : ''}
            >
              <Piano className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Time Ruler */}
        <div className="relative h-8 bg-gray-800 rounded overflow-hidden">
          {/* Loop region indicator */}
          {studioData.loopEnabled && (
            <div 
              className="absolute top-0 h-full bg-orange-500/20 border-l-2 border-r-2 border-orange-500"
              style={{
                left: `${(loopStart / 64) * 100}%`,
                width: `${((loopEnd - loopStart) / 64) * 100}%`
              }}
            />
          )}
          
          {/* Timeline markers */}
          <div className="absolute inset-0 flex">
            {Array.from({ length: 32 }).map((_, i) => (
              <div key={i} className="flex-1 border-r border-gray-700 flex items-center justify-center">
                <span className="text-xs text-gray-500">{i * 2 + 1}</span>
              </div>
            ))}
          </div>
          
          {/* Playhead */}
          <div 
            className="absolute top-0 w-0.5 h-full bg-orange-500 z-20"
            style={{ left: `${(playbackTime / 64) * 100}%` }}
          />
        </div>
      </div>
      
      {/* Track Timeline */}
      <div className="flex-1 overflow-y-auto">
        {studioData.tracks.map((track) => (
          <div 
            key={track.id}
            className={`h-20 border-b border-gray-800 flex items-center px-4 ${
              selectedTrack === track.id ? 'bg-gray-900/50' : 'hover:bg-gray-900/30'
            }`}
          >
            <div className="flex-1 h-12 bg-gray-800 rounded relative overflow-hidden">
              {/* Audio clips */}
              {track.clips.map((clip) => (
                <div
                  key={clip.id}
                  className={`absolute h-full rounded border-2 flex items-center px-2 cursor-pointer hover:brightness-110 transition-all ${
                    selectedClip === clip.id ? 'border-orange-500' : 'border-gray-600'
                  }`}
                  style={{
                    backgroundColor: track.color + '40',
                    borderColor: selectedClip === clip.id ? '#f97316' : track.color,
                    left: `${(clip.start / 64) * 100}%`,
                    width: `${(clip.duration / 64) * 100}%`
                  }}
                  onClick={() => setSelectedClip(clip.id)}
                >
                  <span className="text-xs text-white truncate font-medium">{clip.name}</span>
                  
                  {/* Enhanced Waveform */}
                  <div className="absolute inset-0 opacity-30 overflow-hidden p-1">
                    <div className="flex items-center h-full">
                      {Array.from({ length: Math.floor(clip.duration * 8) }).map((_, i) => {
                        const height = Math.sin(i * 0.5) * Math.random() * 80 + 20;
                        return (
                          <div
                            key={i}
                            className="w-px bg-white mx-px"
                            style={{ height: `${height}%` }}
                          />
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Clip handles for resizing */}
                  <div className="absolute left-0 top-0 w-1 h-full bg-white/20 cursor-ew-resize opacity-0 hover:opacity-100" />
                  <div className="absolute right-0 top-0 w-1 h-full bg-white/20 cursor-ew-resize opacity-0 hover:opacity-100" />
                </div>
              ))}
              
              {/* Automation lanes */}
              {showAutomation && (
                <div className="absolute bottom-0 left-0 right-0 h-6 bg-gray-900/50 border-t border-gray-700">
                  <div className="flex items-center px-2 h-full">
                    <span className="text-xs text-gray-500">Volume</span>
                    {/* Automation curve visualization */}
                    <div className="ml-2 flex-1 h-2 bg-gray-800 rounded relative">
                      <div className="absolute inset-0 flex items-center">
                        {Array.from({ length: 20 }).map((_, i) => (
                          <div key={i} className="flex-1 flex justify-center">
                            <div 
                              className="w-1 bg-orange-500 rounded"
                              style={{ height: `${Math.sin(i * 0.3) * 50 + 50}%` }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Piano Roll */}
      {showPianoRoll && (
        <div className="h-64 border-t border-gray-800 bg-gray-900">
          <div className="p-4">
            <h4 className="text-sm font-semibold text-gray-300 mb-3">Piano Roll - {studioData.tracks.find(t => t.id === selectedTrack)?.name}</h4>
            <div className="h-48 bg-gray-800 rounded flex">
              {/* Piano keys */}
              <div className="w-16 border-r border-gray-700">
                {['C4', 'B3', 'A#3', 'A3', 'G#3', 'G3', 'F#3', 'F3', 'E3', 'D#3', 'D3', 'C#3'].map((note, i) => (
                  <div 
                    key={note}
                    className={`h-4 border-b border-gray-700 flex items-center px-2 text-xs cursor-pointer hover:bg-gray-700 ${
                      note.includes('#') ? 'bg-gray-900 text-gray-400' : 'bg-gray-800 text-white'
                    }`}
                  >
                    {note}
                  </div>
                ))}
              </div>
              
              {/* Note grid */}
              <div className="flex-1 relative">
                <div className="grid grid-cols-32 h-full">
                  {/* Mock MIDI notes */}
                  <div className="absolute bg-orange-500/80 rounded" style={{ left: '12.5%', top: '16.67%', width: '6.25%', height: '8.33%' }} />
                  <div className="absolute bg-orange-500/80 rounded" style={{ left: '25%', top: '33.33%', width: '12.5%', height: '8.33%' }} />
                  <div className="absolute bg-orange-500/80 rounded" style={{ left: '50%', top: '25%', width: '6.25%', height: '8.33%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const EnhancedBrowser = () => (
    <div className="w-80 bg-gray-900 border-l border-gray-800">
      <Tabs defaultValue="sounds" className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800 border-b border-gray-700 rounded-none">
          <TabsTrigger value="sounds" className="data-[state=active]:bg-orange-500 text-xs">
            <Music className="w-3 h-3 mr-1" />
            Sounds
          </TabsTrigger>
          <TabsTrigger value="samples" className="data-[state=active]:bg-orange-500 text-xs">
            <Waves className="w-3 h-3 mr-1" />
            Samples
          </TabsTrigger>
          <TabsTrigger value="fx" className="data-[state=active]:bg-orange-500 text-xs">
            <Zap className="w-3 h-3 mr-1" />
            FX
          </TabsTrigger>
          <TabsTrigger value="collab" className="data-[state=active]:bg-orange-500 text-xs">
            <Users className="w-3 h-3 mr-1" />
            Live
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sounds" className="flex-1 p-4 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-gray-300">INSTRUMENTS</h4>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Filter className="w-3 h-3" />
            </Button>
          </div>
          
          {instrumentsLibrary.map((instrument) => {
            const Icon = instrument.icon;
            return (
              <Card key={instrument.id} className="bg-gray-800 border-gray-700 hover:bg-gray-750 cursor-pointer transition-all">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 ${instrument.color} rounded flex items-center justify-center`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-sm text-white">{instrument.name}</div>
                        <div className="text-xs text-gray-400">{instrument.category}</div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white w-6 h-6 p-0">
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{instrument.samples} samples</span>
                    <span>{instrument.polyphony} voices</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="samples" className="flex-1 p-4 space-y-4">
          <h4 className="text-sm font-semibold text-gray-300 mb-4">SAMPLE PACKS</h4>
          
          {samplePacks.map((pack) => (
            <Card key={pack.id} className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-white flex items-center justify-between">
                  {pack.name}
                  <Badge variant="outline" className="border-gray-600 text-xs">{pack.category}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {pack.samples.map((sample, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-gray-900 rounded hover:bg-gray-700 cursor-pointer transition-colors">
                    <div className="flex-1">
                      <div className="text-xs text-white font-medium">{sample.name}</div>
                      <div className="text-xs text-gray-400">{sample.key} • {sample.bpm} BPM • {sample.duration}</div>
                    </div>
                    <Button variant="ghost" size="sm" className="w-6 h-6 p-0 text-gray-400 hover:text-white">
                      <Play className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="fx" className="flex-1 p-4 space-y-4">
          <h4 className="text-sm font-semibold text-gray-300 mb-4">EFFECTS RACK</h4>
          
          {effectsRack.map((effect) => (
            <Card key={effect.id} className="bg-gray-800 border-gray-700">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-medium text-sm text-white">{effect.name}</div>
                    <div className="text-xs text-gray-400">{effect.category}</div>
                  </div>
                  <Switch
                    checked={effect.active}
                    onCheckedChange={(checked) => {
                      console.log(`Toggle ${effect.name}: ${checked}`);
                    }}
                  />
                </div>
                
                {effect.active && (
                  <div className="space-y-2">
                    {Object.entries(effect.params).slice(0, 3).map(([param, value]) => (
                      <div key={param} className="flex items-center space-x-2">
                        <span className="text-xs text-gray-400 w-16 capitalize">{param}:</span>
                        <Slider
                          value={[typeof value === 'number' ? Math.abs(value) : value]}
                          max={100}
                          step={1}
                          className="flex-1"
                        />
                        <span className="text-xs text-gray-400 w-8">{value}</span>
                      </div>
                    ))}
                    
                    <Button variant="outline" size="sm" className="w-full border-gray-600 text-xs mt-2">
                      <Settings className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="collab" className="flex-1 p-4 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-gray-300">LIVE SESSION</h4>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-green-400">Live</span>
            </div>
          </div>
          
          <div className="space-y-3">
            {collaborators.map((collab) => (
              <div key={collab.id} className="flex items-center space-x-3 p-2 bg-gray-800 rounded">
                <div className="relative">
                  <img 
                    src={collab.avatar} 
                    alt={collab.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-800 ${
                    collab.online ? 'bg-green-500' : 'bg-gray-500'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-white font-medium">{collab.name}</div>
                  <div className="text-xs text-gray-400">
                    {collab.editing ? `Editing ${collab.editing}` : 'Listening'}
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="w-6 h-6 p-0 text-gray-400 hover:text-white">
                  <MessageSquare className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
          
          <Button variant="outline" className="w-full border-gray-600 hover:bg-gray-800">
            <Plus className="w-4 h-4 mr-2" />
            Invite Collaborator
          </Button>
          
          <div className="mt-6 p-3 bg-gray-800 rounded">
            <h5 className="text-sm font-medium text-white mb-2">Session Chat</h5>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              <div className="text-xs">
                <span className="text-orange-400">Alex:</span>
                <span className="text-gray-300 ml-1">Added new bass line!</span>
              </div>
              <div className="text-xs">
                <span className="text-green-400">Maya:</span>
                <span className="text-gray-300 ml-1">Sounds great! 🔥</span>
              </div>
            </div>
            <Input 
              placeholder="Type a message..."
              className="mt-2 bg-gray-700 border-gray-600 text-xs"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Top Navigation Bar */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-semibold">{studioData.currentProject.name}</h1>
          <div className="flex items-center space-x-3 text-sm text-gray-400">
            <span>BPM: {studioData.currentProject.bpm}</span>
            <span>Key: {studioData.currentProject.key}</span>
            <span>{studioData.currentProject.timeSignature}</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-400">{collaborators.length} online</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-800">
            <Users className="w-4 h-4 mr-1" />
            Invite
          </Button>
          <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-800">
            <Upload className="w-4 h-4 mr-1" />
            Import
          </Button>
          <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-800">
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
          <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-800">
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="default"
                size="sm"
                className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
              >
                <Share className="w-4 h-4 mr-1" />
                Publish
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-gray-700">
              <DialogHeader>
                <DialogTitle>Publish Track</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">Track Title</label>
                  <Input defaultValue={studioData.currentProject.name} className="bg-gray-700 border-gray-600" />
                </div>
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">Genre</label>
                  <Select defaultValue="electronic">
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electronic">Electronic</SelectItem>
                      <SelectItem value="hiphop">Hip Hop</SelectItem>
                      <SelectItem value="rock">Rock</SelectItem>
                      <SelectItem value="pop">Pop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch />
                  <span className="text-sm text-gray-300">Make public</span>
                </div>
                <Button className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600">
                  Publish to Community
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <AdvancedTransportControls />

      {/* Main Studio Interface */}
      <div className="flex-1 flex overflow-hidden">
        <EnhancedTrackPanel />
        <EnhancedTimeline />
        <EnhancedBrowser />
      </div>

      {/* Enhanced Status Bar */}
      <div className="bg-gray-900 border-t border-gray-800 px-6 py-2">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center space-x-6">
            <span>CPU: 12%</span>
            <span>RAM: 1.2 GB</span>
            <span>Disk: 45 MB/s</span>
            <span>44.1 kHz / 24-bit</span>
            <span>Latency: 256 samples (5.8ms)</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <MonitorSpeaker className="w-4 h-4" />
              <Slider
                value={masterVolume}
                onValueChange={setMasterVolume}
                max={100}
                step={1}
                className="w-20"
              />
              <span className="w-8 text-center">{masterVolume[0]}</span>
            </div>
            
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Studio;