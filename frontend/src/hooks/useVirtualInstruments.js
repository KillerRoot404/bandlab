import { useState, useRef, useCallback, useEffect } from 'react';
import axios from 'axios';

export const useVirtualInstruments = (audioContext = null, masterGainNode = null) => {
  const [availableInstruments, setAvailableInstruments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const baseURL = process.env.REACT_APP_BACKEND_URL;

  const audioContextRef = useRef(audioContext);
  const masterGainRef = useRef(masterGainNode);
  const activeNotesRef = useRef(new Map());
  const instrumentInstancesRef = useRef(new Map());

  // Update refs when external context changes
  useEffect(() => {
    audioContextRef.current = audioContext;
    masterGainRef.current = masterGainNode;
  }, [audioContext, masterGainNode]);

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
    if (audioContextRef.current) {
      return audioContextRef.current;
    }
    console.warn('Virtual Instruments: No shared audio context provided. Audio may not work correctly.');
    return null;
  }, []);

  // Convert note name to MIDI number (e.g., "C4" -> 60)
  const noteToMIDI = useCallback((note) => {
    if (typeof note === 'number') return note;
    const noteMap = {
      'C': 0, 'C#': 1, 'Db': 1,
      'D': 2, 'D#': 3, 'Eb': 3,
      'E': 4,
      'F': 5, 'F#': 6, 'Gb': 6,
      'G': 7, 'G#': 8, 'Ab': 8,
      'A': 9, 'A#': 10, 'Bb': 10,
      'B': 11
    };
    const noteStr = String(note);
    const noteKey = noteStr.slice(0, -1);
    const octave = parseInt(noteStr.slice(-1), 10);
    if (noteMap.hasOwnProperty(noteKey) && !isNaN(octave)) {
      const midiNumber = 12 * (octave + 1) + noteMap[noteKey];
      return isFinite(midiNumber) && midiNumber >= 0 && midiNumber <= 127 ? midiNumber : 60;
    }
    return 60;
  }, []);

  const getFrequencyFromMIDI = useCallback((midiNote) => {
    const frequency = 440 * Math.pow(2, (midiNote - 69) / 12);
    return isFinite(frequency) ? frequency : 440;
  }, []);

  const validateAudioParam = useCallback((value, min = 0, max = 1) => {
    if (!isFinite(value) || isNaN(value)) {
      return min;
    }
    return Math.max(min, Math.min(max, value));
  }, []);

  const validateTime = useCallback((time, audioContext) => {
    const currentTime = audioContext?.currentTime || 0;
    if (!isFinite(time) || isNaN(time) || time < 0) {
      return currentTime;
    }
    return time;
  }, []);

  const createPianoVoice = useCallback((audioContext, frequency, velocity, preset) => {
    const { brightness = 60, sustain = 60, attack = 10, release = 80 } = preset.parameters;
    const validFreq = validateAudioParam(frequency, 20, 20000);
    const validVelocity = validateAudioParam(velocity, 0, 127);
    const validBrightness = validateAudioParam(brightness, 0, 100);
    const validSustain = validateAudioParam(sustain, 0, 100);
    const validAttack = validateAudioParam(attack, 0, 100);
    const validRelease = validateAudioParam(release, 0, 100);
    try {
      const osc1 = audioContext.createOscillator();
      osc1.type = 'triangle';
      const validTime = validateTime(audioContext.currentTime, audioContext);
      osc1.frequency.setValueAtTime(validFreq, validTime);
      const osc2 = audioContext.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(validFreq * 2, validTime);
      const gainNode1 = audioContext.createGain();
      const gainNode2 = audioContext.createGain();
      const masterGain = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();
      filter.type = 'lowpass';
      const filterFreq = validateAudioParam(800 + (validBrightness * 40), 200, 8000);
      filter.frequency.setValueAtTime(filterFreq, validTime);
      filter.Q.setValueAtTime(1, validTime);
      osc1.connect(gainNode1);
      osc2.connect(gainNode2);
      gainNode1.connect(filter);
      gainNode2.connect(filter);
      filter.connect(masterGain);
      const vel = validateAudioParam(validVelocity / 127, 0, 1);
      const gain1Level = validateAudioParam(vel * 0.8, 0, 1);
      const gain2Level = validateAudioParam(vel * 0.3 * (validBrightness / 100), 0, 1);
      gainNode1.gain.setValueAtTime(gain1Level, validTime);
      gainNode2.gain.setValueAtTime(gain2Level, validTime);
      const now = validTime;
      const attackTime = validateAudioParam((validAttack / 100) * 0.1, 0.001, 1);
      const releaseTime = validateAudioParam((validRelease / 100) * 2, 0.1, 5);
      const sustainLevel = validateAudioParam(vel * (validSustain / 100), 0.001, 1);
      masterGain.gain.setValueAtTime(0.001, now);
      masterGain.gain.linearRampToValueAtTime(vel, now + attackTime);
      masterGain.gain.setValueAtTime(sustainLevel, now + attackTime + 0.1);
      osc1.start(now);
      osc2.start(now);
      return {
        output: masterGain,
        stop: (when = audioContext.currentTime) => {
          const validWhen = validateAudioParam(when, audioContext.currentTime, audioContext.currentTime + 10);
          const stopTime = validWhen + releaseTime;
          masterGain.gain.exponentialRampToValueAtTime(0.001, stopTime);
          osc1.stop(stopTime);
          osc2.stop(stopTime);
        }
      };
    } catch (error) {
      console.error('Piano voice creation error:', error);
      return null;
    }
  }, [validateAudioParam, validateTime]);

  const createSynthVoice = useCallback((audioContext, frequency, velocity, preset) => {
    const { oscillator_type = 'sawtooth', cutoff = 70, resonance = 30, attack = 10, decay = 20, sustain = 70, release = 40 } = preset.parameters;
    const validFreq = validateAudioParam(frequency, 20, 20000);
    const validVelocity = validateAudioParam(velocity, 0, 127);
    const validCutoff = validateAudioParam(cutoff, 0, 100);
    const validResonance = validateAudioParam(resonance, 0, 100);
    const validAttack = validateAudioParam(attack, 0, 1000);
    const validDecay = validateAudioParam(decay, 0, 1000);
    const validSustain = validateAudioParam(sustain, 0, 100);
    const validRelease = validateAudioParam(release, 0, 1000);
    try {
      const osc = audioContext.createOscillator();
      osc.type = oscillator_type;
      const validTime = validateTime(audioContext.currentTime, audioContext);
      osc.frequency.setValueAtTime(validFreq, validTime);
      const filter = audioContext.createBiquadFilter();
      filter.type = 'lowpass';
      const filterFreq = validateAudioParam(200 + (validCutoff / 100) * 4000, 200, 8000);
      const filterQ = validateAudioParam(validResonance / 10, 0.1, 30);
      filter.frequency.setValueAtTime(filterFreq, validTime);
      filter.Q.setValueAtTime(filterQ, validTime);
      const gainNode = audioContext.createGain();
      osc.connect(filter);
      filter.connect(gainNode);
      const now = validTime;
      const vel = validateAudioParam(validVelocity / 127, 0, 1);
      const attackTime = validateAudioParam(validAttack / 1000, 0.001, 2);
      const decayTime = validateAudioParam(validDecay / 1000, 0.001, 2);
      const sustainLevel = validateAudioParam(validSustain / 100, 0.001, 1);
      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.linearRampToValueAtTime(vel, now + attackTime);
      gainNode.gain.exponentialRampToValueAtTime(vel * sustainLevel, now + attackTime + decayTime);
      osc.start(now);
      return {
        output: gainNode,
        stop: (when = audioContext.currentTime) => {
          const validWhen = validateAudioParam(when, audioContext.currentTime, audioContext.currentTime + 10);
          const releaseTime = validateAudioParam(validRelease / 1000, 0.01, 5);
          const stopTime = validWhen + releaseTime;
          gainNode.gain.exponentialRampToValueAtTime(0.001, stopTime);
          osc.stop(stopTime);
        }
      };
    } catch (error) {
      console.error('Synth voice creation error:', error);
      return null;
    }
  }, [validateAudioParam, validateTime]);

  const createDrumVoice = useCallback((audioContext, drumType, velocity, preset) => {
    const validVel = validateAudioParam(velocity / 127, 0, 1);
    const validTime = validateTime(audioContext.currentTime, audioContext);
    switch (drumType) {
      case 'kick': {
        try {
          const osc = audioContext.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(60, validTime);
          const gain = audioContext.createGain();
          gain.gain.setValueAtTime(validVel, validTime);
          gain.gain.exponentialRampToValueAtTime(0.001, validTime + 0.3);
          osc.frequency.exponentialRampToValueAtTime(30, validTime + 0.1);
          osc.connect(gain);
          osc.start(validTime);
          osc.stop(validTime + 0.3);
          return { output: gain, stop: () => {} };
        } catch (error) {
          console.error('Drum kick creation error:', error);
          return null;
        }
      }
      case 'snare': {
        try {
          const noise = audioContext.createBufferSource();
          const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.2, audioContext.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < data.length; i++) { data[i] = Math.random() * 2 - 1; }
          noise.buffer = buffer;
          const filter = audioContext.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(200, validTime);
          const gain = audioContext.createGain();
          gain.gain.setValueAtTime(validVel * 0.8, validTime);
          gain.gain.exponentialRampToValueAtTime(0.001, validTime + 0.2);
          noise.connect(filter);
          filter.connect(gain);
          noise.start(validTime);
          noise.stop(validTime + 0.2);
          return { output: gain, stop: () => {} };
        } catch (error) {
          console.error('Drum snare creation error:', error);
          return null;
        }
      }
      case 'hihat': {
        try {
          const noise = audioContext.createBufferSource();
          const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.1, audioContext.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < data.length; i++) { data[i] = Math.random() * 2 - 1; }
          noise.buffer = buffer;
          const filter = audioContext.createBiquadFilter();
          filter.type = 'highpass';
          filter.frequency.setValueAtTime(8000, validTime);
          const gain = audioContext.createGain();
          gain.gain.setValueAtTime(validVel * 0.5, validTime);
          gain.gain.exponentialRampToValueAtTime(0.001, validTime + 0.1);
          noise.connect(filter);
          filter.connect(gain);
          noise.start(validTime);
          noise.stop(validTime + 0.1);
          return { output: gain, stop: () => {} };
        } catch (error) {
          console.error('Drum hihat creation error:', error);
          return null;
        }
      }
      default:
        return null;
    }
  }, [validateAudioParam, validateTime]);

  // Play note: tenta retomar o AudioContext imediatamente se suspenso
  const playNote = useCallback((instrumentId, note, velocity = 100, preset = null) => {
    const audioContext = initializeAudioContext();
    if (!audioContext) {
      console.error('Virtual Instruments: AudioContext not available');
      return null;
    }

    if (audioContext.state === 'suspended') {
      try { audioContext.resume(); } catch (e) {}
    }
    if (audioContext.state === 'suspended') {
      console.warn('Virtual Instruments: AudioContext is suspended. Audio playback blocked by browser autoplay policy.');
      return null;
    }

    const instrument = availableInstruments.find(inst => inst.id === instrumentId);
    if (!instrument) return null;

    const selectedPreset = preset || instrument.presets[0];
    let voice = null;

    const midiNote = noteToMIDI(note);
    const frequency = getFrequencyFromMIDI(midiNote);

    switch (instrument.type) {
      case 'piano':
        voice = createPianoVoice(audioContext, frequency, velocity, selectedPreset);
        break;
      case 'synth':
        voice = createSynthVoice(audioContext, frequency, velocity, selectedPreset);
        break;
      case 'drums': {
        const drumTypes = ['kick', 'snare', 'hihat', 'crash', 'ride', 'tom1', 'tom2', 'tom3'];
        const drumType = typeof note === 'string' ? note : drumTypes[note % drumTypes.length];
        voice = createDrumVoice(audioContext, drumType, velocity, selectedPreset);
        break;
      }
      default:
        voice = createSynthVoice(audioContext, frequency, velocity, selectedPreset);
    }

    if (voice) {
      const destination = masterGainRef.current || audioContext.destination;
      voice.output.connect(destination);
      const noteKey = `${instrumentId}-${note}`;
      activeNotesRef.current.set(noteKey, voice);
      return noteKey;
    }
    return null;
  }, [availableInstruments, initializeAudioContext, noteToMIDI, getFrequencyFromMIDI, createPianoVoice, createSynthVoice, createDrumVoice]);

  const stopNote = useCallback((noteKey) => {
    const voice = activeNotesRef.current.get(noteKey);
    if (voice && voice.stop) {
      voice.stop();
      activeNotesRef.current.delete(noteKey);
    }
  }, []);

  const stopAllNotes = useCallback(() => {
    activeNotesRef.current.forEach((voice) => {
      if (voice.stop) voice.stop();
    });
    activeNotesRef.current.clear();
  }, []);

  const getPreset = useCallback((instrumentId, presetId) => {
    const instrument = availableInstruments.find(inst => inst.id === instrumentId);
    if (!instrument) return null;
    return instrument.presets.find(preset => preset.id === presetId);
  }, [availableInstruments]);

  const keyboardMap = {
    'KeyA': 60,
    'KeyW': 61,
    'KeyS': 62,
    'KeyE': 63,
    'KeyD': 64,
    'KeyF': 65,
    'KeyT': 66,
    'KeyG': 67,
    'KeyY': 68,
    'KeyH': 69,
    'KeyU': 70,
    'KeyJ': 71,
    'KeyK': 72,
  };

  return {
    availableInstruments,
    playNote,
    stopNote,
    stopAllNotes,
    getPreset,
    keyboardMap,
    noteToMIDI,
    getFrequencyFromMIDI,
    loading,
    error,
    activeNotes: Array.from(activeNotesRef.current.keys())
  };
};