import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Volume2, RotateCcw, Activity } from 'lucide-react';

const AdvancedCompressor = ({
  trackId,
  isEnabled = true,
  onToggle,
  onParameterChange,
  parameters = {
    threshold: -12,
    ratio: 4,
    attack: 10,
    release: 100,
    knee: 2,
    makeupGain: 0,
    lookAhead: 5,
    sidechain: false
  },
  gainReduction = 0,
  inputLevel = 0,
  outputLevel = 0
}) => {
  const canvasRef = useRef(null);
  const meterCanvasRef = useRef(null);
  const animationRef = useRef(null);

  // Draw compression curve
  const drawCompressionCurve = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    
    ctx.clearRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    
    // Draw grid lines every 6dB
    for (let db = -48; db <= 0; db += 6) {
      const x = dbToX(db, width);
      const y = dbToY(db, height);
      
      // Vertical lines (input)
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      
      // Horizontal lines (output)
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw labels
    ctx.fillStyle = '#9ca3af';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    
    // Input labels (bottom)
    for (let db = -48; db <= 0; db += 12) {
      const x = dbToX(db, width);
      ctx.fillText(`${db}`, x, height - 5);
    }
    
    // Output labels (left)
    ctx.textAlign = 'left';
    for (let db = -48; db <= 0; db += 12) {
      const y = dbToY(db, height);
      ctx.fillText(`${db}`, 5, y - 5);
    }

    // Draw compression curve
    ctx.strokeStyle = '#ff4500';
    ctx.lineWidth = 3;
    ctx.beginPath();

    for (let inputDb = -48; inputDb <= 0; inputDb += 0.5) {
      const outputDb = calculateCompression(inputDb, parameters);
      const x = dbToX(inputDb, width);
      const y = dbToY(outputDb, height);
      
      if (inputDb === -48) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Draw 1:1 reference line
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(width, 0);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw threshold line
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    const thresholdX = dbToX(parameters.threshold, width);
    ctx.beginPath();
    ctx.moveTo(thresholdX, 0);
    ctx.lineTo(thresholdX, height);
    ctx.stroke();

    // Draw current operating point (if we have input level)
    if (inputLevel > 0) {
      const inputDb = 20 * Math.log10(inputLevel);
      const outputDb = calculateCompression(inputDb, parameters);
      const x = dbToX(inputDb, width);
      const y = dbToY(outputDb, height);

      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

  }, [parameters, inputLevel]);

  // Draw gain reduction meter
  const drawGainReductionMeter = useCallback(() => {
    const canvas = meterCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    
    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, width, height);

    // Scale
    const maxReduction = 20; // dB
    const reductionRatio = Math.min(Math.abs(gainReduction) / maxReduction, 1);
    
    // Meter background
    ctx.fillStyle = '#374151';
    ctx.fillRect(0, 0, width, height);

    // Active meter
    const meterWidth = width * reductionRatio;
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, '#22c55e');
    gradient.addColorStop(0.5, '#eab308');
    gradient.addColorStop(0.8, '#f97316');
    gradient.addColorStop(1, '#ef4444');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, meterWidth, height);

    // Scale markings
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    
    for (let db = 0; db <= maxReduction; db += 5) {
      const x = (db / maxReduction) * width;
      ctx.fillText(`-${db}`, x + 2, height - 2);
      
      // Tick marks
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 4);
      ctx.stroke();
    }

    // Current value
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      `${gainReduction.toFixed(1)}dB`, 
      width / 2, 
      height / 2 + 4
    );

  }, [gainReduction]);

  // Calculate compression output for given input
  const calculateCompression = (inputDb, params) => {
    const { threshold, ratio, knee } = params;
    
    if (inputDb <= threshold - knee/2) {
      // Below threshold
      return inputDb;
    } else if (inputDb >= threshold + knee/2) {
      // Above threshold
      const excess = inputDb - threshold;
      return threshold + excess / ratio;
    } else {
      // In knee region (soft knee)
      const kneeRatio = (inputDb - (threshold - knee/2)) / knee;
      const softRatio = 1 + (ratio - 1) * kneeRatio;
      const excess = inputDb - threshold;
      return threshold + excess / softRatio;
    }
  };

  // Coordinate conversion
  const dbToX = (db, width) => ((db + 48) / 48) * width;
  const dbToY = (db, height) => height - ((db + 48) / 48) * height;

  // Animation loop
  const animate = useCallback(() => {
    drawCompressionCurve();
    drawGainReductionMeter();
    
    if (isEnabled) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [drawCompressionCurve, drawGainReductionMeter, isEnabled]);

  useEffect(() => {
    animate();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate]);

  const resetCompressor = () => {
    onParameterChange('threshold', -12);
    onParameterChange('ratio', 4);
    onParameterChange('attack', 10);
    onParameterChange('release', 100);
    onParameterChange('knee', 2);
    onParameterChange('makeupGain', 0);
  };

  return (
    <Card className="bg-[#1a1a1b] border-gray-700">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Volume2 className="w-5 h-5 text-[#ff4500]" />
            <h4 className="text-white font-medium">Advanced Compressor</h4>
            <Badge variant="secondary" className="text-xs">
              Optical
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Switch checked={isEnabled} onCheckedChange={onToggle} />
            <Button
              onClick={resetCompressor}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white w-8 h-8 p-0"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Compression Curve */}
          <div>
            <h5 className="text-sm text-gray-400 mb-2">Compression Curve</h5>
            <div className="p-2 bg-[#0f0f11] rounded border">
              <canvas
                ref={canvasRef}
                width={300}
                height={200}
                className="w-full h-40"
                style={{ filter: isEnabled ? 'none' : 'grayscale(1) opacity(0.5)' }}
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Input (dB)</span>
                <span>Output (dB)</span>
              </div>
            </div>
          </div>

          {/* Gain Reduction Meter */}
          <div>
            <h5 className="text-sm text-gray-400 mb-2">Gain Reduction</h5>
            <div className="p-2 bg-[#0f0f11] rounded border">
              <canvas
                ref={meterCanvasRef}
                width={300}
                height={60}
                className="w-full h-16"
                style={{ filter: isEnabled ? 'none' : 'grayscale(1) opacity(0.5)' }}
              />
            </div>
            
            {/* Level Meters */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="text-center">
                <div className="text-xs text-gray-400">Input</div>
                <div className="text-sm text-white font-mono">
                  {inputLevel > 0 ? `${(20 * Math.log10(inputLevel)).toFixed(1)}dB` : '-∞dB'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-400">Output</div>
                <div className="text-sm text-white font-mono">
                  {outputLevel > 0 ? `${(20 * Math.log10(outputLevel)).toFixed(1)}dB` : '-∞dB'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Parameter Controls */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {/* Threshold */}
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Threshold</label>
            <Slider
              value={[parameters.threshold]}
              onValueChange={(v) => onParameterChange('threshold', v[0])}
              min={-48}
              max={0}
              step={0.1}
              disabled={!isEnabled}
            />
            <div className="text-xs text-gray-400 text-center mt-1">
              {parameters.threshold.toFixed(1)}dB
            </div>
          </div>

          {/* Ratio */}
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Ratio</label>
            <Slider
              value={[parameters.ratio]}
              onValueChange={(v) => onParameterChange('ratio', v[0])}
              min={1}
              max={20}
              step={0.1}
              disabled={!isEnabled}
            />
            <div className="text-xs text-gray-400 text-center mt-1">
              {parameters.ratio.toFixed(1)}:1
            </div>
          </div>

          {/* Attack */}
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Attack</label>
            <Slider
              value={[parameters.attack]}
              onValueChange={(v) => onParameterChange('attack', v[0])}
              min={0.1}
              max={100}
              step={0.1}
              disabled={!isEnabled}
            />
            <div className="text-xs text-gray-400 text-center mt-1">
              {parameters.attack.toFixed(1)}ms
            </div>
          </div>

          {/* Release */}
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Release</label>
            <Slider
              value={[parameters.release]}
              onValueChange={(v) => onParameterChange('release', v[0])}
              min={10}
              max={1000}
              step={1}
              disabled={!isEnabled}
            />
            <div className="text-xs text-gray-400 text-center mt-1">
              {parameters.release}ms
            </div>
          </div>

          {/* Knee */}
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Knee</label>
            <Slider
              value={[parameters.knee]}
              onValueChange={(v) => onParameterChange('knee', v[0])}
              min={0}
              max={40}
              step={0.1}
              disabled={!isEnabled}
            />
            <div className="text-xs text-gray-400 text-center mt-1">
              {parameters.knee.toFixed(1)}dB
            </div>
          </div>

          {/* Makeup Gain */}
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Makeup</label>
            <Slider
              value={[parameters.makeupGain]}
              onValueChange={(v) => onParameterChange('makeupGain', v[0])}
              min={-20}
              max={20}
              step={0.1}
              disabled={!isEnabled}
            />
            <div className="text-xs text-gray-400 text-center mt-1">
              {parameters.makeupGain > 0 ? '+' : ''}{parameters.makeupGain.toFixed(1)}dB
            </div>
          </div>
        </div>

        {/* Advanced Controls */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Advanced</span>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={parameters.sidechain}
                  onChange={(e) => onParameterChange('sidechain', e.target.checked)}
                  className="text-[#ff4500] focus:ring-[#ff4500]"
                  disabled={!isEnabled}
                />
                <span className="text-xs text-gray-400">Sidechain</span>
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-400">Look-ahead</span>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={parameters.lookAhead}
                  onChange={(e) => onParameterChange('lookAhead', parseFloat(e.target.value))}
                  className="w-12 px-1 py-0.5 text-xs bg-[#1a1a1b] border border-gray-700 rounded text-white"
                  disabled={!isEnabled}
                />
                <span className="text-xs text-gray-400">ms</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedCompressor;