import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Slider } from '../components/ui/slider';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Switch } from '../components/ui/switch';
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
  Filter
} from 'lucide-react';
import { mockStudioData } from '../data/mock';

const Studio = () => {
  const [studioData, setStudioData] = useState(mockStudioData);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [masterVolume, setMasterVolume] = useState([85]);
  const [isCollaborating, setIsCollaborating] = useState(false);

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

  // BandLab original inspired layout
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Top Navigation Bar */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-semibold">{studioData.currentProject.name}</h1>
          <div className="flex items-center space-x-3 text-sm text-gray-400">
            <span>BPM: {studioData.currentProject.bpm}</span>
            <span>Key: {studioData.currentProject.key}</span>
            <span>4/4</span>
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
          <Button 
            variant="default"
            size="sm"
            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
          >
            <Share className="w-4 h-4 mr-1" />
            Publish
          </Button>
        </div>
      </div>

      {/* Transport Controls */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-3">
        <div className="flex items-center justify-center space-x-4">
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
            onClick={() => setPlaybackTime(Math.min(32, playbackTime + 4))}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <SkipForward className="w-4 h-4" />
          </Button>
          
          <div className="mx-6 text-mono text-lg bg-gray-800 px-4 py-1 rounded border border-gray-700">
            {Math.floor(playbackTime / 60)}:{String(Math.floor(playbackTime % 60)).padStart(2, '0')}
          </div>
          
          <Button
            variant={studioData.loopEnabled ? "default" : "ghost"}
            size="sm"
            className={!studioData.loopEnabled ? "text-gray-400 hover:text-white" : ""}
            onClick={() => setStudioData(prev => ({ ...prev, loopEnabled: !prev.loopEnabled }))}
          >
            <Repeat className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center space-x-2">
            <Switch 
              checked={studioData.metronomeEnabled}
              onCheckedChange={(checked) => setStudioData(prev => ({ ...prev, metronomeEnabled: checked }))}
            />
            <Clock className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Main Studio Interface */}
      <div className="flex-1 flex overflow-hidden">
        {/* Track Mixer Panel */}
        <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-300">TRACKS</h3>
              <Button 
                onClick={addNewTrack} 
                variant="ghost" 
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Tracks List */}
          <div className="flex-1 overflow-y-auto">
            {studioData.tracks.map((track, index) => (
              <div 
                key={track.id}
                className={`p-4 border-b border-gray-800 hover:bg-gray-800 cursor-pointer ${
                  selectedTrack === track.id ? 'bg-gray-800' : ''
                }`}
                onClick={() => setSelectedTrack(track.id)}
              >
                {/* Track Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: track.color }}
                    />
                    <span className="text-sm font-medium text-white">{track.name}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="w-6 h-6 p-0 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                
                <div className="text-xs text-gray-400 mb-3">{track.instrument}</div>
                
                {/* Track Controls */}
                <div className="flex items-center space-x-1 mb-3">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTrackMute(track.id);
                    }}
                    variant={track.muted ? "destructive" : "ghost"}
                    size="sm"
                    className="w-8 h-6 p-0 text-xs font-medium"
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
                    className="w-8 h-6 p-0 text-xs font-medium"
                  >
                    S
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-8 h-6 p-0 text-xs font-medium text-gray-400"
                  >
                    R
                  </Button>
                </div>
                
                {/* Volume Control */}
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
                  <span className="text-xs text-gray-400 w-6">{track.volume}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Timeline Area */}
        <div className="flex-1 flex flex-col bg-gray-950">
          {/* Timeline Header */}
          <div className="bg-gray-900 border-b border-gray-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-400">Timeline</div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <Grid3X3 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Time Ruler */}
            <div className="relative h-6 bg-gray-800 rounded overflow-hidden">
              {/* Timeline markers */}
              <div className="absolute inset-0 flex">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className="flex-1 border-r border-gray-700 flex items-center justify-center">
                    <span className="text-xs text-gray-500">{i * 4 + 1}</span>
                  </div>
                ))}
              </div>
              
              {/* Playhead */}
              <div 
                className="absolute top-0 w-0.5 h-full bg-orange-500 z-10"
                style={{ left: `${(playbackTime / 64) * 100}%` }}
              />
            </div>
          </div>
          
          {/* Track Timeline */}
          <div className="flex-1 overflow-y-auto">
            {studioData.tracks.map((track) => (
              <div 
                key={track.id}
                className="h-16 border-b border-gray-800 flex items-center px-4"
              >
                <div className="flex-1 h-10 bg-gray-800 rounded relative overflow-hidden">
                  {/* Audio clips */}
                  {track.clips.map((clip) => (
                    <div
                      key={clip.id}
                      className="absolute h-full rounded border border-gray-600 flex items-center px-2"
                      style={{
                        backgroundColor: track.color + '40',
                        borderColor: track.color,
                        left: `${(clip.start / 64) * 100}%`,
                        width: `${(clip.duration / 64) * 100}%`
                      }}
                    >
                      <span className="text-xs text-white truncate">{clip.name}</span>
                      
                      {/* Waveform visualization */}
                      <div className="absolute inset-0 opacity-30 overflow-hidden">
                        <div className="flex items-end h-full px-1">
                          {Array.from({ length: Math.floor(clip.duration * 4) }).map((_, i) => (
                            <div
                              key={i}
                              className="w-px bg-white mx-px"
                              style={{ height: `${Math.random() * 100}%` }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar - Browser */}
        <div className="w-72 bg-gray-900 border-l border-gray-800">
          <Tabs defaultValue="sounds" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 bg-gray-800 border-b border-gray-700 rounded-none">
              <TabsTrigger value="sounds" className="data-[state=active]:bg-orange-500 text-xs">
                Sounds
              </TabsTrigger>
              <TabsTrigger value="loops" className="data-[state=active]:bg-orange-500 text-xs">
                Loops
              </TabsTrigger>
              <TabsTrigger value="fx" className="data-[state=active]:bg-orange-500 text-xs">
                FX
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sounds" className="flex-1 p-4 space-y-3">
              {/* Instruments Library */}
              <h4 className="text-sm font-semibold text-gray-300 mb-3">INSTRUMENTS</h4>
              
              {[
                { name: 'Piano', icon: Piano, color: 'bg-blue-500' },
                { name: 'Synth Bass', icon: Waves, color: 'bg-purple-500' },
                { name: 'Drums', icon: Music, color: 'bg-red-500' },
                { name: 'Guitar', icon: Music, color: 'bg-orange-500' },
                { name: 'Vocals', icon: Mic, color: 'bg-green-500' },
                { name: 'Strings', icon: Music, color: 'bg-yellow-500' },
              ].map((instrument, i) => {
                const Icon = instrument.icon;
                return (
                  <div 
                    key={i}
                    className="flex items-center p-3 bg-gray-800 rounded hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <div className={`w-8 h-8 ${instrument.color} rounded flex items-center justify-center mr-3`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm text-white">{instrument.name}</span>
                  </div>
                );
              })}
            </TabsContent>

            <TabsContent value="loops" className="flex-1 p-4 space-y-3">
              <h4 className="text-sm font-semibold text-gray-300 mb-3">SAMPLE PACKS</h4>
              
              {[
                'Hip Hop Essentials',
                'Electronic Vibes',
                'Chill Lofi',
                'Trap Beats',
                'House Foundation',
                'Ambient Textures'
              ].map((pack, i) => (
                <div 
                  key={i}
                  className="p-3 bg-gray-800 rounded hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <div className="text-sm text-white mb-1">{pack}</div>
                  <div className="text-xs text-gray-400">120 BPM • 8 samples</div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="fx" className="flex-1 p-4 space-y-3">
              <h4 className="text-sm font-semibold text-gray-300 mb-3">EFFECTS</h4>
              
              {[
                { name: 'Reverb', type: 'Spatial' },
                { name: 'Delay', type: 'Spatial' },
                { name: 'Compressor', type: 'Dynamics' },
                { name: 'EQ', type: 'Filter' },
                { name: 'Distortion', type: 'Drive' },
                { name: 'Chorus', type: 'Modulation' }
              ].map((fx, i) => (
                <div 
                  key={i}
                  className="flex items-center justify-between p-3 bg-gray-800 rounded hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <div>
                    <div className="text-sm text-white">{fx.name}</div>
                    <div className="text-xs text-gray-400">{fx.type}</div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="bg-gray-900 border-t border-gray-800 px-6 py-2">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center space-x-4">
            <span>CPU: 12%</span>
            <span>•</span>
            <span>44.1 kHz</span>
            <span>•</span>
            <span>256 samples</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Volume2 className="w-4 h-4" />
              <Slider
                value={masterVolume}
                onValueChange={setMasterVolume}
                max={100}
                step={1}
                className="w-20"
              />
              <span className="w-8">{masterVolume[0]}</span>
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