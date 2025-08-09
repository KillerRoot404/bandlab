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
import { useAudioUpload } from '../hooks/useAudioUpload';
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
  LogIn, User, Maximize2, Minimize2, Sliders, FileAudio, Layers3, AlertCircle,
  Menu, X, ChevronLeft, ChevronRight, ChevronUp, ChevronDown
} from 'lucide-react';

const Studio = () => {
  const { toast } = useToast();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  // Audio Upload Hook
  const { uploadMultipleFiles, isUploading: uploadIsUploading, validateAudioFile } = useAudioUpload();
  
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
  const { availableEffects, createEffectChain, loading: effectsLoading, error: effectsError } = useAdvancedEffects();

  // Virtual Instruments Hook
  const { 
    availableInstruments, 
    playNote, 
    stopNote, 
    stopAllNotes, 
    getPreset, 
    keyboardMap,
    loading: instrumentsLoading,
    error: instrumentsError
  } = useVirtualInstruments();

  // Samples Hook
  const { 
    availablePacks, 
    loadPack, 
    getSamples, 
    playSample, 
    generateSamples,
    loading: samplesLoading,
    error: samplesError
  } = useSamples();

  // Projects Hook
  const { 
    currentProject, 
    projects, 
    createProject, 
    loadProject, 
    loadProjects,
    saveProject, 
    updateProject,
    addTrack: projectAddTrack,
    updateTrack: projectUpdateTrack,
    deleteTrack: projectDeleteTrack,
    loading: projectsLoading,
    error: projectsError
  } = useProjects();

  // Mobile/Responsive UI State
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [mobileActivePanel, setMobileActivePanel] = useState('tracks'); // tracks, timeline, browser
  const [showMobileTransport, setShowMobileTransport] = useState(true);
  const [isLandscape, setIsLandscape] = useState(false);

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
  const [activeBrowserTab, setActiveBrowserTab] = useState('instruments');

  // Real-time collaboration mock
  const [onlineUsers] = useState([
    { id: 1, name: 'Alex Producer', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face', color: '#3b82f6' },
    { id: 2, name: 'Maya Singer', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b7d0a6f1?w=32&h=32&fit=crop&crop=face', color: '#ef4444' }
  ]);

  // Responsive detection
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      const landscape = window.innerWidth > window.innerHeight;
      setIsMobile(mobile);
      setIsLandscape(landscape);
      
      // Auto-hide mobile menu when switching to desktop
      if (!mobile) {
        setShowMobileMenu(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Initialize everything
  useEffect(() => {
    initializeAudioContext();
    generateSamples();
  }, [initializeAudioContext, generateSamples]);

  // Load user projects when authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadProjects();
    }
  }, [isAuthenticated, authLoading, loadProjects]);

  // Create default project if user is authenticated but has no projects
  useEffect(() => {
    if (isAuthenticated && !projectsLoading && projects.length === 0 && !currentProject) {
      createProject({
        name: 'Untitled Project',
        description: 'New music project'
      });
    }
  }, [isAuthenticated, projects, projectsLoading, currentProject, createProject]);

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

  // Import functionality with improved upload
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

    try {
      const results = await uploadMultipleFiles(
        files, 
        currentProject.id, 
        selectedTrack, 
        currentTime,
        (clipData) => {
          // Add clip to project when uploaded
          const track = tracks.find(t => t.id === selectedTrack);
          if (track && currentProject) {
            const updatedClips = [...(track.clips || []), clipData];
            projectUpdateTrack(currentProject.id, selectedTrack, { clips: updatedClips });
          }
        }
      );

      setShowImportModal(false);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload files",
        variant: "destructive"
      });
    }
  };

  // Mobile panel switching
  const switchMobilePanel = (panel) => {
    setMobileActivePanel(panel);
    if (isMobile) {
      setShowMobileMenu(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1b] text-white flex flex-col overflow-hidden">
      {/* Header - BandLab Style - Responsive */}
      <div className="bg-[#242529] border-b border-gray-800 px-2 sm:px-4 py-2 flex items-center justify-between relative z-50">
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Mobile Menu Button */}
          {isMobile && (
            <Button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              variant="ghost"
              size="sm"
              className="text-gray-300 hover:text-white hover:bg-gray-700 h-8 w-8 p-0 md:hidden"
            >
              {showMobileMenu ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          )}
          
          <h1 className="text-sm sm:text-base font-medium text-white truncate max-w-32 sm:max-w-none">
            {currentProject?.name || 'New Project'}
          </h1>
          
          <div className="hidden sm:flex items-center space-x-4 text-sm text-gray-400">
            <span>BPM: {bpm}</span>
            <span>Key: {currentProject?.key || 'C Major'}</span>
            <span className="hidden lg:inline">{currentProject?.time_signature || '4/4'}</span>
            
            {/* Loading/Error States */}
            {(effectsLoading || instrumentsLoading || samplesLoading || authLoading || projectsLoading) && (
              <div className="flex items-center space-x-1 text-xs text-[#ff4500]">
                <div className="w-3 h-3 border border-[#ff4500] border-t-transparent rounded-full animate-spin"></div>
                <span>Loading...</span>
              </div>
            )}
            
            {(effectsError || instrumentsError || samplesError || projectsError) && (
              <div className="flex items-center space-x-1 text-xs text-red-400">
                <AlertCircle className="w-3 h-3" />
                <span>Offline</span>
              </div>
            )}

            {isAuthenticated && (
              <div className="flex items-center space-x-1">
                <Users className="w-3 h-3" />
                <span>Online</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-1 sm:space-x-2">
          {!isAuthenticated ? (
            <Button 
              onClick={() => setShowAuthModal(true)}
              variant="ghost" 
              size="sm" 
              className="text-gray-300 hover:text-white hover:bg-gray-700 h-8 text-xs sm:text-sm"
            >
              <LogIn className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="hidden sm:inline">Sign In</span>
            </Button>
          ) : (
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-300">
              <User className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline truncate max-w-20 sm:max-w-none">
                {user?.display_name || user?.username}
              </span>
            </div>
          )}
          
          <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-700 h-8 w-8 p-0 sm:w-auto sm:px-2">
            <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
            <span className="hidden sm:inline">Chat</span>
          </Button>
          
          <Button 
            onClick={handleImportFiles}
            variant="ghost" 
            size="sm" 
            className="text-gray-300 hover:text-white hover:bg-gray-700 h-8 w-8 p-0 sm:w-auto sm:px-2"
          >
            <Upload className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
            <span className="hidden sm:inline">Import</span>
          </Button>
          
          <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-700 h-8 w-8 p-0 sm:w-auto sm:px-2 hidden sm:flex">
            <Download className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
            <span className="hidden lg:inline">Export</span>
          </Button>
          
          <Button 
            onClick={handleProjectSave}
            variant="ghost" 
            size="sm" 
            className="text-gray-300 hover:text-white hover:bg-gray-700 h-8 w-8 p-0 sm:w-auto sm:px-2"
            disabled={!isAuthenticated || !currentProject || projectsLoading}
          >
            <Save className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
            <span className="hidden sm:inline">Save</span>
          </Button>
          
          <Button 
            className="bg-[#ff4500] hover:bg-[#ff5722] text-white h-8 w-8 p-0 sm:w-auto sm:px-2"
            size="sm"
            disabled={!isAuthenticated}
          >
            <Share2 className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
            <span className="hidden sm:inline">Publish</span>
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobile && showMobileMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowMobileMenu(false)}>
          <div className="bg-[#242529] w-64 h-full border-r border-gray-800" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-800">
              <h3 className="text-lg font-medium text-white">Navigation</h3>
            </div>
            
            <div className="space-y-2 p-4">
              <Button
                onClick={() => switchMobilePanel('tracks')}
                variant={mobileActivePanel === 'tracks' ? 'default' : 'ghost'}
                className="w-full justify-start"
              >
                <Layers3 className="w-4 h-4 mr-2" />
                Tracks
              </Button>
              
              <Button
                onClick={() => switchMobilePanel('timeline')}
                variant={mobileActivePanel === 'timeline' ? 'default' : 'ghost'}
                className="w-full justify-start"
              >
                <Clock className="w-4 h-4 mr-2" />
                Timeline
              </Button>
              
              <Button
                onClick={() => switchMobilePanel('browser')}
                variant={mobileActivePanel === 'browser' ? 'default' : 'ghost'}
                className="w-full justify-start"
              >
                <Music className="w-4 h-4 mr-2" />
                Browser
              </Button>
              
              <div className="border-t border-gray-800 pt-2 mt-2">
                <Button
                  onClick={() => setShowKeyboard(!showKeyboard)}
                  variant={showKeyboard ? 'default' : 'ghost'}
                  className="w-full justify-start"
                >
                  <Piano className="w-4 h-4 mr-2" />
                  Virtual Keyboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transport Controls - Responsive */}
      <div className="bg-[#242529] border-b border-gray-800 px-3 sm:px-6 py-2 sm:py-4">
        <div className="flex items-center justify-center space-x-2 sm:space-x-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white w-6 h-6 sm:w-8 sm:h-8 p-0"
            onClick={() => handleSeek(Math.max(0, currentTime - 10))}
          >
            <SkipBack className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
          
          <Button
            onClick={handleStop}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white w-6 h-6 sm:w-8 sm:h-8 p-0"
          >
            <Square className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
          
          <Button
            onClick={handlePlay}
            className="bg-[#ff4500] hover:bg-[#ff5722] text-white rounded-full w-10 h-10 sm:w-12 sm:h-12"
          >
            {audioIsPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5" />}
          </Button>
          
          <Button
            onClick={handleRecord}
            variant="ghost"
            size="sm"
            className={`w-6 h-6 sm:w-8 sm:h-8 p-0 ${audioIsRecording ? "text-red-500" : "text-gray-400 hover:text-white"}`}
          >
            <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${audioIsRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white w-6 h-6 sm:w-8 sm:h-8 p-0"
            onClick={() => handleSeek(currentTime + 10)}
          >
            <SkipForward className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
          
          <div className="mx-2 sm:mx-6 bg-[#1a1a1b] px-2 py-1 sm:px-3 rounded text-xs sm:text-sm font-mono border border-gray-700">
            {formatTime(currentTime)}
          </div>
          
          <Button
            onClick={() => setLoopEnabled(!loopEnabled)}
            variant="ghost"
            size="sm"
            className={`w-6 h-6 sm:w-8 sm:h-8 p-0 ${loopEnabled ? "text-[#ff4500]" : "text-gray-400 hover:text-white"}`}
          >
            <Repeat className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
          
          <div className="hidden sm:flex items-center space-x-2">
            <Switch 
              checked={metronomeEnabled}
              onCheckedChange={setMetronomeEnabled}
            />
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Click</span>
          </div>

          <div className="hidden lg:flex items-center space-x-2 ml-4">
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

      {/* Main Layout - Responsive */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Layout */}
        <div className="hidden md:flex flex-1 overflow-hidden">
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
            <Tabs value={activeBrowserTab} onValueChange={setActiveBrowserTab} className="h-full flex flex-col">
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
                  loading={samplesLoading}
                  error={samplesError}
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

        {/* Mobile Layout */}
        <div className="md:hidden flex flex-col flex-1 overflow-hidden">
          {/* Mobile Panel Navigation */}
          <div className="bg-[#242529] border-b border-gray-800 px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex space-x-1">
                <Button
                  onClick={() => setMobileActivePanel('tracks')}
                  variant={mobileActivePanel === 'tracks' ? 'default' : 'ghost'}
                  size="sm"
                  className="text-xs"
                >
                  <Layers3 className="w-3 h-3 mr-1" />
                  Tracks
                </Button>
                <Button
                  onClick={() => setMobileActivePanel('timeline')}
                  variant={mobileActivePanel === 'timeline' ? 'default' : 'ghost'}
                  size="sm"
                  className="text-xs"
                >
                  <Clock className="w-3 h-3 mr-1" />
                  Timeline
                </Button>
                <Button
                  onClick={() => setMobileActivePanel('browser')}
                  variant={mobileActivePanel === 'browser' ? 'default' : 'ghost'}
                  size="sm"
                  className="text-xs"
                >
                  <Music className="w-3 h-3 mr-1" />
                  Browser
                </Button>
              </div>
              
              <Button
                onClick={() => setShowKeyboard(!showKeyboard)}
                variant="ghost"
                size="sm"
                className="text-xs"
              >
                <Piano className="w-3 h-3 mr-1" />
                {showKeyboard ? 'Hide' : 'Show'} KB
              </Button>
            </div>
          </div>

          {/* Mobile Panel Content */}
          <div className="flex-1 overflow-hidden">
            {/* Tracks Panel - Mobile */}
            {mobileActivePanel === 'tracks' && (
              <div className="bg-[#242529] h-full flex flex-col">
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
                      className={`p-4 border-b border-gray-800 hover:bg-[#2a2a2e] cursor-pointer transition-colors ${
                        selectedTrack === track.id ? 'bg-[#2a2a2e] border-l-4 border-l-[#ff4500]' : ''
                      }`}
                      onClick={() => setSelectedTrack(track.id)}
                    >
                      {/* Track Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: track.color }}
                          />
                          <div>
                            <Input
                              value={track.name}
                              onChange={(e) => {
                                if (currentProject) {
                                  projectUpdateTrack(currentProject.id, track.id, { name: e.target.value });
                                }
                              }}
                              className="bg-transparent border-none p-0 h-auto text-base font-medium text-white"
                            />
                            <div className="text-sm text-gray-400">{track.instrument}</div>
                          </div>
                          {track.isRecording && (
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="w-6 h-6 p-0 text-gray-500 hover:text-gray-300"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button 
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSelectedTrack(track.id);
                            }}
                            variant="ghost" 
                            size="sm"
                            className="w-6 h-6 p-0 text-gray-500 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Track Controls - Mobile Optimized */}
                      <div className="flex items-center space-x-3 mb-4">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTrackMute(track.id);
                          }}
                          className={`w-10 h-8 p-0 text-sm font-bold rounded ${
                            track.muted 
                              ? 'bg-red-600 text-white' 
                              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                          }`}
                        >
                          MUTE
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTrackSolo(track.id);
                          }}
                          className={`w-10 h-8 p-0 text-sm font-bold rounded ${
                            track.solo 
                              ? 'bg-yellow-600 text-white' 
                              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                          }`}
                        >
                          SOLO
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (selectedTrack === track.id && !audioIsRecording) {
                              handleRecord();
                            }
                          }}
                          className={`w-10 h-8 p-0 text-sm font-bold rounded ${
                            track.isRecording
                              ? 'bg-red-600 text-white animate-pulse'
                              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                          }`}
                        >
                          REC
                        </Button>
                      </div>
                      
                      {/* Volume Control - Mobile Optimized */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Volume2 className="w-4 h-4 text-gray-500" />
                          <Slider
                            value={[track.volume]}
                            onValueChange={(value) => updateTrackVolume(track.id, value)}
                            max={100}
                            step={1}
                            className="flex-1"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span className="text-sm text-gray-400 w-8">{track.volume}%</span>
                        </div>
                      </div>
                      
                      {/* Clip Count and Effects */}
                      <div className="mt-3 flex items-center justify-between text-sm">
                        <div className="text-gray-500">
                          {getTrackClips(track.id).length} clips
                        </div>
                        <div className="text-gray-500">
                          {track.effects?.length || 0} effects
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline Panel - Mobile */}
            {mobileActivePanel === 'timeline' && (
              <div className="h-full">
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
                  isMobile={true}
                />
              </div>
            )}

            {/* Browser Panel - Mobile */}
            {mobileActivePanel === 'browser' && (
              <div className="bg-[#242529] h-full">
                <Tabs value={activeBrowserTab} onValueChange={setActiveBrowserTab} className="h-full flex flex-col">
                  <TabsList className="grid w-full grid-cols-4 bg-[#2a2a2e] border-b border-gray-800 rounded-none h-12">
                    <TabsTrigger 
                      value="instruments" 
                      className="data-[state=active]:bg-[#ff4500] data-[state=active]:text-white text-xs text-gray-400 flex-col p-1"
                    >
                      <Piano className="w-4 h-4 mb-1" />
                      Instruments
                    </TabsTrigger>
                    <TabsTrigger 
                      value="samples" 
                      className="data-[state=active]:bg-[#ff4500] data-[state=active]:text-white text-xs text-gray-400 flex-col p-1"
                    >
                      <FileAudio className="w-4 h-4 mb-1" />
                      Samples
                    </TabsTrigger>
                    <TabsTrigger 
                      value="effects" 
                      className="data-[state=active]:bg-[#ff4500] data-[state=active]:text-white text-xs text-gray-400 flex-col p-1"
                    >
                      <Sliders className="w-4 h-4 mb-1" />
                      Effects
                    </TabsTrigger>
                    <TabsTrigger 
                      value="mixer" 
                      className="data-[state=active]:bg-[#ff4500] data-[state=active]:text-white text-xs text-gray-400 flex-col p-1"
                    >
                      <Layers3 className="w-4 h-4 mb-1" />
                      Mixer
                    </TabsTrigger>
                  </TabsList>

                  {/* Mobile Browser Content */}
                  <div className="flex-1 overflow-hidden">
                    {/* Instruments Tab - Mobile */}
                    <TabsContent value="instruments" className="flex-1 flex flex-col overflow-hidden h-full">
                      <div className="p-4 flex-1 overflow-y-auto">
                        <h4 className="text-base font-medium text-gray-300 mb-4">VIRTUAL INSTRUMENTS</h4>
                        
                        <div className="space-y-3 mb-6">
                          {availableInstruments.map((instrument) => (
                            <div 
                              key={instrument.id}
                              className={`flex items-center p-4 rounded cursor-pointer transition-colors border ${
                                activeInstrument === instrument.id 
                                  ? 'bg-[#ff4500]/20 border-[#ff4500]' 
                                  : 'bg-[#2a2a2e] border-gray-700 hover:bg-[#333338]'
                              }`}
                              onClick={() => handleInstrumentSelect(instrument.id)}
                            >
                              <div className={`w-12 h-12 rounded flex items-center justify-center mr-4`} style={{ backgroundColor: instrument.color }}>
                                <Music className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="text-base text-white font-medium">{instrument.name}</div>
                                <div className="text-sm text-gray-400">{instrument.category}</div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Presets - Mobile */}
                        {activeInstrument && availableInstruments.find(inst => inst.id === activeInstrument)?.presets && (
                          <div className="mb-6">
                            <h5 className="text-sm font-medium text-gray-400 mb-3">PRESETS</h5>
                            <div className="space-y-2">
                              {availableInstruments.find(inst => inst.id === activeInstrument)?.presets.map((preset) => (
                                <button
                                  key={preset.id}
                                  onClick={() => handlePresetSelect(preset)}
                                  className={`w-full text-left px-4 py-3 text-sm rounded transition-colors border ${
                                    selectedPreset?.id === preset.id 
                                      ? 'bg-[#ff4500] text-white border-[#ff4500]' 
                                      : 'text-gray-300 hover:bg-[#333338] border-gray-700'
                                  }`}
                                >
                                  {preset.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    {/* Samples Tab - Mobile */}
                    <TabsContent value="samples" className="flex-1 overflow-y-auto h-full">
                      <SampleBrowser 
                        availablePacks={availablePacks}
                        selectedPack={selectedSamplePack}
                        onPackSelect={setSelectedSamplePack}
                        onSamplePlay={handleSamplePlay}
                        getSamples={getSamples}
                        loading={samplesLoading}
                        error={samplesError}
                        isMobile={true}
                      />
                    </TabsContent>

                    {/* Effects Tab - Mobile */}
                    <TabsContent value="effects" className="flex-1 overflow-y-auto h-full">
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
                        isMobile={true}
                      />
                    </TabsContent>

                    {/* Mixer Tab - Mobile */}
                    <TabsContent value="mixer" className="flex-1 p-4 overflow-y-auto h-full">
                      <h4 className="text-base font-medium text-gray-300 mb-4">MASTER MIXER</h4>
                      
                      {/* Master Volume - Mobile */}
                      <div className="space-y-4">
                        <Card className="bg-[#2a2a2e] border-gray-700">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-base text-white font-medium">Master Volume</span>
                              <span className="text-sm text-gray-400">{Math.round(masterVolume)}%</span>
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

                        {/* Track Volumes - Mobile */}
                        {tracks.map((track) => (
                          <Card key={track.id} className="bg-[#2a2a2e] border-gray-700">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                  <div 
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: track.color }}
                                  />
                                  <span className="text-base text-white font-medium">{track.name}</span>
                                </div>
                                <span className="text-sm text-gray-400">{track.volume}%</span>
                              </div>
                              <Slider
                                value={[track.volume]}
                                onValueChange={(value) => updateTrackVolume(track.id, value)}
                                max={100}
                                step={1}
                                className="w-full mb-3"
                              />
                              
                              {/* Mute/Solo buttons - Mobile */}
                              <div className="flex items-center space-x-2">
                                <Button
                                  onClick={() => toggleTrackMute(track.id)}
                                  className={`flex-1 h-10 text-sm font-bold rounded ${
                                    track.muted 
                                      ? 'bg-red-600 text-white' 
                                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                  }`}
                                >
                                  MUTE
                                </Button>
                                <Button
                                  onClick={() => toggleTrackSolo(track.id)}
                                  className={`flex-1 h-10 text-sm font-bold rounded ${
                                    track.solo 
                                      ? 'bg-yellow-600 text-white' 
                                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                  }`}
                                >
                                  SOLO
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Virtual Keyboard - Responsive */}
      {showKeyboard && (
        <div className="bg-[#242529] border-t border-gray-800">
          <VirtualKeyboard 
            onNotePlay={handleNotePlay}
            onNoteStop={handleNoteStop}
            keyboardMap={keyboardMap}
            activeInstrument={activeInstrument}
            isMobile={isMobile}
          />
        </div>
      )}

      {/* Status Bar - Responsive */}
      <div className="bg-[#242529] border-t border-gray-800 px-2 sm:px-4 py-2">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <span className="hidden sm:inline">CPU: 15%</span>
            <span className="hidden md:inline">44.1 kHz</span>
            <span className="hidden lg:inline">Latency: 5.8ms</span>
            <span>Tracks: {tracks.length}</span>
            <span className="hidden sm:inline">Clips: {tracks.reduce((total, track) => total + getTrackClips(track.id).length, 0)}</span>
            <span className="hidden md:inline">Instrument: {availableInstruments.find(inst => inst.id === activeInstrument)?.name || 'None'}</span>
            {onlineUsers.length > 0 && (
              <div className="hidden lg:flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-green-400">{onlineUsers.length} online</span>
              </div>
            )}
            {user && (
              <div className="hidden sm:flex items-center space-x-1">
                <User className="w-3 h-3" />
                <span className="text-white truncate max-w-20">{user.display_name}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="flex items-center space-x-2">
              <MonitorSpeaker className="w-3 h-3 sm:w-4 sm:h-4" />
              <Slider
                value={[masterVolume]}
                onValueChange={(value) => updateMasterVolume(value[0])}
                max={100}
                step={1}
                className="w-12 sm:w-20"
              />
              <span className="w-6 text-xs sm:text-sm">{Math.round(masterVolume)}</span>
            </div>
            
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white w-6 h-6 p-0">
              <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />

      {/* Import Modal - Responsive */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#242529] border border-gray-700 rounded-lg p-4 sm:p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-medium text-white">Import Audio Files</h3>
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
              
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 sm:p-8 text-center hover:border-gray-500 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="audio/*"
                  onChange={(e) => handleFileUpload(Array.from(e.target.files))}
                  className="hidden"
                  id="file-upload"
                  disabled={uploadIsUploading}
                />
                <label 
                  htmlFor="file-upload" 
                  className={`cursor-pointer ${uploadIsUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mx-auto mb-2" />
                  <div className="text-sm sm:text-base text-gray-300">
                    {uploadIsUploading ? 'Uploading...' : 'Click to select audio files'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Supports: MP3, WAV, OGG, M4A, FLAC
                  </div>
                </label>
              </div>
              
              <div className="text-xs text-gray-400 space-y-1">
                <div>• Files will be placed at current timeline position ({formatTime(currentTime)})</div>
                <div>• Maximum file size: 50MB per file</div>
                <div className="hidden sm:block">• Files will be automatically converted if needed</div>
              </div>
              
              {uploadIsUploading && (
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
                disabled={uploadIsUploading}
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