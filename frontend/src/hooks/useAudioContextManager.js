import { useState, useRef, useCallback, useEffect } from 'react';

export const useAudioContextManager = () => {
  const [audioContext, setAudioContext] = useState(null);
  const [isAudioContextSuspended, setIsAudioContextSuspended] = useState(true);
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  
  const audioContextRef = useRef(null);
  const masterGainNodeRef = useRef(null);
  const interactionListenersRef = useRef([]);
  const resumePromiseRef = useRef(null);
  const onStateChangeRef = useRef(null);

  // Internal: create a fresh AudioContext and wire master gain + listeners
  const createNewAudioContext = useCallback(() => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) {
        console.error('Web Audio API não suportada neste navegador.');
        return null;
      }

      const ctx = new Ctx();

      // Master gain
      const masterGain = ctx.createGain();
      masterGain.connect(ctx.destination);
      masterGain.gain.value = 0.8;
      masterGainNodeRef.current = masterGain;

      // Save context
      audioContextRef.current = ctx;
      setAudioContext(ctx);

      // Attach statechange handler
      const onStateChange = () => {
        const state = ctx.state;
        if (state === 'running') {
          setIsAudioContextSuspended(false);
          setAutoplayBlocked(false);
        } else if (state === 'suspended') {
          setIsAudioContextSuspended(true);
          // Suspenso por política ou por nossa ação; áudio requer retomada
          setAutoplayBlocked(true);
        } else if (state === 'closed') {
          // Um contexto fechado não pode ser retomado; marcar como bloqueado
          setIsAudioContextSuspended(false);
          setAutoplayBlocked(true);
        }
      };
      onStateChangeRef.current = onStateChange;
      ctx.addEventListener('statechange', onStateChange);

      // Estado inicial
      onStateChange();

      return ctx;
    } catch (error) {
      console.error('Falha ao criar AudioContext:', error);
      return null;
    }
  }, []);

  // Initialize or reuse AudioContext
  const initializeAudioContext = useCallback(() => {
    const existing = audioContextRef.current;
    if (existing) {
      if (existing.state === 'closed') {
        // Recriar se estiver fechado
        return createNewAudioContext();
      }
      return existing;
    }
    return createNewAudioContext();
  }, [createNewAudioContext]);

  // Resume AudioContext after user interaction
  const resumeAudioContext = useCallback(async () => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      initializeAudioContext();
    }

    if (!audioContextRef.current) return false;

    // Evitar múltiplas retomadas simultâneas
    if (resumePromiseRef.current) {
      return resumePromiseRef.current;
    }

    if (audioContextRef.current.state === 'suspended') {
      try {
        resumePromiseRef.current = audioContextRef.current.resume();
        await resumePromiseRef.current;
        setIsAudioContextSuspended(false);
        setAutoplayBlocked(false);
        setUserHasInteracted(true);
        return true;
      } catch (error) {
        console.error('Falha ao retomar AudioContext:', error);
        return false;
      } finally {
        resumePromiseRef.current = null;
      }
    } else if (audioContextRef.current.state === 'running') {
      setUserHasInteracted(true);
      setAutoplayBlocked(false);
      return true;
    }

    // Se estiver fechado, tentar recriar
    if (audioContextRef.current.state === 'closed') {
      const ctx = initializeAudioContext();
      return !!ctx;
    }

    return false;
  }, [initializeAudioContext]);

  // Ensure AudioContext is ready for use
  const ensureAudioContextReady = useCallback(async () => {
    if (!audioContextRef.current) {
      initializeAudioContext();
    }

    if (!audioContextRef.current) {
      throw new Error('Falha ao inicializar o AudioContext');
    }

    if (audioContextRef.current.state === 'closed') {
      // Recriar automaticamente
      const ctx = initializeAudioContext();
      if (!ctx) throw new Error('Falha ao recriar o AudioContext fechado');
      return ctx;
    }

    if (audioContextRef.current.state === 'suspended') {
      const resumed = await resumeAudioContext();
      if (!resumed) {
        throw new Error('AudioContext suspenso e requer interação do usuário');
      }
    }

    return audioContextRef.current;
  }, [initializeAudioContext, resumeAudioContext]);

  // Add user interaction listeners to resume
  const addInteractionListeners = useCallback(() => {
    const events = ['click', 'touchstart', 'touchend', 'keydown', 'keyup'];

    const handleInteraction = async () => {
      if (audioContextRef.current?.state === 'suspended') {
        await resumeAudioContext();
      }
      setUserHasInteracted(true);
      setAutoplayBlocked(false);
    };

    events.forEach(eventType => {
      document.addEventListener(eventType, handleInteraction, { once: true, passive: true });
      interactionListenersRef.current.push({ eventType, handler: handleInteraction });
    });
  }, [resumeAudioContext]);

  const removeInteractionListeners = useCallback(() => {
    interactionListenersRef.current.forEach(({ eventType, handler }) => {
      document.removeEventListener(eventType, handler);
    });
    interactionListenersRef.current = [];
  }, []);

  // Manual activation (used by UI prompt)
  const requestAudioActivation = useCallback(async () => {
    return await resumeAudioContext();
  }, [resumeAudioContext]);

  // Master gain helpers
  const getMasterGainNode = useCallback(() => masterGainNodeRef.current, []);

  const updateMasterVolume = useCallback((volume) => {
    if (masterGainNodeRef.current) {
      masterGainNodeRef.current.gain.value = volume / 100;
    }
  }, []);

  // Visibility management: suspend when tab hidden; when visible, prepare for interaction-based resume
  useEffect(() => {
    const handleVisibilityChange = async () => {
      const ctx = audioContextRef.current;
      if (!ctx) return;

      if (document.visibilityState === 'hidden') {
        if (ctx.state === 'running') {
          try {
            await ctx.suspend();
            setIsAudioContextSuspended(true);
            // Ao suspender manualmente, não é bloqueio de autoplay; reteremos a necessidade de interação apenas quando voltarmos
          } catch (e) {
            console.warn('Falha ao suspender ao ocultar aba:', e);
          }
        }
      } else if (document.visibilityState === 'visible') {
        // Não retomar automaticamente para evitar conflitos com políticas; adiciona ouvintes de interação novamente
        if (ctx.state === 'suspended') {
          addInteractionListeners();
          setAutoplayBlocked(true);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [addInteractionListeners]);

  // Initialize on mount
  useEffect(() => {
    initializeAudioContext();
    addInteractionListeners();

    return () => {
      removeInteractionListeners();
      // Não fechar o contexto automaticamente para evitar estado "closed"
      // Caso precise, exponha destroyAudioContext()
    };
  }, [initializeAudioContext, addInteractionListeners, removeInteractionListeners]);

  // Optional explicit destroy (not used by default)
  const destroyAudioContext = useCallback(async () => {
    try {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    } catch (e) {
      console.warn('Erro ao fechar AudioContext:', e);
    } finally {
      audioContextRef.current = null;
      masterGainNodeRef.current = null;
      setAudioContext(null);
      setIsAudioContextSuspended(true);
      setAutoplayBlocked(false);
      setUserHasInteracted(false);
    }
  }, []);

  return {
    // AudioContext instance and routing
    audioContext: audioContextRef.current,
    masterGainNode: masterGainNodeRef.current,

    // State flags
    isAudioContextSuspended,
    userHasInteracted,
    autoplayBlocked,

    // Control functions
    initializeAudioContext,
    resumeAudioContext,
    ensureAudioContextReady,
    requestAudioActivation,
    getMasterGainNode,
    updateMasterVolume,
    addInteractionListeners,
    removeInteractionListeners,
    destroyAudioContext,
  };
};