import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Activity, Settings, Pause, Play } from 'lucide-react';

const SpectrumAnalyzer = ({ 
  audioContext,
  audioSource,
  isEnabled = true,
  onToggle,
  size = 'normal', // 'small', 'normal', 'large'
  showControls = true
}) => {
  const canvasRef = useRef(null);
  const analyzerRef = useRef(null);
  const animationRef = useRef(null);
  const dataArrayRef = useRef(null);
  
  const [isRunning, setIsRunning] = useState(true);
  const [mode, setMode] = useState('spectrum'); // 'spectrum', 'waveform'
  const [resolution, setResolution] = useState(1024); // FFT size

  const initializeAnalyzer = useCallback(() => {
    if (!audioContext || !audioSource) return;

    try {
      // Create analyzer node
      const analyzer = audioContext.createAnalyser();
      analyzer.fftSize = resolution;
      analyzer.smoothingTimeConstant = 0.8;
      analyzer.minDecibels = -90;
      analyzer.maxDecibels = -10;

      // Connect audio source to analyzer
      audioSource.connect(analyzer);

      analyzerRef.current = analyzer;
      
      const bufferLength = analyzer.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);

    } catch (error) {
      console.error('Failed to initialize spectrum analyzer:', error);
    }
  }, [audioContext, audioSource, resolution]);

  const drawSpectrum = useCallback(() => {
    if (!canvasRef.current || !analyzerRef.current || !dataArrayRef.current || !isRunning) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const analyzer = analyzerRef.current;
    const dataArray = dataArrayRef.current;

    const { width, height } = canvas;

    // Get frequency data
    if (mode === 'spectrum') {
      analyzer.getByteFrequencyData(dataArray);
    } else {
      analyzer.getByteTimeDomainData(dataArray);
    }

    // Clear canvas
    ctx.fillStyle = '#0f0f11';
    ctx.fillRect(0, 0, width, height);

    if (mode === 'spectrum') {
      drawFrequencySpectrum(ctx, dataArray, width, height);
    } else {
      drawWaveform(ctx, dataArray, width, height);
    }

    // Continue animation
    animationRef.current = requestAnimationFrame(drawSpectrum);
  }, [isRunning, mode]);

  const drawFrequencySpectrum = (ctx, dataArray, width, height) => {
    const bufferLength = dataArray.length;
    const barWidth = width / bufferLength;

    // Create gradient
    const gradient = ctx.createLinearGradient(0, height, 0, 0);
    gradient.addColorStop(0, '#22c55e');
    gradient.addColorStop(0.3, '#eab308');
    gradient.addColorStop(0.7, '#f97316');
    gradient.addColorStop(1, '#ef4444');

    ctx.fillStyle = gradient;

    // Draw frequency bars
    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * height;
      const x = i * barWidth;

      ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
    }

    // Draw frequency labels
    ctx.fillStyle = '#9ca3af';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';

    const sampleRate = 44100; // Assume standard sample rate
    const nyquist = sampleRate / 2;
    
    // Draw frequency markers
    const frequencies = [100, 1000, 5000, 10000];
    frequencies.forEach(freq => {
      if (freq < nyquist) {
        const binIndex = Math.round((freq / nyquist) * bufferLength);
        const x = binIndex * barWidth;
        
        ctx.fillText(
          freq < 1000 ? `${freq}Hz` : `${freq/1000}kHz`,
          x,
          height - 5
        );

        // Draw vertical line
        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height - 15);
        ctx.stroke();
      }
    });

    // Draw dB scale on left
    ctx.textAlign = 'left';
    for (let db = -90; db <= -10; db += 20) {
      const y = height - ((db + 90) / 80) * height;
      ctx.fillText(`${db}dB`, 5, y + 3);
      
      // Draw horizontal line
      ctx.strokeStyle = '#374151';
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const drawWaveform = (ctx, dataArray, width, height) => {
    ctx.strokeStyle = '#ff4500';
    ctx.lineWidth = 2;
    ctx.beginPath();

    const sliceWidth = width / dataArray.length;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
      const v = dataArray[i] / 128.0; // Convert to 0-2 range
      const y = (v * height) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.stroke();

    // Draw center line
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
  };

  // Start/stop animation
  useEffect(() => {
    if (isEnabled && isRunning) {
      animationRef.current = requestAnimationFrame(drawSpectrum);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [drawSpectrum, isEnabled, isRunning]);

  // Initialize analyzer when audio context changes
  useEffect(() => {
    initializeAnalyzer();
  }, [initializeAnalyzer]);

  const getCanvasSize = () => {
    switch (size) {
      case 'small': return { width: 300, height: 120 };
      case 'large': return { width: 600, height: 300 };
      default: return { width: 400, height: 160 };
    }
  };

  const { width: canvasWidth, height: canvasHeight } = getCanvasSize();

  return (
    <Card className="bg-[#1a1a1b] border-gray-700">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-[#ff4500]" />
            <h4 className="text-white font-medium">Spectrum Analyzer</h4>
            <Badge variant={isRunning ? 'default' : 'secondary'} className="text-xs">
              {isRunning ? 'LIVE' : 'PAUSED'}
            </Badge>
          </div>
          
          {showControls && (
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setIsRunning(!isRunning)}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white w-8 h-8 p-0"
              >
                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Switch checked={isEnabled} onCheckedChange={onToggle} />
            </div>
          )}
        </div>

        {/* Analyzer Canvas */}
        <div className="mb-4 p-2 bg-[#0f0f11] rounded border">
          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            className="w-full"
            style={{ 
              height: `${canvasHeight}px`,
              filter: isEnabled ? 'none' : 'grayscale(1) opacity(0.5)' 
            }}
          />
        </div>

        {/* Controls */}
        {showControls && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Mode</span>
              <div className="flex space-x-1">
                <Button
                  variant={mode === 'spectrum' ? 'default' : 'ghost'}
                  size="sm"
                  className="text-xs px-3 py-1"
                  onClick={() => setMode('spectrum')}
                >
                  Spectrum
                </Button>
                <Button
                  variant={mode === 'waveform' ? 'default' : 'ghost'}
                  size="sm"
                  className="text-xs px-3 py-1"
                  onClick={() => setMode('waveform')}
                >
                  Waveform
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Resolution</span>
              <div className="flex space-x-1">
                {[512, 1024, 2048, 4096].map((size) => (
                  <Button
                    key={size}
                    variant={resolution === size ? 'default' : 'ghost'}
                    size="sm"
                    className="text-xs px-2 py-1"
                    onClick={() => setResolution(size)}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SpectrumAnalyzer;