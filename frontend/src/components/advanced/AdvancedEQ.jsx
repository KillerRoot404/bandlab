import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { RotateCcw, Settings } from 'lucide-react';

const AdvancedEQ = ({ 
  trackId,
  isEnabled = true,
  onToggle,
  onParameterChange,
  parameters = {
    lowGain: 0,
    lowFreq: 80,
    lowQ: 0.7,
    midGain: 0, 
    midFreq: 1000,
    midQ: 1.0,
    highGain: 0,
    highFreq: 8000,
    highQ: 0.7,
    highMidGain: 0,
    highMidFreq: 3000,
    highMidQ: 1.0
  }
}) => {
  const canvasRef = useRef(null);
  const [activeNode, setActiveNode] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // EQ frequency bands
  const bands = [
    { name: 'Low', freq: 'lowFreq', gain: 'lowGain', q: 'lowQ', color: '#22c55e', minFreq: 20, maxFreq: 500 },
    { name: 'Low-Mid', freq: 'midFreq', gain: 'midGain', q: 'midQ', color: '#3b82f6', minFreq: 200, maxFreq: 2000 },
    { name: 'High-Mid', freq: 'highMidFreq', gain: 'highMidGain', q: 'highMidQ', color: '#f59e0b', minFreq: 1000, maxFreq: 8000 },
    { name: 'High', freq: 'highFreq', gain: 'highGain', q: 'highQ', color: '#ef4444', minFreq: 2000, maxFreq: 20000 }
  ];

  // Draw EQ curve visualization
  const drawEQCurve = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    
    ctx.clearRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    
    // Vertical grid lines (frequencies)
    const freqLines = [100, 1000, 10000];
    freqLines.forEach(freq => {
      const x = freqToX(freq, width);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    });

    // Horizontal grid lines (dB)
    for (let db = -12; db <= 12; db += 6) {
      const y = gainToY(db, height);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw frequency response curve
    ctx.strokeStyle = '#ff4500';
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let x = 0; x < width; x++) {
      const freq = xToFreq(x, width);
      let totalGain = 0;

      // Calculate response for each band
      bands.forEach(band => {
        const centerFreq = parameters[band.freq];
        const gain = parameters[band.gain];
        const q = parameters[band.q];

        if (gain !== 0) {
          const response = calculateBandResponse(freq, centerFreq, gain, q);
          totalGain += response;
        }
      });

      const y = gainToY(totalGain, height);
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Draw control nodes
    bands.forEach((band, index) => {
      const freq = parameters[band.freq];
      const gain = parameters[band.gain];
      
      const x = freqToX(freq, width);
      const y = gainToY(gain, height);

      ctx.fillStyle = band.color;
      ctx.beginPath();
      ctx.arc(x, y, activeNode === index ? 8 : 6, 0, 2 * Math.PI);
      ctx.fill();

      // Add white border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(band.name, x, y - 12);
    });

  }, [parameters, activeNode]);

  // Coordinate conversion functions
  const freqToX = (freq, width) => {
    const minLog = Math.log10(20);
    const maxLog = Math.log10(20000);
    const freqLog = Math.log10(freq);
    return ((freqLog - minLog) / (maxLog - minLog)) * width;
  };

  const xToFreq = (x, width) => {
    const minLog = Math.log10(20);
    const maxLog = Math.log10(20000);
    const freqLog = minLog + (x / width) * (maxLog - minLog);
    return Math.pow(10, freqLog);
  };

  const gainToY = (gain, height) => {
    return height / 2 - (gain / 24) * height / 2; // ±12dB range
  };

  const yToGain = (y, height) => {
    return -(y - height / 2) * 24 / height;
  };

  // Calculate frequency response for a single band
  const calculateBandResponse = (freq, centerFreq, gain, q) => {
    const w = 2 * Math.PI * freq / 44100; // Sample rate 44100
    const w0 = 2 * Math.PI * centerFreq / 44100;
    const A = Math.pow(10, gain / 40);
    const alpha = Math.sin(w0) / (2 * q);

    // Peaking EQ filter response
    const H_real = (1 + alpha * A) / (1 + alpha / A);
    const H_imag = 0; // Simplified for visualization

    return 20 * Math.log10(Math.sqrt(H_real * H_real + H_imag * H_imag));
  };

  // Mouse interaction handlers
  const handleCanvasMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find nearest control node
    let nearestNode = null;
    let nearestDistance = Infinity;

    bands.forEach((band, index) => {
      const nodeX = freqToX(parameters[band.freq], canvas.width);
      const nodeY = gainToY(parameters[band.gain], canvas.height);
      const distance = Math.sqrt((x - nodeX) ** 2 + (y - nodeY) ** 2);

      if (distance < 20 && distance < nearestDistance) {
        nearestNode = index;
        nearestDistance = distance;
      }
    });

    if (nearestNode !== null) {
      setActiveNode(nearestNode);
      setIsDragging(true);
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (!isDragging || activeNode === null) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const band = bands[activeNode];
    const newFreq = Math.max(band.minFreq, Math.min(band.maxFreq, xToFreq(x, canvas.width)));
    const newGain = Math.max(-12, Math.min(12, yToGain(y, canvas.height)));

    onParameterChange(band.freq, newFreq);
    onParameterChange(band.gain, newGain);
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
    setActiveNode(null);
  };

  const resetEQ = () => {
    bands.forEach(band => {
      onParameterChange(band.gain, 0);
    });
  };

  useEffect(() => {
    drawEQCurve();
  }, [drawEQCurve]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleCanvasMouseMove);
      document.addEventListener('mouseup', handleCanvasMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleCanvasMouseMove);
        document.removeEventListener('mouseup', handleCanvasMouseUp);
      };
    }
  }, [isDragging, activeNode]);

  return (
    <Card className="bg-[#1a1a1b] border-gray-700">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <h4 className="text-white font-medium">Parametric EQ</h4>
            <Badge variant="secondary" className="text-xs">
              4-Band
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Switch checked={isEnabled} onCheckedChange={onToggle} />
            <Button
              onClick={resetEQ}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white w-8 h-8 p-0"
              title="Reset EQ"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Interactive EQ Curve */}
        <div className="mb-4 p-2 bg-[#0f0f11] rounded border">
          <canvas
            ref={canvasRef}
            width={400}
            height={200}
            className="w-full h-48 cursor-crosshair"
            onMouseDown={handleCanvasMouseDown}
            style={{ filter: isEnabled ? 'none' : 'grayscale(1) opacity(0.5)' }}
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>20Hz</span>
            <span>100Hz</span>
            <span>1kHz</span>
            <span>10kHz</span>
            <span>20kHz</span>
          </div>
        </div>

        {/* Precise Controls */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {bands.map((band, index) => (
            <div key={band.name} className="p-3 bg-[#2a2a2e] rounded border border-gray-700">
              <div className="flex items-center space-x-2 mb-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: band.color }}
                />
                <span className="text-sm text-white font-medium">{band.name}</span>
              </div>
              
              <div className="space-y-2">
                {/* Frequency */}
                <div>
                  <label className="text-xs text-gray-400">Freq</label>
                  <Slider
                    value={[parameters[band.freq]]}
                    onValueChange={(v) => onParameterChange(band.freq, v[0])}
                    min={band.minFreq}
                    max={band.maxFreq}
                    step={1}
                    className="mt-1"
                    disabled={!isEnabled}
                  />
                  <div className="text-xs text-gray-400 text-center mt-1">
                    {parameters[band.freq] < 1000 ? 
                      `${Math.round(parameters[band.freq])}Hz` : 
                      `${(parameters[band.freq] / 1000).toFixed(1)}kHz`
                    }
                  </div>
                </div>

                {/* Gain */}
                <div>
                  <label className="text-xs text-gray-400">Gain</label>
                  <Slider
                    value={[parameters[band.gain]]}
                    onValueChange={(v) => onParameterChange(band.gain, v[0])}
                    min={-12}
                    max={12}
                    step={0.1}
                    className="mt-1"
                    disabled={!isEnabled}
                  />
                  <div className="text-xs text-gray-400 text-center mt-1">
                    {parameters[band.gain] > 0 ? '+' : ''}{parameters[band.gain].toFixed(1)}dB
                  </div>
                </div>

                {/* Q Factor */}
                <div>
                  <label className="text-xs text-gray-400">Q</label>
                  <Slider
                    value={[parameters[band.q]]}
                    onValueChange={(v) => onParameterChange(band.q, v[0])}
                    min={0.1}
                    max={10}
                    step={0.1}
                    className="mt-1"
                    disabled={!isEnabled}
                  />
                  <div className="text-xs text-gray-400 text-center mt-1">
                    {parameters[band.q].toFixed(1)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* EQ Presets */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Presets</span>
            <div className="flex space-x-1">
              {['Flat', 'Rock', 'Jazz', 'Electronic', 'Vocal'].map((preset) => (
                <Button
                  key={preset}
                  variant="ghost"
                  size="sm"
                  className="text-xs text-gray-400 hover:text-white px-2 py-1"
                  onClick={() => {
                    // Apply preset logic here
                    console.log('Apply preset:', preset);
                  }}
                >
                  {preset}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedEQ;