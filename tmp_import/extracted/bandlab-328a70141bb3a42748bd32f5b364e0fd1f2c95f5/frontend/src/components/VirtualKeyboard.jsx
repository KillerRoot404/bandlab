import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';

const VirtualKeyboard = ({ 
  onNotePlay, 
  onNoteStop, 
  keyboardMap = {}, 
  activeInstrument = 'grand_piano',
  isMobile = false
}) => {
  const [pressedKeys, setPressedKeys] = useState(new Set());
  const [octave, setOctave] = useState(4);

  // Helpers
  const midiToNoteName = (m) => {
    if (typeof m !== 'number' || !isFinite(m)) return 'C4';
    const names = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
    const octave = Math.floor(m / 12) - 1;
    const name = names[m % 12];
    return `${name}${octave}`;
  };

  // Piano key layout
  const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const blackKeys = ['C#', 'D#', '', 'F#', 'G#', 'A#', ''];
  
  const totalOctaves = isMobile ? 2 : 3;
  const startOctave = octave - (isMobile ? 1 : 1);
  
  const handleNotePlay = (note, velocity = 100) => {
    if (onNotePlay && !pressedKeys.has(note)) {
      setPressedKeys(prev => new Set([...prev, note]));
      onNotePlay(note, velocity);
    }
  };

  const handleNoteStop = (note) => {
    if (onNoteStop) {
      setPressedKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(note);
        return newSet;
      });
      onNoteStop(note);
    }
  };

  // Computer keyboard mapping (convert MIDI numbers to note names for consistent pressed state/UI)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const mapped = keyboardMap[e.code];
      if (!mapped) return;
      const noteName = typeof mapped === 'number' ? midiToNoteName(mapped) : mapped;
      if (pressedKeys.has(noteName)) return;
      e.preventDefault();
      handleNotePlay(noteName);
    };

    const handleKeyUp = (e) => {
      const mapped = keyboardMap[e.code];
      if (!mapped) return;
      const noteName = typeof mapped === 'number' ? midiToNoteName(mapped) : mapped;
      e.preventDefault();
      handleNoteStop(noteName);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [keyboardMap, pressedKeys]);

  const changeOctave = (direction) => {
    setOctave(prev => Math.max(1, Math.min(7, prev + direction)));
  };

  return (
    <div className={`bg-[#242529] border-gray-800 ${isMobile ? 'p-2' : 'p-4'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <h4 className={`font-medium text-gray-300 ${isMobile ? 'text-sm' : 'text-base'}`}>
            Virtual Keyboard
          </h4>
          <span className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>
            ({activeInstrument})
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => changeOctave(-1)}
            variant="ghost"
            size="sm"
            className={`text-gray-400 hover:text-white ${isMobile ? 'w-6 h-6 p-0' : 'w-8 h-8 p-0'}`}
            disabled={octave <= 1}
          >
            -
          </Button>
          <span className={`text-gray-300 ${isMobile ? 'text-sm' : 'text-base'} min-w-16 text-center`}>
            Octave {octave}
          </span>
          <Button
            onClick={() => changeOctave(1)}
            variant="ghost"
            size="sm"
            className={`text-gray-400 hover:text-white ${isMobile ? 'w-6 h-6 p-0' : 'w-8 h-8 p-0'}`}
            disabled={octave >= 7}
          >
            +
          </Button>
        </div>
      </div>

      {/* Piano Keys */}
      <div className="relative select-none">
        <div className="flex">
          {/* White Keys */}
          {Array.from({ length: totalOctaves * 7 }, (_, i) => {
            const keyIndex = i % 7;
            const currentOctave = startOctave + Math.floor(i / 7);
            const note = `${whiteKeys[keyIndex]}${currentOctave}`;
            const isPressed = pressedKeys.has(note);
            
            return (
              <button
                key={note}
                className={`relative border border-gray-600 transition-all duration-75 ${
                  isPressed 
                    ? 'bg-[#ff4500] border-[#ff4500]' 
                    : 'bg-white hover:bg-gray-100'
                } ${
                  isMobile 
                    ? 'w-8 h-20 text-xs' 
                    : 'w-12 h-32 text-sm'
                }`}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleNotePlay(note);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleNoteStop(note);
                }}
                onMouseDown={() => handleNotePlay(note)}
                onMouseUp={() => handleNoteStop(note)}
                onMouseLeave={() => handleNoteStop(note)}
              >
                <span className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 text-black font-medium ${
                  isMobile ? 'text-xs' : 'text-sm'
                }`}>
                  {whiteKeys[keyIndex]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Black Keys */}
        <div className="absolute top-0 flex">
          {Array.from({ length: totalOctaves * 7 }, (_, i) => {
            const keyIndex = i % 7;
            const currentOctave = startOctave + Math.floor(i / 7);
            const blackKeyNote = blackKeys[keyIndex];
            
            if (!blackKeyNote) {
              return (
                <div 
                  key={`spacer-${i}`} 
                  className={isMobile ? 'w-8' : 'w-12'}
                />
              );
            }
            
            const note = `${blackKeyNote}${currentOctave}`;
            const isPressed = pressedKeys.has(note);
            
            return (
              <div key={`container-${i}`} className={`relative ${isMobile ? 'w-8' : 'w-12'}`}>
                <button
                  className={`absolute transition-all duration-75 border border-gray-700 ${
                    isPressed 
                      ? 'bg-[#ff4500] border-[#ff4500]' 
                      : 'bg-gray-800 hover:bg-gray-700'
                  } ${
                    isMobile 
                      ? 'w-5 h-12 -ml-2.5 text-xs' 
                      : 'w-8 h-20 -ml-4 text-sm'
                  }`}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    handleNotePlay(note);
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    handleNoteStop(note);
                  }}
                  onMouseDown={() => handleNotePlay(note)}
                  onMouseUp={() => handleNoteStop(note)}
                  onMouseLeave={() => handleNoteStop(note)}
                >
                  <span className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 text-white font-medium ${
                    isMobile ? 'text-xs' : 'text-sm'
                  }`}>
                    {blackKeyNote.replace('#', '♯')}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Keyboard Shortcuts Info - Desktop Only */}
      {!isMobile && (
        <div className="mt-3 text-xs text-gray-500 text-center">
          Use computer keyboard: A S D F G H J K L (white keys) • W E T Y U O P (black keys)
        </div>
      )}
      
      {/* Mobile Instructions */}
      {isMobile && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          Tap keys to play • Use octave controls to change range
        </div>
      )}
    </div>
  );
};

export default VirtualKeyboard;