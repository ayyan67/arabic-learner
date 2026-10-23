"use client";

import { useEffect, useRef, useState } from "react";

export function AudioButton({
  src,
  label = "Play recitation",
}: {
  src: string;
  label?: string;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const toggle = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(src);
      audioRef.current.onended = () => setPlaying(false);
      audioRef.current.onerror = () => {
        setError(true);
        setPlaying(false);
      };
    }
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .then(() => setPlaying(true))
        .catch(() => setError(true));
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label={label}
      title={error ? "Audio unavailable offline" : label}
      className={`grid h-8 w-8 place-items-center rounded-full border transition ${
        playing
          ? "border-sage bg-sage text-white"
          : "border-[#e3d8c2] bg-white text-ink-soft hover:border-gold hover:text-gold"
      }`}
    >
      {playing ? (
        <svg width="13" height="13" viewBox="0 0 12 12" fill="currentColor">
          <rect x="2" y="2" width="3" height="8" rx="1" />
          <rect x="7" y="2" width="3" height="8" rx="1" />
        </svg>
      ) : (
        <svg width="13" height="13" viewBox="0 0 12 12" fill="currentColor">
          <path d="M3 2.2v7.6c0 .5.55.8.97.53l5.6-3.8a.64.64 0 0 0 0-1.06l-5.6-3.8A.64.64 0 0 0 3 2.2Z" />
        </svg>
      )}
    </button>
  );
}
