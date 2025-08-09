import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Play,
  Heart,
  MessageCircle,
  Share2,
  MapPin,
  Calendar,
  Music,
  Users,
  Settings,
  UserPlus,
  CheckCircle
} from 'lucide-react';
import { mockUsers, mockTracks, mockProjects } from '../data/mock';

const Profile = () => {
  const { username } = useParams();
  const [isFollowing, setIsFollowing] = useState(false);
  
  // Find user by username
  const user = mockUsers.find(u => u.username === username) || mockUsers[0];
  
  // Get user's tracks
  const userTracks = mockTracks.filter(track => track.artist.id === user.id);
  
  // Get user's collaborations
  const collaborations = mockTracks.filter(track => 
    track.collaborators.some(collab => collab.id === user.id)
  );
  
  // Get user's projects
  const userProjects = mockProjects.filter(project => project.owner.id === user.id);

  const toggleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  const TrackItem = ({ track }) => (
    <Card className="bg-gray-900 border-gray-800 hover:bg-gray-850 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Play className="w-5 h-5 text-white" />
            </div>
            
            <div>
              <Link 
                to={`/track/${track.id}`}
                className="font-medium text-white hover:text-orange-500 transition-colors"
              >
                {track.title}
              </Link>
              <div className="text-sm text-gray-400 flex items-center space-x-2">
                <span>{track.genre}</span>
                <span>•</span>
                <span>{track.duration}</span>
                <span>•</span>
                <span>{track.plays.toLocaleString()} plays</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 text-gray-400">
            <span className="flex items-center text-sm">
              <Heart className="w-4 h-4 mr-1" />
              {track.likes}
            </span>
            <span className="flex items-center text-sm">
              <MessageCircle className="w-4 h-4 mr-1" />
              {track.comments}
            </span>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ProjectItem = ({ project }) => (
    <Card className="bg-gray-900 border-gray-800 hover:bg-gray-850 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-white">{project.name}</h3>
          <Badge variant={project.isPrivate ? "secondary" : "outline"} className="border-gray-600">
            {project.isPrivate ? 'Private' : 'Public'}
          </Badge>
        </div>
        
        <p className="text-gray-400 text-sm mb-3">{project.description}</p>
        
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center space-x-4">
            <span>{project.tracks.length} track{project.tracks.length !== 1 ? 's' : ''}</span>
            <span>•</span>
            <span>{project.collaborators.length + 1} member{project.collaborators.length !== 0 ? 's' : ''}</span>
          </div>
          <span>Updated {project.lastModified}</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 mb-8 border border-gray-700">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <Avatar className="w-24 h-24 border-4 border-orange-500">
              <AvatarImage src={user.avatar} alt={user.displayName} />
              <AvatarFallback className="text-2xl">{user.displayName.charAt(0)}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold">{user.displayName}</h1>
                {user.verified && (
                  <CheckCircle className="w-6 h-6 text-blue-500 fill-current" />
                )}
              </div>
              
              <p className="text-gray-300 mb-2">@{user.username}</p>
              
              {user.bio && (
                <p className="text-gray-400 mb-3">{user.bio}</p>
              )}
              
              <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
                {user.location && (
                  <span className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {user.location}
                  </span>
                )}
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Joined January 2025
                </span>
              </div>
              
              <div className="flex items-center space-x-6 text-sm">
                <span>
                  <span className="font-semibold text-white">{user.following.toLocaleString()}</span>
                  <span className="text-gray-400 ml-1">Following</span>
                </span>
                <span>
                  <span className="font-semibold text-white">{user.followers.toLocaleString()}</span>
                  <span className="text-gray-400 ml-1">Followers</span>
                </span>
                <span>
                  <span className="font-semibold text-white">{userTracks.length}</span>
                  <span className="text-gray-400 ml-1">Tracks</span>
                </span>
              </div>
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
        </div>

        {/* Profile Content */}
        <Tabs defaultValue="tracks" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-900 border border-gray-800 mb-6">
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
              <Heart className="w-4 h-4 mr-2" />
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