import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Slider } from '../components/ui/slider';
import { Badge } from '../components/ui/badge';
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Volume2,
  VolumeX,
  Mic,
  Piano,
  Headphones,
  Settings,
  Save,
  Share,
  Plus,
  Trash2
} from 'lucide-react';
import { mockStudioData } from '../data/mock';

const Studio = () => {
  const [studioData, setStudioData] = useState(mockStudioData);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [selectedTrack, setSelectedTrack] = useState(null);

  // Simulate playback timer
  useEffect(() => {
    let interval;
    if (studioData.isPlaying) {
      interval = setInterval(() => {
        setPlaybackTime(prev => prev + 0.1);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [studioData.isPlaying]);

  const togglePlay = () => {
    setStudioData(prev => ({
      ...prev,
      isPlaying: !prev.isPlaying
    }));
  };

  const stopPlayback = () => {
    setStudioData(prev => ({
      ...prev,
      isPlaying: false
    }));
    setPlaybackTime(0);
  };

  const toggleRecord = () => {
    setStudioData(prev => ({
      ...prev,
      isRecording: !prev.isRecording
    }));
  };

  const toggleTrackMute = (trackId) => {
    setStudioData(prev => ({
      ...prev,
      tracks: prev.tracks.map(track => 
        track.id === trackId 
          ? { ...track, muted: !track.muted }
          : track
      )
    }));
  };

  const toggleTrackSolo = (trackId) => {
    setStudioData(prev => ({
      ...prev,
      tracks: prev.tracks.map(track => 
        track.id === trackId 
          ? { ...track, solo: !track.solo }
          : track
      )
    }));
  };

  const updateTrackVolume = (trackId, volume) => {
    setStudioData(prev => ({
      ...prev,
      tracks: prev.tracks.map(track => 
        track.id === trackId 
          ? { ...track, volume: volume[0] }
          : track
      )
    }));
  };

  const addNewTrack = () => {
    const newTrack = {
      id: String(studioData.tracks.length + 1),
      name: `Track ${studioData.tracks.length + 1}`,
      instrument: 'Synth',
      volume: 75,
      muted: false,
      solo: false,
      color: '#8b5cf6',
      clips: []
    };
    
    setStudioData(prev => ({
      ...prev,
      tracks: [...prev.tracks, newTrack]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Studio Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{studioData.currentProject.name}</h1>
            <div className="flex items-center space-x-6 text-sm text-gray-400 mt-1">
              <span>BPM: {studioData.currentProject.bpm}</span>
              <span>Key: {studioData.currentProject.key}</span>
              <span>Time: {studioData.currentProject.timeSignature}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" className="border-gray-600">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" size="sm" className="border-gray-600">
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm" className="border-gray-600">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Transport Controls */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-center space-x-4">
          <Button
            onClick={stopPlayback}
            variant="outline"
            size="sm"
            className="border-gray-600"
          >
            <Square className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={togglePlay}
            variant="default"
            size="lg"
            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
          >
            {studioData.isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>
          
          <Button
            onClick={toggleRecord}
            variant={studioData.isRecording ? "destructive" : "outline"}
            size="sm"
            className={!studioData.isRecording ? "border-gray-600" : ""}
          >
            <div className={`w-3 h-3 rounded-full ${studioData.isRecording ? 'bg-white' : 'bg-red-500'}`} />
          </Button>
          
          <Button
            onClick={() => setPlaybackTime(0)}
            variant="outline"
            size="sm"
            className="border-gray-600"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          
          <div className="text-mono text-sm bg-gray-800 px-3 py-1 rounded">
            {Math.floor(playbackTime / 60)}:{String(Math.floor(playbackTime % 60)).padStart(2, '0')}.{String(Math.floor((playbackTime % 1) * 10)).padStart(1, '0')}
          </div>
        </div>
      </div>

      <div className="flex h-full">
        {/* Track List */}
        <div className="w-80 bg-gray-900 border-r border-gray-800">
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Tracks</h3>
              <Button onClick={addNewTrack} size="sm" variant="outline" className="border-gray-600">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-2">
              {studioData.tracks.map((track) => (
                <Card 
                  key={track.id} 
                  className={`bg-gray-800 border-gray-700 cursor-pointer transition-all ${
                    selectedTrack === track.id ? 'border-orange-500' : 'hover:bg-gray-750'
                  }`}
                  onClick={() => setSelectedTrack(track.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: track.color }}
                        />
                        <span className="font-medium text-sm">{track.name}</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="w-6 h-6 p-0 text-gray-400 hover:text-white"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    <div className="text-xs text-gray-400 mb-2">{track.instrument}</div>
                    
                    <div className="flex items-center space-x-2 mb-2">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTrackMute(track.id);
                        }}
                        variant={track.muted ? "destructive" : "ghost"}
                        size="sm"
                        className="w-6 h-6 p-0 text-xs"
                      >
                        M
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTrackSolo(track.id);
                        }}
                        variant={track.solo ? "default" : "ghost"}
                        size="sm"
                        className="w-6 h-6 p-0 text-xs"
                      >
                        S
                      </Button>
                      <div className="flex-1">
                        <Slider
                          value={[track.volume]}
                          onValueChange={(value) => updateTrackVolume(track.id, value)}
                          max={100}
                          step={1}
                          className="flex-1"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-8">{track.volume}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline/Arrangement View */}
        <div className="flex-1 bg-gray-950">
          <div className="p-6">
            <div className="bg-gray-900 rounded-lg p-6 h-96">
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Piano className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Music Creation Studio</h3>
                  <p className="text-gray-400 mb-4">
                    Select a track to start editing, or create a new track to begin composing.
                  </p>
                  <div className="flex items-center justify-center space-x-4">
                    <Badge variant="outline" className="border-gray-600">
                      <Mic className="w-3 h-3 mr-1" />
                      Record
                    </Badge>
                    <Badge variant="outline" className="border-gray-600">
                      <Piano className="w-3 h-3 mr-1" />
                      Instruments
                    </Badge>
                    <Badge variant="outline" className="border-gray-600">
                      <Headphones className="w-3 h-3 mr-1" />
                      Effects
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Instruments/Effects */}
        <div className="w-80 bg-gray-900 border-l border-gray-800">
          <div className="p-4">
            <h3 className="font-semibold mb-4">Library</h3>
            <div className="space-y-3">
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <Piano className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Instruments</div>
                      <div className="text-xs text-gray-400">Piano, Synths, Drums</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                      <Volume2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Effects</div>
                      <div className="text-xs text-gray-400">Reverb, Delay, EQ</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                      <Mic className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Samples</div>
                      <div className="text-xs text-gray-400">Loops, One-shots</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Studio;