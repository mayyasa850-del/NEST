"use client";

import { useEffect, useRef } from "react";

type Clip = {
  basePath: string;
  frameCount: number;
  frameWidth: number;
  frameHeight: number;
  extension?: string;
  pad?: number;
};

type ImageSequenceProps = {
  clips: Clip[];
  scrollHeightVh?: number;
  title?: string;
  logo?: string;
  fadeInAtStart?: boolean;
  fadeOutAtEnd?: boolean;
  fadeDurationMs?: number;
  logoFadeOutProgress?: number;
};

export default function ImageSequence({
  clips,
  scrollHeightVh,
  title,
  logo,
  fadeInAtStart = true,
  fadeOutAtEnd = true,
  fadeDurationMs = 20,
  logoFadeOutProgress = 0.15,
}: ImageSequenceProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);

  const totalFrames = clips.reduce((sum, clip) => sum + clip.frameCount, 0);
  const resolvedScrollHeightVh = scrollHeightVh ?? totalFrames * 1.333 + 100;

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Flatten all clips into one global frame timeline so scrubbing
    // continues seamlessly from one clip into the next.
    const frameMeta: { clip: Clip; localIndex: number }[] = [];
    for (const clip of clips) {
      for (let i = 0; i < clip.frameCount; i++) {
        frameMeta.push({ clip, localIndex: i });
      }
    }

    const images: HTMLImageElement[] = [];
    let currentFrame = 0;
    let ticking = false;
    let framesLoading = false;

    const frameSrc = (globalIndex: number) => {
      const { clip, localIndex } = frameMeta[globalIndex];
      const pad = clip.pad ?? 4;
      const extension = clip.extension ?? "jpg";
      return `${clip.basePath}${String(localIndex + 1).padStart(pad, "0")}.${extension}`;
    };

    const dpr = window.devicePixelRatio || 1;

    const draw = (index: number) => {
      const img = images[index];
      if (!img || !img.complete || img.naturalWidth === 0) return;

      const { frameWidth, frameHeight } = frameMeta[index].clip;

      const canvasWidth = canvas.clientWidth;
      const canvasHeight = canvas.clientHeight;
      const targetWidth = Math.round(canvasWidth * dpr);
      const targetHeight = Math.round(canvasHeight * dpr);
      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const scale = Math.max(
        canvasWidth / frameWidth,
        canvasHeight / frameHeight
      );
      const drawWidth = frameWidth * scale;
      const drawHeight = frameHeight * scale;
      const offsetX = (canvasWidth - drawWidth) / 2;
      const offsetY = (canvasHeight - drawHeight) / 2;

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    };

    const updateFrame = () => {
      ticking = false;
      const rect = wrapper.getBoundingClientRect();
      const scrollableDistance = wrapper.offsetHeight - window.innerHeight;
      const progress = scrollableDistance > 0
        ? Math.min(1, Math.max(0, -rect.top / scrollableDistance))
        : 0;

      currentFrame = Math.min(
        totalFrames - 1,
        Math.floor(progress * totalFrames)
      );
      draw(currentFrame);

      if (titleRef.current) {
        const fadeProgress = Math.min(1, progress / logoFadeOutProgress);
        titleRef.current.style.opacity = String(1 - fadeProgress);
      }

      if (scrimRef.current) {
        const edgeThreshold = 0.001;
        let targetOpacity = 0;
        if (fadeInAtStart && progress < edgeThreshold) targetOpacity = 1;
        if (fadeOutAtEnd && progress > 1 - edgeThreshold) targetOpacity = 1;
        scrimRef.current.style.opacity = String(targetOpacity);
      }
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateFrame);
      }
    };

    const loadFrames = () => {
      if (framesLoading) return;
      framesLoading = true;
      for (let i = 0; i < totalFrames; i++) {
        const img = new Image();
        img.src = frameSrc(i);
        img.onload = () => {
          if (i === currentFrame) draw(currentFrame);
        };
        images.push(img);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadFrames();
          observer.disconnect();
        }
      },
      { rootMargin: "150% 0px 150% 0px" }
    );
    observer.observe(wrapper);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateFrame);
    updateFrame();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateFrame);
      observer.disconnect();
    };
  }, [clips, totalFrames, fadeInAtStart, fadeOutAtEnd, logoFadeOutProgress]);

  return (
    <div ref={wrapperRef} style={{ height: `${resolvedScrollHeightVh}vh`, position: "relative" }}>
      <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
        <div
          ref={scrimRef}
          style={{
            position: "absolute",
            inset: 0,
            background: "#000",
            pointerEvents: "none",
            opacity: fadeInAtStart ? 1 : 0,
            transition: `opacity ${fadeDurationMs}ms linear`,
          }}
        />
        {(title || logo) && (
          <div
            ref={titleRef}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            {logo ? (
              <img
                src={logo}
                alt={title ?? ""}
                style={{ width: "clamp(280px, 30vw, 480px)", height: "auto" }}
              />
            ) : (
              <h1
                style={{
                  margin: 0,
                  fontSize: "clamp(4rem, 12vw, 10rem)",
                  fontWeight: 800,
                  letterSpacing: "0.05em",
                  color: "#fff",
                  textShadow: "0 4px 30px rgba(0,0,0,0.35)",
                  textTransform: "uppercase",
                }}
              >
                {title}
              </h1>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
