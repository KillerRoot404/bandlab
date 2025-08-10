import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { Separator } from '../components/ui/separator';
import {
  Play,
  Pause,
  Heart,
  MessageCircle,
  Share2,
  Download,
  Plus,
  MoreHorizontal,
  Send,
  Calendar,
  Music,
  Users
} from 'lucide-react';
import { mockTracks, mockUsers, mockComments } from '../data/mock';

const Track = () => {
  const { id } = useParams();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(mockComments);
  
  // Find track by ID
  const track = mockTracks.find(t => t.id === id) || mockTracks[0];
  const currentUser = mockUsers[0]; // Mock logged-in user

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      const comment = {
        id: String(comments.length + 1),
        user: currentUser,
        content: newComment,
        timestamp: new Date().toISOString(),
        likes: 0
      };
      setComments([comment, ...comments]);
      setNewComment('');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Track Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Track Info */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
              <CardContent className="p-8">
                {/* Artist Info */}
                <div className="flex items-center space-x-4 mb-6">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={track.artist.avatar} alt={track.artist.displayName} />
                    <AvatarFallback>{track.artist.displayName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Link 
                      to={`/profile/${track.artist.username}`}
                      className="text-xl font-semibold text-white hover:text-orange-500 transition-colors"
                    >
                      {track.artist.displayName}
                    </Link>
                    <div className="flex items-center space-x-2 text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>Published {track.createdAt}</span>
                    </div>
                  </div>
                </div>

                {/* Track Title */}
                <h1 className="text-4xl font-bold mb-4 text-white">{track.title}</h1>

                {/* Track Metadata */}
                <div className="flex items-center space-x-4 mb-6 text-gray-400">
                  <Badge variant="outline" className="border-gray-600">
                    {track.genre}
                  </Badge>
                  <span>•</span>
                  <span>{track.duration}</span>
                  <span>•</span>
                  <span>{track.plays.toLocaleString()} plays</span>
                </div>

                {/* Waveform Player */}
                <div className="bg-gray-800 rounded-lg p-6 mb-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <Button
                      onClick={togglePlay}
                      size="lg"
                      className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 rounded-full w-16 h-16 p-0"
                    >
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    </Button>
                    
                    <div className="flex-1">
                      <div className="h-20 bg-gradient-to-r from-gray-700 to-gray-600 rounded relative overflow-hidden">
                        <div 
                          className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 opacity-30 transition-all duration-1000"
                          style={{ width: isPlaying ? '75%' : '0%' }}
                        />
                        {/* Enhanced waveform */}
                        <div className="absolute inset-0 flex items-end justify-around px-2">
                          {Array.from({ length: 100 }).map((_, i) => (
                            <div
                              key={i}
                              className="bg-white opacity-60"
                              style={{ 
                                width: '1px',
                                height: `${Math.random() * 100}%`,
                                minHeight: '2px'
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-sm text-gray-400 mt-2">
                        <span>0:00</span>
                        <span>{track.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Button
                      onClick={toggleLike}
                      variant="ghost"
                      className={`text-gray-400 hover:text-red-500 transition-colors ${
                        isLiked ? 'text-red-500' : ''
                      }`}
                    >
                      <Heart className={`w-5 h-5 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                      {track.likes + (isLiked ? 1 : 0)}
                    </Button>
                    
                    <Button variant="ghost" className="text-gray-400 hover:text-white transition-colors">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      {comments.length}
                    </Button>
                    
                    <Button variant="ghost" className="text-gray-400 hover:text-white transition-colors">
                      <Share2 className="w-5 h-5 mr-2" />
                      Share
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Button variant="outline" className="border-gray-600 hover:bg-gray-800">
                      <Plus className="w-4 h-4 mr-2" />
                      Add to Playlist
                    </Button>
                    
                    <Button variant="outline" className="border-gray-600 hover:bg-gray-800">
                      <Download className="w-4 h-4" />
                    </Button>
                    
                    <Button variant="ghost" className="text-gray-400 hover:text-white">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Collaborators */}
            {track.collaborators.length > 0 && (
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Collaborators
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {track.collaborators.map(collaborator => (
                      <Link
                        key={collaborator.id}
                        to={`/profile/${collaborator.username}`}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={collaborator.avatar} alt={collaborator.displayName} />
                          <AvatarFallback>{collaborator.displayName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-white">{collaborator.displayName}</div>
                          <div className="text-sm text-gray-400">@{collaborator.username}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tags */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {track.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="border-gray-600 hover:bg-gray-800 cursor-pointer">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Related Tracks */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Music className="w-5 h-5 mr-2" />
                  More from {track.artist.displayName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockTracks
                    .filter(t => t.id !== track.id && t.artist.id === track.artist.id)
                    .slice(0, 3)
                    .map(relatedTrack => (
                      <Link
                        key={relatedTrack.id}
                        to={`/track/${relatedTrack.id}`}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        <div className="w-10 h-10 bg-gradient-to-r from-gray-700 to-gray-600 rounded flex items-center justify-center">
                          <Play className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white truncate">{relatedTrack.title}</div>
                          <div className="text-sm text-gray-400">{relatedTrack.plays.toLocaleString()} plays</div>
                        </div>
                      </Link>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Comments Section */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageCircle className="w-5 h-5 mr-2" />
              Comments ({comments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="mb-6">
              <div className="flex space-x-4">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={currentUser.avatar} alt={currentUser.displayName} />
                  <AvatarFallback>{currentUser.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 resize-none"
                    rows={3}
                  />
                  <div className="flex justify-end mt-2">
                    <Button 
                      type="submit" 
                      size="sm"
                      className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                      disabled={!newComment.trim()}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Post
                    </Button>
                  </div>
                </div>
              </div>
            </form>

            <Separator className="bg-gray-800 mb-6" />

            {/* Comments List */}
            <div className="space-y-6">
              {comments.map(comment => (
                <div key={comment.id} className="flex space-x-4">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={comment.user.avatar} alt={comment.user.displayName} />
                    <AvatarFallback>{comment.user.displayName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Link 
                        to={`/profile/${comment.user.username}`}
                        className="font-medium text-white hover:text-orange-500 transition-colors"
                      >
                        {comment.user.displayName}
                      </Link>
                      <span className="text-gray-400 text-sm">
                        {new Date(comment.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-300 mb-2">{comment.content}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <Button variant="ghost" size="sm" className="h-auto p-1 text-gray-400 hover:text-red-500">
                        <Heart className="w-4 h-4 mr-1" />
                        {comment.likes}
                      </Button>
                      <Button variant="ghost" size="sm" className="h-auto p-1 text-gray-400 hover:text-white">
                        Reply
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Track;