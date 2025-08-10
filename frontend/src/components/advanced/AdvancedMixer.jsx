import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import AdvancedEQ from './AdvancedEQ';
import SpectrumAnalyzer from './SpectrumAnalyzer';
import AdvancedCompressor from './AdvancedCompressor';
import AutomationLane from './AutomationLane';
import { 
  Volume2, VolumeX, Mic, Settings, Activity, Sliders,
  ChevronUp, ChevronDown, MoreHorizontal, Copy, Trash2,
  Send, ArrowRight, Power, Monitor, Headphones, TrendingUp
} from 'lucide-react';

const AdvancedChannelStrip = ({
  track,
  isSelected,
  onSelect,
  onMute,
  onSolo,
  onRecord,
  onVolumeChange,
  onPanChange,
  level = 0,
  expanded = false,
  onToggleExpanded,
  onEQParameterChange,
  onCompressorParameterChange,
  eqParameters = {},
  compressorParameters = {},
  gainReduction = 0,
  audioContext,
  audioSource
}) => {
  const [activeTab, setActiveTab] = useState('eq');
  const [eqEnabled, setEQEnabled] = useState(true);
  const [compEnabled, setCompEnabled] = useState(true);
  const [spectrumEnabled, setSpectrumEnabled] = useState(true);
  const [automationVisible, setAutomationVisible] = useState(false);
  
  const volume = typeof track.volume === 'number' ? track.volume : 75;
  const pan = typeof track.pan === 'number' ? track.pan : 0;

  const sendLevels = {
    reverb: 0,
    delay: 0,
    chorus: 15
  };

  return (
    <div className={`flex flex-col w-full max-w-sm transition-all duration-300 ${
      expanded ? 'min-h-[800px]' : 'min-h-[300px]'
    }`}>
      {/* Channel Header */}
      <Card className={`mb-2 ${isSelected ? 'ring-2 ring-[#ff4500]/50' : ''}`}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-sm" 
                style={{ backgroundColor: track.color || '#3b82f6' }}
              />
              <span className="text-sm text-white font-medium truncate">
                {track.name}
              </span>
            </div>
            <Button
              onClick={() => onToggleExpanded(track.id)}
              variant="ghost"
              size="sm"
              className="w-6 h-6 p-0 text-gray-400 hover:text-white"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>

          <div className="text-xs text-gray-400 mb-3">{track.instrument || 'Audio'}</div>

          {/* Transport Controls */}
          <div className="flex items-center justify-center space-x-1 mb-4">
            <Button
              onClick={() => onMute(track.id)}
              variant={track.muted ? 'default' : 'ghost'}
              size="sm"
              className={`w-8 h-8 p-0 text-xs ${
                track.muted ? 'bg-gray-600 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              M
            </Button>
            <Button
              onClick={() => onSolo(track.id)}
              variant={track.solo ? 'default' : 'ghost'}
              size="sm"
              className={`w-8 h-8 p-0 text-xs ${
                track.solo ? 'bg-yellow-600 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              S
            </Button>
            <Button
              onClick={() => onRecord(track.id)}
              variant={track.isRecording ? 'destructive' : 'ghost'}
              size="sm"
              className={`w-8 h-8 p-0 text-xs ${
                track.isRecording ? 'bg-red-600 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              R
            </Button>
          </div>

          {/* Level Meter */}
          <div className="mb-3">
            <div className="w-full h-3 bg-gray-800 rounded overflow-hidden">
              <div 
                className="h-full transition-all duration-75"
                style={{ 
                  width: `${Math.min(100, level * 100)}%`,
                  background: level > 0.8 ? '#ef4444' : level > 0.6 ? '#f59e0b' : '#22c55e'
                }}
              />
            </div>
            <div className="text-xs text-gray-400 text-center mt-1">
              {level > 0 ? `${(20 * Math.log10(level)).toFixed(1)}dB` : '-∞'}
            </div>
          </div>

          {/* Pan Control */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">Pan</span>
              <span className="text-xs text-gray-400">
                {pan > 0 ? `R${pan}` : pan < 0 ? `L${Math.abs(pan)}` : 'C'}
              </span>
            </div>
            <Slider
              value={[pan]}
              onValueChange={(v) => onPanChange(track.id, v)}
              min={-100}
              max={100}
              step={1}
              className="mb-1"
            />
          </div>

          {/* Volume Fader */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">Volume</span>
              <span className="text-xs text-gray-400">{Math.round(volume)}</span>
            </div>
            <Slider
              value={[volume]}
              onValueChange={(v) => onVolumeChange(track.id, v)}
              min={0}
              max={100}
              step={1}
              className="mb-1"
            />
          </div>

          {/* Send Controls (collapsed view) */}
          {!expanded && (
            <div className="space-y-2">
              <div className="text-xs text-gray-400 mb-1">Sends</div>
              {Object.entries(sendLevels).map(([sendName, sendLevel]) => (
                <div key={sendName} className="flex items-center space-x-2">
                  <span className="text-xs text-gray-300 w-12 capitalize">{sendName}</span>
                  <Slider
                    value={[sendLevel]}
                    onValueChange={() => {}}
                    min={0}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-xs text-gray-400 w-6">{sendLevel}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expanded Processing Section */}
      {expanded && (
        <div className="flex-1 space-y-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full bg-[#1a1a1b] border border-gray-800">
              <TabsTrigger 
                value="eq" 
                className="flex-1 data-[state=active]:bg-[#ff4500] data-[state=active]:text-white"
              >
                <Sliders className="w-4 h-4 mr-1" />
                EQ
              </TabsTrigger>
              <TabsTrigger 
                value="compressor"
                className="flex-1 data-[state=active]:bg-[#ff4500] data-[state=active]:text-white"
              >
                <Volume2 className="w-4 h-4 mr-1" />
                Comp
              </TabsTrigger>
              <TabsTrigger 
                value="automation"
                className="flex-1 data-[state=active]:bg-[#ff4500] data-[state=active]:text-white"
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                Auto
              </TabsTrigger>
              <TabsTrigger 
                value="analyzer"
                className="flex-1 data-[state=active]:bg-[#ff4500] data-[state=active]:text-white"
              >
                <Activity className="w-4 h-4 mr-1" />
                Analyzer
              </TabsTrigger>
            </TabsList>

            <TabsContent value="eq" className="mt-2">
              <AdvancedEQ
                trackId={track.id}
                isEnabled={eqEnabled}
                onToggle={setEQEnabled}
                onParameterChange={(param, value) => onEQParameterChange(track.id, param, value)}
                parameters={eqParameters}
              />
            </TabsContent>

            <TabsContent value="compressor" className="mt-2">
              <AdvancedCompressor
                trackId={track.id}
                isEnabled={compEnabled}
                onToggle={setCompEnabled}
                onParameterChange={(param, value) => onCompressorParameterChange(track.id, param, value)}
                parameters={compressorParameters}
                gainReduction={gainReduction}
                inputLevel={level}
                outputLevel={level * (1 - gainReduction / 100)}
              />
            </TabsContent>

            <TabsContent value="analyzer" className="mt-2">
              <SpectrumAnalyzer
                audioContext={audioContext}
                audioSource={audioSource}
                isEnabled={spectrumEnabled}
                onToggle={setSpectrumEnabled}
                size="small"
              />
            </TabsContent>
          </Tabs>

          {/* Send Section (expanded view) */}
          <Card className="bg-[#1a1a1b] border-gray-700">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-sm text-gray-400 font-medium">SENDS</h5>
                <Button variant="ghost" size="sm" className="w-6 h-6 p-0 text-gray-400">
                  <Settings className="w-3 h-3" />
                </Button>
              </div>
              
              <div className="space-y-3">
                {Object.entries(sendLevels).map(([sendName, sendLevel]) => (
                  <div key={sendName} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Send className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-gray-300 capitalize">{sendName}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-gray-400">{sendLevel}%</span>
                        <Switch size="sm" />
                      </div>
                    </div>
                    <Slider
                      value={[sendLevel]}
                      onValueChange={() => {}}
                      min={0}
                      max={100}
                      step={1}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t border-gray-700">
                <div className="flex justify-between">
                  <Button variant="ghost" size="sm" className="text-xs text-gray-400">
                    Pre-Fader
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs text-gray-400">
                    Post-EQ
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

const MasterSection = ({ 
  volume, 
  onVolumeChange, 
  level = 0, 
  audioContext, 
  masterAudioSource 
}) => {
  const [spectrumEnabled, setSpectrumEnabled] = useState(true);
  const [limiterEnabled, setLimiterEnabled] = useState(true);
  
  return (
    <div className="w-full max-w-md">
      <Card className="mb-2">
        <CardContent className="p-4">
          <div className="text-center mb-4">
            <h3 className="text-lg font-bold text-white">MASTER</h3>
            <Badge variant="secondary" className="text-xs mt-1">Stereo Out</Badge>
          </div>

          {/* Master Spectrum Analyzer */}
          <div className="mb-4">
            <SpectrumAnalyzer
              audioContext={audioContext}
              audioSource={masterAudioSource}
              isEnabled={spectrumEnabled}
              onToggle={setSpectrumEnabled}
              size="small"
              showControls={false}
            />
          </div>

          {/* Master Level Meters */}
          <div className="mb-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-xs text-gray-400 mb-1 text-center">L</div>
                <div className="w-full h-32 bg-gray-800 rounded relative overflow-hidden">
                  <div 
                    className="absolute bottom-0 w-full transition-all duration-75"
                    style={{ 
                      height: `${Math.min(100, level * 100)}%`,
                      background: level > 0.8 ? '#ef4444' : level > 0.6 ? '#f59e0b' : '#22c55e'
                    }}
                  />
                  {/* Peak indicators */}
                  {[0.2, 0.4, 0.6, 0.8, 1.0].map((threshold, i) => (
                    <div
                      key={i}
                      className="absolute w-full h-px bg-gray-600"
                      style={{ bottom: `${threshold * 100}%` }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1 text-center">R</div>
                <div className="w-full h-32 bg-gray-800 rounded relative overflow-hidden">
                  <div 
                    className="absolute bottom-0 w-full transition-all duration-75"
                    style={{ 
                      height: `${Math.min(100, level * 100)}%`,
                      background: level > 0.8 ? '#ef4444' : level > 0.6 ? '#f59e0b' : '#22c55e'
                    }}
                  />
                  {[0.2, 0.4, 0.6, 0.8, 1.0].map((threshold, i) => (
                    <div
                      key={i}
                      className="absolute w-full h-px bg-gray-600"
                      style={{ bottom: `${threshold * 100}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-400 text-center mt-1">
              Peak: {level > 0 ? `${(20 * Math.log10(level)).toFixed(1)}dB` : '-∞'}
            </div>
          </div>

          {/* Master Controls */}
          <div className="space-y-3">
            {/* Limiter */}
            <div className="flex items-center justify-between p-2 bg-[#2a2a2e] rounded">
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4 text-[#ff4500]" />
                <span className="text-sm text-white">Limiter</span>
              </div>
              <Switch checked={limiterEnabled} onCheckedChange={setLimiterEnabled} />
            </div>

            {/* Master Volume */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Master Volume</span>
                <span className="text-sm text-gray-400">{Math.round(volume)}</span>
              </div>
              <Slider
                value={[volume]}
                onValueChange={(v) => onVolumeChange(v[0])}
                min={0}
                max={100}
                step={1}
                className="mb-2"
              />
            </div>

            {/* Monitor Controls */}
            <div className="pt-3 border-t border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Monitor</span>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                    <Monitor className="w-4 h-4 text-gray-400 hover:text-white" />
                  </Button>
                  <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                    <Headphones className="w-4 h-4 text-gray-400 hover:text-white" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const AdvancedMixer = ({
  tracks = [],
  selectedTrack,
  onTrackSelect,
  onTrackMuteToggle,
  onTrackSoloToggle,
  onTrackRecordToggle,
  onTrackVolumeChange,
  onTrackPanChange,
  masterVolume = 80,
  onMasterVolumeChange,
  masterLevel = 0,
  audioContext,
  trackAudioSources = {},
  masterAudioSource
}) => {
  const [expandedTracks, setExpandedTracks] = useState(new Set());
  const [eqParameters, setEQParameters] = useState({});
  const [compressorParameters, setCompressorParameters] = useState({});

  const toggleTrackExpanded = (trackId) => {
    const newExpanded = new Set(expandedTracks);
    if (newExpanded.has(trackId)) {
      newExpanded.delete(trackId);
    } else {
      newExpanded.add(trackId);
    }
    setExpandedTracks(newExpanded);
  };

  const handleEQParameterChange = (trackId, parameter, value) => {
    setEQParameters(prev => ({
      ...prev,
      [trackId]: {
        ...prev[trackId],
        [parameter]: value
      }
    }));
  };

  const handleCompressorParameterChange = (trackId, parameter, value) => {
    setCompressorParameters(prev => ({
      ...prev,
      [trackId]: {
        ...prev[trackId],
        [parameter]: value
      }
    }));
  };

  return (
    <div className="border-t border-gray-800 bg-gradient-to-b from-[#0f0f11] to-[#1a1a1b]">
      <div className="px-4 py-2 text-xs text-gray-400 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4" />
          <span className="uppercase tracking-wider">Advanced Mixer</span>
          <Badge variant="secondary" className="text-xs">Professional</Badge>
        </div>
        <div className="text-xs text-gray-500">
          Click track headers to expand processing • Drag EQ nodes to adjust frequency response
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <div className="flex gap-4 px-4 py-4 min-w-max">
          {/* Track Channels */}
          {tracks.map((track) => (
            <AdvancedChannelStrip
              key={track.id}
              track={track}
              isSelected={selectedTrack === track.id}
              onSelect={onTrackSelect}
              onMute={onTrackMuteToggle}
              onSolo={onTrackSoloToggle}
              onRecord={onTrackRecordToggle}
              onVolumeChange={onTrackVolumeChange}
              onPanChange={onTrackPanChange}
              level={track.level || 0}
              expanded={expandedTracks.has(track.id)}
              onToggleExpanded={toggleTrackExpanded}
              onEQParameterChange={handleEQParameterChange}
              onCompressorParameterChange={handleCompressorParameterChange}
              eqParameters={eqParameters[track.id] || {}}
              compressorParameters={compressorParameters[track.id] || {}}
              gainReduction={0} // TODO: Get from audio engine
              audioContext={audioContext}
              audioSource={trackAudioSources[track.id]}
            />
          ))}

          {/* Master Section */}
          <MasterSection
            volume={masterVolume}
            onVolumeChange={onMasterVolumeChange}
            level={masterLevel}
            audioContext={audioContext}
            masterAudioSource={masterAudioSource}
          />
        </div>
      </div>
    </div>
  );
};

export default AdvancedMixer;