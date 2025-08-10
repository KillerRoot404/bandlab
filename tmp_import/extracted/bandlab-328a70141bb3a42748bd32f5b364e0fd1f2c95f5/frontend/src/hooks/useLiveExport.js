import { useCallback, useRef, useState } from 'react';

/**
 * Live mixdown export by recording the master bus.
 * Pros: simple, works across browsers. Cons: real-time (takes project duration).
 *
 * Usage in Studio:
 * const { exportProject, isExporting, progress } = useLiveExport(audioContext, masterGainNode, startPlayback, stopPlayback);
 * await exportProject({ tracks, getTrackClips, duration, filename });
 */
export const useLiveExport = (audioContext, masterGainNode, startPlayback, stopPlayback) => {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const exportAbortRef = useRef({ aborted: false });

  const computeProjectDuration = useCallback((tracks = [], getTrackClips) => {
    let maxEnd = 0;
    try {
      tracks.forEach((t) => {
        // Include clips known by the engine
        const engineClips = typeof getTrackClips === 'function' ? (getTrackClips(t.id) || []) : [];
        // Include clips stored on the track object (e.g., demo/default clips)
        const trackClips = Array.isArray(t.clips) ? t.clips : [];
        const all = [...engineClips, ...trackClips];
        all.forEach((c) => {
          const start = Number(c.start_time || 0);
          const dur = Number(c.duration || 0);
          const end = Math.max(0, start) + Math.max(0, dur);
          if (end > maxEnd) maxEnd = end;
        });
      });
    } catch (e) {
      // Fallback to 10s if something goes wrong
      maxEnd = Math.max(10, maxEnd);
    }
    // Reasonable default minimum
    return Math.max(maxEnd, 5);
  }, []);

  const exportProject = useCallback(async ({ tracks = [], getTrackClips, duration, filename = 'mixdown.webm' }) => {
    if (!audioContext || !masterGainNode) {
      throw new Error('AudioContext ou cadeia de áudio não estão prontos.');
    }

    if (isExporting) {
      throw new Error('Uma exportação já está em andamento.');
    }

    exportAbortRef.current.aborted = false;
    setIsExporting(true);
    setProgress(0);

    const totalDuration = Math.max(1, Number(duration) || computeProjectDuration(tracks, getTrackClips));

    // Create a MediaStreamDestination connected to master
    const destination = audioContext.createMediaStreamDestination();
    try {
      masterGainNode.connect(destination);
    } catch (e) {
      // ignore double connections
    }

    const supportedMime = (() => {
      const candidates = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/ogg'
      ];
      for (const mime of candidates) {
        if (window.MediaRecorder && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(mime)) {
          return mime;
        }
      }
      return 'audio/webm';
    })();

    const recorder = new MediaRecorder(destination.stream, { mimeType: supportedMime });
    const chunks = [];

    const stopAll = () => {
      try { recorder.state !== 'inactive' && recorder.stop(); } catch (e) {}
      try { stopPlayback(); } catch (e) {}
      try { masterGainNode.disconnect(destination); } catch (e) {}
    };

    return await new Promise(async (resolve, reject) => {
      let timer = null;
      let progTimer = null;
      let startedAt = 0;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onerror = (e) => {
        clearInterval(progTimer);
        clearTimeout(timer);
        stopAll();
        setIsExporting(false);
        reject(new Error(e.error?.message || 'Erro no MediaRecorder durante exportação'));
      };

      recorder.onstop = () => {
        clearInterval(progTimer);
        clearTimeout(timer);
        setProgress(100);
        setIsExporting(false);
        if (exportAbortRef.current.aborted) {
          reject(new Error('Exportação cancelada'));
          return;
        }
        const blob = new Blob(chunks, { type: supportedMime });
        const url = URL.createObjectURL(blob);

        // Trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }, 2000);
        resolve({ blob, url, filename, duration: totalDuration });
      };

      try {
        recorder.start(100);
        // Start playback from 0 so mixdown has a consistent start
        await startPlayback(0, tracks);
        startedAt = performance.now();

        // Progress indicator (up to 99%)
        progTimer = setInterval(() => {
          const elapsed = (performance.now() - startedAt) / 1000;
          const pct = Math.min(99, (elapsed / totalDuration) * 100);
          setProgress(pct);
        }, 200);

        // Stop after duration + small safety margin
        timer = setTimeout(() => {
          if (exportAbortRef.current.aborted) {
            stopAll();
            return;
          }
          try { recorder.stop(); } catch (e) {}
          try { stopPlayback(); } catch (e) {}
          try { masterGainNode.disconnect(destination); } catch (e) {}
        }, Math.ceil(totalDuration * 1000) + 300);
      } catch (err) {
        clearInterval(progTimer);
        clearTimeout(timer);
        stopAll();
        setIsExporting(false);
        reject(err);
      }
    });
  }, [audioContext, masterGainNode, startPlayback, stopPlayback, isExporting, computeProjectDuration]);

  const cancelExport = useCallback(() => {
    if (isExporting) {
      exportAbortRef.current.aborted = true;
    }
  }, [isExporting]);

  return {
    exportProject,
    cancelExport,
    isExporting,
    progress,
  };
};