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
import { useLiveExport } from '../hooks/useLiveExport';
import { useHistory } from '../hooks/useHistory';
import Timeline from '../components/Timeline';
import VirtualKeyboard from '../components/VirtualKeyboard';
import EffectsRack from '../components/EffectsRack';
import SampleBrowser from '../components/SampleBrowser';
import AuthModal from '../components/AuthModal';
import AudioActivationPrompt from '../components/AudioActivationPrompt';
import Mixer from '../components/Mixer';
import AdvancedMixer from '../components/advanced/AdvancedMixer';
import {
  Play, Pause, Square, RotateCcw, Volume2, VolumeX, Mic, Piano, Headphones,
  Settings, Save, Share2, Plus, Trash2, SkipBack, SkipForward, Repeat, Shuffle,
  Users, Upload, Download, MessageSquare, Clock, Grid3X3, Music, Waves, Zap,
  Filter, Activity, MonitorSpeaker, Mic2, Target, Volume1, Copy, Edit3, MoreHorizontal,
  LogIn, User, Maximize2, Minimize2, Sliders, FileAudio, Layers3, AlertCircle,
  Menu, X, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, ToggleLeft, ToggleRight
} from 'lucide-react';

const Studio = () => {
  const { toast } = useToast();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  // Audio Upload Hook
  const { uploadMultipleFiles, isUploading: uploadIsUploading, validateAudioFile, uploadProgress } = useAudioUpload();
  
  // Audio Engine Hook
  const {
    isRecording: audioIsRecording,
    isPlaying: audioIsPlaying,
    currentTime,
    bpm,
    masterVolume,
    metronomeVolume,
    // Audio context state
    isAudioContextSuspended,
    userHasInteracted,
    autoplayBlocked,
    // Actions
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
    initializeAudioContext,
    addUploadedClip,
    audioContext,
    masterGainNode,
    requestAudioActivation,
    // Metronome API
    setMetronomeEnabled: engineSetMetronomeEnabled,
    setMetronomeVolume: engineSetMetronomeVolume,
    masterLevel,
    trackLevels,
  } = useAudioEngine();

  // Advanced Effects Hook
  const { availableEffects, createEffectChain, loading: effectsLoading, error: effectsError } = useAdvancedEffects();

  // Virtual Instruments Hook (with shared audio context)
  const { 
    availableInstruments, 
    playNote, 
    stopNote, 
    stopAllNotes, 
    getPreset, 
    keyboardMap,
    loading: instrumentsLoading,
    error: instrumentsError
  } = useVirtualInstruments(audioContext, masterGainNode);

  // Samples Hook (with shared audio context)
  const { 
    availablePacks, 
    loadPack, 
    getSamples, 
    playSample, 
    generateSamples,
    loading: samplesLoading,
    error: samplesError
  } = useSamples(audioContext, masterGainNode);

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

  // Undo/Redo history (frontend-only snapshot of project)
  const { push: pushHistory, undo, redo, canUndo, canRedo } = useHistory(100);
  const snapshotProject = () => ({ project: JSON.parse(JSON.stringify(currentProject || {})) });
  const applySnapshot = (snap) => { if (!snap?.project) return; updateProject(snap.project.id, snap.project); };

  // Sync BPM from backend project when available
  useEffect(() => {
    if (currentProject?.bpm) {
      setBpm(currentProject.bpm);
    }
  }, [currentProject, setBpm]);

  // Mobile/Responsive UI State
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [mobileActivePanel, setMobileActivePanel] = useState('tracks'); // tracks, timeline, browser
  const [showMobileTransport, setShowMobileTransport] = useState(true);
  const [isLandscape, setIsLandscape] = useState(false);

  // Header: project name editing
  const [isEditingName, setIsEditingName] = useState(false);
  const [projectName, setProjectName] = useState('Projeto novo');
  useEffect(() => {
    if (currentProject?.name) setProjectName(currentProject.name);
  }, [currentProject?.name]);

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
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFilename, setExportFilename] = useState('mixdown.webm');
  const [exportDuration, setExportDuration] = useState(10);
  // Musical context UI (BandLab parity)
  const [timeSignature, setTimeSignature] = useState('4/4');
  const [keySignature, setKeySignature] = useState('C Major');
  const [masterPreset, setMasterPreset] = useState('None');
  // Loop/Grid
  const [loopStart, setLoopStart] = useState(0);
  const [loopEnd, setLoopEnd] = useState(4);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [gridDivision, setGridDivision] = useState('1/4');
  const [countInEnabled, setCountInEnabled] = useState(false);
  
  // Advanced Mixer State
  const [advancedMixerMode, setAdvancedMixerMode] = useState(false);

  // Live Export hook
  const { exportProject, isExporting, progress: exportProgress } = useLiveExport(
    audioContext,
    masterGainNode,
    startPlayback,
    stopPlayback
  );

  // Responsive detection
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      const landscape = window.innerWidth > window.innerHeight;
      setIsMobile(mobile);
      setIsLandscape(landscape);
      
      if (!mobile) setShowMobileMenu(false);
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

  // Compute export duration when tracks change
  useEffect(() => {
    const getEnd = () => {
      let maxEnd = 0;
      const allTracks = currentProject?.tracks || [];
      allTracks.forEach((t) => {
        const engineClips = getTrackClips(t.id) || [];
        const all = [...engineClips, ...(t.clips || [])];
        all.forEach((c) => {
          const end = (c.start_time || 0) + (c.duration || 0);
          if (end > maxEnd) maxEnd = end;
        });
      });
      return Math.max(5, Math.ceil(maxEnd));
    };
    setExportDuration(getEnd());
  }, [currentProject, getTrackClips]);

  // Audio activation handling stays same
  const noteKeyMapRef = React.useRef(new Map());
  const [showAudioActivationPrompt, setShowAudioActivationPrompt] = useState(false);
  const [hasTriedAudioAction, setHasTriedAudioAction] = useState(false);

  const checkAudioActivation = useCallback(async () => {
    if (autoplayBlocked && !userHasInteracted && !hasTriedAudioAction) {
      setHasTriedAudioAction(true);
      setShowAudioActivationPrompt(true);
      return false;
    }
    return true;
  }, [autoplayBlocked, userHasInteracted, hasTriedAudioAction]);

  const handleAudioActivation = useCallback(async () => {
    try {
      const activated = await requestAudioActivation();
      if (activated) {
        setShowAudioActivationPrompt(false);
        setHasTriedAudioAction(false);
        toast({ title: 'Audio Ativado', description: 'Agora você pode reproduzir instrumentos, samples e áudio carregado!' });
      } else {
        toast({ title: 'Falha na Ativação de Áudio', description: 'Não foi possível ativar o áudio. Tente novamente.', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Audio activation error:', error);
      toast({ title: 'Erro de Áudio', description: 'Erro ao ativar contexto de áudio.', variant: 'destructive' });
    }
  }, [requestAudioActivation, toast]);

  const handleDismissAudioPrompt = useCallback(() => { setShowAudioActivationPrompt(false); setHasTriedAudioAction(false); }, []);

  // Transport Controls
  const handlePlay = async () => {
    if (audioIsPlaying) {
      stopPlayback();
      stopAllNotes();
    } else {
      const canPlayAudio = await checkAudioActivation();
      if (!canPlayAudio) return;
      try {
        await startPlayback(currentTime, currentProject?.tracks || [], { loopEnabled, loopStart, loopEnd });
        toast({ title: 'Reprodução Iniciada', description: 'Reproduzindo a partir de ' + formatTime(currentTime) });
      } catch (error) {
        console.error('Playback error:', error);
        if (error.message && error.message.includes('suspended')) { setShowAudioActivationPrompt(true); }
        else { toast({ title: 'Erro de Reprodução', description: 'Não foi possível iniciar a reprodução.', variant: 'destructive' }); }
      }
    }
  };

  const handleStop = () => {
    stopPlayback();
    stopAllNotes();
    setCurrentTime(0);
    toast({ title: 'Playback Stopped', description: 'Returned to beginning' });
  };

  const handleRecord = async () => {
    if (!isAuthenticated) { setShowAuthModal(true); return; }

    // Snapshot para undo antes de gravar (caso crie clip)
    if (!audioIsRecording) pushHistory(snapshotProject());

    if (audioIsRecording) {
      stopRecording();
      setRecordingTrack(null);
      if (currentProject) projectUpdateTrack(currentProject.id, selectedTrack, { isRecording: false });
      toast({ title: 'Gravação Parada', description: 'Clipe de áudio salvo na timeline' });
    } else {
      const canPlayAudio = await checkAudioActivation();
      if (!canPlayAudio) return;
      try {
        // Count-in visual e simples (placeholder de 1 compasso)
        if (countInEnabled) {
          const beatMs = (60 / Math.max(1, bpm)) * 1000;
          await new Promise((res) => setTimeout(res, beatMs * 4));
        }
        await startRecording(selectedTrack);
        setRecordingTrack(selectedTrack);
        if (currentProject) projectUpdateTrack(currentProject.id, selectedTrack, { isRecording: true });
        toast({ title: 'Gravação Iniciada', description: `Gravando em ${ (currentProject?.tracks || []).find(t => t.id === selectedTrack)?.name || 'Track' }` });
      } catch (error) {
        console.error('Recording error:', error);
        if (error.message && error.message.includes('suspended')) setShowAudioActivationPrompt(true);
        else toast({ title: 'Erro de Gravação', description: 'Não foi possível iniciar a gravação. Verifique as permissões do microfone.', variant: 'destructive' });
      }
    }
  };

  const handleSeek = (time) => {
    setCurrentTime(time);
    if (audioIsPlaying) {
      startPlayback(time, currentProject?.tracks || [], { loopEnabled, loopStart, loopEnd });
    }
  };

  // Track Controls
  const toggleTrackMute = (trackId) => {
    const track = (currentProject?.tracks || []).find(t => t.id === trackId);
    if (track && currentProject) {
      pushHistory(snapshotProject());
      projectUpdateTrack(currentProject.id, trackId, { muted: !track.muted });
      toast({ title: track.muted ? 'Track Unmuted' : 'Track Muted', description: track.name });
    }
  };

  const toggleTrackSolo = (trackId) => {
    const track = (currentProject?.tracks || []).find(t => t.id === trackId);
    if (track && currentProject) {
      pushHistory(snapshotProject());
      projectUpdateTrack(currentProject.id, trackId, { solo: !track.solo });
    }
  };

  const updateTrackVolume = (trackId, volume) => { if (currentProject) projectUpdateTrack(currentProject.id, trackId, { volume: (Array.isArray(volume) ? volume[0] : volume) }); };
  const updateTrackPan = (trackId, panVal) => { if (currentProject) projectUpdateTrack(currentProject.id, trackId, { pan: (Array.isArray(panVal) ? panVal[0] : panVal) }); };


  const addNewTrack = async () => {
    if (!isAuthenticated) { setShowAuthModal(true); return; }
    if (!currentProject) { toast({ title: 'No Project', description: 'Please create a project first', variant: 'destructive' }); return; }

    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];
    const newTrackData = { name: `Track ${ (currentProject?.tracks || []).length + 1 }`, instrument: 'Audio', volume: 75, color: colors[(currentProject?.tracks || []).length % colors.length] };
    const result = await projectAddTrack(currentProject.id, newTrackData);
    if (result?.track?.id) setSelectedTrack(result.track.id);
    toast({ title: 'Track Added', description: `${newTrackData.name} created` });
  };

  const deleteSelectedTrack = (trackId) => {
    if (currentProject) {
      projectDeleteTrack(currentProject.id, trackId);
      toast({ title: 'Track Deleted', description: 'Track and all clips removed' });
    }
  };

  const handleInstrumentSelect = (instrumentId) => {
    setActiveInstrument(instrumentId);
    const instrument = availableInstruments.find(inst => inst.id === instrumentId);
    if (instrument && instrument.presets.length > 0) setSelectedPreset(instrument.presets[0]);
  };

  const handlePresetSelect = (preset) => { setSelectedPreset(preset); };

  const handleNotePlay = async (note, velocity = 100) => {
    const canPlayAudio = await checkAudioActivation();
    if (!canPlayAudio) return;
    const preset = selectedPreset || availableInstruments.find(inst => inst.id === activeInstrument)?.presets[0];
    const result = playNote(activeInstrument, note, velocity, preset);
    if (result) noteKeyMapRef.current.set(String(note), result);
    if (result === null && autoplayBlocked) setShowAudioActivationPrompt(true);
  };

  const handleNoteStop = (note) => { const key = noteKeyMapRef.current.get(String(note)); if (key) { stopNote(key); noteKeyMapRef.current.delete(String(note)); } };

  const handleSamplePlay = async (sampleId) => {
    if (!isAuthenticated) { setShowAuthModal(true); return; }
    const canPlayAudio = await checkAudioActivation();
    if (!canPlayAudio) return;
    const sample = availablePacks.flatMap(pack => pack.samples).find(s => s.id === sampleId);
    if (sample) { const result = await playSample(sample); if (result === null && autoplayBlocked) setShowAudioActivationPrompt(true); }
  };

  const handleProjectSave = async () => {
    if (!isAuthenticated) { setShowAuthModal(true); return; }
    try { await saveProject(); toast({ title: 'Projeto Salvo', description: 'Alterações salvas com sucesso' }); }
    catch (error) { toast({ title: 'Falha ao Salvar', description: 'Não foi possível salvar o projeto', variant: 'destructive' }); }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const centiseconds = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}:${centiseconds.toString().padStart(2, '0')}`;
  };

  const handleClipDelete = async (clipId) => {
    pushHistory(snapshotProject());
    deleteClip(clipId);
    if (currentProject) {
      const track = (currentProject.tracks || []).find(t => t.id === selectedTrack);
      if (track) {
        const updatedClips = (track.clips || []).filter(c => c.id !== clipId);
        await projectUpdateTrack(currentProject.id, selectedTrack, { clips: updatedClips });
      }
    }
    toast({ title: 'Clip Deleted', description: 'Audio clip removed from timeline' });
  };

  const handleClipMove = (clipId, newStartTime) => { moveClip(clipId, newStartTime); };
  const handleClipMoveEnd = () => { pushHistory(snapshotProject()); };

  const handleImportFiles = () => {
    if (!isAuthenticated) { setShowAuthModal(true); return; }
    if (!currentProject) { toast({ title: 'No Project', description: 'Please create a project first', variant: 'destructive' }); return; }
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
        async (clipData) => {
          addUploadedClip(clipData);
          if (currentProject) {
            const track = (currentProject.tracks || []).find(t => t.id === selectedTrack);
            const updatedClips = [...(track?.clips || []), clipData];
            await projectUpdateTrack(currentProject.id, selectedTrack, { clips: updatedClips });
          }
        }
      );
      setShowImportModal(false);
      toast({ title: 'Arquivos Importados', description: `${results.length} arquivo(s) adicionado(s) à timeline` });
    } catch (error) {
      console.error('Upload error:', error);
      toast({ title: 'Falha no Upload', description: error.message || 'Falha ao carregar arquivos', variant: 'destructive' });
    }
  };

  // Export mixdown (live)
  const handleExport = async () => {
    try {
      const canPlayAudio = await checkAudioActivation(); if (!canPlayAudio) return;
      await exportProject({ tracks: currentProject?.tracks || [], getTrackClips, duration: exportDuration, filename: exportFilename });
      setShowExportModal(false);
      toast({ title: 'Exportação concluída', description: 'Seu mixdown foi baixado.' });
    } catch (e) {
      console.error(e);
      toast({ title: 'Falha na exportação', description: e.message || 'Erro ao exportar mix.', variant: 'destructive' });
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const onKeyDown = async (e) => {
      const tag = (e.target && e.target.tagName) || '';
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
      if (e.code === 'Space') { e.preventDefault(); await handlePlay(); }
      else if (e.key === 'r' || e.key === 'R') { e.preventDefault(); await handleRecord(); }
      else if (e.key === 'l' || e.key === 'L') { e.preventDefault(); setLoopEnabled((prev) => !prev); toast({ title: 'Loop', description: 'Loop ' + (!loopEnabled ? 'ativado' : 'desativado') }); }
      else if (e.key === 'm' || e.key === 'M') { e.preventDefault(); const val = !metronomeEnabled; setMetronomeEnabled(val); engineSetMetronomeEnabled(val); toast({ title: 'Metrônomo', description: 'Metrônomo ' + (val ? 'ativado' : 'desativado') }); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handlePlay, handleRecord, loopEnabled, metronomeEnabled, toast, engineSetMetronomeEnabled]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#131315] to-[#0f0f11] text-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-[#242529]/90 backdrop-blur border-b border-gray-800/80 px-2 sm:px-4 py-2 flex items-center justify-between relative z-50">
        {/* Left: brand and navigation */}
        <div className="flex items-center space-x-2">
          <div className="text-white font-semibold tracking-tight">BandLab</div>
          <div className="flex items-center space-x-2 ml-2">
            <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">Arquivo</Button>
            <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">Editar</Button>
          </div>
        </div>
        {/* Center: project title and context pills */}
        <div className="flex-1 flex items-center justify-center">
          {isEditingName ? (
            <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} onBlur={() => setIsEditingName(false)} className="w-48 text-center bg-[#1a1a1b] border-gray-700 text-white" />
          ) : (
            <button onClick={() => setIsEditingName(true)} className="text-sm sm:text-base text-gray-200 hover:text-white">
              {currentProject?.name || projectName}
            </button>
          )}
        </div>
        {/* Right: actions */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {!isAuthenticated ? (
            <Button onClick={() => setShowAuthModal(true)} variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-700 h-8 text-xs sm:text-sm"><LogIn className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /><span className="hidden sm:inline">Sign In</span></Button>
          ) : (
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-300"><User className="w-3 h-3 sm:w-4 sm:h-4" /><span className="hidden sm:inline truncate max-w-20 sm:max-w-none">{user?.display_name || user?.username}</span></div>
          )}
          <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-700 h-8 w-8 p-0 sm:w-auto sm:px-2"><MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" /><span className="hidden sm:inline">Chat</span></Button>
          <Button onClick={() => setShowImportModal(true)} variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-700 h-8 w-8 p-0 sm:w-auto sm:px-2"><Upload className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" /><span className="hidden sm:inline">Import</span></Button>
          <Button onClick={() => setShowExportModal(true)} variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-700 h-8 w-8 p-0 sm:w-auto sm:px-2"><Download className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" /><span className="hidden lg:inline">Export</span></Button>
          <Button onClick={handleProjectSave} variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-700 h-8 w-8 p-0 sm:w-auto sm:px-2" disabled={!isAuthenticated || !currentProject || projectsLoading}><Save className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" /><span className="hidden sm:inline">Save</span></Button>
          <Button className="bg-[#ff4500] hover:bg-[#ff5722] text-white h-8 w-8 p-0 sm:w-auto sm:px-2" size="sm" disabled={!isAuthenticated}><Share2 className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" /><span className="hidden sm:inline">Publish</span></Button>
        </div>
      </div>

      {/* Transport */}
      <div className="bg-[#242529]/90 backdrop-blur border-b border-gray-800 px-3 sm:px-6 py-2 sm:py-4">
        <div className="flex items-center justify-center space-x-2 sm:space-x-3">
          {/* Left: Snap/Quantize & Undo/Redo placeholders for parity */}
          <div className="hidden xl:flex items-center space-x-2 mr-4">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" disabled={!canUndo()} onClick={() => undo(applySnapshot)}>Undo</Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" disabled={!canRedo()} onClick={() => redo(applySnapshot)}>Redo</Button>
          </div>

          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white w-6 h-6 sm:w-8 sm:h-8 p-0" onClick={() => handleSeek(Math.max(0, currentTime - 10))}><SkipBack className="w-3 h-3 sm:w-4 sm:h-4" /></Button>
          <Button onClick={handleStop} variant="ghost" size="sm" className="text-gray-400 hover:text-white w-6 h-6 sm:w-8 sm:h-8 p-0"><Square className="w-3 h-3 sm:w-4 sm:h-4" /></Button>
          <Button onClick={handlePlay} className="bg-[#ff4500] hover:bg-[#ff5722] text-white rounded-full w-10 h-10 sm:w-12 sm:h-12">
            {audioIsPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5" />}
          </Button>
          <Button onClick={handleRecord} variant="ghost" size="sm" className={`w-6 h-6 sm:w-8 sm:h-8 p-0 ${audioIsRecording ? 'text-red-500' : 'text-gray-400 hover:text-white'}`}><div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${audioIsRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} /></Button>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white w-6 h-6 sm:w-8 sm:h-8 p-0" onClick={() => handleSeek(currentTime + 10)}><SkipForward className="w-3 h-3 sm:w-4 sm:h-4" /></Button>
          <div className="mx-2 sm:mx-6 bg-[#1a1a1b] px-2 py-1 sm:px-3 rounded text-xs sm:text-sm font-mono border border-gray-700">{formatTime(currentTime)}</div>
          <Button onClick={() => setLoopEnabled(!loopEnabled)} variant="ghost" size="sm" className={`w-6 h-6 sm:w-8 sm:h-8 p-0 ${loopEnabled ? 'text-[#ff4500]' : 'text-gray-400 hover:text-white'}`} title="Loop"><Repeat className="w-3 h-3 sm:w-4 sm:h-4" /></Button>

          {/* Count-in */}
          <div className="hidden sm:flex items-center space-x-2">
            <span className="text-sm text-gray-400">Count-in</span>
            <Switch checked={countInEnabled} onCheckedChange={setCountInEnabled} />
          </div>

          {/* Metronome control with volume */}
          <div className="hidden sm:flex items-center space-x-2">
            <Switch 
              checked={metronomeEnabled}
              onCheckedChange={(v) => { setMetronomeEnabled(v); engineSetMetronomeEnabled(v); }}
            />
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Click</span>
            {metronomeEnabled && (
              <div className="flex items-center space-x-2 ml-2">
                <Slider value={[metronomeVolume]} onValueChange={(val) => engineSetMetronomeVolume(val[0])} max={100} step={1} className="w-24" />
                <span className="text-xs text-gray-400 w-6 text-right">{Math.round(metronomeVolume)}</span>
              </div>
            )}
          </div>

          <div className="hidden lg:flex items-center space-x-2 ml-4">
            <span className="text-sm text-gray-400">BPM:</span>
            <Input type="number" value={bpm} onChange={(e) => setBpm(parseInt(e.target.value) || 120)} onBlur={() => { if (currentProject) updateProject(currentProject.id, { bpm }); }} className="w-16 h-8 bg-[#1a1a1b] border-gray-700 text-white text-center" min="60" max="200" />
            <div className="mx-2 flex items-center space-x-2">
              <span className="text-sm text-gray-400">Tom:</span>
              <Input value={keySignature} onChange={(e) => setKeySignature(e.target.value)} className="w-28 h-8 bg-[#1a1a1b] border-gray-700 text-white" />
              <span className="text-sm text-gray-400">Compasso:</span>
              <Input value={timeSignature} onChange={(e) => setTimeSignature(e.target.value)} className="w-20 h-8 bg-[#1a1a1b] border-gray-700 text-white text-center" />
            </div>

            <div className="mx-2 flex items-center space-x-2">
              <span className="text-sm text-gray-400">Mastering:</span>
              <Input value={masterPreset} onChange={(e) => setMasterPreset(e.target.value)} className="w-32 h-8 bg-[#1a1a1b] border-gray-700 text-white" />
            </div>

            <div className="mx-2 hidden xl:flex items-center space-x-2">
              <span className="text-sm text-gray-400">Master Vol</span>
              <Slider value={[masterVolume]} onValueChange={(val) => updateMasterVolume(val[0])} max={100} step={1} className="w-28" />
              <span className="text-xs text-gray-400 w-8 text-right">{Math.round(masterVolume)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main layout & panels */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Timeline */}
        <div className="hidden md:flex flex-1 overflow-hidden">
          <Timeline 
            tracks={currentProject?.tracks || []}
            currentTime={currentTime}
            isPlaying={audioIsPlaying}
            onSeek={handleSeek}
            selectedTrack={selectedTrack}
            onTrackSelect={setSelectedTrack}
            getTrackClips={getTrackClips}
            deleteClip={handleClipDelete}
            moveClip={handleClipMove}
            generateWaveform={generateWaveform}
            onClipMoveEnd={handleClipMoveEnd}
            bpm={bpm}
            loopEnabled={loopEnabled}
            loopStart={loopStart}
            loopEnd={loopEnd}
            onLoopChange={({ start, end }) => { setLoopStart(start); setLoopEnd(end); }}
            snapEnabled={snapEnabled}
            gridDivision={gridDivision}
            onSnapToggle={setSnapEnabled}
            onDivisionChange={setGridDivision}
            onTrackMuteToggle={toggleTrackMute}
            onTrackSoloToggle={toggleTrackSolo}
            onTrackVolumeChange={updateTrackVolume}
            onAddTrack={addNewTrack}
          />
        </div>

        {/* Right: Browser Panel */}
        <div className="hidden md:flex w-[360px] min-w-[320px] max-w-[400px] border-l border-gray-800 bg-[#1a1a1b] flex-col">
      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#242529] border border-gray-700 rounded-lg p-4 sm:p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-medium text-white">Import Audio</h3>
              <Button onClick={() => setShowImportModal(false)} variant="ghost" size="sm" className="text-gray-300 hover:text-white w-6 h-6 p-0">×</Button>
            </div>

            <div className="space-y-4">
              <div className="p-4 border border-dashed border-gray-700 rounded bg-[#1a1a1b] text-center">
                <input
                  id="file-input"
                  type="file"
                  accept="audio/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileUpload(Array.from(e.target.files || []))}
                />
                <label htmlFor="file-input" className="cursor-pointer inline-block px-4 py-2 bg-[#ff4500] hover:bg-[#ff5722] text-white rounded">
                  Select Audio Files
                </label>
                <div className="text-xs text-gray-400 mt-2">Supported: MP3, WAV, OGG, M4A, FLAC, AAC • Max 50MB</div>
              </div>
              {uploadIsUploading && (
                <div className="text-xs text-gray-400">Uploading... {Math.round(uploadProgress || 0)}%</div>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <Button onClick={() => setShowImportModal(false)} variant="ghost" className="text-gray-300 hover:text-white">Close</Button>
            </div>
          </div>
        </div>
      )}

          <div className="px-3 py-2 border-b border-gray-800 bg-[#242529]">
            <Tabs value={activeBrowserTab} onValueChange={setActiveBrowserTab}>
              <TabsList className="w-full bg-[#1a1a1b] border border-gray-800 p-1 rounded">
                <TabsTrigger value="instruments" className="data-[state=active]:bg-[#ff4500] data-[state=active]:text-white">Instruments</TabsTrigger>
                <TabsTrigger value="samples" className="data-[state=active]:bg-[#ff4500] data-[state=active]:text-white">Samples</TabsTrigger>
                <TabsTrigger value="effects" className="data-[state=active]:bg-[#ff4500] data-[state=active]:text-white">Effects</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            {/* Instruments Tab */}
            {activeBrowserTab === 'instruments' && (
              <div className="p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Select Instrument</span>
                  <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white" onClick={() => setShowKeyboard((v) => !v)}>
                    {showKeyboard ? 'Hide Keyboard' : 'Show Keyboard'}
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {availableInstruments.map((inst) => (
                    <button
                      key={inst.id}
                      className={`text-left p-3 rounded border transition-colors ${
                        activeInstrument === inst.id
                          ? 'bg-[#ff4500]/20 border-[#ff4500] text-white'
                          : 'bg-[#2a2a2e] border-gray-700 text-gray-300 hover:bg-[#333338]'
                      }`}
                      onClick={() => handleInstrumentSelect(inst.id)}
                    >
                      <div className="font-medium">{inst.name}</div>
                      <div className="text-gray-400 text-xs">{(inst.presets || []).length} presets</div>
                    </button>
                  ))}
                </div>

                {showKeyboard && (
                  <div className="mt-2">
                    <VirtualKeyboard
                      onNotePlay={handleNotePlay}
                      onNoteStop={handleNoteStop}
                      keyboardMap={keyboardMap}
                      activeInstrument={availableInstruments.find(i => i.id === activeInstrument)?.name || 'Grand Piano'}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Samples Tab */}
            {activeBrowserTab === 'samples' && (
              <SampleBrowser
                availablePacks={availablePacks}
                selectedPack={selectedSamplePack}
                onPackSelect={setSelectedSamplePack}
                onSamplePlay={handleSamplePlay}
                getSamples={getSamples}
                loading={samplesLoading}
                error={samplesError}
              />
            )}

            {/* Effects Tab */}
            {activeBrowserTab === 'effects' && (
              <EffectsRack
                availableEffects={availableEffects}
                selectedTrack={selectedTrack}
                tracks={currentProject?.tracks || []}
                onEffectAdd={(effectData) => {
                  if (!currentProject) return;
                  const track = (currentProject.tracks || []).find(t => t.id === selectedTrack);
                  const effects = [...(track?.effects || []), effectData];
                  projectUpdateTrack(currentProject.id, selectedTrack, { effects });
                }}
                onEffectUpdate={(index, paramName, value) => {
                  if (!currentProject) return;
                  const track = (currentProject.tracks || []).find(t => t.id === selectedTrack);
                  const effects = [...(track?.effects || [])];
                  const effect = effects[index];
                  if (!effect) return;
                  if (paramName === 'enabled') {
                    effect.parameters = effect.parameters.map(p => p.name === 'enabled' ? { ...p, value } : p);
                  } else {
                    effect.parameters = effect.parameters.map(p => p.name === paramName ? { ...p, value } : p);
                  }
                  projectUpdateTrack(currentProject.id, selectedTrack, { effects });
                }}
              />
            )}
          </div>
        </div>

        {/* Mobile: show only one panel at a time (tracks/timeline/browser) - keep timeline for now */}
      </div>

      {/* Bottom Mixer */}
      <Mixer
        tracks={(currentProject?.tracks || []).map(t => ({ ...t, level: (trackLevels && trackLevels[t.id]) || 0 }))}
        selectedTrack={selectedTrack}
        onTrackSelect={setSelectedTrack}
        onTrackMuteToggle={toggleTrackMute}
        onTrackSoloToggle={toggleTrackSolo}
        onTrackRecordToggle={(trackId) => {
          if (!currentProject) return;
          const track = (currentProject.tracks || []).find(t => t.id === trackId);
          if (!track) return;
          projectUpdateTrack(currentProject.id, trackId, { isRecording: !track.isRecording });
        }}
        onTrackVolumeChange={updateTrackVolume}
        onTrackPanChange={updateTrackPan}
        masterVolume={masterVolume}
        onMasterVolumeChange={(v) => updateMasterVolume(Array.isArray(v) ? v[0] : v)}
        masterLevel={typeof masterLevel === 'number' ? masterLevel : 0}
      />

      {/* Modals and status bar unchanged */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      {showExportModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#242529] border border-gray-700 rounded-lg p-4 sm:p-6 w-full max-w-md">
            {/* LED de count-in (visual) */}
            {countInEnabled && (
              <div className="absolute -top-3 right-3 w-3 h-3 rounded-full bg-[#ff4500] animate-pulse" title="Count-in ativo" />
            )}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-medium text-white">Export Mixdown</h3>
              <Button onClick={() => setShowExportModal(false)} variant="ghost" size="sm" className="text-gray-300 hover:text-white w-6 h-6 p-0" disabled={isExporting}>×</Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Filename</label>
                <Input value={exportFilename} onChange={(e) => setExportFilename(e.target.value)} className="bg-[#1a1a1b] border-gray-700 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Start</label>
                  <Input value={0} readOnly className="bg-[#1a1a1b] border-gray-700 text-white" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">End (s)</label>
                  <Input type="number" min={1} value={exportDuration} onChange={(e) => setExportDuration(Math.max(1, Number(e.target.value)||1))} className="bg-[#1a1a1b] border-gray-700 text-white" />
                </div>
              </div>
              <div className="text-xs text-gray-400">Estimated duration: {exportDuration}s</div>
              {isExporting && (<div className="flex items-center space-x-2 text-[#ff4500]"><div className="w-4 h-4 border-2 border-[#ff4500] border-t-transparent rounded-full animate-spin"></div><span className="text-sm">Exporting...</span></div>)}
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button onClick={() => setShowExportModal(false)} variant="ghost" className="text-gray-300 hover:text-white" disabled={isExporting}>Cancel</Button>
              <Button onClick={handleExport} className="bg-[#ff4500] hover:bg-[#ff5722] text-white" disabled={isExporting}>Export</Button>
            </div>
          </div>
        </div>
      )}

      <AudioActivationPrompt isVisible={showAudioActivationPrompt} onActivate={handleAudioActivation} onDismiss={handleDismissAudioPrompt} title="Ativar Áudio" message="Clique para habilitar reprodução de áudio para esta sessão" />
    </div>
  );
};

export default Studio;