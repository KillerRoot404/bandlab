import { useState, useRef, useCallback, useEffect } from 'react';
import axios from 'axios';

export const useVirtualInstruments = () => {
  const [availableInstruments, setAvailableInstruments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const baseURL = process.env.REACT_APP_BACKEND_URL;
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
        },
        { 
          id: 'electric_piano', 
          name: 'Electric Piano', 
          parameters: { 
            brightness: 70, 
            sustain: 50, 
            attack: 5, 
            release: 60,
            reverb: 15,
            velocity_sensitivity: 80
          } 
        }
      ]
    },
    {
      id: 'analog_synth',
      name: 'Analog Synthesizer',
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
            release: 40,
            lfo_rate: 2,
            lfo_depth: 0
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
            release: 300,
            lfo_rate: 0.5,
            lfo_depth: 20
          } 
        },
        { 
          id: 'bass_synth', 
          name: 'Bass Synth', 
          parameters: { 
            oscillator_type: 'triangle',
            cutoff: 60, 
            resonance: 50, 
            attack: 5,
            decay: 30,
            sustain: 60,
            release: 100,
            lfo_rate: 4,
            lfo_depth: 30
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
            snare_tone: 50,
            hihat_brightness: 70,
            cymbal_sustain: 60,
            room_sound: 30
          } 
        },
        { 
          id: 'electronic_kit', 
          name: 'Electronic Kit', 
          parameters: { 
            kick_punch: 90, 
            kick_tone: 40,
            snare_crack: 85,
            snare_tone: 80,
            hihat_brightness: 90,
            cymbal_sustain: 40,
            room_sound: 10
          } 
        },
        { 
          id: 'jazz_kit', 
          name: 'Jazz Kit', 
          parameters: { 
            kick_punch: 50, 
            kick_tone: 70,
            snare_crack: 40,
            snare_tone: 60,
            hihat_brightness: 50,
            cymbal_sustain: 80,
            room_sound: 70
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
            release: 60,
            pickup_position: 70,
            amp_drive: 20
          } 
        },
        { 
          id: 'slap_bass', 
          name: 'Slap Bass', 
          parameters: { 
            tone: 80, 
            attack: 90,
            sustain: 40,
            release: 30,
            pickup_position: 90,
            amp_drive: 40
          } 
        },
        { 
          id: 'synth_bass', 
          name: 'Synth Bass', 
          parameters: { 
            tone: 70, 
            attack: 10,
            sustain: 70,
            release: 50,
            pickup_position: 50,
            amp_drive: 60
          } 
        }
      ]
    },
    {
      id: 'acoustic_guitar',
      name: 'Acoustic Guitar',
      type: 'guitar',
      category: 'Strings',
      color: '#f97316',
      presets: [
        { 
          id: 'steel_string', 
          name: 'Steel String', 
          parameters: { 
            brightness: 70,
            body_resonance: 60,
            string_tension: 80,
            pick_attack: 60,
            sustain: 70,
            room_sound: 40
          } 
        },
        { 
          id: 'nylon_string', 
          name: 'Nylon String', 
          parameters: { 
            brightness: 40,
            body_resonance: 80,
            string_tension: 50,
            pick_attack: 30,
            sustain: 80,
            room_sound: 60
          } 
        }
      ]
    },
    {
      id: 'string_section',
      name: 'String Section',
      type: 'orchestral',
      category: 'Orchestra',
      color: '#eab308',
      presets: [
        { 
          id: 'chamber_strings', 
          name: 'Chamber Strings', 
          parameters: { 
            ensemble_size: 40,
            bow_speed: 50,
            vibrato: 30,
            attack: 100,
            sustain: 90,
            release: 200,
            hall_reverb: 60
          } 
        },
        { 
          id: 'full_orchestra', 
          name: 'Full Orchestra', 
          parameters: { 
            ensemble_size: 100,
            bow_speed: 60,
            vibrato: 50,
            attack: 150,
            sustain: 85,
            release: 300,
            hall_reverb: 80
          } 
        }
      ]
    }
  ]);

  const audioContextRef = useRef(null);
  const activeNotesRef = useRef(new Map());
  const instrumentInstancesRef = useRef(new Map());

  // MIDI note mapping
  const noteFrequencies = {
    'C': [65.41, 130.81, 261.63, 523.25, 1046.50, 2093.00],
    'C#': [69.30, 138.59, 277.18, 554.37, 1108.73, 2217.46],
    'D': [73.42, 146.83, 293.66, 587.33, 1174.66, 2349.32],
    'D#': [77.78, 155.56, 311.13, 622.25, 1244.51, 2489.02],
    'E': [82.41, 164.81, 329.63, 659.25, 1318.51, 2637.02],
    'F': [87.31, 174.61, 349.23, 698.46, 1396.91, 2793.83],
    'F#': [92.50, 185.00, 369.99, 739.99, 1479.98, 2959.96],
    'G': [98.00, 196.00, 392.00, 783.99, 1567.98, 3135.96],
    'G#': [103.83, 207.65, 415.30, 830.61, 1661.22, 3322.44],
    'A': [110.00, 220.00, 440.00, 880.00, 1760.00, 3520.00],
    'A#': [116.54, 233.08, 466.16, 932.33, 1864.66, 3729.31],
    'B': [123.47, 246.94, 493.88, 987.77, 1975.53, 3951.07]
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
    const { brightness, sustain, attack, release, reverb } = preset.parameters;
    
    // Main oscillator
    const osc1 = audioContext.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(frequency, audioContext.currentTime);
    
    // Harmonic oscillators for richness
    const osc2 = audioContext.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(frequency * 2, audioContext.currentTime);
    
    const osc3 = audioContext.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(frequency * 3, audioContext.currentTime);
    
    // Gains
    const gainNode1 = audioContext.createGain();
    const gainNode2 = audioContext.createGain();
    const gainNode3 = audioContext.createGain();
    const masterGain = audioContext.createGain();
    
    // Filter for brightness
    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800 + (brightness * 40), audioContext.currentTime);
    filter.Q.setValueAtTime(1, audioContext.currentTime);
    
    // Connect
    osc1.connect(gainNode1);
    osc2.connect(gainNode2);
    osc3.connect(gainNode3);
    
    gainNode1.connect(filter);
    gainNode2.connect(filter);
    gainNode3.connect(filter);
    
    filter.connect(masterGain);
    
    // Set levels
    const vel = velocity / 127;
    gainNode1.gain.setValueAtTime(vel * 0.8, audioContext.currentTime);
    gainNode2.gain.setValueAtTime(vel * 0.3 * (brightness / 100), audioContext.currentTime);
    gainNode3.gain.setValueAtTime(vel * 0.1 * (brightness / 100), audioContext.currentTime);
    
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
    osc3.start(now);
    
    return {
      output: masterGain,
      stop: (when = audioContext.currentTime) => {
        const stopTime = when + (releaseTime);
        masterGain.gain.exponentialRampToValueAtTime(0.001, stopTime);
        osc1.stop(stopTime);
        osc2.stop(stopTime);
        osc3.stop(stopTime);
      }
    };
  }, []);

  // Create synth instrument
  const createSynthVoice = useCallback((audioContext, frequency, velocity, preset) => {
    const { oscillator_type, cutoff, resonance, attack, decay, sustain, release, lfo_rate, lfo_depth } = preset.parameters;
    
    // Main oscillator
    const osc = audioContext.createOscillator();
    osc.type = oscillator_type || 'sawtooth';
    osc.frequency.setValueAtTime(frequency, audioContext.currentTime);
    
    // Filter
    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200 + (cutoff / 100) * 4000, audioContext.currentTime);
    filter.Q.setValueAtTime(resonance / 10, audioContext.currentTime);
    
    // LFO for modulation
    const lfo = audioContext.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(lfo_rate || 2, audioContext.currentTime);
    
    const lfoGain = audioContext.createGain();
    lfoGain.gain.setValueAtTime((lfo_depth || 0) * 10, audioContext.currentTime);
    
    // Gain envelope
    const gainNode = audioContext.createGain();
    
    // Connect
    osc.connect(filter);
    filter.connect(gainNode);
    
    if (lfo_depth > 0) {
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();
    }
    
    // ADSR envelope
    const now = audioContext.currentTime;
    const vel = velocity / 127;
    const attackTime = (attack || 10) / 1000;
    const decayTime = (decay || 20) / 1000;
    const sustainLevel = (sustain || 70) / 100;
    
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(vel, now + attackTime);
    gainNode.gain.exponentialRampToValueAtTime(vel * sustainLevel, now + attackTime + decayTime);
    
    osc.start(now);
    
    return {
      output: gainNode,
      stop: (when = audioContext.currentTime) => {
        const releaseTime = (release || 40) / 1000;
        const stopTime = when + releaseTime;
        gainNode.gain.exponentialRampToValueAtTime(0.001, stopTime);
        osc.stop(stopTime);
        if (lfo_depth > 0) {
          lfo.stop(stopTime);
        }
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
    activeNotes: Array.from(activeNotesRef.current.keys())
  };
};