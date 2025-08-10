import { useState, useRef, useCallback, useEffect } from 'react';
import { useAudioContextManager } from './useAudioContextManager';

export const useAudioEngine = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [bpm, setBpm] = useState(120);
  const [masterVolume, setMasterVolume] = useState(80);
  
  // Meters
  const [masterLevel, setMasterLevel] = useState(0);
  const [trackLevels, setTrackLevels] = useState({}); // { [trackId]: 0..1 }
  const getMasterLevel = useCallback(() => masterLevel, [masterLevel]);
  const getTrackLevels = useCallback(() => trackLevels, [trackLevels]);

  
  // Metronome UI values
  const [metronomeVolume, setMetronomeVolume] = useState(60);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordedClipsRef = useRef({});
  const uploadedClipsRef = useRef({}); // store uploaded clips
  const playbackSourcesRef = useRef([]);
  const playbackStartTimeRef = useRef(0);
  const animationFrameRef = useRef(null);
  const audioBufferCache = useRef(new Map()); // Cache for uploaded audio buffers

  // Loop config refs
  const loopEnabledRef = useRef(false);
  const loopStartRef = useRef(0);
  const loopEndRef = useRef(Infinity);

  // Metronome internals
  const metronomeEnabledRef = useRef(false);
  const metronomeGainNodeRef = useRef(null);
  const metronomeSchedulerRef = useRef(null); // setInterval id
  const nextClickTimeRef = useRef(0);
  const beatCounterRef = useRef(0);

  // Mixer nodes per track for meters and routing
  const trackNodesRef = useRef(new Map()); // trackId -> { gain, analyser }

  // Centralized audio context manager
  const {
    audioContext,
    masterGainNode,
    isAudioContextSuspended,
    userHasInteracted,
    autoplayBlocked,
    ensureAudioContextReady,
    requestAudioActivation,
    updateMasterVolume: updateContextMasterVolume
  } = useAudioContextManager();

  // Initialize Audio Context via manager
  const initializeAudioContext = useCallback(async () => {
    try {
      const ctx = await ensureAudioContextReady();
      // Ensure metronome gain exists and is connected
      if (ctx && !metronomeGainNodeRef.current && masterGainNode) {
        const mg = ctx.createGain();
        mg.gain.value = metronomeVolume / 100;
        mg.connect(masterGainNode);
        metronomeGainNodeRef.current = mg;
      }
      return ctx;
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      throw error;
    }
  }, [ensureAudioContextReady, masterGainNode, metronomeVolume]);
  // Master analyser for meters
  const masterAnalyserRef = useRef(null);
  const trackAnalyserMapRef = useRef(new Map());
  const masterSmoothRef = useRef(0);
  const trackSmoothMapRef = useRef(new Map());


  // Helpers to create a tick sound
  const scheduleMetronomeClick = useCallback((when, accent = false) => {
    if (!audioContext || !metronomeGainNodeRef.current) return;
    try {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const freq = accent ? 1200 : 800;

      osc.frequency.setValueAtTime(freq, when);
      osc.connect(gain);
      gain.connect(metronomeGainNodeRef.current);

      const level = (metronomeVolume / 100) * 0.6 + (accent ? 0.1 : 0);
      gain.gain.setValueAtTime(level, when);
      gain.gain.exponentialRampToValueAtTime(0.001, when + 0.08);

      osc.start(when);
      osc.stop(when + 0.09);
    } catch (e) {
      // Ignore scheduling errors
    }
  }, [audioContext, metronomeVolume]);

  const startMetronome = useCallback(async () => {
    const ctx = await initializeAudioContext();
    if (!ctx) return;
    // Ensure master analyser
    if (ctx && masterGainNode && !masterAnalyserRef.current) {
      const an = ctx.createAnalyser();
      an.fftSize = 256;
      masterGainNode.connect(an);
      masterAnalyserRef.current = an;
    }


    // Prepare gain if missing
    if (!metronomeGainNodeRef.current && masterGainNode) {
      const mg = ctx.createGain();
      mg.gain.value = metronomeVolume / 100;
      mg.connect(masterGainNode);
      metronomeGainNodeRef.current = mg;
    }

    const lookahead = 25; // ms
    const scheduleAheadTime = 0.15; // s
    const beatInterval = 60 / Math.max(1, bpm);

    // Align next click to the next small slice to avoid burst at time 0
    nextClickTimeRef.current = ctx.currentTime + 0.05;
    // If we want 4/4 accent, reset counter so first beat gets accent
    beatCounterRef.current = 0;

    const scheduler = () => {
      if (!metronomeEnabledRef.current) return;
      const ct = ctx.currentTime;
      while (nextClickTimeRef.current < ct + scheduleAheadTime) {
        const count = beatCounterRef.current % 4;
        const accent = (count === 0);
        scheduleMetronomeClick(nextClickTimeRef.current, accent);
        nextClickTimeRef.current += beatInterval;
        beatCounterRef.current += 1;
      }
    };

    if (metronomeSchedulerRef.current) {
      clearInterval(metronomeSchedulerRef.current);
    }
    metronomeSchedulerRef.current = setInterval(scheduler, lookahead);
  }, [initializeAudioContext, bpm, masterGainNode, metronomeVolume, scheduleMetronomeClick]);

  const stopMetronome = useCallback(() => {
    if (metronomeSchedulerRef.current) {
      clearInterval(metronomeSchedulerRef.current);
      metronomeSchedulerRef.current = null;
    }
  }, []);

  // Public metronome controls
  const setMetronomeEnabled = useCallback(async (enabled) => {
    metronomeEnabledRef.current = !!enabled;
    if (metronomeEnabledRef.current && isPlayingRef.current) {
      try { await startMetronome(); } catch (e) {}
    } else if (!metronomeEnabledRef.current) {
      stopMetronome();
    }
  }, [startMetronome, stopMetronome]);

  const updateMetronomeVolume = useCallback((vol) => {
    const v = Math.max(0, Math.min(100, vol));
    setMetronomeVolume(v);
    if (metronomeGainNodeRef.current) {
      try { metronomeGainNodeRef.current.gain.value = v / 100; } catch (e) {}
    }
  }, []);

  // Count-in clicks regardless of metronome toggle
  const playCountIn = useCallback(async ({ bars = 1, beatsPerBar = 4 } = {}) => {
    const ctx = await initializeAudioContext();
    if (!ctx) return;
    // Ensure gain node exists
    if (!metronomeGainNodeRef.current && masterGainNode) {
      const mg = ctx.createGain();
      mg.gain.value = metronomeVolume / 100;
      mg.connect(masterGainNode);
      metronomeGainNodeRef.current = mg;
    }
    const beatInterval = 60 / Math.max(1, bpm);
    const totalBeats = Math.max(1, Math.round(bars)) * Math.max(1, Math.round(beatsPerBar));
    let when = ctx.currentTime + 0.05;
    for (let i = 0; i < totalBeats; i++) {
      const accent = (i % beatsPerBar) === 0;
      scheduleMetronomeClick(when, accent);
      when += beatInterval;
    }
    // Wait until the last click would have played
    const waitMs = (when - ctx.currentTime) * 1000;
    await new Promise((res) => setTimeout(res, waitMs));
  }, [initializeAudioContext, masterGainNode, metronomeVolume, bpm, scheduleMetronomeClick]);

  // Start Recording
  const startRecording = useCallback(async (trackId) => {
    try {
      const ctx = await initializeAudioContext();

      // Ensure running
      if (ctx.state !== 'running') {
        try { await ctx.resume(); } catch (e) { /* ignore */ }
        if (ctx.state !== 'running') throw new Error('AudioContext suspenso');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 44100
        } 
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audioBuffer = await fetch(audioUrl)
          .then(response => response.arrayBuffer())
          .then(data => ctx.decodeAudioData(data));
          
        // Store the recorded clip
        const clipId = `clip_${trackId}_${Date.now()}`;
        recordedClipsRef.current[clipId] = {
          id: clipId,
          trackId,
          buffer: audioBuffer,
          startTime: playbackStartTimeRef.current,
          duration: audioBuffer.duration,
          name: `Recording ${Object.keys(recordedClipsRef.current).length + 1}`
        };
        
        // Clean up
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100);
      setIsRecording(true);
      playbackStartTimeRef.current = currentTime;
      
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Unable to access microphone. Please check permissions.');
    }
  }, [initializeAudioContext, currentTime]);

  // Stop Recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  // Add uploaded clip to the audio engine
  const addUploadedClip = useCallback((clipData) => {
    uploadedClipsRef.current[clipData.id] = {
      id: clipData.id,
      trackId: clipData.track_id,
      startTime: clipData.start_time || 0,
      duration: clipData.duration || 3,
      name: clipData.name || 'Uploaded Audio',
      fileUrl: clipData.file_url,
      buffer: null // Will be loaded when needed
    };
  }, []);

  // Load audio buffer from URL
  const loadAudioBuffer = useCallback(async (url) => {
    if (audioBufferCache.current.has(url)) {
      return audioBufferCache.current.get(url);
    }

    try {
      const ctx = await initializeAudioContext();
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      
      audioBufferCache.current.set(url, audioBuffer);
      return audioBuffer;
    } catch (error) {
      console.error('Error loading audio buffer:', error);
      return null;
    }
  }, [initializeAudioContext]);

  // Play audio buffer with proper routing
  const playAudioBuffer = useCallback((audioBuffer, startTime = 0, when = 0, volume = 0.7, trackId = null) => {
    if (!audioContext || !masterGainNode) return null;

    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();

    // Per-track nodes (gain + analyser) for meters
    let trackGain = null;
    let trackAnalyser = null;
    if (trackId != null) {
      let nodes = trackNodesRef.current.get(trackId);
      if (!nodes) {
        trackGain = audioContext.createGain();
        trackAnalyser = audioContext.createAnalyser();
        trackAnalyser.fftSize = 256;
        trackGain.connect(trackAnalyser);
        trackAnalyser.connect(masterGainNode);
        nodes = { gain: trackGain, analyser: trackAnalyser };
        trackNodesRef.current.set(trackId, nodes);
      } else {
        trackGain = nodes.gain;
        trackAnalyser = nodes.analyser;
      }
    }

    source.buffer = audioBuffer;
    source.connect(gainNode);
    gainNode.gain.value = volume;

    if (trackGain) {
      gainNode.connect(trackGain);
    } else {
      gainNode.connect(masterGainNode);
    }
    
    const actualStartTime = when || audioContext.currentTime;
    source.start(actualStartTime, Math.max(0, startTime));
    playbackSourcesRef.current.push(source);
    
    // Auto-cleanup when finished
    source.onended = () => {
      const index = playbackSourcesRef.current.indexOf(source);
      if (index > -1) {
        playbackSourcesRef.current.splice(index, 1);
      }
    };
    
    return source;
  }, [audioContext, masterGainNode]);

  // Generate demo audio buffer for testing
  const generateDemoAudioBuffer = useCallback((duration = 3, frequency = 440, type = 'vocal') => {
    if (!audioContext) return null;
    
    const sampleRate = audioContext.sampleRate;
    const numSamples = duration * sampleRate;
    const buffer = audioContext.createBuffer(1, numSamples, sampleRate);
    const data = buffer.getChannelData(0);
    
    if (type === 'vocal') {
      for (let i = 0; i < numSamples; i++) {
        const time = i / sampleRate;
        const envelope = Math.exp(-time * 0.5);
        data[i] = envelope * (
          0.5 * Math.sin(2 * Math.PI * frequency * time) +
          0.3 * Math.sin(2 * Math.PI * frequency * 2 * time) +
          0.2 * Math.sin(2 * Math.PI * frequency * 3 * time)
        ) * 0.3;
      }
    } else if (type === 'piano') {
      for (let i = 0; i < numSamples; i++) {
        const time = i / sampleRate;
        const envelope = Math.exp(-time * 1.5);
        data[i] = envelope * (
          0.6 * Math.sin(2 * Math.PI * frequency * time) +
          0.4 * Math.sin(2 * Math.PI * frequency * 2 * time) +
          0.2 * Math.sin(2 * Math.PI * frequency * 4 * time)
        ) * 0.4;
      }
    }
    
    return buffer;
  }, [audioContext]);

  // Stop Playback (defined before startPlayback to avoid TDZ issues)
  const stopPlayback = useCallback(() => {
    // Stop all playing sources
    playbackSourcesRef.current.forEach((source) => {
      try { source.stop(); } catch (e) {}
    });
    playbackSourcesRef.current = [];

    // Cancel animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Stop metronome if running
    try { stopMetronome(); } catch (e) {}

    // Update state
    setIsPlaying(false);
    isPlayingRef.current = false;
  }, [stopMetronome]);

  // Start Playback (supports loop and metronome)
  const startPlayback = useCallback(async (fromTime = 0, tracksData = [], options = {}) => {
    const ctx = await initializeAudioContext();

    // Apply loop options
    const { loopEnabled = false, loopStart = 0, loopEnd = Infinity } = options || {};
    loopEnabledRef.current = !!loopEnabled;
    loopStartRef.current = Math.max(0, Number(loopStart) || 0);
    loopEndRef.current = Math.max(loopStartRef.current + 0.05, Number(loopEnd) || Infinity);

    // Ensure context running (better for Safari)
    if (ctx.state !== 'running') {
      try { await ctx.resume(); } catch (e) { /* ignore */ }
    }
    if (ctx.state !== 'running') {
      throw new Error('AudioContext suspenso');
    }
    
    // Stop any existing playback
    stopPlayback();
    
    const now = ctx.currentTime;
    playbackStartTimeRef.current = now - fromTime;

    // Start metronome if enabled
    if (metronomeEnabledRef.current) {
      try { await startMetronome(); } catch (e) {}
    }

    // Start meters loop (master + tracks)
    const meterLoop = () => {
      // Master
      if (masterAnalyserRef.current) {
        const arr = new Uint8Array(masterAnalyserRef.current.frequencyBinCount);
        masterAnalyserRef.current.getByteTimeDomainData(arr);
        let peak = 0; for (let i = 0; i < arr.length; i++) { const v = Math.abs(arr[i] - 128) / 128; if (v > peak) peak = v; }
        // Smooth with decay
        const prev = masterSmoothRef.current || 0;
        const smoothed = Math.max(peak, prev * 0.85);
        masterSmoothRef.current = smoothed;
        setMasterLevel(smoothed);
      }
      // Tracks
      if (trackNodesRef.current.size > 0) {
        const next = {};
        trackNodesRef.current.forEach((nodes, tid) => {
          try {
            const an = nodes.analyser;
            if (!an) return;
            const arr = new Uint8Array(an.frequencyBinCount);
            an.getByteTimeDomainData(arr);
            let peak = 0; for (let i = 0; i < arr.length; i++) { const v = Math.abs(arr[i] - 128) / 128; if (v > peak) peak = v; }
            const prev = trackSmoothMapRef.current.get(tid) || 0;
            const smoothed = Math.max(peak, prev * 0.85);
            trackSmoothMapRef.current.set(tid, smoothed);
            next[tid] = smoothed;
          } catch {}
        });
        setTrackLevels(next);
      }
      if (isPlayingRef.current) {
        animationFrameRef.current = requestAnimationFrame(meterLoop);
      }
    };
    isPlayingRef.current = true;
    setIsPlaying(true);
    meterLoop();
    
    // Recorded clips
    Object.values(recordedClipsRef.current).forEach((clip) => {
      const clipStartTime = clip.startTime - fromTime;
      if (clipStartTime >= -clip.duration) {
        const playOffset = Math.max(0, fromTime - clip.startTime);
        const whenToStart = Math.max(now, now + clipStartTime);
        playAudioBuffer(clip.buffer, playOffset, whenToStart, 0.7, clip.trackId);
      }
    });
    
    // Uploaded clips
    Object.values(uploadedClipsRef.current).forEach(async (clip) => {
      const clipStartTime = clip.startTime - fromTime;
      if (clipStartTime >= -clip.duration) {
        try {
          if (!clip.buffer && clip.fileUrl) {
            clip.buffer = await loadAudioBuffer(clip.fileUrl);
          }
          if (clip.buffer) {
            const playOffset = Math.max(0, fromTime - clip.startTime);
            const whenToStart = Math.max(now, now + clipStartTime);
            playAudioBuffer(clip.buffer, playOffset, whenToStart, (clip.volume || 70) / 100, clip.trackId);
          }
        } catch (error) {
          console.error('Error playing uploaded clip:', clip.id, error);
        }
      }
    });
    
    // Timeline clips from tracksData
    tracksData.forEach((track) => {
      if (track.clips && !track.muted) {
        track.clips.forEach((clip) => {
          const clipStartTime = clip.start_time - fromTime;
          if (clipStartTime >= -clip.duration) {
            try {
              let audioBuffer = null;
              if (clip.type === 'demo') {
                const clipType = track.name.toLowerCase().includes('piano') ? 'piano' : 'vocal';
                const frequency = clipType === 'piano' ? 523.25 : 220;
                audioBuffer = generateDemoAudioBuffer(clip.duration, frequency, clipType);
              } else if (clip.buffer) {
                audioBuffer = clip.buffer;
              }
              if (audioBuffer) {
                const playOffset = Math.max(0, fromTime - clip.start_time);
                const whenToStart = Math.max(now, now + clipStartTime);
                const volume = (track.volume || 80) / 100;
                playAudioBuffer(audioBuffer, playOffset, whenToStart, volume, clip.trackId || track.id);
              }
            } catch (error) {
              console.error('Error playing track clip:', clip.id, error);
            }
          }
        });
      }
    });
    
    isPlayingRef.current = true;
    setIsPlaying(true);
    setCurrentTime(fromTime);
    
    const updateTime = () => {
      if (!isPlayingRef.current) return;
      const newTime = ctx.currentTime - playbackStartTimeRef.current;

      // Loop handling
      if (loopEnabledRef.current && Number.isFinite(loopEndRef.current)) {
        if (newTime >= loopEndRef.current) {
          // Wrap to loopStart
          try { stopPlayback(); } catch (e) {}
          setTimeout(() => {
            try {
              startPlayback(loopStartRef.current, tracksData, {
                loopEnabled: loopEnabledRef.current,
                loopStart: loopStartRef.current,
                loopEnd: loopEndRef.current,
              });
            } catch (e) {
              console.error('Loop restart error:', e);
            }
          }, 0);
          return;
        }
      }

      setCurrentTime(newTime);
      animationFrameRef.current = requestAnimationFrame(updateTime);
    };
    updateTime();
    
  }, [initializeAudioContext, playAudioBuffer, loadAudioBuffer, generateDemoAudioBuffer, startMetronome, stopPlayback]);

  // Set Master Volume
  const updateMasterVolume = useCallback((volume) => {
    setMasterVolume(volume);
    updateContextMasterVolume(volume);
  }, [updateContextMasterVolume]);

  // Clips getters/mutators
  const getTrackClips = useCallback((trackId) => {
    const recordedClips = Object.values(recordedClipsRef.current)
      .filter(clip => clip.trackId === trackId)
      .map(clip => ({
        id: clip.id,
        name: clip.name,
        start_time: clip.startTime,
        duration: clip.duration,
        buffer: clip.buffer,
        type: 'recorded'
      }));

    const uploadedClips = Object.values(uploadedClipsRef.current)
      .filter(clip => clip.trackId === trackId)
      .map(clip => ({
        id: clip.id,
        name: clip.name,
        start_time: clip.startTime,
        duration: clip.duration,
        buffer: clip.buffer,
        file_url: clip.fileUrl,
        type: 'uploaded'
      }));

    return [...recordedClips, ...uploadedClips].sort((a, b) => a.start_time - b.start_time);
  }, []);

  const deleteClip = useCallback((clipId) => {
    if (recordedClipsRef.current[clipId]) delete recordedClipsRef.current[clipId];
    if (uploadedClipsRef.current[clipId]) {
      const clip = uploadedClipsRef.current[clipId];
      if (clip.fileUrl && audioBufferCache.current.has(clip.fileUrl)) {
        audioBufferCache.current.delete(clip.fileUrl);
      }
      delete uploadedClipsRef.current[clipId];
    }
  }, []);

  const moveClip = useCallback((clipId, newStartTime) => {
    if (recordedClipsRef.current[clipId]) {
      recordedClipsRef.current[clipId].startTime = newStartTime;
    }
    if (uploadedClipsRef.current[clipId]) {
      uploadedClipsRef.current[clipId].startTime = newStartTime;
    }
  }, []);

  const generateWaveform = useCallback((audioBuffer, width = 100) => {
    if (!audioBuffer) return [];
    const channelData = audioBuffer.getChannelData(0);
    const samplesPerPixel = Math.floor(channelData.length / width);
    const waveform = [];
    for (let i = 0; i < width; i++) {
      const start = i * samplesPerPixel;
      const end = start + samplesPerPixel;
      let max = 0;
      for (let j = start; j < end; j++) {
        const sample = Math.abs(channelData[j]);
        if (sample > max) max = sample;
      }
      waveform.push(max);
    }
    return waveform;
  }, []);

  // Clean up on unmount: não feche o AudioContext (evita estado "closed")
  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, [stopPlayback]);

  return {
    // States
    isRecording,
    isPlaying,
    currentTime,
    bpm,
    masterVolume,
    metronomeVolume,
    masterLevel,
    trackLevels,

    // Audio Context Manager states
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

    // Metronome controls
    setMetronomeEnabled,
    setMetronomeVolume: updateMetronomeVolume,

    // Count-in action
    playCountIn,

    // Clip management
    getTrackClips,
    deleteClip,
    moveClip,
    generateWaveform,
    addUploadedClip,
    loadAudioBuffer,
    playAudioBuffer,

    // Audio context
    audioContext,
    initializeAudioContext,
    masterGainNode,
    requestAudioActivation,
    getMasterLevel,
    getTrackLevels,
  };
};