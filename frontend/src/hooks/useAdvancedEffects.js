import { useState, useRef, useCallback, useEffect } from 'react';
import axios from 'axios';

export const useAdvancedEffects = () => {
  const [availableEffects, setAvailableEffects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const baseURL = process.env.REACT_APP_BACKEND_URL;

  // Load available effects from backend
  useEffect(() => {
    const loadEffects = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${baseURL}/api/effects`);
        setAvailableEffects(response.data);
      } catch (err) {
        console.error('Error loading effects:', err);
        // Fallback to local effects if backend fails
        setAvailableEffects([
          {
            type: 'autotune',
            name: 'Auto-Tune',
            category: 'Pitch Correction',
            parameters: [
              { name: 'correction', value: 50.0, min: 0.0, max: 100.0, unit: '%' },
              { name: 'speed', value: 50.0, min: 0.0, max: 100.0, unit: '%' },
              { name: 'key', value: 0.0, min: -12.0, max: 12.0, unit: 'semitones' }
            ]
          },
          {
            type: 'reverb',
            name: 'Reverb',
            category: 'Spatial',
            parameters: [
              { name: 'room_size', value: 30.0, min: 0.0, max: 100.0, unit: '%' },
              { name: 'dampening', value: 50.0, min: 0.0, max: 100.0, unit: '%' },
              { name: 'wet_dry', value: 30.0, min: 0.0, max: 100.0, unit: '%' },
              { name: 'pre_delay', value: 20.0, min: 0.0, max: 100.0, unit: 'ms' }
            ]
          },
          {
            type: 'delay',
            name: 'Delay',
            category: 'Spatial',
            parameters: [
              { name: 'time', value: 250.0, min: 10.0, max: 2000.0, unit: 'ms' },
              { name: 'feedback', value: 40.0, min: 0.0, max: 90.0, unit: '%' },
              { name: 'wet_dry', value: 25.0, min: 0.0, max: 100.0, unit: '%' },
              { name: 'stereo_spread', value: 0.0, min: -100.0, max: 100.0, unit: '%' }
            ]
          },
          {
            type: 'compressor',
            name: 'Compressor',
            category: 'Dynamics',
            parameters: [
              { name: 'threshold', value: -10.0, min: -40.0, max: 0.0, unit: 'dB' },
              { name: 'ratio', value: 3.0, min: 1.0, max: 20.0, unit: ':1' },
              { name: 'attack', value: 3.0, min: 0.1, max: 100.0, unit: 'ms' },
              { name: 'release', value: 100.0, min: 10.0, max: 1000.0, unit: 'ms' },
              { name: 'knee', value: 2.0, min: 0.0, max: 40.0, unit: 'dB' },
              { name: 'makeup_gain', value: 0.0, min: -20.0, max: 20.0, unit: 'dB' }
            ]
          },
          {
            type: 'eq',
            name: 'Parametric EQ',
            category: 'Filter',
            parameters: [
              { name: 'low_gain', value: 0.0, min: -15.0, max: 15.0, unit: 'dB' },
              { name: 'low_freq', value: 80.0, min: 20.0, max: 500.0, unit: 'Hz' },
              { name: 'mid_gain', value: 0.0, min: -15.0, max: 15.0, unit: 'dB' },
              { name: 'mid_freq', value: 1000.0, min: 200.0, max: 8000.0, unit: 'Hz' },
              { name: 'mid_q', value: 1.0, min: 0.1, max: 10.0, unit: 'Q' },
              { name: 'high_gain', value: 0.0, min: -15.0, max: 15.0, unit: 'dB' },
              { name: 'high_freq', value: 8000.0, min: 2000.0, max: 20000.0, unit: 'Hz' }
            ]
          },
          {
            type: 'chorus',
            name: 'Chorus',
            category: 'Modulation',
            parameters: [
              { name: 'rate', value: 1.0, min: 0.1, max: 10.0, unit: 'Hz' },
              { name: 'depth', value: 50.0, min: 0.0, max: 100.0, unit: '%' },
              { name: 'wet_dry', value: 50.0, min: 0.0, max: 100.0, unit: '%' },
              { name: 'feedback', value: 0.0, min: -100.0, max: 100.0, unit: '%' }
            ]
          },
          {
            type: 'distortion',
            name: 'Distortion',
            category: 'Drive',
            parameters: [
              { name: 'drive', value: 30.0, min: 0.0, max: 100.0, unit: '%' },
              { name: 'tone', value: 50.0, min: 0.0, max: 100.0, unit: '%' },
              { name: 'level', value: 75.0, min: 0.0, max: 100.0, unit: '%' },
              { name: 'type', value: 0, min: 0, max: 3, unit: 'type' }
            ]
          }
        ]);
        setError('Using offline effects - backend connection failed');
      } finally {
        setLoading(false);
      }
    };

    loadEffects();
  }, [baseURL]);

  // Create Web Audio API effects chains
  const createEffectChain = useCallback((audioContext, effectsConfig) => {
    const inputGain = audioContext.createGain();
    const outputGain = audioContext.createGain();
    let currentNode = inputGain;

    const effectNodes = [];

    effectsConfig.forEach((effect) => {
      if (!effect.enabled) return;

      let effectNode = null;

      switch (effect.type) {
        case 'reverb':
          effectNode = createReverbEffect(audioContext, effect.parameters);
          break;
        case 'delay':
          effectNode = createDelayEffect(audioContext, effect.parameters);
          break;
        case 'compressor':
          effectNode = createCompressorEffect(audioContext, effect.parameters);
          break;
        case 'eq':
          effectNode = createEQEffect(audioContext, effect.parameters);
          break;
        case 'chorus':
          effectNode = createChorusEffect(audioContext, effect.parameters);
          break;
        case 'distortion':
          effectNode = createDistortionEffect(audioContext, effect.parameters);
          break;
        case 'autotune':
          effectNode = createAutotuneEffect(audioContext, effect.parameters);
          break;
        default:
          return;
      }

      if (effectNode) {
        currentNode.connect(effectNode.input);
        currentNode = effectNode.output;
        effectNodes.push(effectNode);
      }
    });

    currentNode.connect(outputGain);

    return {
      input: inputGain,
      output: outputGain,
      effects: effectNodes,
      updateParameter: (effectIndex, paramName, value) => {
        if (effectNodes[effectIndex] && effectNodes[effectIndex].updateParameter) {
          effectNodes[effectIndex].updateParameter(paramName, value);
        }
      }
    };
  }, []);

  // Individual effect creators (simplified implementations)
  const createReverbEffect = useCallback((audioContext, parameters) => {
    const convolver = audioContext.createConvolver();
    const wetGain = audioContext.createGain();
    const dryGain = audioContext.createGain();
    const inputGain = audioContext.createGain();
    const outputGain = audioContext.createGain();

    // Create simple impulse response
    const createImpulseResponse = (roomSize, dampening) => {
      const sampleRate = audioContext.sampleRate;
      const length = sampleRate * (roomSize / 100) * 2;
      const impulse = audioContext.createBuffer(2, length, sampleRate);

      for (let channel = 0; channel < 2; channel++) {
        const channelData = impulse.getChannelData(channel);
        for (let i = 0; i < length; i++) {
          const decay = Math.pow(1 - (dampening / 100), i / sampleRate);
          channelData[i] = (Math.random() * 2 - 1) * decay;
        }
      }
      return impulse;
    };

    const roomSize = parameters.find(p => p.name === 'room_size')?.value || 30;
    const dampening = parameters.find(p => p.name === 'dampening')?.value || 50;
    const wetDry = parameters.find(p => p.name === 'wet_dry')?.value || 30;

    convolver.buffer = createImpulseResponse(roomSize, dampening);

    inputGain.connect(dryGain);
    inputGain.connect(convolver);
    convolver.connect(wetGain);
    dryGain.connect(outputGain);
    wetGain.connect(outputGain);

    const wetLevel = wetDry / 100;
    const dryLevel = 1 - wetLevel;
    wetGain.gain.value = wetLevel;
    dryGain.gain.value = dryLevel;

    return {
      input: inputGain,
      output: outputGain,
      updateParameter: (paramName, value) => {
        switch (paramName) {
          case 'wet_dry':
            const newWetLevel = value / 100;
            const newDryLevel = 1 - newWetLevel;
            wetGain.gain.value = newWetLevel;
            dryGain.gain.value = newDryLevel;
            break;
          default:
            break;
        }
      }
    };
  }, []);

  const createDelayEffect = useCallback((audioContext, parameters) => {
    const delay = audioContext.createDelay(2.0);
    const feedback = audioContext.createGain();
    const wetGain = audioContext.createGain();
    const dryGain = audioContext.createGain();
    const inputGain = audioContext.createGain();
    const outputGain = audioContext.createGain();

    const time = (parameters.find(p => p.name === 'time')?.value || 250) / 1000;
    const feedbackValue = (parameters.find(p => p.name === 'feedback')?.value || 40) / 100;
    const wetDry = parameters.find(p => p.name === 'wet_dry')?.value || 25;

    delay.delayTime.value = time;
    feedback.gain.value = feedbackValue;
    
    const wetLevel = wetDry / 100;
    const dryLevel = 1 - wetLevel;
    wetGain.gain.value = wetLevel;
    dryGain.gain.value = dryLevel;

    inputGain.connect(dryGain);
    inputGain.connect(delay);
    delay.connect(feedback);
    delay.connect(wetGain);
    feedback.connect(delay);
    dryGain.connect(outputGain);
    wetGain.connect(outputGain);

    return {
      input: inputGain,
      output: outputGain,
      updateParameter: (paramName, value) => {
        switch (paramName) {
          case 'time':
            delay.delayTime.value = value / 1000;
            break;
          case 'feedback':
            feedback.gain.value = value / 100;
            break;
          case 'wet_dry':
            const newWetLevel = value / 100;
            const newDryLevel = 1 - newWetLevel;
            wetGain.gain.value = newWetLevel;
            dryGain.gain.value = newDryLevel;
            break;
          default:
            break;
        }
      }
    };
  }, []);

  const createCompressorEffect = useCallback((audioContext, parameters) => {
    const compressor = audioContext.createDynamicsCompressor();
    const makeupGain = audioContext.createGain();

    const threshold = parameters.find(p => p.name === 'threshold')?.value || -10;
    const ratio = parameters.find(p => p.name === 'ratio')?.value || 3;
    const attack = (parameters.find(p => p.name === 'attack')?.value || 3) / 1000;
    const release = (parameters.find(p => p.name === 'release')?.value || 100) / 1000;
    const makeup = parameters.find(p => p.name === 'makeup_gain')?.value || 0;

    compressor.threshold.value = threshold;
    compressor.ratio.value = ratio;
    compressor.attack.value = attack;
    compressor.release.value = release;
    makeupGain.gain.value = Math.pow(10, makeup / 20);

    compressor.connect(makeupGain);

    return {
      input: compressor,
      output: makeupGain,
      updateParameter: (paramName, value) => {
        switch (paramName) {
          case 'threshold':
            compressor.threshold.value = value;
            break;
          case 'ratio':
            compressor.ratio.value = value;
            break;
          case 'attack':
            compressor.attack.value = value / 1000;
            break;
          case 'release':
            compressor.release.value = value / 1000;
            break;
          case 'makeup_gain':
            makeupGain.gain.value = Math.pow(10, value / 20);
            break;
          default:
            break;
        }
      }
    };
  }, []);

  const createEQEffect = useCallback((audioContext, parameters) => {
    const lowShelf = audioContext.createBiquadFilter();
    const midPeak = audioContext.createBiquadFilter();
    const highShelf = audioContext.createBiquadFilter();

    lowShelf.type = 'lowshelf';
    midPeak.type = 'peaking';
    highShelf.type = 'highshelf';

    const lowGain = parameters.find(p => p.name === 'low_gain')?.value || 0;
    const lowFreq = parameters.find(p => p.name === 'low_freq')?.value || 80;
    const midGain = parameters.find(p => p.name === 'mid_gain')?.value || 0;
    const midFreq = parameters.find(p => p.name === 'mid_freq')?.value || 1000;
    const midQ = parameters.find(p => p.name === 'mid_q')?.value || 1;
    const highGain = parameters.find(p => p.name === 'high_gain')?.value || 0;
    const highFreq = parameters.find(p => p.name === 'high_freq')?.value || 8000;

    lowShelf.gain.value = lowGain;
    lowShelf.frequency.value = lowFreq;
    midPeak.gain.value = midGain;
    midPeak.frequency.value = midFreq;
    midPeak.Q.value = midQ;
    highShelf.gain.value = highGain;
    highShelf.frequency.value = highFreq;

    lowShelf.connect(midPeak);
    midPeak.connect(highShelf);

    return {
      input: lowShelf,
      output: highShelf,
      updateParameter: (paramName, value) => {
        switch (paramName) {
          case 'low_gain':
            lowShelf.gain.value = value;
            break;
          case 'low_freq':
            lowShelf.frequency.value = value;
            break;
          case 'mid_gain':
            midPeak.gain.value = value;
            break;
          case 'mid_freq':
            midPeak.frequency.value = value;
            break;
          case 'mid_q':
            midPeak.Q.value = value;
            break;
          case 'high_gain':
            highShelf.gain.value = value;
            break;
          case 'high_freq':
            highShelf.frequency.value = value;
            break;
          default:
            break;
        }
      }
    };
  }, []);

  const createChorusEffect = useCallback((audioContext, parameters) => {
    const delay1 = audioContext.createDelay();
    const lfo1 = audioContext.createOscillator();
    const lfoGain1 = audioContext.createGain();
    const wetGain = audioContext.createGain();
    const dryGain = audioContext.createGain();
    const inputGain = audioContext.createGain();
    const outputGain = audioContext.createGain();

    const rate = parameters.find(p => p.name === 'rate')?.value || 1;
    const depth = (parameters.find(p => p.name === 'depth')?.value || 50) / 100;
    const wetDry = parameters.find(p => p.name === 'wet_dry')?.value || 50;

    lfo1.frequency.value = rate;
    lfoGain1.gain.value = depth * 0.005;
    delay1.delayTime.value = 0.02;

    lfo1.connect(lfoGain1);
    lfoGain1.connect(delay1.delayTime);
    lfo1.start();

    inputGain.connect(dryGain);
    inputGain.connect(delay1);
    delay1.connect(wetGain);

    const wetLevel = wetDry / 100;
    const dryLevel = 1 - wetLevel;
    wetGain.gain.value = wetLevel;
    dryGain.gain.value = dryLevel;

    dryGain.connect(outputGain);
    wetGain.connect(outputGain);

    return {
      input: inputGain,
      output: outputGain,
      updateParameter: () => {}
    };
  }, []);

  const createDistortionEffect = useCallback((audioContext, parameters) => {
    const waveshaper = audioContext.createWaveShaper();
    const inputGain = audioContext.createGain();
    const outputGain = audioContext.createGain();

    const drive = (parameters.find(p => p.name === 'drive')?.value || 30) / 100;
    const level = (parameters.find(p => p.name === 'level')?.value || 75) / 100;

    const samples = 44100;
    const curve = new Float32Array(samples);
    const deg = Math.PI / 180;
    
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = (3 + drive * 20) * x * 20 * deg / (Math.PI + drive * 20 * Math.abs(x));
    }

    waveshaper.curve = curve;
    waveshaper.oversample = '4x';
    outputGain.gain.value = level;

    inputGain.connect(waveshaper);
    waveshaper.connect(outputGain);

    return {
      input: inputGain,
      output: outputGain,
      updateParameter: () => {}
    };
  }, []);

  const createAutotuneEffect = useCallback((audioContext, parameters) => {
    // Simplified autotune placeholder
    const inputGain = audioContext.createGain();
    const outputGain = audioContext.createGain();
    
    inputGain.connect(outputGain);

    return {
      input: inputGain,
      output: outputGain,
      updateParameter: () => {}
    };
  }, []);

  return {
    availableEffects,
    createEffectChain,
    loading,
    error
  };
};