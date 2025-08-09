import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Zap, 
  Volume2, 
  Filter, 
  Activity, 
  Waves, 
  Settings,
  Plus,
  X,
  MoreHorizontal
} from 'lucide-react';
import { useAdvancedEffects } from '../hooks/useAdvancedEffects';

const EffectsRack = ({ trackId, effects = [], onEffectAdd, onEffectRemove, onEffectUpdate }) => {
  const { availableEffects } = useAdvancedEffects();
  const [showAddDialog, setShowAddDialog] = useState(false);

  const getEffectIcon = (type) => {
    const icons = {
      autotune: Zap,
      reverb: Waves,
      delay: Volume2,
      compressor: Activity,
      eq: Filter,
      chorus: Waves,
      distortion: Activity,
      filter: Filter,
      gate: Activity,
      pitch_shift: Zap
    };
    return icons[type] || Settings;
  };

  const handleAddEffect = (effectType) => {
    const effectTemplate = availableEffects.find(e => e.type === effectType);
    if (effectTemplate && onEffectAdd) {
      const newEffect = {
        id: `effect_${Date.now()}`,
        type: effectType,
        name: effectTemplate.name,
        enabled: true,
        parameters: effectTemplate.parameters.reduce((params, param) => {
          params[param.name] = param.value;
          return params;
        }, {})
      };
      onEffectAdd(trackId, newEffect);
      setShowAddDialog(false);
    }
  };

  const handleParameterChange = (effectId, paramName, value) => {
    if (onEffectUpdate) {
      onEffectUpdate(trackId, effectId, paramName, value);
    }
  };

  const handleEffectToggle = (effectId, enabled) => {
    if (onEffectUpdate) {
      onEffectUpdate(trackId, effectId, 'enabled', enabled);
    }
  };

  const handleRemoveEffect = (effectId) => {
    if (onEffectRemove) {
      onEffectRemove(trackId, effectId);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-300">EFFECTS</h3>
        <Button 
          onClick={() => setShowAddDialog(true)}
          size="sm"
          variant="ghost"
          className="text-gray-400 hover:text-white w-6 h-6 p-0"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Effects Chain */}
      <div className="space-y-3">
        {effects.map((effect, index) => {
          const effectTemplate = availableEffects.find(e => e.type === effect.type);
          const Icon = getEffectIcon(effect.type);
          
          return (
            <Card key={effect.id} className="bg-[#2a2a2e] border-gray-700">
              <CardHeader className="p-3 pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon className="w-4 h-4 text-[#ff4500]" />
                    <CardTitle className="text-sm text-white">{effect.name}</CardTitle>
                    <Badge variant="outline" className="border-gray-600 text-xs">
                      {effectTemplate?.category || 'Effect'}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Switch 
                      checked={effect.enabled}
                      onCheckedChange={(enabled) => handleEffectToggle(effect.id, enabled)}
                      size="sm"
                    />
                    <Button
                      onClick={() => handleRemoveEffect(effect.id)}
                      size="sm"
                      variant="ghost"
                      className="w-5 h-5 p-0 text-gray-500 hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {effect.enabled && effectTemplate && (
                <CardContent className="p-3 pt-0">
                  <div className="space-y-3">
                    {effectTemplate.parameters.map((param) => (
                      <div key={param.name} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs text-gray-400 capitalize">
                            {param.name.replace('_', ' ')}
                          </label>
                          <span className="text-xs text-gray-400">
                            {effect.parameters[param.name] || param.value}{param.unit || ''}
                          </span>
                        </div>
                        <Slider
                          value={[effect.parameters[param.name] || param.value]}
                          onValueChange={(value) => handleParameterChange(effect.id, param.name, value[0])}
                          min={param.min}
                          max={param.max}
                          step={0.1}
                          className="w-full"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Add Effect Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96 max-h-96 overflow-y-auto bg-[#242529] border-gray-700">
            <CardHeader className="p-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Add Effect</CardTitle>
                <Button
                  onClick={() => setShowAddDialog(false)}
                  size="sm"
                  variant="ghost"
                  className="w-6 h-6 p-0 text-gray-400"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-[#2a2a2e]">
                  <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                  <TabsTrigger value="dynamics" className="text-xs">Dynamics</TabsTrigger>
                  <TabsTrigger value="spatial" className="text-xs">Spatial</TabsTrigger>
                  <TabsTrigger value="filter" className="text-xs">Filter</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="mt-4 space-y-2">
                  {availableEffects.map((effect) => {
                    const Icon = getEffectIcon(effect.type);
                    return (
                      <Button
                        key={effect.type}
                        onClick={() => handleAddEffect(effect.type)}
                        variant="ghost"
                        className="w-full justify-start p-2 h-auto text-gray-300 hover:bg-[#333338]"
                      >
                        <Icon className="w-4 h-4 mr-2 text-[#ff4500]" />
                        <div className="text-left">
                          <div className="text-sm font-medium">{effect.name}</div>
                          <div className="text-xs text-gray-500">{effect.category}</div>
                        </div>
                      </Button>
                    );
                  })}
                </TabsContent>
                
                <TabsContent value="dynamics" className="mt-4 space-y-2">
                  {availableEffects.filter(e => e.category === 'Dynamics').map((effect) => {
                    const Icon = getEffectIcon(effect.type);
                    return (
                      <Button
                        key={effect.type}
                        onClick={() => handleAddEffect(effect.type)}
                        variant="ghost"
                        className="w-full justify-start p-2 h-auto text-gray-300 hover:bg-[#333338]"
                      >
                        <Icon className="w-4 h-4 mr-2 text-[#ff4500]" />
                        <div className="text-left">
                          <div className="text-sm font-medium">{effect.name}</div>
                          <div className="text-xs text-gray-500">{effect.category}</div>
                        </div>
                      </Button>
                    );
                  })}
                </TabsContent>
                
                <TabsContent value="spatial" className="mt-4 space-y-2">
                  {availableEffects.filter(e => e.category === 'Spatial').map((effect) => {
                    const Icon = getEffectIcon(effect.type);
                    return (
                      <Button
                        key={effect.type}
                        onClick={() => handleAddEffect(effect.type)}
                        variant="ghost"
                        className="w-full justify-start p-2 h-auto text-gray-300 hover:bg-[#333338]"
                      >
                        <Icon className="w-4 h-4 mr-2 text-[#ff4500]" />
                        <div className="text-left">
                          <div className="text-sm font-medium">{effect.name}</div>
                          <div className="text-xs text-gray-500">{effect.category}</div>
                        </div>
                      </Button>
                    );
                  })}
                </TabsContent>
                
                <TabsContent value="filter" className="mt-4 space-y-2">
                  {availableEffects.filter(e => e.category === 'Filter').map((effect) => {
                    const Icon = getEffectIcon(effect.type);
                    return (
                      <Button
                        key={effect.type}
                        onClick={() => handleAddEffect(effect.type)}
                        variant="ghost"
                        className="w-full justify-start p-2 h-auto text-gray-300 hover:bg-[#333338]"
                      >
                        <Icon className="w-4 h-4 mr-2 text-[#ff4500]" />
                        <div className="text-left">
                          <div className="text-sm font-medium">{effect.name}</div>
                          <div className="text-xs text-gray-500">{effect.category}</div>
                        </div>
                      </Button>
                    );
                  })}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EffectsRack;