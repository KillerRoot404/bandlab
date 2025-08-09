import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Play, 
  Pause, 
  Search, 
  Music, 
  Drum, 
  Piano as PianoIcon,
  Zap,
  Waves,
  Download,
  Plus
} from 'lucide-react';
import { useSamples } from '../hooks/useSamples';

const SampleBrowser = ({ availablePacks, selectedPack, onPackSelect, onSamplePlay, getSamples }) => {
  const { samplePacks } = useSamples();

  const [searchQuery, setSearchQuery] = useState('');
  const [playingId, setPlayingId] = useState(null);
  const [searchResults, setSearchResults] = useState([]);

  const packs = availablePacks || samplePacks;

  useEffect(() => {
    if (searchQuery.trim()) {
      // Simple search implementation
      const results = [];
      packs.forEach(pack => {
        pack.samples.forEach(sample => {
          const matchesName = sample.name.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesTags = sample.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
          
          if (matchesName || matchesTags) {
            results.push({ ...sample, packName: pack.name, packColor: pack.color });
          }
        });
      });
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, packs]);

  const getSampleIcon = (type) => {
    const icons = {
      kick: Drum,
      snare: Drum,
      hihat: Drum,
      bass: Zap,
      lead: Music,
      pad: Waves,
      piano: PianoIcon,
      texture: Waves,
      drone: Waves,
      fx: Zap,
      loop: Music
    };
    return icons[type] || Music;
  };

  const handlePlaySample = async (sample) => {
    try {
      if (playingId === sample.id) {
        setPlayingId(null);
        return;
      }

      if (onSamplePlay) {
        onSamplePlay(sample.id);
        setPlayingId(sample.id);
        
        // Auto-stop after sample duration
        setTimeout(() => {
          setPlayingId(null);
        }, sample.duration * 1000);
      }
    } catch (error) {
      console.error('Error playing sample:', error);
    }
  };

  const handleAddToTrack = (sample) => {
    // This function would be implemented to add sample to track
    console.log('Adding sample to track:', sample);
  };

  const getSamplesByType = (type) => {
    const results = [];
    packs.forEach(pack => {
      pack.samples.forEach(sample => {
        if (sample.type === type) {
          results.push({ ...sample, packName: pack.name, packColor: pack.color });
        }
      });
    });
    return results;
  };

  const renderSample = (sample, packInfo = null) => {
    const Icon = getSampleIcon(sample.type);
    const isPlaying = playingId === sample.id;
    const pack = packInfo || packs.find(p => p.samples.some(s => s.id === sample.id));
    
    return (
      <div 
        key={sample.id}
        className="flex items-center p-3 bg-[#2a2a2e] rounded hover:bg-[#333338] cursor-pointer transition-colors border border-gray-700"
      >
        <div 
          className="w-8 h-8 rounded flex items-center justify-center mr-3"
          style={{ backgroundColor: pack?.color || '#666' }}
        >
          <Icon className="w-4 h-4 text-white" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <div className="text-sm text-white font-medium truncate">{sample.name}</div>
            <div className="flex space-x-1">
              {sample.tags.slice(0, 2).map((tag) => (
                <Badge 
                  key={tag} 
                  variant="outline" 
                  className="border-gray-600 text-xs text-gray-400"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <div className="text-xs text-gray-400">
            {sample.duration.toFixed(1)}s
            {sample.key && ` • ${sample.key}`}
            {pack && ` • ${pack.name}`}
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button
            onClick={() => handlePlaySample(sample)}
            size="sm"
            variant="ghost"
            className="w-8 h-8 p-0 text-gray-400 hover:text-white"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          
          <Button
            onClick={() => handleAddToTrack(sample)}
            size="sm"
            variant="ghost"
            className="w-8 h-8 p-0 text-gray-400 hover:text-[#ff4500]"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-[#242529] border-gray-700 h-full flex flex-col">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-medium text-gray-300 mb-3">
          SAMPLES & LOOPS
        </CardTitle>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search samples..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#2a2a2e] border-gray-600 text-white placeholder-gray-500"
          />
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-4 pt-0 overflow-hidden">
        <Tabs defaultValue="packs" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3 bg-[#2a2a2e] border-b border-gray-800 rounded-none">
            <TabsTrigger 
              value="packs" 
              className="data-[state=active]:bg-[#ff4500] data-[state=active]:text-white text-xs text-gray-400"
            >
              Packs
            </TabsTrigger>
            <TabsTrigger 
              value="types" 
              className="data-[state=active]:bg-[#ff4500] data-[state=active]:text-white text-xs text-gray-400"
            >
              Types
            </TabsTrigger>
            <TabsTrigger 
              value="search" 
              className="data-[state=active]:bg-[#ff4500] data-[state=active]:text-white text-xs text-gray-400"
              disabled={!searchQuery}
            >
              Search
            </TabsTrigger>
          </TabsList>

          {/* Sample Packs */}
          <TabsContent value="packs" className="flex-1 mt-4 overflow-y-auto space-y-3">
            <div className="space-y-4">
              {samplePacks.map((pack) => (
                <div key={pack.id} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: pack.color }}
                    />
                    <h4 className="text-sm font-medium text-gray-300">{pack.name}</h4>
                    <Badge variant="outline" className="border-gray-600 text-xs">
                      {pack.genre}
                    </Badge>
                    <Badge variant="outline" className="border-gray-600 text-xs">
                      {pack.bpm} BPM
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    {pack.samples.slice(0, 5).map((sample) => renderSample(sample, pack))}
                    {pack.samples.length > 5 && (
                      <div className="text-xs text-gray-500 text-center py-2">
                        +{pack.samples.length - 5} more samples
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Sample Types */}
          <TabsContent value="types" className="flex-1 mt-4 overflow-y-auto">
            <Tabs defaultValue="drums" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-4 bg-[#2a2a2e] mb-4">
                <TabsTrigger value="drums" className="text-xs">Drums</TabsTrigger>
                <TabsTrigger value="bass" className="text-xs">Bass</TabsTrigger>
                <TabsTrigger value="melody" className="text-xs">Melody</TabsTrigger>
                <TabsTrigger value="fx" className="text-xs">FX</TabsTrigger>
              </TabsList>
              
              <TabsContent value="drums" className="flex-1 overflow-y-auto space-y-2">
                {getSamplesByType('kick').concat(getSamplesByType('snare'), getSamplesByType('hihat'))
                  .map((sample) => renderSample(sample))}
              </TabsContent>
              
              <TabsContent value="bass" className="flex-1 overflow-y-auto space-y-2">
                {getSamplesByType('bass').map((sample) => renderSample(sample))}
              </TabsContent>
              
              <TabsContent value="melody" className="flex-1 overflow-y-auto space-y-2">
                {getSamplesByType('lead').concat(getSamplesByType('pad'), getSamplesByType('piano'))
                  .map((sample) => renderSample(sample))}
              </TabsContent>
              
              <TabsContent value="fx" className="flex-1 overflow-y-auto space-y-2">
                {getSamplesByType('fx').concat(getSamplesByType('texture'))
                  .map((sample) => renderSample(sample))}
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Search Results */}
          <TabsContent value="search" className="flex-1 mt-4 overflow-y-auto space-y-2">
            {searchResults.length > 0 ? (
              searchResults.map((sample) => renderSample(sample))
            ) : (
              <div className="text-center text-gray-500 py-8">
                {searchQuery ? 'No samples found' : 'Enter a search query'}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SampleBrowser;