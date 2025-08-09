import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { 
  Zap, Waves, Volume2, Filter, Activity, Settings, 
  Plus, Trash2, MoreHorizontal, ChevronDown, ChevronUp,
  Sliders, Music
} from 'lucide-react';

const EffectsRack = ({ 
  availableEffects, 
  selectedTrack, 
  tracks, 
  onEffectAdd, 
  onEffectUpdate,
  isMobile = false
}) => {
  const [expandedEffect, setExpandedEffect] = useState(null);
  const [showAddEffects, setShowAddEffects] = useState(false);

  const currentTrack = tracks.find(t => t.id === selectedTrack);
  const trackEffects = currentTrack?.effects || [];

  const getEffectIcon = (effectType) => {
    const iconClass = isMobile ? 'w-4 h-4' : 'w-5 h-5';
    switch (effectType.toLowerCase()) {
      case 'autotune': return <Music className={iconClass} />;
      case 'reverb': return <Waves className={iconClass} />;
      case 'delay': return <Activity className={iconClass} />;
      case 'compressor': return <Volume2 className={iconClass} />;
      case 'eq': return <Sliders className={iconClass} />;
      case 'chorus': return <Zap className={iconClass} />;
      case 'distortion': return <Filter className={iconClass} />;
      default: return <Settings className={iconClass} />;
    }
  };

  const handleAddEffect = (effect) => {
    if (onEffectAdd) {
      const effectData = {
        id: `${effect.id}_${Date.now()}`,
        type: effect.type,
        name: effect.name,
        enabled: true,
        parameters: effect.parameters.map(param => ({
          ...param,
          value: param.default_value
        }))
      };
      onEffectAdd(effectData);
    }
    setShowAddEffects(false);
  };

  const handleParameterChange = (effectIndex, paramName, value) => {
    if (onEffectUpdate) {
      onEffectUpdate(effectIndex, paramName, value);
    }
  };

  const toggleEffect = (effectIndex) => {
    const effect = trackEffects[effectIndex];
    if (effect && onEffectUpdate) {
      const enabledParam = effect.parameters.find(p => p.name === 'enabled');
      if (enabledParam) {
        onEffectUpdate(effectIndex, 'enabled', !enabledParam.value);
      }
    }
  };

  return (
    <div className={`${isMobile ? 'p-3' : 'p-4'} h-full flex flex-col`}>
      <div className="flex items-center justify-between mb-4">
        <h4 className={`font-medium text-gray-300 ${isMobile ? 'text-base' : 'text-lg'}`}>
          EFFECTS RACK
        </h4>
        <Button
          onClick={() => setShowAddEffects(!showAddEffects)}
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-white"
        >
          <Plus className={isMobile ? 'w-4 h-4' : 'w-5 h-5'} />
        </Button>
      </div>

      {/* Selected Track Info */}
      {currentTrack && (
        <div className="mb-4 p-3 bg-[#2a2a2e] rounded border border-gray-700">
          <div className="flex items-center space-x-2">
            <div 
              className={`rounded-full ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`}
              style={{ backgroundColor: currentTrack.color }}
            />
            <span className={`text-white font-medium ${isMobile ? 'text-sm' : 'text-base'}`}>
              {currentTrack.name}
            </span>
            <Badge variant="secondary" className="text-xs">
              {trackEffects.length} effects
            </Badge>
          </div>
        </div>
      )}

      {/* Add Effects Section */}
      {showAddEffects && (
        <div className="mb-4 p-3 bg-[#2a2a2e] rounded border border-gray-700">
          <h5 className={`font-medium text-gray-400 mb-3 ${isMobile ? 'text-sm' : 'text-base'}`}>
            ADD EFFECTS
          </h5>
          <div className={`grid gap-2 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {availableEffects.map((effect) => (
              <button
                key={effect.id}
                onClick={() => handleAddEffect(effect)}
                className="flex items-center p-3 bg-[#1a1a1b] hover:bg-[#333338] rounded border border-gray-700 transition-colors text-left"
              >
                <div className="mr-3 text-[#ff4500]">
                  {getEffectIcon(effect.type)}
                </div>
                <div className="flex-1">
                  <div className={`text-white font-medium ${isMobile ? 'text-sm' : 'text-base'}`}>
                    {effect.name}
                  </div>
                  <div className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    {effect.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
          <Button
            onClick={() => setShowAddEffects(false)}
            variant="ghost"
            className="w-full mt-3 text-gray-400 hover:text-white"
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Track Effects */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {trackEffects.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="mb-2">
              <Sliders className={`mx-auto ${isMobile ? 'w-8 h-8' : 'w-12 h-12'} text-gray-600`} />
            </div>
            <p className={isMobile ? 'text-sm' : 'text-base'}>No effects on this track</p>
            <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
              Click the + button to add effects
            </p>
          </div>
        ) : (
          trackEffects.map((effect, effectIndex) => {
            const isExpanded = expandedEffect === effectIndex;
            const isEnabled = effect.parameters.find(p => p.name === 'enabled')?.value !== false;

            return (
              <Card key={effect.id} className="bg-[#2a2a2e] border-gray-700">
                <CardContent className={isMobile ? 'p-3' : 'p-4'}>
                  {/* Effect Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className={`text-[#ff4500] ${!isEnabled ? 'opacity-50' : ''}`}>
                        {getEffectIcon(effect.type)}
                      </div>
                      <div className="flex-1">
                        <div className={`text-white font-medium ${
                          isMobile ? 'text-sm' : 'text-base'
                        } ${!isEnabled ? 'opacity-50' : ''}`}>
                          {effect.name}
                        </div>
                        <div className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                          {effect.type}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {/* Enable/Disable Switch */}
                      <Switch
                        checked={isEnabled}
                        onCheckedChange={() => toggleEffect(effectIndex)}
                      />
                      
                      {/* Expand/Collapse */}
                      <Button
                        onClick={() => setExpandedEffect(isExpanded ? null : effectIndex)}
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-white w-6 h-6 p-0"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                      
                      {/* Delete Effect */}
                      <Button
                        onClick={() => {
                          // Handle effect deletion
                          console.log('Delete effect', effectIndex);
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-red-400 w-6 h-6 p-0"
                      >
                        <Trash2 className={isMobile ? 'w-3 h-3' : 'w-4 h-4'} />
                      </Button>
                    </div>
                  </div>

                  {/* Effect Parameters */}
                  {isExpanded && (
                    <div className="space-y-3 pt-3 border-t border-gray-700">
                      {effect.parameters
                        .filter(param => param.name !== 'enabled')
                        .map((param) => (
                        <div key={param.name} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className={`text-gray-300 ${isMobile ? 'text-sm' : 'text-base'}`}>
                              {param.display_name || param.name}
                            </label>
                            <span className={`text-gray-400 ${isMobile ? 'text-sm' : 'text-base'}`}>
                              {param.value}{param.unit || ''}
                            </span>
                          </div>
                          
                          <Slider
                            value={[param.value]}
                            onValueChange={(value) => 
                              handleParameterChange(effectIndex, param.name, value[0])
                            }
                            min={param.min_value}
                            max={param.max_value}
                            step={param.step || 0.1}
                            className="w-full"
                            disabled={!isEnabled}
                          />
                          
                          {param.description && (
                            <p className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                              {param.description}
                            </p>
                          )}
                        </div>
                      ))}

                      {/* Preset Controls - Mobile Optimized */}
                      {!isMobile && (
                        <div className="pt-2 border-t border-gray-700">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Presets</span>
                            <div className="flex space-x-1">
                              <Button variant="ghost" size="sm" className="text-xs text-gray-400 hover:text-white">
                                Save
                              </Button>
                              <Button variant="ghost" size="sm" className="text-xs text-gray-400 hover:text-white">
                                Reset
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Mobile Quick Actions */}
      {isMobile && trackEffects.length > 0 && (
        <div className="mt-4 p-3 bg-[#2a2a2e] rounded border border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Quick Actions</span>
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" className="text-xs text-gray-400 hover:text-white">
                Bypass All
              </Button>
              <Button variant="ghost" size="sm" className="text-xs text-gray-400 hover:text-white">
                Clear All
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EffectsRack;