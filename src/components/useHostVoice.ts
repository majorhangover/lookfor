"use client";

import { useCallback, useRef, useState } from "react";
import type { CharacterId } from "@/lib/occasions";
import type { Region } from "@/lib/types";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Speech out (ElevenLabs via /api/tts, or the browser's voice) and speech in
 * (browser speech recognition). Exposes `mouth` (0-1) to animate Santa.
 * Audio is never recorded or sent anywhere except the browser's recogniser.
 */
export function useHostVoice(region: Region, character: CharacterId, pitch: number) {
  const [mouth, setMouth] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [canListen] = useState(() => {
    const w = window as any;
    return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
  });
  const raf = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recRef = useRef<any>(null);

  const stopAnim = () => {
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = null;
    setMouth(0);
  };

  const flap = () => {
    // Fallback mouth movement when we cannot read the audio level.
    const start = performance.now();
    const step = (t: number) => {
      const v = (Math.sin((t - start) / 70) + 1) / 2;
      setMouth(0.2 + v * 0.7 * (0.6 + Math.random() * 0.4));
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  };

  const stop = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
    stopAnim();
    setSpeaking(false);
  }, []);

  const speakWithBrowser = useCallback(
    (text: string) => {
      if (typeof speechSynthesis === "undefined") return;
      const u = new SpeechSynthesisUtterance(text);
      u.lang = region === "UK" ? "en-GB" : "en-US";
      const voices = speechSynthesis.getVoices().filter((v) => v.lang.startsWith(u.lang.slice(0, 2)));
      const deep = pitch < 0.9 ? voices.find((v) => /male|daniel|george|arthur|fred|alex/i.test(v.name)) : undefined;
      if (deep || voices[0]) u.voice = deep || voices[0];
      u.pitch = pitch;
      u.rate = 0.92;
      u.onstart = () => {
        setSpeaking(true);
        flap();
      };
      u.onend = u.onerror = () => {
        stopAnim();
        setSpeaking(false);
      };
      speechSynthesis.speak(u);
    },
    [region, pitch],
  );

  const speak = useCallback(
    async (text: string) => {
      stop();
      try {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, character }),
        });
        if (res.status !== 200) return speakWithBrowser(text);
        const url = URL.createObjectURL(await res.blob());
        const audio = new Audio(url);
        audioRef.current = audio;
        const ctx = new AudioContext();
        const src = ctx.createMediaElementSource(audio);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        src.connect(analyser);
        analyser.connect(ctx.destination);
        const data = new Uint8Array(analyser.frequencyBinCount);
        const step = () => {
          analyser.getByteTimeDomainData(data);
          let sum = 0;
          for (const d of data) sum += Math.abs(d - 128);
          setMouth(Math.min(1, (sum / data.length) / 18));
          raf.current = requestAnimationFrame(step);
        };
        audio.onplay = () => {
          setSpeaking(true);
          step();
        };
        audio.onended = () => {
          stopAnim();
          setSpeaking(false);
          URL.revokeObjectURL(url);
          ctx.close();
        };
        await audio.play();
      } catch {
        speakWithBrowser(text);
      }
    },
    [speakWithBrowser, stop, character],
  );

  const listen = useCallback(
    (onText: (text: string) => void) => {
      const w = window as any;
      const Rec = w.SpeechRecognition || w.webkitSpeechRecognition;
      if (!Rec) return;
      stop();
      const rec = new Rec();
      rec.lang = region === "UK" ? "en-GB" : "en-US";
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.onresult = (e: any) => {
        const text = e.results?.[0]?.[0]?.transcript;
        if (text) onText(text);
      };
      rec.onend = () => setListening(false);
      rec.onerror = () => setListening(false);
      recRef.current = rec;
      setListening(true);
      rec.start();
    },
    [region, stop],
  );

  const stopListening = useCallback(() => {
    recRef.current?.stop();
    setListening(false);
  }, []);

  return { mouth, speaking, listening, canListen, speak, stop, listen, stopListening };
}
