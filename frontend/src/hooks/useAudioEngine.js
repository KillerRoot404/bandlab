import { useState, useRef, useCallback, useEffect } from 'react';

export const useAudioEngine = () => {
  const [audioContext, setAudioContext] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [bpm, setBpm] = useState(120);
  const [masterVolume, setMasterVolume] = useState(0.8);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordedClipsRef = useRef({});
  const playbackSourcesRef = useRef([]);
  const masterGainNodeRef = useRef(null);
  const metronomeRef = useRef(null);
  const playbackStartTimeRef = useRef(0);
  const animationFrameRef = useRef(null);

  // Initialize Audio Context
  const initializeAudioContext = useCallback(async () => {
    if (!audioContext) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create master gain node
      const masterGain = ctx.createGain();
      masterGain.connect(ctx.destination);
      masterGain.gain.value = masterVolume;
      masterGainNodeRef.current = masterGain;
      
      setAudioContext(ctx);
      return ctx;
    }
    return audioContext;
  }, [audioContext, masterVolume]);

  // Start Recording
  const startRecording = useCallback(async (trackId) => {
    try {
      const ctx = await initializeAudioContext();
      
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
      mediaRecorder.start(100); // Record in 100ms chunks
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

  // Play Audio Buffer
  const playAudioBuffer = useCallback((audioBuffer, startTime = 0, when = 0) => {
    if (!audioContext || !masterGainNodeRef.current) return null;

    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();
    
    source.buffer = audioBuffer;
    source.connect(gainNode);
    gainNode.connect(masterGainNodeRef.current);
    gainNode.gain.value = 0.7;
    
    source.start(when, startTime);
    playbackSourcesRef.current.push(source);
    
    return source;
  }, [audioContext]);

  // Create Metronome
  const createMetronome = useCallback(() => {
    if (!audioContext) return;
    
    const beatInterval = 60 / bpm;
    let nextBeatTime = audioContext.currentTime;
    
    const scheduleBeat = () => {
      while (nextBeatTime < audioContext.currentTime + 0.1) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.frequency.value = 800;
        oscillator.connect(gainNode);
        gainNode.connect(masterGainNodeRef.current);
        
        gainNode.gain.setValueAtTime(0.1, nextBeatTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, nextBeatTime + 0.1);
        
        oscillator.start(nextBeatTime);
        oscillator.stop(nextBeatTime + 0.1);
        
        nextBeatTime += beatInterval;
      }
    };
    
    return scheduleBeat;
  }, [audioContext, bpm]);

  // Start Playback
  const startPlayback = useCallback(async (fromTime = 0) => {
    const ctx = await initializeAudioContext();
    
    // Stop any existing playback
    stopPlayback();
    
    const now = ctx.currentTime;
    playbackStartTimeRef.current = now - fromTime;
    
    // Play all recorded clips
    Object.values(recordedClipsRef.current).forEach((clip) => {
      const clipStartTime = clip.startTime - fromTime;
      if (clipStartTime >= -clip.duration) {
        const playOffset = Math.max(0, fromTime - clip.startTime);
        const whenToStart = Math.max(now, now + clipStartTime);
        playAudioBuffer(clip.buffer, playOffset, whenToStart);
      }
    });
    
    setIsPlaying(true);
    setCurrentTime(fromTime);
    
    // Start time update loop
    const updateTime = () => {
      if (isPlaying) {
        setCurrentTime(ctx.currentTime - playbackStartTimeRef.current);
        animationFrameRef.current = requestAnimationFrame(updateTime);
      }
    };
    updateTime();
    
  }, [initializeAudioContext, playAudioBuffer, isPlaying]);

  // Stop Playback
  const stopPlayback = useCallback(() => {
    playbackSourcesRef.current.forEach(source => {
      try {
        source.stop();
      } catch (e) {
        // Source might already be stopped
      }
    });
    playbackSourcesRef.current = [];
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    setIsPlaying(false);
  }, []);

  // Set Master Volume
  const updateMasterVolume = useCallback((volume) => {
    setMasterVolume(volume);
    if (masterGainNodeRef.current) {
      masterGainNodeRef.current.gain.value = volume / 100;
    }
  }, []);

  // Get recorded clips for a specific track
  const getTrackClips = useCallback((trackId) => {
    return Object.values(recordedClipsRef.current)
      .filter(clip => clip.trackId === trackId)
      .map(clip => ({
        id: clip.id,
        name: clip.name,
        startTime: clip.startTime,
        duration: clip.duration,
        buffer: clip.buffer
      }));
  }, []);

  // Delete a clip
  const deleteClip = useCallback((clipId) => {
    delete recordedClipsRef.current[clipId];
  }, []);

  // Move a clip
  const moveClip = useCallback((clipId, newStartTime) => {
    if (recordedClipsRef.current[clipId]) {
      recordedClipsRef.current[clipId].startTime = newStartTime;
    }
  }, []);

  // Generate waveform data
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

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopPlayback();
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close();
      }
    };
  }, [audioContext, stopPlayback]);

  return {
    // States
    isRecording,
    isPlaying,
    currentTime,
    bpm,
    masterVolume,
    
    // Actions
    startRecording,
    stopRecording,
    startPlayback,
    stopPlayback,
    updateMasterVolume,
    setBpm,
    setCurrentTime,
    
    // Clip management
    getTrackClips,
    deleteClip,
    moveClip,
    generateWaveform,
    
    // Audio context
    audioContext,
    initializeAudioContext
  };
};