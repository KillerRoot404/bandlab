import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Slider } from '../components/ui/slider';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Switch } from '../components/ui/switch';
import { useToast } from '../hooks/use-toast';
import { useAudioEngine } from '../hooks/useAudioEngine';
import { useAdvancedEffects } from '../hooks/useAdvancedEffects';
import { useVirtualInstruments } from '../hooks/useVirtualInstruments';
import { useSamples } from '../hooks/useSamples';
import { useProjects } from '../hooks/useProjects';
import { useAuth } from '../hooks/useAuth';
import Timeline from '../components/Timeline';
import VirtualKeyboard from '../components/VirtualKeyboard';
import EffectsRack from '../components/EffectsRack';
import SampleBrowser from '../components/SampleBrowser';
import AuthModal from '../components/AuthModal';
import {
  Play, Pause, Square, RotateCcw, Volume2, VolumeX, Mic, Piano, Headphones,
  Settings, Save, Share2, Plus, Trash2, SkipBack, SkipForward, Repeat, Shuffle,
  Users, Upload, Download, MessageSquare, Clock, Grid3X3, Music, Waves, Zap,
  Filter, Activity, MonitorSpeaker, Mic2, Target, Volume1, Copy, Edit3, MoreHorizontal,
  LogIn, User, Maximize2, Minimize2, Sliders, FileAudio, Layers3
} from 'lucide-react';

const Studio = () => {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  
  // Audio Engine Hook
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

  // Advanced Effects Hook
  const { availableEffects, createEffectChain } = useAdvancedEffects();

  // Virtual Instruments Hook
  const { availableInstruments, playNote, stopNote, stopAllNotes, getPreset, keyboardMap } = useVirtualInstruments();

  // Samples Hook
  const { availablePacks, loadPack, getSamples, playSample, generateSamples } = useSamples();

  // Projects Hook
  const { 
    currentProject, 
    projects, 
    createProject, 
    loadProject, 
    saveProject, 
    updateProject,
    addTrack: projectAddTrack,
    updateTrack: projectUpdateTrack,
    deleteTrack: projectDeleteTrack
  } = useProjects();

  // UI State
  const [selectedTrack, setSelectedTrack] = useState('1');
  const [loopEnabled, setLoopEnabled] = useState(false);
  const [metronomeEnabled, setMetronomeEnabled] = useState(false);
  const [recordingTrack, setRecordingTrack] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeInstrument, setActiveInstrument] = useState('grand_piano');
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [selectedSamplePack, setSelectedSamplePack] = useState('hip_hop_essentials');
  const [showImportModal, setShowImportModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Real-time collaboration mock
  const [onlineUsers] = useState([
    { id: 1, name: 'Alex Producer', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face', color: '#3b82f6' },
    { id: 2, name: 'Maya Singer', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b7d0a6f1?w=32&h=32&fit=crop&crop=face', color: '#ef4444' }
  ]);

  // Initialize everything
  useEffect(() => {
    initializeAudioContext();
    generateSamples();
    
    // Create default project if none exists
    if (!currentProject && isAuthenticated) {
      createProject({
        name: 'Untitled Project',
        description: 'New music project'
      });
    }
  }, [initializeAudioContext, generateSamples, currentProject, isAuthenticated, createProject]);

  // Project tracks or default tracks
  const tracks = currentProject?.tracks || [
    {
      id: '1',
      name: 'Vocal',
      instrument: 'Microphone',
      volume: 75,
      muted: false,
      solo: false,
      isRecording: false,
      color: '#ef4444',
      clips: [],
      effects: []
    },
    {
      id: '2',
      name: 'Piano',
      instrument: 'Grand Piano',
      volume: 80,
      muted: false,
      solo: false,
      isRecording: false,
      color: '#3b82f6',
      clips: [],
      effects: []
    }
  ];

  // Transport Controls
  const handlePlay = async () => {
    if (audioIsPlaying) {
      stopPlayback();
      stopAllNotes();
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
    stopAllNotes();
    setCurrentTime(0);
    toast({
      title: "Playback Stopped",
      description: "Returned to beginning",
    });
  };

  const handleRecord = async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    if (audioIsRecording) {
      stopRecording();
      setRecordingTrack(null);
      
      if (currentProject) {
        projectUpdateTrack(currentProject.id, selectedTrack, { isRecording: false });
      }
      
      toast({
        title: "Recording Stopped",
        description: "Audio clip saved to timeline",
      });
    } else {
      try {
        await startRecording(selectedTrack);
        setRecordingTrack(selectedTrack);
        
        if (currentProject) {
          projectUpdateTrack(currentProject.id, selectedTrack, { isRecording: true });
        }
        
        toast({
          title: "Recording Started",
          description: `Recording to ${tracks.find(t => t.id === selectedTrack)?.name}`,
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

  // Track Controls
  const toggleTrackMute = (trackId) => {
    const track = tracks.find(t => t.id === trackId);
    if (track && currentProject) {
      projectUpdateTrack(currentProject.id, trackId, { muted: !track.muted });
      toast({
        title: track.muted ? "Track Unmuted" : "Track Muted",
        description: track.name,
      });
    }
  };

  const toggleTrackSolo = (trackId) => {
    const track = tracks.find(t => t.id === trackId);
    if (track && currentProject) {
      projectUpdateTrack(currentProject.id, trackId, { solo: !track.solo });
    }
  };

  const updateTrackVolume = (trackId, volume) => {
    if (currentProject) {
      projectUpdateTrack(currentProject.id, trackId, { volume: volume[0] });
    }
  };

  const addNewTrack = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    if (!currentProject) {
      toast({
        title: "No Project",
        description: "Please create a project first",
        variant: "destructive"
      });
      return;
    }

    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];
    const newTrackData = {
      name: `Track ${tracks.length + 1}`,
      instrument: 'Audio',
      volume: 75,
      color: colors[tracks.length % colors.length]
    };

    projectAddTrack(currentProject.id, newTrackData);
    toast({
      title: "Track Added",
      description: `${newTrackData.name} created`,
    });
  };

  const deleteSelectedTrack = (trackId) => {
    if (currentProject) {
      projectDeleteTrack(trackId);
      toast({
        title: "Track Deleted",
        description: "Track and all clips removed",
      });
    }
  };

  const handleInstrumentSelect = (instrumentId) => {
    setActiveInstrument(instrumentId);
    const instrument = availableInstruments.find(inst => inst.id === instrumentId);
    if (instrument && instrument.presets.length > 0) {
      setSelectedPreset(instrument.presets[0]);
    }
  };

  const handlePresetSelect = (preset) => {
    setSelectedPreset(preset);
  };

  const handleNotePlay = (note, velocity = 100) => {
    const preset = selectedPreset || availableInstruments.find(inst => inst.id === activeInstrument)?.presets[0];
    playNote(activeInstrument, note, velocity, preset);
  };

  const handleNoteStop = (noteKey) => {
    stopNote(noteKey);
  };

  const handleSamplePlay = (sampleId) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    playSample(sampleId);
  };

  const handleProjectSave = async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    try {
      await saveProject();
      toast({
        title: "Project Saved",
        description: "All changes saved successfully",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Unable to save project",
        variant: "destructive"
      });
    }
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

  // Import functionality
  const handleImportFiles = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    if (!currentProject) {
      toast({
        title: "No Project",
        description: "Please create a project first",
        variant: "destructive"
      });
      return;
    }

    setShowImportModal(true);
  };

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      const backendUrl = import.meta.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('token');

      for (let file of files) {
        // Validate file type
        if (!file.type.startsWith('audio/')) {
          toast({
            title: "Invalid File",
            description: `${file.name} is not an audio file`,
            variant: "destructive"
          });
          continue;
        }

        // Create form data
        const formData = new FormData();
        formData.append('file', file);
        formData.append('project_id', currentProject.id);
        formData.append('track_id', selectedTrack);

        // Upload file
        const response = await fetch(`${backendUrl}/api/audio/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        const result = await response.json();
        
        // Calculate file duration (this would be done properly with Web Audio API)
        const audio = new Audio();
        audio.src = URL.createObjectURL(file);
        
        await new Promise((resolve) => {
          audio.addEventListener('loadedmetadata', () => {
            // Add clip to project
            const clipData = {
              ...result.clip,
              duration: audio.duration,
              start_time: currentTime, // Place at current timeline position
              track_id: selectedTrack
            };

            // Update project with new clip (this would be done through a proper API)
            if (currentProject) {
              const track = tracks.find(t => t.id === selectedTrack);
              if (track) {
                const updatedClips = [...(track.clips || []), clipData];
                projectUpdateTrack(currentProject.id, selectedTrack, { clips: updatedClips });
              }
            }

            toast({
              title: "File Imported",
              description: `${file.name} added to ${tracks.find(t => t.id === selectedTrack)?.name}`,
            });

            resolve();
          });
        });

        URL.revokeObjectURL(audio.src);
      }

      setShowImportModal(false);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload files",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1b] text-white flex flex-col">
      {/* Header - BandLab Style */}
      <div className="bg-[#242529] border-b border-gray-800 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-base font-medium text-white">
            {currentProject?.name || 'New Project'}
          </h1>
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <span>BPM: {bpm}</span>
            <span>Key: {currentProject?.key || 'C Major'}</span>
            <span>{currentProject?.time_signature || '4/4'}</span>
            <div className="flex items-center space-x-1">
              <Users className="w-3 h-3" />
              <span>{onlineUsers.length} collaborators</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {!isAuthenticated && (
            <Button 
              onClick={() => setShowAuthModal(true)}
              variant="ghost" 
              size="sm" 
              className="text-gray-300 hover:text-white hover:bg-gray-700 h-8"
            >
              <LogIn className="w-4 h-4 mr-1" />
              Login
            </Button>
          )}
          
          <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-700 h-8">
            <MessageSquare className="w-4 h-4 mr-1" />
            Chat
          </Button>
          <Button 
            onClick={handleImportFiles}
            variant="ghost" 
            size="sm" 
            className="text-gray-300 hover:text-white hover:bg-gray-700 h-8"
          >
            <Upload className="w-4 h-4 mr-1" />
            Import
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-700 h-8">
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
          <Button 
            onClick={handleProjectSave}
            variant="ghost" 
            size="sm" 
            className="text-gray-300 hover:text-white hover:bg-gray-700 h-8"
          >
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
          <Button 
            className="bg-[#ff4500] hover:bg-[#ff5722] text-white h-8"
            size="sm"
            disabled={!isAuthenticated}
          >
            <Share2 className="w-4 h-4 mr-1" />
            Publish
          </Button>
        </div>
      </div>

      {/* Transport Controls */}
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

          <div className="flex items-center space-x-2 ml-4">
            <span className="text-sm text-gray-400">BPM:</span>
            <Input
              type="number"
              value={bpm}
              onChange={(e) => setBpm(parseInt(e.target.value) || 120)}
              className="w-16 h-8 bg-[#1a1a1b] border-gray-700 text-white text-center"
              min="60"
              max="200"
            />
          </div>
        </div>
      </div>

      {/* Main Layout */}
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
            {tracks.map((track) => (
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
                        if (currentProject) {
                          projectUpdateTrack(currentProject.id, track.id, { name: e.target.value });
                        }
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
                        deleteSelectedTrack(track.id);
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
                
                {/* Clip Count and Effects */}
                <div className="mt-2 flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    {getTrackClips(track.id).length} clips
                  </div>
                  <div className="text-xs text-gray-500">
                    {track.effects?.length || 0} FX
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center Panel - Timeline */}
        <Timeline 
          tracks={tracks}
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

        {/* Right Panel - Browser with Advanced Features */}
        <div className="w-80 bg-[#242529] border-l border-gray-800">
          <Tabs defaultValue="instruments" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4 bg-[#2a2a2e] border-b border-gray-800 rounded-none h-10">
              <TabsTrigger 
                value="instruments" 
                className="data-[state=active]:bg-[#ff4500] data-[state=active]:text-white text-xs text-gray-400"
              >
                <Piano className="w-3 h-3 mr-1" />
                Instruments
              </TabsTrigger>
              <TabsTrigger 
                value="samples" 
                className="data-[state=active]:bg-[#ff4500] data-[state=active]:text-white text-xs text-gray-400"
              >
                <FileAudio className="w-3 h-3 mr-1" />
                Samples
              </TabsTrigger>
              <TabsTrigger 
                value="effects" 
                className="data-[state=active]:bg-[#ff4500] data-[state=active]:text-white text-xs text-gray-400"
              >
                <Sliders className="w-3 h-3 mr-1" />
                Effects
              </TabsTrigger>
              <TabsTrigger 
                value="mixer" 
                className="data-[state=active]:bg-[#ff4500] data-[state=active]:text-white text-xs text-gray-400"
              >
                <Layers3 className="w-3 h-3 mr-1" />
                Mixer
              </TabsTrigger>
            </TabsList>

            {/* Instruments Tab */}
            <TabsContent value="instruments" className="flex-1 flex flex-col overflow-hidden">
              <div className="p-4">
                <h4 className="text-sm font-medium text-gray-300 mb-3">VIRTUAL INSTRUMENTS</h4>
                
                <div className="space-y-2 mb-4">
                  {availableInstruments.map((instrument) => (
                    <div 
                      key={instrument.id}
                      className={`flex items-center p-3 rounded cursor-pointer transition-colors border ${
                        activeInstrument === instrument.id 
                          ? 'bg-[#ff4500]/20 border-[#ff4500]' 
                          : 'bg-[#2a2a2e] border-gray-700 hover:bg-[#333338]'
                      }`}
                      onClick={() => handleInstrumentSelect(instrument.id)}
                    >
                      <div className={`w-8 h-8 rounded flex items-center justify-center mr-3`} style={{ backgroundColor: instrument.color }}>
                        <Music className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-white font-medium">{instrument.name}</div>
                        <div className="text-xs text-gray-400">{instrument.category}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Presets */}
                {activeInstrument && availableInstruments.find(inst => inst.id === activeInstrument)?.presets && (
                  <div className="mb-4">
                    <h5 className="text-xs font-medium text-gray-400 mb-2">PRESETS</h5>
                    <div className="space-y-1">
                      {availableInstruments.find(inst => inst.id === activeInstrument)?.presets.map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => handlePresetSelect(preset)}
                          className={`w-full text-left px-2 py-1 text-xs rounded transition-colors ${
                            selectedPreset?.id === preset.id 
                              ? 'bg-[#ff4500] text-white' 
                              : 'text-gray-300 hover:bg-[#333338]'
                          }`}
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Virtual Keyboard Toggle */}
                <Button
                  onClick={() => setShowKeyboard(!showKeyboard)}
                  className={`w-full ${showKeyboard ? 'bg-[#ff4500]' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                  <Piano className="w-4 h-4 mr-2" />
                  {showKeyboard ? 'Hide' : 'Show'} Keyboard
                </Button>
              </div>
            </TabsContent>

            {/* Samples Tab */}
            <TabsContent value="samples" className="flex-1 overflow-y-auto">
              <SampleBrowser 
                availablePacks={availablePacks}
                selectedPack={selectedSamplePack}
                onPackSelect={setSelectedSamplePack}
                onSamplePlay={handleSamplePlay}
                getSamples={getSamples}
              />
            </TabsContent>

            {/* Effects Tab */}
            <TabsContent value="effects" className="flex-1 overflow-y-auto">
              <EffectsRack 
                availableEffects={availableEffects}
                selectedTrack={selectedTrack}
                tracks={tracks}
                onEffectAdd={(effectData) => {
                  if (currentProject) {
                    const track = tracks.find(t => t.id === selectedTrack);
                    const updatedEffects = [...(track?.effects || []), effectData];
                    projectUpdateTrack(currentProject.id, selectedTrack, { effects: updatedEffects });
                  }
                }}
                onEffectUpdate={(effectIndex, paramName, value) => {
                  if (currentProject) {
                    const track = tracks.find(t => t.id === selectedTrack);
                    if (track?.effects?.[effectIndex]) {
                      const updatedEffects = [...track.effects];
                      updatedEffects[effectIndex] = {
                        ...updatedEffects[effectIndex],
                        parameters: updatedEffects[effectIndex].parameters.map(param =>
                          param.name === paramName ? { ...param, value } : param
                        )
                      };
                      projectUpdateTrack(currentProject.id, selectedTrack, { effects: updatedEffects });
                    }
                  }
                }}
              />
            </TabsContent>

            {/* Mixer Tab */}
            <TabsContent value="mixer" className="flex-1 p-4 overflow-y-auto">
              <h4 className="text-sm font-medium text-gray-300 mb-3">MASTER MIXER</h4>
              
              {/* Master Volume */}
              <div className="space-y-4">
                <Card className="bg-[#2a2a2e] border-gray-700">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white font-medium">Master Volume</span>
                      <span className="text-xs text-gray-400">{Math.round(masterVolume)}%</span>
                    </div>
                    <Slider
                      value={[masterVolume]}
                      onValueChange={(value) => updateMasterVolume(value[0])}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </CardContent>
                </Card>

                {/* Track Volumes */}
                {tracks.map((track) => (
                  <Card key={track.id} className="bg-[#2a2a2e] border-gray-700">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: track.color }}
                          />
                          <span className="text-sm text-white font-medium">{track.name}</span>
                        </div>
                        <span className="text-xs text-gray-400">{track.volume}%</span>
                      </div>
                      <Slider
                        value={[track.volume]}
                        onValueChange={(value) => updateTrackVolume(track.id, value)}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                      
                      {/* Mute/Solo buttons */}
                      <div className="flex items-center space-x-1 mt-2">
                        <Button
                          onClick={() => toggleTrackMute(track.id)}
                          className={`w-8 h-6 p-0 text-xs font-bold rounded ${
                            track.muted 
                              ? 'bg-red-600 text-white' 
                              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                          }`}
                        >
                          M
                        </Button>
                        <Button
                          onClick={() => toggleTrackSolo(track.id)}
                          className={`w-8 h-6 p-0 text-xs font-bold rounded ${
                            track.solo 
                              ? 'bg-yellow-600 text-white' 
                              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                          }`}
                        >
                          S
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Virtual Keyboard */}
      {showKeyboard && (
        <div className="bg-[#242529] border-t border-gray-800">
          <VirtualKeyboard 
            onNotePlay={handleNotePlay}
            onNoteStop={handleNoteStop}
            keyboardMap={keyboardMap}
            activeInstrument={activeInstrument}
          />
        </div>
      )}

      {/* Status Bar */}
      <div className="bg-[#242529] border-t border-gray-800 px-4 py-2">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-4">
            <span>CPU: 15%</span>
            <span>44.1 kHz</span>
            <span>Latency: 5.8ms</span>
            <span>Tracks: {tracks.length}</span>
            <span>Clips: {tracks.reduce((total, track) => total + getTrackClips(track.id).length, 0)}</span>
            <span>Instrument: {availableInstruments.find(inst => inst.id === activeInstrument)?.name || 'None'}</span>
            {onlineUsers.length > 0 && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-green-400">{onlineUsers.length} online</span>
              </div>
            )}
            {user && (
              <div className="flex items-center space-x-1">
                <User className="w-3 h-3" />
                <span className="text-white">{user.display_name}</span>
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

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#242529] border border-gray-700 rounded-lg p-6 w-96 max-w-[90vw]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">Import Audio Files</h3>
              <Button
                onClick={() => setShowImportModal(false)}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white w-6 h-6 p-0"
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="text-sm text-gray-300">
                Select audio files to import into track: <span className="text-[#ff4500] font-medium">
                  {tracks.find(t => t.id === selectedTrack)?.name}
                </span>
              </div>
              
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-gray-500 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="audio/*"
                  onChange={(e) => handleFileUpload(Array.from(e.target.files))}
                  className="hidden"
                  id="file-upload"
                  disabled={isUploading}
                />
                <label 
                  htmlFor="file-upload" 
                  className={`cursor-pointer ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <div className="text-gray-300">
                    {isUploading ? 'Uploading...' : 'Click to select audio files'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Supports: MP3, WAV, OGG, M4A, FLAC
                  </div>
                </label>
              </div>
              
              <div className="text-xs text-gray-400 space-y-1">
                <div>• Files will be placed at current timeline position ({formatTime(currentTime)})</div>
                <div>• Maximum file size: 50MB per file</div>
                <div>• Files will be automatically converted if needed</div>
              </div>
              
              {isUploading && (
                <div className="flex items-center space-x-2 text-[#ff4500]">
                  <div className="w-4 h-4 border-2 border-[#ff4500] border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">Uploading and processing files...</span>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button
                onClick={() => setShowImportModal(false)}
                variant="ghost"
                className="text-gray-300 hover:text-white"
                disabled={isUploading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Studio;