import { useState, useEffect } from 'react';

/**
 * DelayedLoader
 * 
 * Shows 'fallback' (skeleton) only if 'isLoading' is true for longer than 'delay' ms.
 * If data loads fast (< delay), the fallback is skipped entirely to prevent flickering.
 * 
 * @param {boolean} isLoading - Current loading state
 * @param {number} delay - Time in ms to wait before showing fallback (default 300ms)
 * @param {ReactNode} fallback - The skeleton/loader to show
 * @param {ReactNode} children - The actual content
 */
const DelayedLoader = ({ isLoading, delay = 300, fallback, children }) => {
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    let timer;
    if (isLoading) {
      timer = setTimeout(() => {
        setShowFallback(true);
      }, delay);
    } else {
      setShowFallback(false);
    }
    return () => clearTimeout(timer);
  }, [isLoading, delay]);

  if (isLoading) {
    // If we haven't hit the delay threshold yet, show nothing (transparent)
    // or just keep waiting. If we hit the threshold, show fallback.
    return showFallback ? fallback : null;
  }

  return children;
};

export default DelayedLoader;
