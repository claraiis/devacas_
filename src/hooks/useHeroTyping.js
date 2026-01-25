import { useEffect, useState } from 'react';

const DEFAULT_SPEEDS = {
  type: 80,
  delete: 40,
  pause: 1200
};

const useHeroTyping = (suffixes, speeds = DEFAULT_SPEEDS) => {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!suffixes.length) return;
    const currentPhrase = suffixes[phraseIndex];
    let timeoutId;

    if (!isDeleting) {
      if (typed === currentPhrase) {
        timeoutId = window.setTimeout(() => setIsDeleting(true), speeds.pause);
      } else {
        timeoutId = window.setTimeout(
          () => setTyped(currentPhrase.slice(0, typed.length + 1)),
          speeds.type
        );
      }
    } else {
      if (typed === '') {
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % suffixes.length);
      } else {
        timeoutId = window.setTimeout(
          () => setTyped(currentPhrase.slice(0, typed.length - 1)),
          speeds.delete
        );
      }
    }

    return () => window.clearTimeout(timeoutId);
  }, [isDeleting, phraseIndex, speeds.delete, speeds.pause, speeds.type, suffixes, typed]);

  return typed;
};

export default useHeroTyping;
