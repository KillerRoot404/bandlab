import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Slider } from '../components/ui/slider';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Switch } from '../components/ui/switch';
import { useToast } from '../hooks/use-toast';
import { useAudioEngine } from '../hooks/useAudioEngine';
import Timeline from '../components/Timeline';
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
  const { toast } = useToast();
  const {
    isRecording: audioIsRecording,
    isPlaying: audioIsPlaying,
    currentTime,
    bpm,
    masterVolume,
    startRecording,
    stopRecording,
    startPlayback,
    stopPlayback,
    updateMasterVolume,
    setBpm,
    setCurrentTime,
    getTrackClips,
    deleteClip,
    moveClip,
    generateWaveform,
    initializeAudioContext
  } = useAudioEngine();

  const [studioData, setStudioData] = useState(mockStudioData);
  const [selectedTrack, setSelectedTrack] = useState('1');
  const [loopEnabled, setLoopEnabled] = useState(false);
  const [metronomeEnabled, setMetronomeEnabled] = useState(false);
  const [recordingTrack, setRecordingTrack] = useState(null);
  
  // Real-time collaboration mock
  const [onlineUsers] = useState([
    { id: 1, name: 'Alex Producer', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face', color: '#3b82f6' },
    { id: 2, name: 'Maya Singer', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b7d0a6f1?w=32&h=32&fit=crop&crop=face', color: '#ef4444' }
  ]);

  // Initialize audio context on component mount
  useEffect(() => {
    initializeAudioContext();
  }, [initializeAudioContext]);

  const handlePlay = async () => {
    if (audioIsPlaying) {
      stopPlayback();
    } else {
      try {
        await startPlayback(currentTime);
        toast({
          title: "Playback Started",
          description: "Playing from " + formatTime(currentTime),
        });
      } catch (error) {
        console.error('Playback error:', error);
        toast({
          title: "Playback Error",
          description: "Unable to start playback. Check audio permissions.",
          variant: "destructive"
        });
      }
    }
  };

  const handleStop = () => {
    stopPlayback();
    setCurrentTime(0);
    toast({
      title: "Playback Stopped",
      description: "Returned to beginning",
    });
  };

  const handleRecord = async () => {
    if (audioIsRecording) {
      stopRecording();
      setRecordingTrack(null);
      // Update track state
      setStudioData(prev => ({
        ...prev,
        tracks: prev.tracks.map(track => 
          track.id === recordingTrack 
            ? { ...track, isRecording: false }
            : track
        )
      }));
      toast({
        title: "Recording Stopped",
        description: "Audio clip saved to timeline",
      });
    } else {
      try {
        await startRecording(selectedTrack);
        setRecordingTrack(selectedTrack);
        // Update track state
        setStudioData(prev => ({
          ...prev,
          tracks: prev.tracks.map(track => 
            track.id === selectedTrack 
              ? { ...track, isRecording: true }
              : track
          )
        }));
        toast({
          title: "Recording Started",
          description: `Recording to ${studioData.tracks.find(t => t.id === selectedTrack)?.name}`,
        });
      } catch (error) {
        console.error('Recording error:', error);
        toast({
          title: "Recording Error",
          description: "Unable to start recording. Check microphone permissions.",
          variant: "destructive"
        });
      }
    }
  };

  const handleSeek = (time) => {
    setCurrentTime(time);
    if (audioIsPlaying) {
      startPlayback(time);
    }
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
    
    toast({
      title: track.muted ? "Track Unmuted" : "Track Muted",
      description: `${studioData.tracks.find(t => t.id === trackId)?.name}`,
    });
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
      instrument: 'Audio',
      volume: 75,
      muted: false,
      solo: false,
      isRecording: false,
      color: colors[studioData.tracks.length % colors.length],
      clips: []
    };
    
    setStudioData(prev => ({
      ...prev,
      tracks: [...prev.tracks, newTrack]
    }));

    toast({
      title: "Track Added",
      description: `${newTrack.name} created`,
    });
  };

  const deleteTrack = (trackId) => {
    setStudioData(prev => ({
      ...prev,
      tracks: prev.tracks.filter(track => track.id !== trackId)
    }));
    
    toast({
      title: "Track Deleted",
      description: "Track and all clips removed",
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const centiseconds = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}:${centiseconds.toString().padStart(2, '0')}`;
  };

  const handleClipDelete = (clipId) => {
    deleteClip(clipId);
    toast({
      title: "Clip Deleted",
      description: "Audio clip removed from timeline",
    });
  };

  const handleClipMove = (clipId, newStartTime) => {
    moveClip(clipId, newStartTime);
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

      {/* Transport Controls - Funcionais */}
      <div className="bg-[#242529] border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white w-8 h-8"
            onClick={() => handleSeek(Math.max(0, currentTime - 10))}
          >
            <SkipBack className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={handleStop}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white w-8 h-8"
          >
            <Square className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={handlePlay}
            className="bg-[#ff4500] hover:bg-[#ff5722] text-white rounded-full w-12 h-12"
          >
            {audioIsPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>
          
          <Button
            onClick={handleRecord}
            variant="ghost"
            size="sm"
            className={`w-8 h-8 ${audioIsRecording ? "text-red-500" : "text-gray-400 hover:text-white"}`}
          >
            <div className={`w-3 h-3 rounded-full ${audioIsRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white w-8 h-8"
            onClick={() => handleSeek(currentTime + 10)}
          >
            <SkipForward className="w-4 h-4" />
          </Button>
          
          <div className="mx-6 bg-[#1a1a1b] px-3 py-1 rounded text-sm font-mono border border-gray-700">
            {formatTime(currentTime)}
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

      {/* Main Layout - Três painéis funcionais */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Tracks Mixer Funcional */}
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
                    {track.isRecording && (
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    )}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTrack(track.id);
                      }}
                      variant="ghost" 
                      size="sm"
                      className="w-5 h-5 p-0 text-gray-500 hover:text-red-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="text-xs text-gray-400 mb-3">{track.instrument}</div>
                
                {/* Track Controls Funcionais */}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      if (selectedTrack === track.id && !audioIsRecording) {
                        handleRecord();
                      }
                    }}
                    className={`w-6 h-5 p-0 text-xs font-bold rounded ${
                      track.isRecording
                        ? 'bg-red-600 text-white animate-pulse'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                  >
                    R
                  </Button>
                </div>
                
                {/* Volume Control Funcional */}
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
                
                {/* Clip Count */}
                <div className="mt-2 text-xs text-gray-500">
                  {getTrackClips(track.id).length} clips
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center Panel - Timeline Funcional */}
        <Timeline 
          tracks={studioData.tracks}
          currentTime={currentTime}
          isPlaying={audioIsPlaying}
          onSeek={handleSeek}
          selectedTrack={selectedTrack}
          onTrackSelect={setSelectedTrack}
          getTrackClips={getTrackClips}
          deleteClip={handleClipDelete}
          moveClip={handleClipMove}
          generateWaveform={generateWaveform}
        />

        {/* Right Panel - Browser (igual ao anterior) */}
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

      {/* Status Bar Funcional */}
      <div className="bg-[#242529] border-t border-gray-800 px-4 py-2">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-4">
            <span>CPU: 15%</span>
            <span>44.1 kHz</span>
            <span>Latency: 5.8ms</span>
            <span>Tracks: {studioData.tracks.length}</span>
            <span>Clips: {studioData.tracks.reduce((total, track) => total + getTrackClips(track.id).length, 0)}</span>
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
                value={[masterVolume]}
                onValueChange={(value) => updateMasterVolume(value[0])}
                max={100}
                step={1}
                className="w-20"
              />
              <span className="w-6">{Math.round(masterVolume)}</span>
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