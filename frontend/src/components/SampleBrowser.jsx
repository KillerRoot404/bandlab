import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Play, Pause, Volume2, Download, Search, Filter } from 'lucide-react';
import { Input } from './ui/input';

const SampleBrowser = ({ 
  availablePacks, 
  selectedPack, 
  onPackSelect, 
  onSamplePlay, 
  getSamples,
  loading,
  error,
  isMobile = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [playingSample, setPlayingSample] = useState(null);
  const [samples, setSamples] = useState([]);

  useEffect(() => {
    if (selectedPack && getSamples) {
      const packSamples = getSamples(selectedPack);
      setSamples(packSamples || []);
    }
  }, [selectedPack, getSamples]);

  const filteredSamples = samples.filter(sample =>
    sample.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sample.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSamplePlay = (sampleId) => {
    if (playingSample === sampleId) {
      setPlayingSample(null);
    } else {
      setPlayingSample(sampleId);
      if (onSamplePlay) {
        onSamplePlay(sampleId);
      }
      // Auto stop after 3 seconds for demo
      setTimeout(() => setPlayingSample(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center h-64">
        <div className="flex items-center space-x-2 text-gray-400">
          <div className="w-4 h-4 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          <span className={isMobile ? 'text-sm' : 'text-base'}>Loading samples...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-400 mb-2">⚠️ Offline Mode</div>
          <p className={`text-gray-400 ${isMobile ? 'text-sm' : 'text-base'}`}>
            Using built-in samples
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isMobile ? 'p-3' : 'p-4'} h-full flex flex-col`}>
      <div className="flex-none">
        <h4 className={`font-medium text-gray-300 mb-3 ${isMobile ? 'text-base' : 'text-lg'}`}>
          SAMPLE BROWSER
        </h4>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search samples..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`bg-[#2a2a2e] border-gray-700 text-white pl-10 ${
              isMobile ? 'h-10 text-sm' : 'h-9'
            }`}
          />
        </div>

        {/* Sample Packs */}
        <div className="mb-4">
          <h5 className={`font-medium text-gray-400 mb-2 ${isMobile ? 'text-sm' : 'text-base'}`}>
            PACKS
          </h5>
          <div className={`grid gap-2 ${isMobile ? 'grid-cols-1' : 'grid-cols-1'}`}>
            {availablePacks.map((pack) => (
              <button
                key={pack.id}
                onClick={() => onPackSelect(pack.id)}
                className={`text-left p-3 rounded border transition-colors ${
                  selectedPack === pack.id
                    ? 'bg-[#ff4500]/20 border-[#ff4500] text-white'
                    : 'bg-[#2a2a2e] border-gray-700 text-gray-300 hover:bg-[#333338]'
                }`}
              >
                <div className={`font-medium ${isMobile ? 'text-sm' : 'text-base'}`}>
                  {pack.name}
                </div>
                <div className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  {pack.description}
                </div>
                <div className="flex items-center mt-1 space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    {pack.genre}
                  </Badge>
                  <span className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    {pack.bpm} BPM
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Samples List */}
      <div className="flex-1 overflow-y-auto">
        <h5 className={`font-medium text-gray-400 mb-2 ${isMobile ? 'text-sm' : 'text-base'}`}>
          SAMPLES {filteredSamples.length > 0 && `(${filteredSamples.length})`}
        </h5>
        
        <div className="space-y-2">
          {filteredSamples.map((sample) => (
            <Card key={sample.id} className="bg-[#2a2a2e] border-gray-700 hover:bg-[#333338] transition-colors">
              <CardContent className={isMobile ? 'p-3' : 'p-4'}>
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className={`text-white font-medium truncate ${
                      isMobile ? 'text-sm' : 'text-base'
                    }`}>
                      {sample.name}
                    </div>
                    <div className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      {sample.duration}s • {sample.key} • {sample.bpm} BPM
                    </div>
                    {sample.tags && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {sample.tags.slice(0, isMobile ? 2 : 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-3">
                    {/* Volume indicator */}
                    <div className="hidden sm:flex items-center space-x-1">
                      <Volume2 className="w-3 h-3 text-gray-500" />
                      <div className="flex space-x-px">
                        {Array.from({ length: 5 }, (_, i) => (
                          <div
                            key={i}
                            className={`w-1 h-3 ${
                              i < 3 ? 'bg-green-500' : 'bg-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    {/* Play Button */}
                    <Button
                      onClick={() => handleSamplePlay(sample.id)}
                      className={`rounded-full ${
                        playingSample === sample.id
                          ? 'bg-[#ff4500] hover:bg-[#ff5722]'
                          : 'bg-green-600 hover:bg-green-700'
                      } ${isMobile ? 'w-8 h-8 p-0' : 'w-10 h-10 p-0'}`}
                    >
                      {playingSample === sample.id ? (
                        <Pause className={isMobile ? 'w-3 h-3' : 'w-4 h-4'} />
                      ) : (
                        <Play className={isMobile ? 'w-3 h-3' : 'w-4 h-4'} />
                      )}
                    </Button>
                  </div>
                </div>
                
                {/* Waveform visualization - Simplified for mobile */}
                <div className="mt-2 h-8 bg-[#1a1a1b] rounded overflow-hidden">
                  <div className="flex items-center justify-center h-full">
                    {Array.from({ length: isMobile ? 20 : 40 }, (_, i) => (
                      <div
                        key={i}
                        className={`mx-px transition-all ${
                          playingSample === sample.id && i < 15
                            ? 'bg-[#ff4500]'
                            : 'bg-green-500/50'
                        }`}
                        style={{
                          height: `${Math.random() * 60 + 20}%`,
                          width: isMobile ? '2px' : '1px'
                        }}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {filteredSamples.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className={isMobile ? 'text-sm' : 'text-base'}>
              {searchTerm ? 'No samples match your search' : 'No samples available'}
            </p>
            {searchTerm && (
              <Button
                onClick={() => setSearchTerm('')}
                variant="ghost"
                className="mt-2 text-gray-400 hover:text-white"
              >
                Clear search
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SampleBrowser;