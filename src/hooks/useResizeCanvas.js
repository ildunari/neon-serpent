// extracted from NeonSerpentGame_backup.jsx on 2025-04-17
// TODO: Implement canvas resize and DPI scaling hook
import { useEffect } from 'react';

/**
 * Hook to handle canvas resizing and high-DPI scaling.
 * @param {HTMLCanvasElement} canvas Ref or DOM node of the canvas
 */
export function useResizeCanvas(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let dpr = window.devicePixelRatio || 1;
    function resize() {
      dpr = window.devicePixelRatio || 1;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [canvasRef]);
}
