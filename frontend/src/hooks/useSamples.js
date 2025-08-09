import { useState, useRef, useCallback, useEffect } from 'react';
import axios from 'axios';

export const useSamples = () => {
  const [availablePacks, setAvailablePacks] = useState([]);
  const [loadedSamples, setLoadedSamples] = useState(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const baseURL = process.env.REACT_APP_BACKEND_URL;
  const audioContextRef = useRef(null);
  const currentlyPlayingRef = useRef(new Map());

  // Load sample packs from backend
  useEffect(() => {
    const loadSamplePacks = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${baseURL}/api/samples/packs`);
        
        // Transform backend data to frontend format
        const formattedPacks = response.data.map(pack => ({
          id: pack.name.toLowerCase().replace(/\s+/g, '_'),
          name: pack.name,
          description: pack.description,
          genre: pack.genre,
          bpm: pack.bpm,
          samples_count: pack.samples_count,
          color: getColorForGenre(pack.genre),
          samples: generateSamplesForPack(pack)
        }));

        setAvailablePacks(formattedPacks);
      } catch (err) {
        console.error('Error loading sample packs:', err);
        // Fallback to local samples
        setAvailablePacks([
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
                audioData: null
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
              }
            ]
          }
        ]);
        setError('Using offline sample packs - backend connection failed');
      } finally {
        setLoading(false);
      }
    };

    loadSamplePacks();
  }, [baseURL]);

  const getColorForGenre = (genre) => {
    const colors = {
      'Hip Hop': '#ef4444',
      'Electronic': '#8b5cf6',
      'Lo-Fi': '#10b981',
      'Trap': '#f59e0b',
      'Ambient': '#06b6d4'
    };
    return colors[genre] || '#64748b';
  };

  const generateSamplesForPack = (pack) => {
    // Generate basic samples based on genre
    const baseSamples = [
      { type: 'kick', name: 'Kick', duration: 0.5 },
      { type: 'snare', name: 'Snare', duration: 0.3 },
      { type: 'hihat', name: 'Hi-Hat', duration: 0.1 },
      { type: 'bass', name: 'Bass', duration: 1.5 }
    ];

    return baseSamples.map((sample, index) => ({
      id: `${pack.name.toLowerCase().replace(/\s+/g, '_')}_${sample.type}_${index}`,
      name: `${pack.genre} ${sample.name}`,
      type: sample.type,
      duration: sample.duration,
      key: sample.type === 'bass' || sample.type === 'kick' ? 'C' : null,
      tags: [sample.type, pack.genre.toLowerCase()],
      audioData: null
    }));
  };

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

  // Get samples by pack
  const getSamples = useCallback((packId) => {
    const pack = availablePacks.find(p => p.id === packId);
    return pack ? pack.samples : [];
  }, [availablePacks]);

  // Load pack (preload samples)
  const loadPack = useCallback(async (packId) => {
    const pack = availablePacks.find(p => p.id === packId);
    if (!pack) return;

    const promises = pack.samples.map(sample => loadSample(sample));
    await Promise.all(promises);
  }, [availablePacks, loadSample]);

  // Generate samples (preload generated samples)
  const generateSamples = useCallback(async () => {
    try {
      // Preload a few samples from each pack
      for (const pack of availablePacks.slice(0, 2)) { // Only first 2 packs to avoid overwhelming
        for (const sample of pack.samples.slice(0, 3)) { // Only first 3 samples per pack
          await loadSample(sample);
        }
      }
    } catch (error) {
      console.error('Error generating samples:', error);
    }
  }, [availablePacks, loadSample]);

  return {
    availablePacks,
    loadedSamples: Array.from(loadedSamples.values()),
    playSample,
    stopSample,
    stopAllSamples,
    loadSample,
    getSamples,
    loadPack,
    generateSamples,
    loading,
    error,
    currentlyPlaying: Array.from(currentlyPlayingRef.current.keys())
  };
};