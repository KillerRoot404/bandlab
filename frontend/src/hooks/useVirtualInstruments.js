import { useState, useRef, useCallback, useEffect } from 'react';
import axios from 'axios';

export const useVirtualInstruments = () => {
  const [availableInstruments, setAvailableInstruments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const baseURL = process.env.REACT_APP_BACKEND_URL;

  const audioContextRef = useRef(null);
  const activeNotesRef = useRef(new Map());
  const instrumentInstancesRef = useRef(new Map());

  // Load instruments from backend
  useEffect(() => {
    const loadInstruments = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${baseURL}/api/instruments`);
        
        // Transform backend data to frontend format
        const formattedInstruments = response.data.map(inst => ({
          id: inst.name.toLowerCase().replace(/\s+/g, '_'),
          name: inst.name,
          type: inst.type,
          category: inst.category,
          color: getColorForInstrument(inst.type),
          presets: inst.presets.map(preset => ({
            id: preset.name.toLowerCase().replace(/\s+/g, '_'),
            name: preset.name,
            parameters: preset.parameters
          }))
        }));

        setAvailableInstruments(formattedInstruments);
      } catch (err) {
        console.error('Error loading instruments:', err);
        // Fallback to local instruments
        setAvailableInstruments([
          {
            id: 'grand_piano',
            name: 'Grand Piano',
            type: 'piano',
            category: 'Piano',
            color: '#3b82f6',
            presets: [
              { 
                id: 'bright_piano', 
                name: 'Bright Piano', 
                parameters: { 
                  brightness: 80, 
                  sustain: 60, 
                  attack: 10, 
                  release: 80,
                  reverb: 20,
                  velocity_sensitivity: 70
                } 
              },
              { 
                id: 'warm_piano', 
                name: 'Warm Piano', 
                parameters: { 
                  brightness: 40, 
                  sustain: 80, 
                  attack: 20, 
                  release: 90,
                  reverb: 30,
                  velocity_sensitivity: 60
                } 
              }
            ]
          },
          {
            id: 'analog_synth',
            name: 'Analog Synth',
            type: 'synth',
            category: 'Synthesizer',
            color: '#8b5cf6',
            presets: [
              { 
                id: 'lead_synth', 
                name: 'Lead Synth', 
                parameters: { 
                  oscillator_type: 'sawtooth',
                  cutoff: 70, 
                  resonance: 30, 
                  attack: 10,
                  decay: 20,
                  sustain: 70,
                  release: 40
                } 
              },
              { 
                id: 'pad_synth', 
                name: 'Pad Synth', 
                parameters: { 
                  oscillator_type: 'square',
                  cutoff: 40, 
                  resonance: 10, 
                  attack: 200,
                  decay: 100,
                  sustain: 80,
                  release: 300
                } 
              }
            ]
          },
          {
            id: 'drum_kit',
            name: 'Drum Kit',
            type: 'drums',
            category: 'Percussion',
            color: '#ef4444',
            presets: [
              { 
                id: 'rock_kit', 
                name: 'Rock Kit', 
                parameters: { 
                  kick_punch: 80, 
                  kick_tone: 60,
                  snare_crack: 70,
                  snare_tone: 50
                } 
              }
            ]
          },
          {
            id: 'electric_bass',
            name: 'Electric Bass',
            type: 'bass',
            category: 'Bass',
            color: '#10b981',
            presets: [
              { 
                id: 'finger_bass', 
                name: 'Finger Bass', 
                parameters: { 
                  tone: 60, 
                  attack: 40,
                  sustain: 80,
                  release: 60
                } 
              }
            ]
          }
        ]);
        setError('Using offline instruments - backend connection failed');
      } finally {
        setLoading(false);
      }
    };

    loadInstruments();
  }, [baseURL]);

  const getColorForInstrument = (type) => {
    const colors = {
      'piano': '#3b82f6',
      'synth': '#8b5cf6',
      'drums': '#ef4444',
      'bass': '#10b981',
      'guitar': '#f97316',
      'orchestral': '#eab308'
    };
    return colors[type] || '#64748b';
  };

  const initializeAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Get frequency from MIDI note number
  const getFrequencyFromMIDI = useCallback((midiNote) => {
    return 440 * Math.pow(2, (midiNote - 69) / 12);
  }, []);

  // Create piano instrument
  const createPianoVoice = useCallback((audioContext, frequency, velocity, preset) => {
    const { brightness = 60, sustain = 60, attack = 10, release = 80 } = preset.parameters;
    
    // Main oscillator
    const osc1 = audioContext.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(frequency, audioContext.currentTime);
    
    // Harmonic oscillators for richness
    const osc2 = audioContext.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(frequency * 2, audioContext.currentTime);
    
    // Gains
    const gainNode1 = audioContext.createGain();
    const gainNode2 = audioContext.createGain();
    const masterGain = audioContext.createGain();
    
    // Filter for brightness
    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800 + (brightness * 40), audioContext.currentTime);
    filter.Q.setValueAtTime(1, audioContext.currentTime);
    
    // Connect
    osc1.connect(gainNode1);
    osc2.connect(gainNode2);
    
    gainNode1.connect(filter);
    gainNode2.connect(filter);
    
    filter.connect(masterGain);
    
    // Set levels
    const vel = velocity / 127;
    gainNode1.gain.setValueAtTime(vel * 0.8, audioContext.currentTime);
    gainNode2.gain.setValueAtTime(vel * 0.3 * (brightness / 100), audioContext.currentTime);
    
    // ADSR envelope
    const now = audioContext.currentTime;
    const attackTime = (attack / 100) * 0.1;
    const releaseTime = (release / 100) * 2;
    
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(vel, now + attackTime);
    masterGain.gain.setValueAtTime(vel * (sustain / 100), now + attackTime + 0.1);
    
    // Start oscillators
    osc1.start(now);
    osc2.start(now);
    
    return {
      output: masterGain,
      stop: (when = audioContext.currentTime) => {
        const stopTime = when + (releaseTime);
        masterGain.gain.exponentialRampToValueAtTime(0.001, stopTime);
        osc1.stop(stopTime);
        osc2.stop(stopTime);
      }
    };
  }, []);

  // Create synth instrument
  const createSynthVoice = useCallback((audioContext, frequency, velocity, preset) => {
    const { oscillator_type = 'sawtooth', cutoff = 70, resonance = 30, attack = 10, decay = 20, sustain = 70, release = 40 } = preset.parameters;
    
    // Main oscillator
    const osc = audioContext.createOscillator();
    osc.type = oscillator_type;
    osc.frequency.setValueAtTime(frequency, audioContext.currentTime);
    
    // Filter
    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200 + (cutoff / 100) * 4000, audioContext.currentTime);
    filter.Q.setValueAtTime(resonance / 10, audioContext.currentTime);
    
    // Gain envelope
    const gainNode = audioContext.createGain();
    
    // Connect
    osc.connect(filter);
    filter.connect(gainNode);
    
    // ADSR envelope
    const now = audioContext.currentTime;
    const vel = velocity / 127;
    const attackTime = attack / 1000;
    const decayTime = decay / 1000;
    const sustainLevel = sustain / 100;
    
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(vel, now + attackTime);
    gainNode.gain.exponentialRampToValueAtTime(vel * sustainLevel, now + attackTime + decayTime);
    
    osc.start(now);
    
    return {
      output: gainNode,
      stop: (when = audioContext.currentTime) => {
        const releaseTime = release / 1000;
        const stopTime = when + releaseTime;
        gainNode.gain.exponentialRampToValueAtTime(0.001, stopTime);
        osc.stop(stopTime);
      }
    };
  }, []);

  // Create drum sound
  const createDrumVoice = useCallback((audioContext, drumType, velocity, preset) => {
    const vel = velocity / 127;
    
    switch (drumType) {
      case 'kick': {
        const osc = audioContext.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(60, audioContext.currentTime);
        
        const gain = audioContext.createGain();
        const now = audioContext.currentTime;
        
        gain.gain.setValueAtTime(vel, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.1);
        
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.3);
        
        return { output: gain, stop: () => {} };
      }
      
      case 'snare': {
        const noise = audioContext.createBufferSource();
        const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.2, audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        // White noise
        for (let i = 0; i < data.length; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        noise.buffer = buffer;
        
        const filter = audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(200, audioContext.currentTime);
        
        const gain = audioContext.createGain();
        const now = audioContext.currentTime;
        
        gain.gain.setValueAtTime(vel * 0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        
        noise.connect(filter);
        filter.connect(gain);
        noise.start(now);
        noise.stop(now + 0.2);
        
        return { output: gain, stop: () => {} };
      }
      
      case 'hihat': {
        const noise = audioContext.createBufferSource();
        const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.1, audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        // High-frequency noise
        for (let i = 0; i < data.length; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        noise.buffer = buffer;
        
        const filter = audioContext.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(8000, audioContext.currentTime);
        
        const gain = audioContext.createGain();
        const now = audioContext.currentTime;
        
        gain.gain.setValueAtTime(vel * 0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        
        noise.connect(filter);
        filter.connect(gain);
        noise.start(now);
        noise.stop(now + 0.1);
        
        return { output: gain, stop: () => {} };
      }
      
      default:
        return null;
    }
  }, []);

  // Play note
  const playNote = useCallback((instrumentId, note, velocity = 100, preset = null) => {
    const audioContext = initializeAudioContext();
    const instrument = availableInstruments.find(inst => inst.id === instrumentId);
    
    if (!instrument) return;
    
    const selectedPreset = preset || instrument.presets[0];
    let voice = null;
    
    // Convert note to frequency if it's a MIDI note number
    let frequency = note;
    if (typeof note === 'number' && note >= 0 && note <= 127) {
      frequency = getFrequencyFromMIDI(note);
    }
    
    switch (instrument.type) {
      case 'piano':
        voice = createPianoVoice(audioContext, frequency, velocity, selectedPreset);
        break;
      case 'synth':
        voice = createSynthVoice(audioContext, frequency, velocity, selectedPreset);
        break;
      case 'drums':
        // For drums, note represents drum type
        const drumTypes = ['kick', 'snare', 'hihat', 'crash', 'ride', 'tom1', 'tom2', 'tom3'];
        const drumType = typeof note === 'string' ? note : drumTypes[note % drumTypes.length];
        voice = createDrumVoice(audioContext, drumType, velocity, selectedPreset);
        break;
      default:
        voice = createSynthVoice(audioContext, frequency, velocity, selectedPreset);
    }
    
    if (voice) {
      voice.output.connect(audioContext.destination);
      
      // Store active note
      const noteKey = `${instrumentId}-${note}`;
      activeNotesRef.current.set(noteKey, voice);
      
      return noteKey;
    }
  }, [availableInstruments, initializeAudioContext, getFrequencyFromMIDI, createPianoVoice, createSynthVoice, createDrumVoice]);

  // Stop note
  const stopNote = useCallback((noteKey) => {
    const voice = activeNotesRef.current.get(noteKey);
    if (voice && voice.stop) {
      voice.stop();
      activeNotesRef.current.delete(noteKey);
    }
  }, []);

  // Stop all notes
  const stopAllNotes = useCallback(() => {
    activeNotesRef.current.forEach((voice, noteKey) => {
      if (voice.stop) {
        voice.stop();
      }
    });
    activeNotesRef.current.clear();
  }, []);

  // Get preset for instrument
  const getPreset = useCallback((instrumentId, presetId) => {
    const instrument = availableInstruments.find(inst => inst.id === instrumentId);
    if (!instrument) return null;
    
    return instrument.presets.find(preset => preset.id === presetId);
  }, [availableInstruments]);

  // MIDI keyboard mapping
  const keyboardMap = {
    'KeyA': 60, // C4
    'KeyW': 61, // C#4
    'KeyS': 62, // D4
    'KeyE': 63, // D#4
    'KeyD': 64, // E4
    'KeyF': 65, // F4
    'KeyT': 66, // F#4
    'KeyG': 67, // G4
    'KeyY': 68, // G#4
    'KeyH': 69, // A4
    'KeyU': 70, // A#4
    'KeyJ': 71, // B4
    'KeyK': 72, // C5
  };

  return {
    availableInstruments,
    playNote,
    stopNote,
    stopAllNotes,
    getPreset,
    keyboardMap,
    loading,
    error,
    activeNotes: Array.from(activeNotesRef.current.keys())
  };
};