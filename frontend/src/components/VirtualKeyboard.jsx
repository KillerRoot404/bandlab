import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Piano, Volume2, Settings } from 'lucide-react';
import { useVirtualInstruments } from '../hooks/useVirtualInstruments';

const VirtualKeyboard = ({ onNotePlay, onNoteStop, keyboardMap, activeInstrument }) => {
  const { 
    availableInstruments, 
    playNote, 
    stopNote, 
    stopAllNotes, 
    getPreset, 
    keyboardMap,
    activeNotes 
  } = useVirtualInstruments();

  const [selectedPreset, setSelectedPreset] = useState(null);
  const [velocity, setVelocity] = useState([100]);
  const [activeKeys, setActiveKeys] = useState(new Set());
  const [octave, setOctave] = useState(4);
  
  const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const blackKeys = ['C#', 'D#', 'F#', 'G#', 'A#'];
  
  const instrument = availableInstruments.find(inst => inst.id === selectedInstrument) || availableInstruments[0];

  useEffect(() => {
    if (instrument && instrument.presets.length > 0 && !selectedPreset) {
      setSelectedPreset(instrument.presets[0]);
    }
  }, [instrument, selectedPreset]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.repeat || !keyboardMap[event.code]) return;
      
      const midiNote = keyboardMap[event.code] + (octave - 4) * 12;
      if (midiNote >= 0 && midiNote <= 127) {
        const noteKey = playNote(instrument.id, midiNote, velocity[0], selectedPreset);
        if (noteKey) {
          setActiveKeys(prev => new Set(prev).add(event.code));
        }
      }
    };

    const handleKeyUp = (event) => {
      if (keyboardMap[event.code]) {
        const midiNote = keyboardMap[event.code] + (octave - 4) * 12;
        const noteKey = `${instrument.id}-${midiNote}`;
        stopNote(noteKey);
        setActiveKeys(prev => {
          const newSet = new Set(prev);
          newSet.delete(event.code);
          return newSet;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      stopAllNotes();
    };
  }, [instrument, selectedPreset, velocity, octave, playNote, stopNote, stopAllNotes, keyboardMap]);

  const handleMouseDown = (note) => {
    const midiNote = getMidiNote(note, octave);
    if (midiNote >= 0 && midiNote <= 127) {
      const noteKey = playNote(instrument.id, midiNote, velocity[0], selectedPreset);
      if (noteKey) {
        setActiveKeys(prev => new Set(prev).add(note));
      }
    }
  };

  const handleMouseUp = (note) => {
    const midiNote = getMidiNote(note, octave);
    const noteKey = `${instrument.id}-${midiNote}`;
    stopNote(noteKey);
    setActiveKeys(prev => {
      const newSet = new Set(prev);
      newSet.delete(note);
      return newSet;
    });
  };

  const getMidiNote = (note, octave) => {
    const noteMap = {
      'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
      'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
    };
    return (octave + 1) * 12 + noteMap[note];
  };

  const isBlackKey = (note) => blackKeys.includes(note);
  
  const getKeyPosition = (note, index) => {
    if (isBlackKey(note)) {
      // Black keys positioning
      const positions = { 'C#': 8.5, 'D#': 25.5, 'F#': 59.5, 'G#': 76.5, 'A#': 93.5 };
      return positions[note] || 0;
    } else {
      // White keys positioning  
      return index * 17;
    }
  };

  return (
    <Card className="bg-[#242529] border-gray-700 p-4">
      <div className="space-y-4">
        {/* Instrument Controls */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Piano className="w-4 h-4 text-[#ff4500]" />
            <span className="text-sm text-gray-300">Instrument:</span>
          </div>
          
          <Select 
            value={instrument.id} 
            onValueChange={onInstrumentChange}
          >
            <SelectTrigger className="w-40 bg-[#2a2a2e] border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#2a2a2e] border-gray-600">
              {availableInstruments.map((inst) => (
                <SelectItem key={inst.id} value={inst.id} className="text-white hover:bg-[#333338]">
                  {inst.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select 
            value={selectedPreset?.id || ''} 
            onValueChange={(presetId) => {
              const preset = instrument.presets.find(p => p.id === presetId);
              setSelectedPreset(preset);
            }}
          >
            <SelectTrigger className="w-40 bg-[#2a2a2e] border-gray-600 text-white">
              <SelectValue placeholder="Select preset" />
            </SelectTrigger>
            <SelectContent className="bg-[#2a2a2e] border-gray-600">
              {instrument.presets.map((preset) => (
                <SelectItem key={preset.id} value={preset.id} className="text-white hover:bg-[#333338]">
                  {preset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Performance Controls */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Volume2 className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Velocity:</span>
            <div className="w-20">
              <Slider
                value={velocity}
                onValueChange={setVelocity}
                min={1}
                max={127}
                step={1}
              />
            </div>
            <span className="text-xs text-gray-400 w-8">{velocity[0]}</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Octave:</span>
            <Button
              onClick={() => setOctave(Math.max(0, octave - 1))}
              size="sm"
              variant="ghost"
              className="w-6 h-6 p-0 text-gray-400 hover:text-white"
            >
              -
            </Button>
            <span className="text-sm text-white w-4 text-center">{octave}</span>
            <Button
              onClick={() => setOctave(Math.min(8, octave + 1))}
              size="sm"
              variant="ghost"
              className="w-6 h-6 p-0 text-gray-400 hover:text-white"
            >
              +
            </Button>
          </div>
        </div>

        {/* Virtual Piano */}
        <div className="relative">
          {/* Keyboard Container */}
          <div className="relative h-32 w-full overflow-hidden rounded border border-gray-600">
            {/* White Keys */}
            <div className="flex h-full">
              {whiteKeys.map((note, index) => {
                const isActive = activeKeys.has(note) || 
                               activeKeys.has(Object.keys(keyboardMap).find(key => 
                                 keyboardMap[key] === getMidiNote(note, octave) - (octave + 1) * 12
                               ));
                
                return (
                  <button
                    key={`${note}-${octave}`}
                    className={`flex-1 h-full border-r border-gray-600 transition-colors ${
                      isActive 
                        ? 'bg-[#ff4500] text-white' 
                        : 'bg-white hover:bg-gray-100 text-gray-800'
                    }`}
                    onMouseDown={() => handleMouseDown(note)}
                    onMouseUp={() => handleMouseUp(note)}
                    onMouseLeave={() => handleMouseUp(note)}
                  >
                    <div className="flex flex-col justify-end h-full p-2">
                      <div className="text-xs font-medium">{note}{octave}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Black Keys */}
            <div className="absolute top-0 left-0 h-20 w-full pointer-events-none">
              {blackKeys.map((note) => {
                const position = getKeyPosition(note, 0);
                const isActive = activeKeys.has(note) || 
                               activeKeys.has(Object.keys(keyboardMap).find(key => 
                                 keyboardMap[key] === getMidiNote(note, octave) - (octave + 1) * 12
                               ));

                return (
                  <button
                    key={`${note}-${octave}`}
                    className={`absolute w-3 h-20 pointer-events-auto transition-colors ${
                      isActive 
                        ? 'bg-[#ff6500] border-[#ff4500]' 
                        : 'bg-gray-800 hover:bg-gray-700 border-gray-900'
                    } border rounded-b`}
                    style={{ left: `${position}%` }}
                    onMouseDown={() => handleMouseDown(note)}
                    onMouseUp={() => handleMouseUp(note)}
                    onMouseLeave={() => handleMouseUp(note)}
                  >
                    <div className="flex items-end justify-center h-full pb-1">
                      <div className="text-xs text-white font-medium transform -rotate-90 origin-center">
                        {note.replace('#', '♯')}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Keyboard Shortcuts Info */}
          <div className="mt-2 text-xs text-gray-500 text-center">
            Use your computer keyboard: A-K keys to play notes | Change octave with +/- buttons
          </div>
        </div>

        {/* Active Notes Display */}
        {activeNotes.length > 0 && (
          <div className="text-xs text-gray-400">
            Playing: {activeNotes.length} note(s)
          </div>
        )}
      </div>
    </Card>
  );
};

export default VirtualKeyboard;