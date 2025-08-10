import React from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Users, TrendingUp, Clock, Music, Heart, MessageCircle, Share2, Play, Pause } from 'lucide-react';
import { mockTracks } from '../data/mock';

const Feed = () => {
  const TrackCard = ({ track }) => (
    <Card className="bg-gray-900 border border-gray-800 hover:bg-gray-850">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-800 rounded" />
            <div>
              <div className="text-white font-medium">{track.title}</div>
              <div className="text-gray-400 text-sm">by {track.artist.displayName}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white transition-colors">
              <Heart className="w-4 h-4 mr-1" />
              {track.likes}
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
            <TabsList variant="segment" className="w-full bg-gray-900 border border-gray-800 p-1 rounded-lg">
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