import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Music, Users, Heart, Settings, MessageCircle, UserPlus } from 'lucide-react';
import { mockProfile, mockTracks, mockProjects, mockCollaborations } from '../data/mock';

const Profile = () => {
  const [isFollowing, setIsFollowing] = useState(false);
  const user = mockProfile;
  const userTracks = mockTracks;
  const collaborations = mockCollaborations;
  const userProjects = mockProjects;

  const toggleFollow = () => setIsFollowing(!isFollowing);

  const TrackItem = ({ track }) => (
    <Card className="bg-gray-900 border border-gray-800">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-800 rounded" />
            <div>
              <div className="text-white font-medium">{track.title}</div>
              <div className="text-gray-400 text-sm">{track.genre} • {track.duration}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="border-gray-600 text-white hover:bg-gray-800">
              Edit
            </Button>
            <Button variant="outline" size="sm" className="border-gray-600 text-red-400 hover:text-white hover:bg-red-500/10">
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ProjectItem = ({ project }) => (
    <Card className="bg-gray-900 border border-gray-800">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-800 rounded" />
            <div>
              <div className="text-white font-medium">{project.name}</div>
              <div className="text-gray-400 text-sm">{project.tracks.length} tracks</div>
            </div>
          </div>
          <Button variant="outline" size="sm" className="border-gray-600 text-white hover:bg-gray-800">
            Open
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className="flex items-start space-x-4 mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-orange-500 rounded-full" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">{user.displayName}</h1>
                <div className="text-gray-400">@{user.username}</div>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  onClick={toggleFollow}
                  variant={isFollowing ? "outline" : "default"}
                  className={isFollowing 
                    ? "border-gray-600 hover:bg-gray-800" 
                    : "bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                  }
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
                
                <Button variant="outline" className="border-gray-600 hover:bg-gray-800">
                  <MessageCircle className="w-4 h-4" />
                </Button>
                
                <Button variant="outline" className="border-gray-600 hover:bg-gray-800">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="mt-3 text-gray-300">{user.bio}</div>
            <div className="mt-3 flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <span>
                  <span className="font-semibold text-white">{userTracks.length}</span>
                  <span className="text-gray-400 ml-1">Tracks</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <Tabs defaultValue="tracks" className="w-full">
          <TabsList variant="segment" className="w-full bg-gray-900 border border-gray-800 mb-6 p-1 rounded-lg">
            <TabsTrigger value="tracks" className="data-[state=active]:bg-orange-500">
              <Music className="w-4 h-4 mr-2" />
              Tracks ({userTracks.length})
            </TabsTrigger>
            <TabsTrigger value="collaborations" className="data-[state=active]:bg-orange-500">
              <Users className="w-4 h-4 mr-2" />
              Collaborations ({collaborations.length})
            </TabsTrigger>
            <TabsTrigger value="projects" className="data-[state=active]:bg-orange-500">
              Projects ({userProjects.length})
            </TabsTrigger>
            <TabsTrigger value="likes" className="data-[state=active]:bg-orange-500">
              Liked
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tracks" className="space-y-4">
            {userTracks.length > 0 ? (
              userTracks.map(track => (
                <TrackItem key={track.id} track={track} />
              ))
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No tracks yet</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="collaborations" className="space-y-4">
            {collaborations.length > 0 ? (
              collaborations.map(track => (
                <TrackItem key={track.id} track={track} />
              ))
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No collaborations yet</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="projects" className="space-y-4">
            {userProjects.length > 0 ? (
              userProjects.map(project => (
                <ProjectItem key={project.id} project={project} />
              ))
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No projects yet</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="likes" className="space-y-4">
            <div className="text-center py-12 text-gray-400">
              <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No liked tracks yet</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;