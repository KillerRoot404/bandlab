import { useState, useCallback } from 'react';
import { useToast } from './use-toast';

export const useAudioUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const uploadAudioFile = useCallback(async (file, projectId, trackId) => {
    if (!file.type.startsWith('audio/')) {
      throw new Error(`${file.name} is not an audio file`);
    }

    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const token = localStorage.getItem('bandlab_token');

    if (!token) {
      throw new Error('Authentication required');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('project_id', projectId);
    formData.append('track_id', trackId);

    const response = await fetch(`${backendUrl}/api/audio/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Failed to upload ${file.name}`);
    }

    return await response.json();
  }, []);

  const getAudioDuration = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      const objectUrl = URL.createObjectURL(file);
      
      audio.addEventListener('loadedmetadata', () => {
        URL.revokeObjectURL(objectUrl);
        resolve(audio.duration);
      });
      
      audio.addEventListener('error', () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Failed to load audio metadata'));
      });
      
      audio.src = objectUrl;
    });
  }, []);

  const uploadMultipleFiles = useCallback(async (files, projectId, trackId, currentTime, onClipAdded) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        try {
          // Update progress
          setUploadProgress(((i) / files.length) * 100);

          // Upload file
          const uploadResult = await uploadAudioFile(file, projectId, trackId);
          
          // Get audio duration
          const duration = await getAudioDuration(file);
          
          // Create clip data with proper structure
          const clipData = {
            id: uploadResult.clip.id || `upload_${Date.now()}_${i}`,
            name: uploadResult.clip.name || file.name,
            start_time: currentTime + (i * 0.1), // Offset slightly for multiple files
            duration: duration,
            track_id: trackId,
            file_url: uploadResult.clip.file_url,
            type: 'uploaded'
          };

          results.push(clipData);
          
          // Notify parent component
          if (onClipAdded) {
            onClipAdded(clipData);
          }

          successCount++;

          toast({
            title: "Arquivo Importado",
            description: `${file.name} adicionado com sucesso`,
          });

        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          errorCount++;
          
          toast({
            title: "Falha no Upload",
            description: `${file.name}: ${error.message}`,
            variant: "destructive"
          });
        }
      }

      // Final summary
      if (successCount > 0) {
        toast({
          title: "Importação Completa",
          description: `${successCount} arquivo(s) importado(s) com sucesso${errorCount > 0 ? `, ${errorCount} falharam` : ''}`,
        });
      }

    } catch (error) {
      console.error('Batch upload error:', error);
      toast({
        title: "Erro no Upload",
        description: error.message || "Ocorreu um erro durante o upload",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }

    return results;
  }, [uploadAudioFile, getAudioDuration, toast]);

  const validateAudioFile = useCallback((file) => {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const supportedTypes = [
      'audio/mpeg', 'audio/mp3',
      'audio/wav', 'audio/wave',
      'audio/ogg', 'audio/oga',
      'audio/m4a', 'audio/mp4',
      'audio/flac',
      'audio/aac'
    ];

    if (!supportedTypes.includes(file.type)) {
      return { valid: false, error: `Unsupported file type: ${file.type}` };
    }

    if (file.size > maxSize) {
      return { valid: false, error: `File too large: ${Math.round(file.size / 1024 / 1024)}MB (max 50MB)` };
    }

    return { valid: true };
  }, []);

  return {
    isUploading,
    uploadProgress,
    uploadAudioFile,
    uploadMultipleFiles,
    getAudioDuration,
    validateAudioFile
  };
};