import { useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './useAuth';

export const useProjects = () => {
  const { isAuthenticated } = useAuth();
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const baseURL = process.env.REACT_APP_BACKEND_URL;

  // Create new project
  const createProject = useCallback(async (projectData) => {
    if (!isAuthenticated) return { success: false, error: 'Not authenticated' };

    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`${baseURL}/api/projects`, projectData);
      const newProject = response.data;
      
      setProjects(prev => [newProject, ...prev]);
      setCurrentProject(newProject);
      
      return { success: true, project: newProject };
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to create project';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, baseURL]);

  // Load user projects
  const loadProjects = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${baseURL}/api/projects`);
      setProjects(response.data);
      
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to load projects';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, baseURL]);

  // Load public projects
  const loadPublicProjects = useCallback(async (limit = 20) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${baseURL}/api/projects/public?limit=${limit}`);
      return response.data;
      
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to load public projects';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [baseURL]);

  // Load specific project
  const loadProject = useCallback(async (projectId) => {
    if (!projectId) return null;

    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${baseURL}/api/projects/${projectId}`);
      const project = response.data;
      
      setCurrentProject(project);
      return project;
      
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to load project';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [baseURL]);

  // Update project
  const updateProject = useCallback(async (projectId, updateData) => {
    if (!isAuthenticated) return { success: false, error: 'Not authenticated' };

    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.put(`${baseURL}/api/projects/${projectId}`, updateData);
      const updatedProject = response.data;
      
      // Update in projects list
      setProjects(prev => prev.map(p => 
        p.id === projectId ? updatedProject : p
      ));
      
      // Update current project if it's the same
      if (currentProject?.id === projectId) {
        setCurrentProject(updatedProject);
      }
      
      return { success: true, project: updatedProject };
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to update project';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, baseURL, currentProject]);

  // Delete project
  const deleteProject = useCallback(async (projectId) => {
    if (!isAuthenticated) return { success: false, error: 'Not authenticated' };

    try {
      setLoading(true);
      setError(null);
      
      await axios.delete(`${baseURL}/api/projects/${projectId}`);
      
      // Remove from projects list
      setProjects(prev => prev.filter(p => p.id !== projectId));
      
      // Clear current project if it was deleted
      if (currentProject?.id === projectId) {
        setCurrentProject(null);
      }
      
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to delete project';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, baseURL, currentProject]);

  // Add track to project
  const addTrack = useCallback(async (projectId, trackData) => {
    if (!isAuthenticated) return { success: false, error: 'Not authenticated' };

    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`${baseURL}/api/projects/${projectId}/tracks`, trackData);
      const newTrack = response.data;
      
      // Update current project
      if (currentProject?.id === projectId) {
        setCurrentProject(prev => ({
          ...prev,
          tracks: [...(prev.tracks || []), newTrack]
        }));
      }
      
      return { success: true, track: newTrack };
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to add track';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, baseURL, currentProject]);

  // Update track
  const updateTrack = useCallback(async (projectId, trackId, trackData) => {
    if (!isAuthenticated) return { success: false, error: 'Not authenticated' };

    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.put(`${baseURL}/api/projects/${projectId}/tracks/${trackId}`, trackData);
      const updatedTrack = response.data;
      
      // Update current project
      if (currentProject?.id === projectId) {
        setCurrentProject(prev => ({
          ...prev,
          tracks: prev.tracks?.map(t => 
            t.id === trackId ? updatedTrack : t
          ) || []
        }));
      }
      
      return { success: true, track: updatedTrack };
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to update track';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, baseURL, currentProject]);

  // Delete track
  const deleteTrack = useCallback(async (projectId, trackId) => {
    if (!isAuthenticated) return { success: false, error: 'Not authenticated' };

    try {
      setLoading(true);
      setError(null);
      
      await axios.delete(`${baseURL}/api/projects/${projectId}/tracks/${trackId}`);
      
      // Update current project
      if (currentProject?.id === projectId) {
        setCurrentProject(prev => ({
          ...prev,
          tracks: prev.tracks?.filter(t => t.id !== trackId) || []
        }));
      }
      
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to delete track';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, baseURL, currentProject]);

  // Upload audio file
  const uploadAudio = useCallback(async (projectId, trackId, audioFile) => {
    if (!isAuthenticated) return { success: false, error: 'Not authenticated' };

    try {
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('file', audioFile);
      formData.append('project_id', projectId);
      formData.append('track_id', trackId);
      
      const response = await axios.post(`${baseURL}/api/audio/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return { success: true, clip: response.data.clip };
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to upload audio';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, baseURL]);

  // Add collaborator
  const addCollaborator = useCallback(async (projectId, username) => {
    if (!isAuthenticated) return { success: false, error: 'Not authenticated' };

    try {
      setLoading(true);
      setError(null);
      
      await axios.post(`${baseURL}/api/projects/${projectId}/collaborators`, {
        username
      });
      
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to add collaborator';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, baseURL]);

  // Save project (auto-save functionality)
  const saveProject = useCallback(async (projectData = currentProject) => {
    if (!projectData || !isAuthenticated) return;

    try {
      await axios.put(`${baseURL}/api/projects/${projectData.id}`, {
        ...projectData,
        updated_at: new Date().toISOString()
      });
      
      return { success: true };
    } catch (err) {
      console.error('Auto-save failed:', err);
      return { success: false };
    }
  }, [currentProject, isAuthenticated, baseURL]);

  // Project templates
  const createFromTemplate = useCallback(async (templateType, name) => {
    const templates = {
      'hip_hop': {
        name,
        description: 'Hip Hop beat template',
        bpm: 90,
        key: 'Am',
        tracks: [
          {
            name: 'Drums',
            instrument: 'Drum Kit',
            volume: 85,
            color: '#ef4444',
            clips: []
          },
          {
            name: '808 Bass',
            instrument: 'Synth Bass',
            volume: 80,
            color: '#6366f1',
            clips: []
          },
          {
            name: 'Melody',
            instrument: 'Piano',
            volume: 70,
            color: '#10b981',
            clips: []
          },
          {
            name: 'Vocals',
            instrument: 'Microphone',
            volume: 75,
            color: '#f59e0b',
            clips: []
          }
        ]
      },
      'electronic': {
        name,
        description: 'Electronic music template',
        bpm: 128,
        key: 'Cm',
        tracks: [
          {
            name: 'Kick',
            instrument: 'Electronic Drums',
            volume: 90,
            color: '#ef4444',
            clips: []
          },
          {
            name: 'Bass',
            instrument: 'Analog Synth',
            volume: 85,
            color: '#8b5cf6',
            clips: []
          },
          {
            name: 'Lead',
            instrument: 'Synth Lead',
            volume: 70,
            color: '#10b981',
            clips: []
          },
          {
            name: 'Pad',
            instrument: 'Synth Pad',
            volume: 60,
            color: '#06b6d4',
            clips: []
          }
        ]
      },
      'rock': {
        name,
        description: 'Rock band template',
        bpm: 120,
        key: 'E',
        tracks: [
          {
            name: 'Drums',
            instrument: 'Rock Kit',
            volume: 85,
            color: '#ef4444',
            clips: []
          },
          {
            name: 'Bass',
            instrument: 'Electric Bass',
            volume: 80,
            color: '#10b981',
            clips: []
          },
          {
            name: 'Guitar',
            instrument: 'Electric Guitar',
            volume: 75,
            color: '#f97316',
            clips: []
          },
          {
            name: 'Vocals',
            instrument: 'Microphone',
            volume: 75,
            color: '#f59e0b',
            clips: []
          }
        ]
      }
    };

    const template = templates[templateType];
    if (!template) {
      return { success: false, error: 'Template not found' };
    }

    return await createProject(template);
  }, [createProject]);

  return {
    // State
    projects,
    currentProject,
    loading,
    error,

    // Actions
    createProject,
    loadProjects,
    loadPublicProjects,
    loadProject,
    updateProject,
    deleteProject,
    
    // Track actions
    addTrack,
    updateTrack,
    deleteTrack,
    
    // Audio actions
    uploadAudio,
    
    // Collaboration
    addCollaborator,
    
    // Utilities
    saveProject,
    createFromTemplate,
    
    // Setters
    setCurrentProject,
    setError
  };
};