import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Slider } from '../components/ui/slider';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Switch } from '../components/ui/switch';
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
  Edit,
  Copy,
  Scissors,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Maximize2,
  Minimize2,
  Grid3X3,
  Waves,
  Zap,
  Filter,
  Sliders,
  Upload,
  Download,
  Users,
  MessageSquare,
  Clock,
  Target,
  Volume1,
  VolumeX as Mute
} from 'lucide-react';
import { mockStudioData } from '../data/mock';

const Studio = () => {
  const [studioData, setStudioData] = useState(mockStudioData);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [selectedTool, setSelectedTool] = useState('select');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showPianoRoll, setShowPianoRoll] = useState(false);
  const [showMixer, setShowMixer] = useState(true);
  const [activeEffect, setActiveEffect] = useState(null);
  const [recordingMode, setRecordingMode] = useState('audio');
  const [collaborators, setCollaborators] = useState([]);
  const [masterVolume, setMasterVolume] = useState([85]);

  // Enhanced mock data for studio
  const [instrumentLibrary] = useState([
    { id: 1, name: 'Grand Piano', type: 'Piano', category: 'Keys', color: '#3b82f6' },
    { id: 2, name: 'Analog Synth', type: 'Synthesizer', category: 'Synths', color: '#8b5cf6' },
    { id: 3, name: 'Acoustic Guitar', type: 'Guitar', category: 'Strings', color: '#f59e0b' },
    { id: 4, name: 'Bass Guitar', type: 'Bass', category: 'Bass', color: '#10b981' },
    { id: 5, name: 'Drum Kit', type: 'Drums', category: 'Percussion', color: '#ef4444' },
    { id: 6, name: 'Strings Section', type: 'Strings', category: 'Orchestra', color: '#f97316' },
  ]);

  const [effectsRack] = useState([
    { id: 1, name: 'Reverb Hall', type: 'Reverb', active: false, params: { size: 50, decay: 40, mix: 25 } },
    { id: 2, name: 'Delay', type: 'Delay', active: false, params: { time: 250, feedback: 30, mix: 20 } },
    { id: 3, name: 'Compressor', type: 'Dynamics', active: true, params: { threshold: -12, ratio: 4, attack: 5 } },
    { id: 4, name: 'EQ', type: 'EQ', active: true, params: { low: 0, mid: 2, high: 1 } },
    { id: 5, name: 'Chorus', type: 'Modulation', active: false, params: { rate: 0.5, depth: 30, mix: 40 } },
    { id: 6, name: 'Distortion', type: 'Drive', active: false, params: { drive: 20, tone: 50, level: 80 } },
  ]);

  const [samples] = useState([
    { id: 1, name: 'Hip Hop Drum Loop', category: 'Drums', bpm: 90, duration: '00:08' },
    { id: 2, name: 'Bass Line Funk', category: 'Bass', bpm: 110, duration: '00:16' },
    { id: 3, name: 'Atmospheric Pad', category: 'Synths', bpm: 120, duration: '00:32' },
    { id: 4, name: 'Guitar Strums', category: 'Strings', bpm: 75, duration: '00:04' },
    { id: 5, name: 'Vocal Chops', category: 'Vocal', bpm: 128, duration: '00:02' },
    { id: 6, name: 'Percussion Loop', category: 'Drums', bpm: 100, duration: '00:16' },
  ]);

  // Simulate playback timer
  useEffect(() => {
    let interval;
    if (studioData.isPlaying) {
      interval = setInterval(() => {
        setPlaybackTime(prev => prev + 0.1);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [studioData.isPlaying]);

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
    setPlaybackTime(0);
  };

  const toggleRecord = () => {
    setStudioData(prev => ({
      ...prev,
      isRecording: !prev.isRecording
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
    const newTrack = {
      id: String(studioData.tracks.length + 1),
      name: `Track ${studioData.tracks.length + 1}`,
      instrument: 'Synth',
      volume: 75,
      muted: false,
      solo: false,
      color: '#8b5cf6',
      clips: []
    };
    
    setStudioData(prev => ({
      ...prev,
      tracks: [...prev.tracks, newTrack]
    }));
  };

  const TimelineRuler = () => (
    <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-4 text-sm text-gray-400">
          <span>BPM: {studioData.currentProject.bpm}</span>
          <span>Key: {studioData.currentProject.key}</span>
          <span>4/4</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={() => setZoomLevel(prev => Math.max(25, prev - 25))}>
            <Minimize2 className="w-4 h-4" />
          </Button>
          <span className="text-xs text-gray-400">{zoomLevel}%</span>
          <Button variant="ghost" size="sm" onClick={() => setZoomLevel(prev => Math.min(400, prev + 25))}>
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Timeline ruler */}
      <div className="relative h-8 bg-gray-900 rounded">
        <div className="absolute inset-0 flex">
          {Array.from({ length: 32 }).map((_, i) => (
            <div key={i} className="flex-1 border-r border-gray-700 flex items-center justify-center">
              <span className="text-xs text-gray-500">{i + 1}</span>
            </div>
          ))}
        </div>
        {/* Playhead */}
        <div 
          className="absolute top-0 w-0.5 h-full bg-orange-500 z-10"
          style={{ left: `${(playbackTime / 32) * 100}%` }}
        />
      </div>
    </div>
  );

  const TrackControls = ({ track }) => (
    <Card 
      className={`bg-gray-800 border-gray-700 cursor-pointer transition-all ${
        selectedTrack === track.id ? 'border-orange-500' : 'hover:bg-gray-750'
      }`}
      onClick={() => setSelectedTrack(track.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div 
              className="w-4 h-4 rounded-full border-2 border-white/20" 
              style={{ backgroundColor: track.color }}
            />
            <div>
              <Input
                value={track.name}
                className="bg-transparent border-none p-0 h-auto text-sm font-medium text-white"
                onChange={(e) => {
                  setStudioData(prev => ({
                    ...prev,
                    tracks: prev.tracks.map(t => 
                      t.id === track.id ? { ...t, name: e.target.value } : t
                    )
                  }));
                }}
              />
              <div className="text-xs text-gray-400">{track.instrument}</div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button 
              variant="ghost" 
              size="sm"
              className="w-6 h-6 p-0 text-gray-400 hover:text-white"
            >
              <Edit className="w-3 h-3" />
            </Button>
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
        
        {/* Track controls */}
        <div className="flex items-center space-x-2 mb-3">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              toggleTrackMute(track.id);
            }}
            variant={track.muted ? "destructive" : "outline"}
            size="sm"
            className="w-8 h-8 p-0 text-xs"
          >
            {track.muted ? <Mute className="w-3 h-3" /> : <Volume1 className="w-3 h-3" />}
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              toggleTrackSolo(track.id);
            }}
            variant={track.solo ? "default" : "outline"}
            size="sm"
            className="w-8 h-8 p-0 text-xs"
          >
            S
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-8 h-8 p-0 text-xs"
          >
            R
          </Button>
        </div>
        
        {/* Volume and pan */}
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
            <span className="text-xs text-gray-400 w-8">{track.volume}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Target className="w-3 h-3 text-gray-400" />
            <Slider
              value={[0]}
              max={100}
              step={1}
              className="flex-1"
              onClick={(e) => e.stopPropagation()}
            />
            <span className="text-xs text-gray-400 w-8">C</span>
          </div>
        </div>
        
        {/* Effects indicator */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex space-x-1">
            {effectsRack.filter(fx => fx.active).slice(0, 3).map((fx, i) => (
              <Badge key={i} variant="outline" className="text-xs px-1 py-0 border-gray-600">
                {fx.type}
              </Badge>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="w-6 h-6 p-0 text-gray-400 hover:text-white">
            <Sliders className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const TrackTimeline = ({ track }) => (
    <div className="flex items-center h-20 bg-gray-850 border-b border-gray-700 px-4">
      <div className="relative flex-1 h-12 bg-gray-800 rounded overflow-hidden">
        {track.clips.map((clip, i) => (
          <div
            key={clip.id}
            className="absolute h-full rounded border border-gray-600 flex items-center px-2"
            style={{
              backgroundColor: track.color + '40',
              borderColor: track.color,
              left: `${(clip.start / 32) * 100}%`,
              width: `${(clip.duration / 32) * 100}%`
            }}
          >
            <span className="text-xs text-white truncate">{clip.name}</span>
            <div className="absolute inset-0 opacity-20">
              {/* Mock waveform */}
              <div className="flex items-end h-full px-1">
                {Array.from({ length: 20 }).map((_, j) => (
                  <div
                    key={j}
                    className="flex-1 bg-white mx-px"
                    style={{ height: `${Math.random() * 100}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Studio Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div>
              <h1 className="text-2xl font-bold">{studioData.currentProject.name}</h1>
              <div className="flex items-center space-x-6 text-sm text-gray-400 mt-1">
                <span>BPM: {studioData.currentProject.bpm}</span>
                <span>Key: {studioData.currentProject.key}</span>
                <span>Time: {studioData.currentProject.timeSignature}</span>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>{collaborators.length} collaborators</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" className="border-gray-600">
              <MessageSquare className="w-4 h-4 mr-2" />
              Chat
            </Button>
            <Button variant="outline" size="sm" className="border-gray-600">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" size="sm" className="border-gray-600">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" className="border-gray-600">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" size="sm" className="border-gray-600">
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm" className="border-gray-600">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Transport Controls */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Main transport */}
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setPlaybackTime(Math.max(0, playbackTime - 4))}
                variant="outline"
                size="sm"
                className="border-gray-600"
              >
                <SkipBack className="w-4 h-4" />
              </Button>
              
              <Button
                onClick={stopPlayback}
                variant="outline"
                size="sm"
                className="border-gray-600"
              >
                <Square className="w-4 h-4" />
              </Button>
              
              <Button
                onClick={togglePlay}
                variant="default"
                size="lg"
                className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
              >
                {studioData.isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>
              
              <Button
                onClick={toggleRecord}
                variant={studioData.isRecording ? "destructive" : "outline"}
                size="sm"
                className={!studioData.isRecording ? "border-gray-600" : ""}
              >
                <div className={`w-3 h-3 rounded-full ${studioData.isRecording ? 'bg-white animate-pulse' : 'bg-red-500'}`} />
              </Button>
              
              <Button
                onClick={() => setPlaybackTime(Math.min(32, playbackTime + 4))}
                variant="outline"
                size="sm"
                className="border-gray-600"
              >
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Loop and shuffle */}
            <div className="flex items-center space-x-2">
              <Button
                variant={studioData.loopEnabled ? "default" : "outline"}
                size="sm"
                className={!studioData.loopEnabled ? "border-gray-600" : ""}
                onClick={() => setStudioData(prev => ({ ...prev, loopEnabled: !prev.loopEnabled }))}
              >
                <Repeat className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-600"
              >
                <Shuffle className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Time display */}
            <div className="text-mono text-lg bg-gray-800 px-4 py-2 rounded border border-gray-700">
              {Math.floor(playbackTime / 60)}:{String(Math.floor(playbackTime % 60)).padStart(2, '0')}.{String(Math.floor((playbackTime % 1) * 10)).padStart(1, '0')}
            </div>
          </div>
          
          {/* Recording mode and options */}
          <div className="flex items-center space-x-4">
            <Select value={recordingMode} onValueChange={setRecordingMode}>
              <SelectTrigger className="w-32 bg-gray-800 border-gray-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="midi">MIDI</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center space-x-2">
              <Switch 
                checked={studioData.metronomeEnabled}
                onCheckedChange={(checked) => setStudioData(prev => ({ ...prev, metronomeEnabled: checked }))}
              />
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">Click</span>
            </div>
            
            {/* Master volume */}
            <div className="flex items-center space-x-2">
              <Volume2 className="w-4 h-4 text-gray-400" />
              <Slider
                value={masterVolume}
                onValueChange={setMasterVolume}
                max={100}
                step={1}
                className="w-24"
              />
              <span className="text-sm text-gray-400 w-8">{masterVolume[0]}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Tracks */}
        <div className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center">
                <Waves className="w-4 h-4 mr-2" />
                Tracks ({studioData.tracks.length})
              </h3>
              <Button onClick={addNewTrack} size="sm" variant="outline" className="border-gray-600">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center space-x-2 mb-4">
              <Button
                variant={selectedTool === 'select' ? 'default' : 'outline'}
                size="sm"
                className={selectedTool !== 'select' ? 'border-gray-600' : ''}
                onClick={() => setSelectedTool('select')}
              >
                Select
              </Button>
              <Button
                variant={selectedTool === 'cut' ? 'default' : 'outline'}
                size="sm"
                className={selectedTool !== 'cut' ? 'border-gray-600' : ''}
                onClick={() => setSelectedTool('cut')}
              >
                <Scissors className="w-3 h-3" />
              </Button>
              <Button
                variant={selectedTool === 'draw' ? 'default' : 'outline'}
                size="sm"
                className={selectedTool !== 'draw' ? 'border-gray-600' : ''}
                onClick={() => setSelectedTool('draw')}
              >
                <Edit className="w-3 h-3" />
              </Button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {studioData.tracks.map((track) => (
              <TrackControls key={track.id} track={track} />
            ))}
          </div>
        </div>

        {/* Center Panel - Timeline */}
        <div className="flex-1 flex flex-col">
          <TimelineRuler />
          
          <div className="flex-1 overflow-y-auto">
            {studioData.tracks.map((track) => (
              <TrackTimeline key={track.id} track={track} />
            ))}
          </div>
          
          {/* Piano Roll Toggle */}
          <div className="border-t border-gray-800 p-4">
            <Button
              onClick={() => setShowPianoRoll(!showPianoRoll)}
              variant={showPianoRoll ? "default" : "outline"}
              className={!showPianoRoll ? "border-gray-600" : ""}
            >
              <Piano className="w-4 h-4 mr-2" />
              Piano Roll
            </Button>
          </div>
        </div>

        {/* Right Panel - Library & Effects */}
        <div className="w-80 bg-gray-900 border-l border-gray-800">
          <Tabs defaultValue="instruments" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800 border-b border-gray-700">
              <TabsTrigger value="instruments" className="data-[state=active]:bg-orange-500">
                <Piano className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="samples" className="data-[state=active]:bg-orange-500">
                <Waves className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="effects" className="data-[state=active]:bg-orange-500">
                <Zap className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="mixer" className="data-[state=active]:bg-orange-500">
                <Sliders className="w-4 h-4" />
              </TabsTrigger>
            </TabsList>

            <TabsContent value="instruments" className="flex-1 p-4 space-y-3">
              <h3 className="font-semibold mb-4">Instruments</h3>
              {instrumentLibrary.map(instrument => (
                <Card key={instrument.id} className="bg-gray-800 border-gray-700 hover:bg-gray-750 cursor-pointer transition-colors">
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: instrument.color }}
                      >
                        <Piano className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{instrument.name}</div>
                        <div className="text-xs text-gray-400">{instrument.category}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="samples" className="flex-1 p-4 space-y-3">
              <h3 className="font-semibold mb-4">Samples & Loops</h3>
              {samples.map(sample => (
                <Card key={sample.id} className="bg-gray-800 border-gray-700 hover:bg-gray-750 cursor-pointer transition-colors">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{sample.name}</span>
                      <Button variant="ghost" size="sm" className="w-6 h-6 p-0">
                        <Play className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <Badge variant="outline" className="border-gray-600">{sample.category}</Badge>
                      <span>{sample.bpm} BPM</span>
                      <span>{sample.duration}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="effects" className="flex-1 p-4 space-y-3">
              <h3 className="font-semibold mb-4">Effects Rack</h3>
              {effectsRack.map(effect => (
                <Card key={effect.id} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-sm">{effect.name}</span>
                      <Switch
                        checked={effect.active}
                        onCheckedChange={(checked) => {
                          // Update effect active state
                          console.log(`Toggle ${effect.name}: ${checked}`);
                        }}
                      />
                    </div>
                    {effect.active && (
                      <div className="space-y-2">
                        {Object.entries(effect.params).map(([param, value]) => (
                          <div key={param} className="flex items-center space-x-2">
                            <span className="text-xs text-gray-400 w-12 capitalize">{param}:</span>
                            <Slider
                              value={[value]}
                              max={100}
                              step={1}
                              className="flex-1"
                            />
                            <span className="text-xs text-gray-400 w-8">{value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="mixer" className="flex-1 p-4">
              <h3 className="font-semibold mb-4">Master Mixer</h3>
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="text-center mb-4">
                    <div className="text-lg font-mono">{masterVolume[0]}dB</div>
                    <Progress value={masterVolume[0]} className="h-2 mt-2" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Master EQ</span>
                      <Button variant="outline" size="sm" className="border-gray-600">
                        <Filter className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-xs text-gray-400">Low</div>
                        <Slider value={[0]} max={12} min={-12} className="mt-1" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Mid</div>
                        <Slider value={[2]} max={12} min={-12} className="mt-1" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">High</div>
                        <Slider value={[1]} max={12} min={-12} className="mt-1" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Studio;