import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { 
  TrendingUp, Plus, Trash2, Copy, Scissors, 
  Maximize2, Minimize2, Target, Move, MoreHorizontal 
} from 'lucide-react';

const AutomationLane = ({
  trackId,
  parameter = 'volume',
  parameterName = 'Volume',
  min = 0,
  max = 100,
  unit = '%',
  automationData = [],
  isVisible = true,
  isEnabled = true,
  onToggle,
  onAutomationChange,
  currentTime = 0,
  duration = 60,
  onToggleVisibility
}) => {
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPointIndex, setDragPointIndex] = useState(-1);
  const [automationMode, setAutomationMode] = useState('read'); // read, write, touch, latch
  const [isRecording, setIsRecording] = useState(false);

  // Convert time to canvas X coordinate
  const timeToX = useCallback((time, width) => {
    return (time / duration) * width;
  }, [duration]);

  // Convert canvas X coordinate to time
  const xToTime = useCallback((x, width) => {
    return (x / width) * duration;
  }, [duration]);

  // Convert value to canvas Y coordinate
  const valueToY = useCallback((value, height) => {
    return height - ((value - min) / (max - min)) * height;
  }, [min, max]);

  // Convert canvas Y coordinate to value
  const yToValue = useCallback((y, height) => {
    return min + (1 - y / height) * (max - min);
  }, [min, max]);

  // Draw automation curve
  const drawAutomation = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    
    ctx.clearRect(0, 0, width, height);

    // Draw background grid
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    
    // Time grid (every 4 beats assuming 120 BPM)
    const timeStep = 2; // seconds
    for (let time = 0; time <= duration; time += timeStep) {
      const x = timeToX(time, width);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Value grid
    const valueStep = (max - min) / 4;
    for (let value = min; value <= max; value += valueStep) {
      const y = valueToY(value, height);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw automation curve
    if (automationData.length > 0) {
      ctx.strokeStyle = isEnabled ? '#ff4500' : '#6b7280';
      ctx.lineWidth = 2;
      ctx.beginPath();

      // Sort automation points by time
      const sortedData = [...automationData].sort((a, b) => a.time - b.time);

      sortedData.forEach((point, index) => {
        const x = timeToX(point.time, width);
        const y = valueToY(point.value, height);

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          const prevPoint = sortedData[index - 1];
          const prevX = timeToX(prevPoint.time, width);
          const prevY = valueToY(prevPoint.value, height);

          if (point.curve === 'linear' || !point.curve) {
            ctx.lineTo(x, y);
          } else if (point.curve === 'exponential') {
            // Exponential curve
            const midX = prevX + (x - prevX) * 0.5;
            const midY = prevY;
            ctx.quadraticCurveTo(midX, midY, x, y);
          } else if (point.curve === 'logarithmic') {
            // Logarithmic curve
            const midX = prevX + (x - prevX) * 0.5;
            const midY = y;
            ctx.quadraticCurveTo(midX, midY, x, y);
          }
        }
      });
      ctx.stroke();

      // Draw automation points
      sortedData.forEach((point, index) => {
        const x = timeToX(point.time, width);
        const y = valueToY(point.value, height);

        ctx.fillStyle = isEnabled ? '#ff4500' : '#6b7280';
        ctx.beginPath();
        ctx.arc(x, y, dragPointIndex === index ? 6 : 4, 0, 2 * Math.PI);
        ctx.fill();

        // White border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    } else {
      // Draw flat line at default value
      const defaultValue = (min + max) / 2;
      const y = valueToY(defaultValue, height);
      ctx.strokeStyle = '#6b7280';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw playhead
    const playheadX = timeToX(currentTime, width);
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, height);
    ctx.stroke();

    // Draw recording indicator if in write mode
    if (isRecording && automationMode === 'write') {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
      ctx.fillRect(0, 0, width, height);
      
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('RECORDING', width / 2, 20);
    }

  }, [
    automationData, currentTime, duration, timeToX, valueToY, 
    isEnabled, dragPointIndex, isRecording, automationMode, min, max
  ]);

  // Mouse event handlers
  const handleMouseDown = (e) => {
    if (!isEnabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking on existing point
    const pointIndex = findNearestPoint(x, y, canvas.width, canvas.height);
    
    if (pointIndex !== -1) {
      setDragPointIndex(pointIndex);
      setIsDragging(true);
    } else {
      // Add new automation point
      const time = xToTime(x, canvas.width);
      const value = yToValue(y, canvas.height);
      
      const newPoint = {
        time: Math.max(0, Math.min(duration, time)),
        value: Math.max(min, Math.min(max, value)),
        curve: 'linear'
      };

      onAutomationChange([...automationData, newPoint]);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging || dragPointIndex === -1) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const time = Math.max(0, Math.min(duration, xToTime(x, canvas.width)));
    const value = Math.max(min, Math.min(max, yToValue(y, canvas.height)));

    const newData = [...automationData];
    newData[dragPointIndex] = {
      ...newData[dragPointIndex],
      time,
      value
    };

    onAutomationChange(newData);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragPointIndex(-1);
  };

  const findNearestPoint = (mouseX, mouseY, canvasWidth, canvasHeight) => {
    let nearestIndex = -1;
    let nearestDistance = Infinity;

    automationData.forEach((point, index) => {
      const pointX = timeToX(point.time, canvasWidth);
      const pointY = valueToY(point.value, canvasHeight);
      const distance = Math.sqrt((mouseX - pointX) ** 2 + (mouseY - pointY) ** 2);

      if (distance < 10 && distance < nearestDistance) {
        nearestIndex = index;
        nearestDistance = distance;
      }
    });

    return nearestIndex;
  };

  // Delete selected point
  const deletePoint = () => {
    if (dragPointIndex !== -1) {
      const newData = automationData.filter((_, index) => index !== dragPointIndex);
      onAutomationChange(newData);
      setDragPointIndex(-1);
    }
  };

  // Clear all automation
  const clearAutomation = () => {
    onAutomationChange([]);
  };

  useEffect(() => {
    drawAutomation();
  }, [drawAutomation]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragPointIndex]);

  if (!isVisible) return null;

  return (
    <Card className="bg-[#1a1a1b] border-gray-700">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-[#ff4500]" />
            <h5 className="text-sm text-white font-medium">{parameterName} Automation</h5>
            <Badge variant="secondary" className="text-xs">
              {automationData.length} points
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Automation Mode */}
            <div className="flex space-x-1">
              {['read', 'write', 'touch', 'latch'].map((mode) => (
                <Button
                  key={mode}
                  onClick={() => setAutomationMode(mode)}
                  variant={automationMode === mode ? 'default' : 'ghost'}
                  size="sm"
                  className={`text-xs px-2 py-1 h-6 ${
                    automationMode === mode ? 'bg-[#ff4500] text-white' : 'text-gray-400'
                  }`}
                >
                  {mode.charAt(0).toUpperCase()}
                </Button>
              ))}
            </div>

            <Switch checked={isEnabled} onCheckedChange={onToggle} />
            
            <Button
              onClick={onToggleVisibility}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white w-6 h-6 p-0"
            >
              {isVisible ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
            </Button>
          </div>
        </div>

        {/* Automation Canvas */}
        <div className="mb-3 p-2 bg-[#0f0f11] rounded border">
          <canvas
            ref={canvasRef}
            width={600}
            height={120}
            className="w-full h-28 cursor-crosshair"
            onMouseDown={handleMouseDown}
            style={{ filter: isEnabled ? 'none' : 'grayscale(1) opacity(0.5)' }}
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0s</span>
            <span>{duration/2}s</span>
            <span>{duration}s</span>
          </div>
          <div className="flex justify-between text-xs text-gray-400 absolute">
            <div className="flex flex-col h-28 justify-between py-1">
              <span>{max}{unit}</span>
              <span>{min + (max-min)/2}{unit}</span>
              <span>{min}{unit}</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-1">
            <Button
              onClick={() => setIsRecording(!isRecording)}
              variant={isRecording ? 'destructive' : 'ghost'}
              size="sm"
              className="text-xs"
            >
              {isRecording ? 'Stop Rec' : 'Record'}
            </Button>
            <Button onClick={clearAutomation} variant="ghost" size="sm" className="text-xs">
              Clear
            </Button>
            <Button onClick={deletePoint} variant="ghost" size="sm" className="text-xs" disabled={dragPointIndex === -1}>
              Delete Point
            </Button>
          </div>
          
          <div className="text-xs text-gray-400">
            Current: {
              automationData.length > 0 ? 
                `${getCurrentValue().toFixed(1)}${unit}` :
                `${((min + max) / 2).toFixed(1)}${unit}`
            }
          </div>
        </div>
      </CardContent>
    </Card>
  );

  function getCurrentValue() {
    if (automationData.length === 0) return (min + max) / 2;
    
    // Find the current value based on playhead position
    const sortedData = [...automationData].sort((a, b) => a.time - b.time);
    
    // If before first point
    if (currentTime <= sortedData[0].time) {
      return sortedData[0].value;
    }
    
    // If after last point
    if (currentTime >= sortedData[sortedData.length - 1].time) {
      return sortedData[sortedData.length - 1].value;
    }
    
    // Interpolate between points
    for (let i = 0; i < sortedData.length - 1; i++) {
      const point1 = sortedData[i];
      const point2 = sortedData[i + 1];
      
      if (currentTime >= point1.time && currentTime <= point2.time) {
        const ratio = (currentTime - point1.time) / (point2.time - point1.time);
        return point1.value + (point2.value - point1.value) * ratio;
      }
    }
    
    return (min + max) / 2;
  }
};

export default AutomationLane;