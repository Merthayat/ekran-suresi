import React, { useRef, useEffect, useState } from 'react';

interface TransparentMascotVideoProps {
  defaultSrc?: string;
  fallbackImage?: string;
  className?: string;
}

export const TransparentMascotVideo: React.FC<TransparentMascotVideoProps> = ({
  defaultSrc = '/kus.mp4',
  fallbackImage = '/kus_poster.png',
  className = '',
}) => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    let isCancelled = false;
    let rfcId: number | null = null;
    let rafId: number | null = null;

    // Force autoplay properties directly on DOM element
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');

    const tryPlay = () => {
      if (isCancelled || !video) return;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            if (!isCancelled) {
              setIsVideoLoaded(true);
              setHasError(false);
            }
          })
          .catch((err) => {
            console.warn('Video autoplay waiting for user interaction:', err);
          });
      }
    };

    tryPlay();

    // Canvas target resolution: 360x640 is ideal for mobile/web mascot performance
    const renderW = 360;
    const renderH = 640;
    canvas.width = renderW;
    canvas.height = renderH;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    const processFrame = () => {
      if (isCancelled) return;

      if (video.readyState >= 2 && !video.paused) {
        if (!isVideoLoaded) {
          setIsVideoLoaded(true);
        }

        if (ctx) {
          ctx.drawImage(video, 0, 0, renderW, renderH);

          const frame = ctx.getImageData(0, 0, renderW, renderH);
          const d = frame.data;
          const len = d.length;

          // Corner background sampling
          const c1R = d[0], c1G = d[1], c1B = d[2];
          const c2R = d[(renderW - 1) * 4], c2G = d[(renderW - 1) * 4 + 1], c2B = d[(renderW - 1) * 4 + 2];
          const c3R = d[(renderH - 1) * renderW * 4], c3G = d[(renderH - 1) * renderW * 4 + 1], c3B = d[(renderH - 1) * renderW * 4 + 2];
          const c4R = d[(renderH * renderW - 1) * 4], c4G = d[(renderH * renderW - 1) * 4 + 1], c4B = d[(renderH * renderW - 1) * 4 + 2];

          const avgCornerR = (c1R + c2R + c3R + c4R) / 4;
          const avgCornerG = (c1G + c2G + c3G + c4G) / 4;
          const avgCornerB = (c1B + c2B + c3B + c4B) / 4;

          const isSageGreen = avgCornerG > avgCornerR + 6 && avgCornerG > avgCornerB + 18 && avgCornerR > avgCornerB + 4;

          for (let i = 0; i < len; i += 4) {
            const r = d[i];
            const g = d[i + 1];
            const b = d[i + 2];
            let alpha = 255;

            if (isSageGreen) {
              const dist = Math.sqrt(
                (r - avgCornerR) ** 2 +
                (g - avgCornerG) ** 2 +
                (b - avgCornerB) ** 2
              );
              const isSageTone = (g > r + 6 && g > b + 18 && r > b + 4 && g > 135 && g < 245 && r > 125 && b > 105);

              if (dist < 45 || isSageTone) {
                alpha = 0;
              } else if (dist < 75) {
                alpha = Math.round(((dist - 45) / 30) * 255);
              }
            } else {
              const dist = Math.sqrt(
                (r - avgCornerR) ** 2 +
                (g - avgCornerG) ** 2 +
                (b - avgCornerB) ** 2
              );
              if (dist < 42) {
                alpha = 0;
              } else if (dist < 72) {
                alpha = Math.round(((dist - 42) / 30) * 255);
              }
            }

            d[i + 3] = alpha;
          }

          ctx.putImageData(frame, 0, 0);
        }
      } else if (video.paused && !video.ended) {
        tryPlay();
      }

      // Schedule next frame
      if ('requestVideoFrameCallback' in video && typeof (video as any).requestVideoFrameCallback === 'function') {
        rfcId = (video as any).requestVideoFrameCallback(processFrame);
      } else {
        rafId = requestAnimationFrame(processFrame);
      }
    };

    const handleCanPlay = () => {
      tryPlay();
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadeddata', handleCanPlay);
    video.addEventListener('playing', () => {
      if (!isCancelled) setIsVideoLoaded(true);
    });

    // Start frame loop
    if ('requestVideoFrameCallback' in video && typeof (video as any).requestVideoFrameCallback === 'function') {
      rfcId = (video as any).requestVideoFrameCallback(processFrame);
    } else {
      rafId = requestAnimationFrame(processFrame);
    }

    // Global click / touch event to unlock video autoplay if blocked by browser policy
    const handleUserInteraction = () => {
      if (video && video.paused) {
        tryPlay();
      }
    };
    window.addEventListener('click', handleUserInteraction, { passive: true, once: true });
    window.addEventListener('touchstart', handleUserInteraction, { passive: true, once: true });

    return () => {
      isCancelled = true;
      if (rfcId !== null && 'cancelVideoFrameCallback' in video && typeof (video as any).cancelVideoFrameCallback === 'function') {
        (video as any).cancelVideoFrameCallback(rfcId);
      }
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadeddata', handleCanPlay);
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
    };
  }, [defaultSrc]);

  return (
    <div
      className="relative flex items-end justify-center pointer-events-none select-none"
      aria-hidden="true"
    >
      {/* Hidden Source Video Element (Kept in DOM so decoding stays active across all browsers) */}
      <video
        ref={videoRef}
        src={defaultSrc}
        autoPlay
        loop
        muted
        playsInline
        onError={() => setHasError(true)}
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          opacity: 0.001,
          pointerEvents: 'none',
          zIndex: -100,
        }}
      />

      {/* Primary Video Canvas with Transparent Background */}
      <canvas
        ref={canvasRef}
        className={`${className} ${isVideoLoaded && !hasError ? 'block' : 'hidden'} filter drop-shadow-[0_12px_22px_rgba(0,0,0,0.5)]`}
      />

      {/* Fallback image (e.g. poster) while video is initializing or if video fails */}
      {(!isVideoLoaded || hasError) && fallbackImage && (
        <img
          src={fallbackImage}
          alt="Maskot"
          className={`${className} opacity-95`}
          draggable={false}
          referrerPolicy="no-referrer"
        />
      )}
    </div>
  );
};
