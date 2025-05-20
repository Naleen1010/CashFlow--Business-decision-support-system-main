import React, { useRef, useEffect } from 'react';

// Create a reusable hook for beep sound
export const useBeepSound = (customSoundUrl?: string) => {
  const beepSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element
    const audio = new Audio();
    
    // Use custom sound URL if provided, otherwise use default beep
    if (customSoundUrl) {
      audio.src = customSoundUrl;
    } else {
      // Default beep sound
      audio.src = 'data:audio/wav;base64,//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAGDgYtAgAyN+QWaAAihwMWm4G8QQRDiMcCBcH3Cc+CDv/7xA4Tvh9Rz/y8QADBwMWgQAZG/ILNAARQ4GLTcDeIIIhxGOBAuD7hOfBB3/94gcJ3w+o5/5eIAIAAAVwWgQAVQ2ORaIQwEMAJiDg95G4nQL7mQVWI6GwRcfsZAcsKkJvxgxEjzFUgfHoSQ9Qq7KNwqHwuB13MA4a1q/DmBrHgPcmjiGoh//EwC5nGPEmS4RcfkVKOhJf+WOgoxJclFz3kgn//dBA+ya1GhurNn8zb//9NNutNuhz31f////9vt///z+IdAEAAAK4LQIAKobHItEIYCGAExBwe8jcToF9zIKrEdDYIuP2MgOWFSE34wYiR5iqQPj0JIeoVdlG4VD4XA67mAcNa1fhzA1jwHuTRxDUQ//iYBczjHiTJcIuPyKlHQkv/LHQUYkuSi57yQT//uggfZNajQ3Vmz+Zt//+mm3Wm3Q576v////+32///5/EOgAAADVghQAAAAA//uQZAUAB1WI0PZugAAAAAoQwAAAEk3nRd2qAAAAACiDgAAAAAAABCqEEQRLCgwpBGMlJkIz8jKhGvj4k6jzRnqasNKIeoh5gI7BJaC1A1AoNBjJgbyApVS4IDlZgDU5WUAxEKDNmmALHzZp0Fkz1FMTmGFl1FMEyodIavcCAUHDWrKAIA4aa2oeHXRpQCIBaMXKoPQAnqAhQ,A1h5hLCBthFaEIheA6EWD7QVEQbxyN5KCRtkFUQWBIoIDgZw4d0rD7J/+Mbm8VxL7g/MUPDc5oM8eUTDDi0waDVs4mG+e64BcAJSLQBwgSjxdNP9zj5DN9yUu48ULQVLJwCfBI6oFNYQDe0BpY+Cok83exgAhGozXBXCQ0JJq2JKIBCHMwLFCTI6VQEWRQgD60AAAMVAAAn4MAAAeU7AAgGgAgAAAAAAAAH//2Q==';
    }
    
    // Set properties
    audio.volume = 0.5;
    audio.preload = 'auto';
    
    // Store in ref
    beepSoundRef.current = audio;
    
    // Load the audio
    audio.load();
    
    // Clean up
    return () => {
      beepSoundRef.current = null;
    };
  }, [customSoundUrl]);

  const playBeep = () => {
    if (beepSoundRef.current) {
      // Reset to start
      beepSoundRef.current.currentTime = 0;
      
      // Play with error handling
      beepSoundRef.current.play().catch(error => {
        console.warn('Failed to play beep sound:', error);
      });
    }
  };

  return playBeep;
};

// Component to preload your custom WAV sound
export const SoundPreloader: React.FC<{soundUrl: string}> = ({ soundUrl }) => {
  useEffect(() => {
    // Preload the audio file
    const audio = new Audio(soundUrl);
    audio.preload = 'auto';
    
    // Just load it, don't play it
    audio.load();
    
    return () => {
      // Clean up
      audio.src = '';
    };
  }, [soundUrl]);

  // Render nothing - this is just for preloading
  return null;
};

// Usage example:
/*
// In your component:
const PlayBeep = useBeepSound('/sounds/my-custom-beep.wav');

// When you want to play the sound:
PlayBeep();

// To preload your sound file:
<SoundPreloader soundUrl="/sounds/my-custom-beep.wav" />
*/