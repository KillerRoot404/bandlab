import { useState, useRef, useCallback } from 'react';
import axios from 'axios';

export const useSamples = () => {
  const [samplePacks] = useState([
    {
      id: 'hip_hop_essentials',
      name: 'Hip Hop Essentials',
      description: 'Essential hip hop drums and samples',
      genre: 'Hip Hop',
      bpm: 90,
      samples_count: 25,
      color: '#ef4444',
      samples: [
        {
          id: 'hh_kick_1',
          name: 'Heavy Kick',
          type: 'kick',
          duration: 0.5,
          key: 'C',
          tags: ['drum', 'kick', '808'],
          audioData: null // Would be loaded dynamically
        },
        {
          id: 'hh_snare_1',
          name: 'Trap Snare',
          type: 'snare',
          duration: 0.3,
          key: null,
          tags: ['drum', 'snare', 'trap'],
          audioData: null
        },
        {
          id: 'hh_hihat_1',
          name: 'Closed Hi-Hat',
          type: 'hihat',
          duration: 0.1,
          key: null,
          tags: ['drum', 'hihat', 'closed'],
          audioData: null
        },
        {
          id: 'hh_loop_1',
          name: 'Boom Bap Loop',
          type: 'loop',
          duration: 4.0,
          key: 'Fm',
          tags: ['loop', 'boom bap', 'vintage'],
          audioData: null
        },
        {
          id: 'hh_bass_1',
          name: '808 Bass Hit',
          type: 'bass',
          duration: 1.5,
          key: 'C',
          tags: ['bass', '808', 'sub'],
          audioData: null
        }
      ]
    },
    {
      id: 'electronic_vibes',
      name: 'Electronic Vibes',
      description: 'Modern electronic sounds and loops',
      genre: 'Electronic',
      bpm: 128,
      samples_count: 30,
      color: '#8b5cf6',
      samples: [
        {
          id: 'ev_kick_1',
          name: 'House Kick',
          type: 'kick',
          duration: 0.4,
          key: 'C',
          tags: ['drum', 'kick', 'house'],
          audioData: null
        },
        {
          id: 'ev_bass_1',
          name: 'Acid Bass',
          type: 'bass',
          duration: 2.0,
          key: 'A',
          tags: ['bass', 'acid', 'synth'],
          audioData: null
        },
        {
          id: 'ev_lead_1',
          name: 'Pluck Lead',
          type: 'lead',
          duration: 1.0,
          key: 'E',
          tags: ['lead', 'pluck', 'synth'],
          audioData: null
        },
        {
          id: 'ev_pad_1',
          name: 'Warm Pad',
          type: 'pad',
          duration: 4.0,
          key: 'Am',
          tags: ['pad', 'warm', 'ambient'],
          audioData: null
        },
        {
          id: 'ev_fx_1',
          name: 'Riser FX',
          type: 'fx',
          duration: 2.0,
          key: null,
          tags: ['fx', 'riser', 'build-up'],
          audioData: null
        }
      ]
    },
    {
      id: 'lofi_chill',
      name: 'Lo-Fi Chill',
      description: 'Chill lo-fi beats and textures',
      genre: 'Lo-Fi',
      bpm: 85,
      samples_count: 20,
      color: '#10b981',
      samples: [
        {
          id: 'lf_kick_1',
          name: 'Soft Kick',
          type: 'kick',
          duration: 0.6,
          key: 'C',
          tags: ['drum', 'kick', 'soft', 'vinyl'],
          audioData: null
        },
        {
          id: 'lf_snare_1',
          name: 'Dusty Snare',
          type: 'snare',
          duration: 0.4,
          key: null,
          tags: ['drum', 'snare', 'dusty', 'vintage'],
          audioData: null
        },
        {
          id: 'lf_piano_1',
          name: 'Dusty Piano',
          type: 'piano',
          duration: 3.0,
          key: 'Cm',
          tags: ['piano', 'dusty', 'jazz', 'vintage'],
          audioData: null
        },
        {
          id: 'lf_vinyl_1',
          name: 'Vinyl Crackle',
          type: 'texture',
          duration: 8.0,
          key: null,
          tags: ['texture', 'vinyl', 'crackle', 'atmosphere'],
          audioData: null
        }
      ]
    },
    {
      id: 'trap_beats',
      name: 'Trap Beats',
      description: 'Hard-hitting trap drums',
      genre: 'Trap',
      bpm: 140,
      samples_count: 15,
      color: '#f59e0b',
      samples: [
        {
          id: 'tb_kick_1',
          name: 'Trap Kick',
          type: 'kick',
          duration: 0.8,
          key: 'C',
          tags: ['drum', 'kick', 'trap', 'hard'],
          audioData: null
        },
        {
          id: 'tb_snare_1',
          name: 'Trap Snare',
          type: 'snare',
          duration: 0.2,
          key: null,
          tags: ['drum', 'snare', 'trap', 'crack'],
          audioData: null
        },
        {
          id: 'tb_hihat_1',
          name: 'Trap Hi-Hat',
          type: 'hihat',
          duration: 0.1,
          key: null,
          tags: ['drum', 'hihat', 'trap', 'roll'],
          audioData: null
        },
        {
          id: 'tb_808_1',
          name: 'Trap 808',
          type: 'bass',
          duration: 2.0,
          key: 'F',
          tags: ['bass', '808', 'trap', 'sub'],
          audioData: null
        }
      ]
    },
    {
      id: 'ambient_textures',
      name: 'Ambient Textures',
      description: 'Atmospheric sounds and textures',
      genre: 'Ambient',
      bpm: 70,
      samples_count: 18,
      color: '#06b6d4',
      samples: [
        {
          id: 'at_pad_1',
          name: 'Deep Pad',
          type: 'pad',
          duration: 8.0,
          key: 'Dm',
          tags: ['pad', 'deep', 'dark', 'ambient'],
          audioData: null
        },
        {
          id: 'at_texture_1',
          name: 'Wind Texture',
          type: 'texture',
          duration: 6.0,
          key: null,
          tags: ['texture', 'wind', 'nature', 'ambient'],
          audioData: null
        },
        {
          id: 'at_drone_1',
          name: 'Dark Drone',
          type: 'drone',
          duration: 10.0,
          key: 'A',
          tags: ['drone', 'dark', 'ambient', 'sustain'],
          audioData: null
        }
      ]
    }
  ]);

  const [loadedSamples, setLoadedSamples] = useState(new Map());
  const audioContextRef = useRef(null);
  const currentlyPlayingRef = useRef(new Map());

  // Initialize audio context
  const initializeAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Generate synthetic samples (since we don't have actual audio files)
  const generateSample = useCallback((sample) => {
    const audioContext = initializeAudioContext();
    const sampleRate = audioContext.sampleRate;
    const duration = sample.duration;
    const channels = 2;
    const buffer = audioContext.createBuffer(channels, duration * sampleRate, sampleRate);

    for (let channel = 0; channel < channels; channel++) {
      const channelData = buffer.getChannelData(channel);

      switch (sample.type) {
        case 'kick': {
          // Generate kick drum
          for (let i = 0; i < channelData.length; i++) {
            const t = i / sampleRate;
            const freq = 60 * Math.exp(-t * 10); // Frequency drops over time
            const envelope = Math.exp(-t * 8); // Amplitude envelope
            channelData[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.8;
          }
          break;
        }

        case 'snare': {
          // Generate snare drum (noise + tone)
          for (let i = 0; i < channelData.length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 15);
            const noise = (Math.random() * 2 - 1) * 0.3;
            const tone = Math.sin(2 * Math.PI * 200 * t) * 0.2;
            channelData[i] = (noise + tone) * envelope;
          }
          break;
        }

        case 'hihat': {
          // Generate hi-hat (high frequency noise)
          for (let i = 0; i < channelData.length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 30);
            const noise = (Math.random() * 2 - 1);
            // High-pass filter effect
            const filtered = noise * (1 - Math.exp(-t * 1000));
            channelData[i] = filtered * envelope * 0.4;
          }
          break;
        }

        case 'bass': {
          // Generate bass tone
          const freq = sample.key === 'C' ? 65.41 : 
                      sample.key === 'F' ? 87.31 :
                      sample.key === 'A' ? 110.00 : 65.41;
          
          for (let i = 0; i < channelData.length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 2);
            const fundamental = Math.sin(2 * Math.PI * freq * t);
            const harmonic = Math.sin(2 * Math.PI * freq * 2 * t) * 0.3;
            channelData[i] = (fundamental + harmonic) * envelope * 0.6;
          }
          break;
        }

        case 'lead': {
          // Generate lead synth
          const freq = sample.key === 'E' ? 329.63 : 440;
          
          for (let i = 0; i < channelData.length; i++) {
            const t = i / sampleRate;
            const envelope = t < 0.1 ? t * 10 : 1; // Attack
            const lfo = Math.sin(2 * Math.PI * 5 * t) * 0.1 + 1; // Vibrato
            channelData[i] = Math.sin(2 * Math.PI * freq * lfo * t) * envelope * 0.4;
          }
          break;
        }

        case 'pad': {
          // Generate pad sound
          const baseFreq = 220; // A3
          
          for (let i = 0; i < channelData.length; i++) {
            const t = i / sampleRate;
            const envelope = t < 0.5 ? t * 2 : 1; // Slow attack
            
            // Multiple harmonics for richness
            let signal = 0;
            signal += Math.sin(2 * Math.PI * baseFreq * t) * 0.5;
            signal += Math.sin(2 * Math.PI * baseFreq * 1.5 * t) * 0.3;
            signal += Math.sin(2 * Math.PI * baseFreq * 2 * t) * 0.2;
            
            channelData[i] = signal * envelope * 0.3;
          }
          break;
        }

        case 'piano': {
          // Generate piano-like sound
          const freq = 261.63; // C4
          
          for (let i = 0; i < channelData.length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 1.5);
            
            // Piano harmonics
            let signal = 0;
            signal += Math.sin(2 * Math.PI * freq * t) * 0.6;
            signal += Math.sin(2 * Math.PI * freq * 2 * t) * 0.3;
            signal += Math.sin(2 * Math.PI * freq * 3 * t) * 0.1;
            
            channelData[i] = signal * envelope * 0.5;
          }
          break;
        }

        case 'texture':
        case 'drone': {
          // Generate ambient texture
          for (let i = 0; i < channelData.length; i++) {
            const t = i / sampleRate;
            
            // Multiple sine waves for texture
            let signal = 0;
            signal += Math.sin(2 * Math.PI * 80 * t) * 0.3;
            signal += Math.sin(2 * Math.PI * 120 * t) * 0.2;
            signal += Math.sin(2 * Math.PI * 160 * t) * 0.1;
            
            // Add some noise
            signal += (Math.random() * 2 - 1) * 0.05;
            
            channelData[i] = signal * 0.2;
          }
          break;
        }

        case 'fx': {
          // Generate riser FX
          for (let i = 0; i < channelData.length; i++) {
            const t = i / sampleRate;
            const progress = t / duration;
            
            // Rising frequency
            const freq = 100 + (2000 * progress);
            const envelope = progress;
            
            // Noise sweep
            const noise = (Math.random() * 2 - 1) * progress;
            const tone = Math.sin(2 * Math.PI * freq * t) * 0.3;
            
            channelData[i] = (noise + tone) * envelope * 0.4;
          }
          break;
        }

        default: {
          // Default tone
          for (let i = 0; i < channelData.length; i++) {
            const t = i / sampleRate;
            channelData[i] = Math.sin(2 * Math.PI * 440 * t) * 0.3;
          }
        }
      }
    }

    return buffer;
  }, [initializeAudioContext]);

  // Load sample
  const loadSample = useCallback(async (sample) => {
    if (loadedSamples.has(sample.id)) {
      return loadedSamples.get(sample.id);
    }

    try {
      // For demo purposes, generate synthetic samples
      // In a real app, you'd fetch actual audio files
      const buffer = generateSample(sample);
      
      const loadedSample = {
        ...sample,
        buffer,
        loaded: true
      };

      setLoadedSamples(prev => {
        const newMap = new Map(prev);
        newMap.set(sample.id, loadedSample);
        return newMap;
      });

      return loadedSample;
    } catch (error) {
      console.error('Error loading sample:', error);
      return null;
    }
  }, [loadedSamples, generateSample]);

  // Play sample
  const playSample = useCallback(async (sample, options = {}) => {
    const {
      loop = false,
      volume = 1.0,
      playbackRate = 1.0,
      startTime = 0,
      when = 0
    } = options;

    const audioContext = initializeAudioContext();
    const loadedSample = await loadSample(sample);

    if (!loadedSample || !loadedSample.buffer) {
      console.error('Sample not loaded:', sample.id);
      return null;
    }

    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();

    source.buffer = loadedSample.buffer;
    source.loop = loop;
    source.playbackRate.value = playbackRate;
    
    gainNode.gain.value = volume;

    source.connect(gainNode);
    gainNode.connect(audioContext.destination);

    const startAt = when || audioContext.currentTime;
    source.start(startAt, startTime);

    // Store reference for stopping
    const playId = `${sample.id}-${Date.now()}`;
    currentlyPlayingRef.current.set(playId, {
      source,
      gainNode,
      sample: loadedSample
    });

    // Auto-remove when finished (if not looping)
    if (!loop) {
      source.onended = () => {
        currentlyPlayingRef.current.delete(playId);
      };
    }

    return {
      playId,
      stop: (when = audioContext.currentTime) => {
        source.stop(when);
        currentlyPlayingRef.current.delete(playId);
      },
      fadeOut: (duration = 1.0) => {
        const now = audioContext.currentTime;
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
        source.stop(now + duration);
        currentlyPlayingRef.current.delete(playId);
      }
    };
  }, [initializeAudioContext, loadSample]);

  // Stop sample
  const stopSample = useCallback((playId) => {
    const playing = currentlyPlayingRef.current.get(playId);
    if (playing) {
      playing.source.stop();
      currentlyPlayingRef.current.delete(playId);
    }
  }, []);

  // Stop all samples
  const stopAllSamples = useCallback(() => {
    currentlyPlayingRef.current.forEach((playing, playId) => {
      playing.source.stop();
    });
    currentlyPlayingRef.current.clear();
  }, []);

  // Get samples by type
  const getSamplesByType = useCallback((type) => {
    const allSamples = [];
    samplePacks.forEach(pack => {
      pack.samples.forEach(sample => {
        if (sample.type === type) {
          allSamples.push({ ...sample, packName: pack.name, packColor: pack.color });
        }
      });
    });
    return allSamples;
  }, [samplePacks]);

  // Get samples by pack
  const getSamplesByPack = useCallback((packId) => {
    const pack = samplePacks.find(p => p.id === packId);
    return pack ? pack.samples : [];
  }, [samplePacks]);

  // Search samples
  const searchSamples = useCallback((query) => {
    const results = [];
    const lowerQuery = query.toLowerCase();

    samplePacks.forEach(pack => {
      pack.samples.forEach(sample => {
        const matchesName = sample.name.toLowerCase().includes(lowerQuery);
        const matchesTags = sample.tags.some(tag => tag.toLowerCase().includes(lowerQuery));
        const matchesPack = pack.name.toLowerCase().includes(lowerQuery);
        const matchesGenre = pack.genre.toLowerCase().includes(lowerQuery);

        if (matchesName || matchesTags || matchesPack || matchesGenre) {
          results.push({
            ...sample,
            packName: pack.name,
            packColor: pack.color,
            packGenre: pack.genre
          });
        }
      });
    });

    return results;
  }, [samplePacks]);

  // Preload pack samples
  const preloadPack = useCallback(async (packId) => {
    const pack = samplePacks.find(p => p.id === packId);
    if (!pack) return;

    const promises = pack.samples.map(sample => loadSample(sample));
    await Promise.all(promises);
  }, [samplePacks, loadSample]);

  // Generate samples (preload generated samples)
  const generateSamples = useCallback(async () => {
    try {
      // Preload a few samples from each pack
      for (const pack of samplePacks.slice(0, 2)) { // Only first 2 packs to avoid overwhelming
        for (const sample of pack.samples.slice(0, 3)) { // Only first 3 samples per pack
          await loadSample(sample);
        }
      }
    } catch (error) {
      console.error('Error generating samples:', error);
    }
  }, [samplePacks, loadSample]);

  return {
    samplePacks,
    loadedSamples: Array.from(loadedSamples.values()),
    playSample,
    stopSample,
    stopAllSamples,
    loadSample,
    getSamplesByType,
    getSamplesByPack,
    searchSamples,
    preloadPack,
    generateSamples, // Add the missing function
    currentlyPlaying: Array.from(currentlyPlayingRef.current.keys())
  };
};