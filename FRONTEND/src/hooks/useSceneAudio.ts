import { useEffect, useRef } from 'react';


type AudioScene = 'menu' | 'game' | 'combat';

type UseSceneAudioOptions = {
  enabled: boolean;
  scene: AudioScene;
  volume: number;
  tracks: Record<AudioScene, string>;
};


export function useSceneAudio({
  enabled,
  scene,
  volume,
  tracks,
}: UseSceneAudioOptions) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrackRef = useRef<string | null>(null);

  useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audio.preload = 'auto';
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
      currentTrackRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = Math.max(0, Math.min(1, volume / 100));
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!enabled) {
      audio.pause();
      return;
    }

    const nextTrack = tracks[scene];

    if (currentTrackRef.current !== nextTrack) {
      currentTrackRef.current = nextTrack;
      audio.pause();
      audio.src = nextTrack;
      audio.load();
    }

    const playPromise = audio.play();
    playPromise?.catch(() => undefined);
  }, [enabled, scene, tracks]);
}
