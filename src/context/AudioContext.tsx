'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AudioContextType {
  isMuted: boolean;
  toggleMute: () => void;
  playShutterSound: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

let globalAudioCtx: AudioContext | null = null;

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const saved = sessionStorage.getItem('audio-muted');
    if (saved !== null) {
      setIsMuted(saved === 'true');
    }
  }, []);

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      sessionStorage.setItem('audio-muted', String(next));
      return next;
    });

    // Synthesize a quick click confirmation on mute status toggle
    setTimeout(() => {
      playShutterSound();
    }, 50);
  };

  const playShutterSound = () => {
    // Check local mute setting
    const saved = sessionStorage.getItem('audio-muted');
    const currentlyMuted = saved !== null ? saved === 'true' : isMuted;
    if (currentlyMuted) return;

    try {
      if (!globalAudioCtx) {
        globalAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      if (globalAudioCtx.state === 'suspended') {
        globalAudioCtx.resume();
      }

      const ctx = globalAudioCtx;
      const now = ctx.currentTime;

      // Component 1: Leaf Shutter Mechanical Noise (White Noise Burst)
      const bufferSize = ctx.sampleRate * 0.04; // 40ms noise
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(900, now);
      noiseFilter.Q.setValueAtTime(2.0, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.06, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      // Component 2: Metallic Camera Shutter Strike Sweep (Sine oscillator decay)
      const strikeOsc = ctx.createOscillator();
      const strikeGain = ctx.createGain();

      strikeOsc.type = 'sine';
      strikeOsc.frequency.setValueAtTime(1400, now);
      strikeOsc.frequency.exponentialRampToValueAtTime(220, now + 0.012);

      strikeGain.gain.setValueAtTime(0.04, now);
      strikeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.012);

      strikeOsc.connect(strikeGain);
      strikeGain.connect(ctx.destination);

      // Start both nodes simultaneously
      noiseSource.start(now);
      noiseSource.stop(now + 0.04);
      strikeOsc.start(now);
      strikeOsc.stop(now + 0.012);
    } catch (err) {
      console.warn('Programmatic shutter sound synthesis blocked or failed:', err);
    }
  };

  return (
    <AudioContext.Provider value={{ isMuted, toggleMute, playShutterSound }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
