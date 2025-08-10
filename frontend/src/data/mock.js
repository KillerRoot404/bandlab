// Mock data for BandLab clone

export const mockUsers = [
  {
    id: '1',
    username: 'musicproducer1',
    displayName: 'Alex Thompson',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    followers: 2500,
    following: 180,
    verified: true,
    bio: 'Electronic music producer & sound designer',
    location: 'Los Angeles, CA'
  },
  {
    id: '2',
    username: 'vocalist_maya',
    displayName: 'Maya Chen',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b7d0a6f1?w=100&h=100&fit=crop&crop=face',
    followers: 1800,
    following: 95,
    verified: false,
    bio: 'Singer-songwriter & vocal coach',
    location: 'Nashville, TN'
  },
  {
    id: '3',
    username: 'drummaster',
    displayName: 'Jordan Williams',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    followers: 3200,
    following: 220,
    verified: true,
    bio: 'Session drummer & percussionist',
    location: 'New York, NY'
  }
];

export const mockTracks = [
  {
    id: '1',
    title: 'Midnight Dreams',
    artist: mockUsers[0],
    genre: 'Electronic',
    duration: '3:45',
    plays: 12500,
    likes: 89,
    comments: 23,
    createdAt: '2025-01-08',
    waveform: 'https://via.placeholder.com/400x80/6366f1/ffffff?text=Waveform',
    coverArt: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
    collaborators: [mockUsers[1]],
    isPublic: true,
    tags: ['electronic', 'ambient', 'chill']
  },
  {
    id: '2',
    title: 'Acoustic Vibes',
    artist: mockUsers[1],
    genre: 'Folk',
    duration: '4:12',
    plays: 8900,
    likes: 156,
    comments: 31,
    createdAt: '2025-01-07',
    waveform: 'https://via.placeholder.com/400x80/f59e0b/ffffff?text=Waveform',
    coverArt: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
    collaborators: [],
    isPublic: true,
    tags: ['acoustic', 'folk', 'indie']
  },
  {
    id: '3',
    title: 'Rhythm Revolution',
    artist: mockUsers[2],
    genre: 'Hip Hop',
    duration: '2:58',
    plays: 15600,
    likes: 234,
    comments: 45,
    createdAt: '2025-01-06',
    waveform: 'https://via.placeholder.com/400x80/ef4444/ffffff?text=Waveform',
    coverArt: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
    collaborators: [mockUsers[0]],
    isPublic: true,
    tags: ['hip-hop', 'beats', 'rap']
  }
];

export const mockProjects = [
  {
    id: '1',
    name: 'Summer Vibes EP',
    description: 'A collection of upbeat tracks for summer',
    owner: mockUsers[0],
    collaborators: [mockUsers[1], mockUsers[2]],
    tracks: [mockTracks[0], mockTracks[2]],
    createdAt: '2025-01-05',
    lastModified: '2025-01-08',
    isPrivate: false
  },
  {
    id: '2',
    name: 'Experimental Sounds',
    description: 'Exploring new sonic territories',
    owner: mockUsers[1],
    collaborators: [mockUsers[0]],
    tracks: [mockTracks[1]],
    createdAt: '2025-01-03',
    lastModified: '2025-01-07',
    isPrivate: true
  }
];

export const mockStudioData = {
  currentProject: {
    id: '1',
    name: 'New Track',
    bpm: 120,
    timeSignature: '4/4',
    key: 'C Major'
  },
  tracks: [
    {
      id: '1',
      name: 'Drums',
      instrument: 'Drum Kit',
      volume: 85,
      muted: false,
      solo: false,
      color: '#ef4444',
      clips: [
        { id: '1', start: 0, duration: 8, name: 'Kick Pattern' },
        { id: '2', start: 8, duration: 8, name: 'Full Beat' }
      ]
    },
    {
      id: '2',
      name: 'Bass',
      instrument: 'Synth Bass',
      volume: 75,
      muted: false,
      solo: false,
      color: '#6366f1',
      clips: [
        { id: '3', start: 0, duration: 16, name: 'Bass Line' }
      ]
    },
    {
      id: '3',
      name: 'Lead',
      instrument: 'Electric Piano',
      volume: 65,
      muted: false,
      solo: false,
      color: '#10b981',
      clips: [
        { id: '4', start: 4, duration: 12, name: 'Melody' }
      ]
    },
    {
      id: '4',
      name: 'Vocals',
      instrument: 'Microphone',
      volume: 80,
      muted: false,
      solo: false,
      color: '#f59e0b',
      clips: []
    }
  ],
  playbackPosition: 0,
  isPlaying: false,
  isRecording: false,
  loopEnabled: false,
  metronomeEnabled: false
};

export const mockComments = [
  {
    id: '1',
    user: mockUsers[1],
    content: 'This is amazing! Love the production quality.',
    timestamp: '2025-01-08T10:30:00Z',
    likes: 5
  },
  {
    id: '2',
    user: mockUsers[2],
    content: 'Great work on the mixing. The drums sound perfect!',
    timestamp: '2025-01-08T09:15:00Z',
    likes: 3
  }
];

// Additional exports for Profile page
export const mockProfile = mockUsers[0];
export const mockCollaborations = [mockTracks[1], mockTracks[2]];