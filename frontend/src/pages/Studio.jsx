import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Slider } from '../components/ui/slider';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
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
  Share2,
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
  Activity,
  MonitorSpeaker,
  Mic2,
  Target,
  Volume1,
  Copy,
  Edit3,
  MoreHorizontal
} from 'lucide-react';
import { mockStudioData } from '../data/mock';

const Studio = () => {
  const [studioData, setStudioData] = useState(mockStudioData);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [selectedTrack, setSelectedTrack] = useState('1');
  const [masterVolume, setMasterVolume] = useState([75]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [loopEnabled, setLoopEnabled] = useState(false);
  const [metronomeEnabled, setMetronomeEnabled] = useState(false);
  const [bpm] = useState(120);
  
  // Real-time collaboration mock
  const [onlineUsers] = useState([
    { id: 1, name: 'Alex Producer', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face', color: '#3b82f6' },
    { id: 2, name: 'Maya Singer', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b7d0a6f1?w=32&h=32&fit=crop&crop=face', color: '#ef4444' }
  ]);

  // Simulate playback timer
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlaybackTime(prev => prev + 0.1);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const stopPlayback = () => {
    setIsPlaying(false);
    setPlaybackTime(0);
  };

  const toggleRecord = () => {
    setIsRecording(!isRecording);
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
      color: colors[studioData.tracks.length % colors.length],
      clips: []
    };
    
    setStudioData(prev => ({
      ...prev,
      tracks: [...prev.tracks, newTrack]
    }));
  };

  return (
    <div className="min-h-screen bg-[#1a1a1b] text-white flex flex-col">
      {/* Header exatamente como o BandLab original */}
      <div className="bg-[#242529] border-b border-gray-800 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-base font-medium text-white">{studioData.currentProject.name}</h1>
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <span>BPM: {bpm}</span>
            <span>Key: {studioData.currentProject.key}</span>
            <span>4/4</span>
            <div className="flex items-center space-x-1">
              <Users className="w-3 h-3" />
              <span>{onlineUsers.length} collaborators</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-700 h-8">
            <MessageSquare className="w-4 h-4 mr-1" />
            Chat
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-700 h-8">
            <Upload className="w-4 h-4 mr-1" />
            Import
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-700 h-8">
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-700 h-8">
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
          <Button 
            className="bg-[#ff4500] hover:bg-[#ff5722] text-white h-8"
            size="sm"
          >
            <Share2 className="w-4 h-4 mr-1" />
            Publish
          </Button>
        </div>
      </div>

      {/* Transport Controls - Exatamente como o original */}
      <div className="bg-[#242529] border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white w-8 h-8"
          >
            <SkipBack className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={stopPlayback}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white w-8 h-8"
          >
            <Square className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={togglePlay}
            className="bg-[#ff4500] hover:bg-[#ff5722] text-white rounded-full w-12 h-12"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>
          
          <Button
            onClick={toggleRecord}
            variant="ghost"
            size="sm"
            className={`w-8 h-8 ${isRecording ? "text-red-500" : "text-gray-400 hover:text-white"}`}
          >
            <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white w-8 h-8"
          >
            <SkipForward className="w-4 h-4" />
          </Button>
          
          <div className="mx-6 bg-[#1a1a1b] px-3 py-1 rounded text-sm font-mono border border-gray-700">
            {Math.floor(playbackTime / 60)}:{String(Math.floor(playbackTime % 60)).padStart(2, '0')}
          </div>
          
          <Button
            onClick={() => setLoopEnabled(!loopEnabled)}
            variant="ghost"
            size="sm"
            className={`w-8 h-8 ${loopEnabled ? "text-[#ff4500]" : "text-gray-400 hover:text-white"}`}
          >
            <Repeat className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center space-x-2">
            <Switch 
              checked={metronomeEnabled}
              onCheckedChange={setMetronomeEnabled}
            />
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Click</span>
          </div>
        </div>
      </div>

      {/* Main Layout - Três painéis como o original */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Tracks Mixer */}
        <div className="w-64 bg-[#242529] border-r border-gray-800 flex flex-col">
          <div className="p-3 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-300">TRACKS</h3>
              <Button 
                onClick={addNewTrack}
                variant="ghost" 
                size="sm"
                className="text-gray-400 hover:text-white w-6 h-6 p-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {studioData.tracks.map((track) => (
              <div 
                key={track.id}
                className={`p-3 border-b border-gray-800 hover:bg-[#2a2a2e] cursor-pointer transition-colors ${
                  selectedTrack === track.id ? 'bg-[#2a2a2e] border-l-2 border-l-[#ff4500]' : ''
                }`}
                onClick={() => setSelectedTrack(track.id)}
              >
                {/* Track Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: track.color }}
                    />
                    <span className="text-sm font-medium text-white">{track.name}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="w-5 h-5 p-0 text-gray-500 hover:text-gray-300"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="w-5 h-5 p-0 text-gray-500 hover:text-red-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="text-xs text-gray-400 mb-3">{track.instrument}</div>
                
                {/* Track Controls */}
                <div className="flex items-center space-x-1 mb-3">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTrackMute(track.id);
                    }}
                    className={`w-6 h-5 p-0 text-xs font-bold rounded ${
                      track.muted 
                        ? 'bg-red-600 text-white' 
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                  >
                    M
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTrackSolo(track.id);
                    }}
                    className={`w-6 h-5 p-0 text-xs font-bold rounded ${
                      track.solo 
                        ? 'bg-yellow-600 text-white' 
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                  >
                    S
                  </Button>
                  <Button
                    className="w-6 h-5 p-0 text-xs font-bold bg-gray-700 hover:bg-gray-600 text-gray-300 rounded"
                  >
                    R
                  </Button>
                </div>
                
                {/* Volume Control */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Volume2 className="w-3 h-3 text-gray-500" />
                    <Slider
                      value={[track.volume]}
                      onValueChange={(value) => updateTrackVolume(track.id, value)}
                      max={100}
                      step={1}
                      className="flex-1"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="text-xs text-gray-400 w-6">{track.volume}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Target className="w-3 h-3 text-gray-500" />
                    <Slider
                      value={[0]}
                      max={100}
                      min={-100}
                      step={1}
                      className="flex-1"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="text-xs text-gray-400 w-6">C</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center Panel - Timeline */}
        <div className="flex-1 flex flex-col bg-[#1a1a1b]">
          {/* Timeline Header */}
          <div className="bg-[#242529] border-b border-gray-800 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">Timeline</span>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white w-8 h-8 p-0">
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <span className="text-xs text-gray-400">100%</span>
              </div>
            </div>
            
            {/* Time Ruler */}
            <div className="relative h-6 bg-[#2a2a2e] rounded overflow-hidden border border-gray-700">
              {/* Timeline markers */}
              <div className="absolute inset-0 flex">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className="flex-1 border-r border-gray-600 flex items-center justify-center">
                    <span className="text-xs text-gray-500">{i * 4 + 1}</span>
                  </div>
                ))}
              </div>
              
              {/* Playhead */}
              <div 
                className="absolute top-0 w-0.5 h-full bg-[#ff4500] z-10"
                style={{ left: `${(playbackTime / 64) * 100}%` }}
              />
            </div>
          </div>
          
          {/* Track Timeline */}
          <div className="flex-1 overflow-y-auto">
            {studioData.tracks.map((track) => (
              <div 
                key={track.id}
                className={`h-16 border-b border-gray-800 flex items-center px-3 ${
                  selectedTrack === track.id ? 'bg-[#242529]/50' : 'hover:bg-[#242529]/30'
                }`}
              >
                <div className="flex-1 h-10 bg-[#2a2a2e] rounded relative overflow-hidden border border-gray-700">
                  {/* Audio clips with enhanced waveforms */}
                  {track.clips.map((clip) => (
                    <div
                      key={clip.id}
                      className="absolute h-full rounded border-2 flex items-center px-2 cursor-pointer hover:brightness-110 transition-all"
                      style={{
                        backgroundColor: track.color + '60',
                        borderColor: track.color,
                        left: `${(clip.start / 64) * 100}%`,
                        width: `${(clip.duration / 64) * 100}%`
                      }}
                    >
                      <span className="text-xs text-white font-medium truncate">{clip.name}</span>
                      
                      {/* Enhanced Waveform */}
                      <div className="absolute inset-0 overflow-hidden p-px">
                        <div className="flex items-end h-full opacity-40">
                          {Array.from({ length: Math.floor(clip.duration * 8) }).map((_, i) => {
                            const height = Math.abs(Math.sin(i * 0.3) * Math.cos(i * 0.1)) * 90 + 10;
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
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {/* Piano Roll Toggle */}
          <div className="border-t border-gray-800 p-3 bg-[#242529]">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <Piano className="w-4 h-4 mr-2" />
              Piano Roll
            </Button>
          </div>
        </div>

        {/* Right Panel - Browser (exatamente como o original) */}
        <div className="w-72 bg-[#242529] border-l border-gray-800">
          <Tabs defaultValue="sounds" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 bg-[#2a2a2e] border-b border-gray-800 rounded-none h-10">
              <TabsTrigger 
                value="sounds" 
                className="data-[state=active]:bg-[#ff4500] data-[state=active]:text-white text-xs text-gray-400"
              >
                Sounds
              </TabsTrigger>
              <TabsTrigger 
                value="loops" 
                className="data-[state=active]:bg-[#ff4500] data-[state=active]:text-white text-xs text-gray-400"
              >
                Loops
              </TabsTrigger>
              <TabsTrigger 
                value="fx" 
                className="data-[state=active]:bg-[#ff4500] data-[state=active]:text-white text-xs text-gray-400"
              >
                FX
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sounds" className="flex-1 p-4 space-y-3 overflow-y-auto">
              <h4 className="text-sm font-medium text-gray-300 mb-3">INSTRUMENTS</h4>
              
              {[
                { name: 'Grand Piano', category: 'Piano', color: 'bg-blue-500', icon: Piano },
                { name: 'Synth Bass', category: 'Bass', color: 'bg-purple-500', icon: Waves },
                { name: 'Drums', category: 'Percussion', color: 'bg-red-500', icon: Music },
                { name: 'Acoustic Guitar', category: 'Strings', color: 'bg-orange-500', icon: Music },
                { name: 'Lead Synth', category: 'Lead', color: 'bg-green-500', icon: Zap },
                { name: 'String Section', category: 'Orchestra', color: 'bg-yellow-500', icon: Music },
              ].map((instrument, i) => {
                const Icon = instrument.icon;
                return (
                  <div 
                    key={i}
                    className="flex items-center p-3 bg-[#2a2a2e] rounded hover:bg-[#333338] cursor-pointer transition-colors border border-gray-700"
                  >
                    <div className={`w-8 h-8 ${instrument.color} rounded flex items-center justify-center mr-3`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-white font-medium">{instrument.name}</div>
                      <div className="text-xs text-gray-400">{instrument.category}</div>
                    </div>
                    <Button variant="ghost" size="sm" className="w-6 h-6 p-0 text-gray-400 hover:text-white">
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                );
              })}
            </TabsContent>

            <TabsContent value="loops" className="flex-1 p-4 space-y-3 overflow-y-auto">
              <h4 className="text-sm font-medium text-gray-300 mb-3">SAMPLE PACKS</h4>
              
              {[
                'Hip Hop Essentials',
                'Electronic Vibes',
                'Lo-Fi Chill',
                'Trap Beats',
                'House Foundation',
                'Ambient Textures'
              ].map((pack, i) => (
                <div 
                  key={i}
                  className="p-3 bg-[#2a2a2e] rounded hover:bg-[#333338] cursor-pointer transition-colors border border-gray-700"
                >
                  <div className="text-sm text-white font-medium mb-1">{pack}</div>
                  <div className="text-xs text-gray-400">120 BPM • 8 samples</div>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="outline" className="border-gray-600 text-xs">Hip Hop</Badge>
                    <Button variant="ghost" size="sm" className="w-6 h-6 p-0 text-gray-400 hover:text-white">
                      <Play className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="fx" className="flex-1 p-4 space-y-3 overflow-y-auto">
              <h4 className="text-sm font-medium text-gray-300 mb-3">EFFECTS</h4>
              
              {[
                { name: 'Reverb', type: 'Spatial', active: false },
                { name: 'Delay', type: 'Spatial', active: true },
                { name: 'Compressor', type: 'Dynamics', active: true },
                { name: 'EQ', type: 'Filter', active: false },
                { name: 'Distortion', type: 'Drive', active: false },
                { name: 'Chorus', type: 'Modulation', active: false }
              ].map((fx, i) => (
                <Card key={i} className="bg-[#2a2a2e] border-gray-700">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-sm text-white font-medium">{fx.name}</div>
                        <div className="text-xs text-gray-400">{fx.type}</div>
                      </div>
                      <Switch checked={fx.active} />
                    </div>
                    
                    {fx.active && (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-400 w-12">Mix:</span>
                          <Slider value={[30]} max={100} className="flex-1" />
                          <span className="text-xs text-gray-400 w-6">30</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-400 w-12">Level:</span>
                          <Slider value={[75]} max={100} className="flex-1" />
                          <span className="text-xs text-gray-400 w-6">75</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Status Bar - Exatamente como o original */}
      <div className="bg-[#242529] border-t border-gray-800 px-4 py-2">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-4">
            <span>CPU: 15%</span>
            <span>44.1 kHz</span>
            <span>256 samples</span>
            <span>Latency: 5.8ms</span>
            {onlineUsers.length > 0 && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-green-400">{onlineUsers.length} online</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <MonitorSpeaker className="w-4 h-4" />
              <Slider
                value={masterVolume}
                onValueChange={setMasterVolume}
                max={100}
                step={1}
                className="w-20"
              />
              <span className="w-6">{masterVolume[0]}</span>
            </div>
            
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white w-6 h-6 p-0">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Studio;