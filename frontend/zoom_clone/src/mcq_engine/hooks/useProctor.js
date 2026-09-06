import { useEffect, useRef, useCallback } from 'react';

const useProctor = (isActive, onViolation) => {
  const submittedRef = useRef(false);
  const activeRef = useRef(false);
  const graceRef = useRef(true);

  useEffect(() => {
    activeRef.current = isActive;
  }, [isActive]);

  const fireViolation = useCallback((type) => {
    if (submittedRef.current) return;
    if (!activeRef.current) return;
    if (graceRef.current) return;

    submittedRef.current = true;
    onViolation(type);
  }, [onViolation]);

  useEffect(() => {
    if (!isActive) return;

    graceRef.current = true;
    submittedRef.current = false;
    
    const graceTimer = setTimeout(() => {
      graceRef.current = false;
    }, 3000);

    const fsTimer = setTimeout(async () => {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } catch (e) {
        console.log('Fullscreen request handled:', e);
      }
    }, 1000);

    const onFSChange = () => {
      if (!document.fullscreenElement) {
        fireViolation('fullscreen-exit');
      }
    };

    const onVisChange = () => {
      if (document.hidden) {
        fireViolation('tab-switch');
      }
    };

    let blurTimer = null;
    const onBlur = () => {
      blurTimer = setTimeout(() => {
        if (!document.hasFocus() && document.activeElement?.tagName !== 'IFRAME') {
          fireViolation('window-blur');
        }
      }, 500);
    };

    const onFocus = () => {
      if (blurTimer) clearTimeout(blurTimer);
    };

    const onKeyDown = (e) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) ||
        (e.ctrlKey && (e.key === 'U' || e.key === 'u'))
      ) {
        e.preventDefault();
        fireViolation('devtools');
      }
      if (e.key === 'Escape') {
        fireViolation('escape');
      }
    };

    const onContextMenu = (e) => {
      e.preventDefault();
    };

    document.addEventListener('fullscreenchange', onFSChange);
    document.addEventListener('visibilitychange', onVisChange);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('contextmenu', onContextMenu);

    return () => {
      clearTimeout(graceTimer);
      clearTimeout(fsTimer);
      if (blurTimer) clearTimeout(blurTimer);
      document.removeEventListener('fullscreenchange', onFSChange);
      document.removeEventListener('visibilitychange', onVisChange);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('contextmenu', onContextMenu);
      
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, [isActive, fireViolation]);

  return null;
};

export default useProctor;
