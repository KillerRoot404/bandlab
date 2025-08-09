import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Play, 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  TrendingUp,
  Clock,
  Music,
  Users
} from 'lucide-react';
import { mockTracks, mockUsers } from '../data/mock';

const Feed = () => {
  const [likedTracks, setLikedTracks] = useState(new Set());
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);

  const toggleLike = (trackId) => {
    const newLikedTracks = new Set(likedTracks);
    if (newLikedTracks.has(trackId)) {
      newLikedTracks.delete(trackId);
    } else {
      newLikedTracks.add(trackId);
    }
    setLikedTracks(newLikedTracks);
  };

  const playTrack = (trackId) => {
    if (currentlyPlaying === trackId) {
      setCurrentlyPlaying(null);
    } else {
      setCurrentlyPlaying(trackId);
    }
  };

  const TrackCard = ({ track }) => (
    <Card className="bg-gray-900 border-gray-800 hover:bg-gray-850 transition-colors">
      <CardContent className="p-6">
        {/* Track Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={track.artist.avatar} alt={track.artist.displayName} />
              <AvatarFallback>{track.artist.displayName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <Link 
                to={`/profile/${track.artist.username}`}
                className="font-medium text-white hover:text-orange-500 transition-colors"
              >
                {track.artist.displayName}
              </Link>
              <div className="text-sm text-gray-400 flex items-center space-x-2">
                <span>{track.createdAt}</span>
                <span>•</span>
                <Badge variant="outline" className="border-gray-600 text-xs">
                  {track.genre}
                </Badge>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>

        {/* Track Content */}
        <div className="mb-4">
          <Link 
            to={`/track/${track.id}`}
            className="text-xl font-semibold text-white hover:text-orange-500 transition-colors block mb-2"
          >
            {track.title}
          </Link>
          
          {/* Waveform Player */}
          <div className="relative bg-gray-800 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => playTrack(track.id)}
                variant="default"
                size="sm"
                className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 rounded-full w-10 h-10 p-0"
              >
                <Play className="w-4 h-4" />
              </Button>
              
              <div className="flex-1">
                <div className="h-16 bg-gradient-to-r from-gray-700 to-gray-600 rounded relative overflow-hidden">
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 opacity-30"
                    style={{ width: currentlyPlaying === track.id ? '60%' : '0%' }}
                  />
                  {/* Mock waveform bars */}
                  <div className="absolute inset-0 flex items-end justify-around px-2">
                    {Array.from({ length: 50 }).map((_, i) => (
                      <div
                        key={i}
                        className="bg-white opacity-60"
                        style={{ 
                          width: '2px',
                          height: `${Math.random() * 100}%`,
                          minHeight: '2px'
                        }}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0:00</span>
                  <span>{track.duration}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Track Stats */}
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <Play className="w-4 h-4 mr-1" />
                {track.plays.toLocaleString()}
              </span>
              <span>•</span>
              <span>{track.collaborators.length} collaborator{track.collaborators.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center space-x-2">
              {track.tags.map(tag => (
                <Badge key={tag} variant="outline" className="border-gray-600 text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => toggleLike(track.id)}
              variant="ghost"
              size="sm"
              className={`text-gray-400 hover:text-red-500 transition-colors ${
                likedTracks.has(track.id) ? 'text-red-500' : ''
              }`}
            >
              <Heart className={`w-4 h-4 mr-1 ${likedTracks.has(track.id) ? 'fill-current' : ''}`} />
              {track.likes + (likedTracks.has(track.id) ? 1 : 0)}
            </Button>
            
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white transition-colors">
              <MessageCircle className="w-4 h-4 mr-1" />
              {track.comments}
            </Button>
            
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white transition-colors">
              <Share2 className="w-4 h-4 mr-1" />
              Share
            </Button>
          </div>
          
          <Button variant="outline" size="sm" className="border-gray-600 text-white hover:bg-gray-800">
            Add to Playlist
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Feed Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Music Feed</h1>
          
          <Tabs defaultValue="following" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-900 border border-gray-800">
              <TabsTrigger value="following" className="data-[state=active]:bg-orange-500">
                <Users className="w-4 h-4 mr-2" />
                Following
              </TabsTrigger>
              <TabsTrigger value="trending" className="data-[state=active]:bg-orange-500">
                <TrendingUp className="w-4 h-4 mr-2" />
                Trending
              </TabsTrigger>
              <TabsTrigger value="recent" className="data-[state=active]:bg-orange-500">
                <Clock className="w-4 h-4 mr-2" />
                Recent
              </TabsTrigger>
              <TabsTrigger value="genres" className="data-[state=active]:bg-orange-500">
                <Music className="w-4 h-4 mr-2" />
                Genres
              </TabsTrigger>
            </TabsList>

            <TabsContent value="following" className="space-y-6 mt-6">
              {mockTracks.map(track => (
                <TrackCard key={track.id} track={track} />
              ))}
            </TabsContent>

            <TabsContent value="trending" className="space-y-6 mt-6">
              {[...mockTracks]
                .sort((a, b) => b.plays - a.plays)
                .map(track => (
                  <TrackCard key={track.id} track={track} />
                ))}
            </TabsContent>

            <TabsContent value="recent" className="space-y-6 mt-6">
              {[...mockTracks]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map(track => (
                  <TrackCard key={track.id} track={track} />
                ))}
            </TabsContent>

            <TabsContent value="genres" className="space-y-6 mt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {['Electronic', 'Hip Hop', 'Rock', 'Pop', 'Jazz', 'Classical', 'Folk', 'R&B'].map(genre => (
                  <Button
                    key={genre}
                    variant="outline"
                    className="border-gray-600 hover:bg-orange-500 hover:border-orange-500"
                  >
                    {genre}
                  </Button>
                ))}
              </div>
              {mockTracks.map(track => (
                <TrackCard key={track.id} track={track} />
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Feed;