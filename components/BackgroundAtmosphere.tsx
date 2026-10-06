'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  baseOpacity: number;
  color: string;
  pulseSpeed: number;
  pulseOffset: number;
}

export default function BackgroundAtmosphere() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize, { passive: true });

    // Palette: Emerald, Cyber Mint, Golden Harvest, Soft Cyan
    const colors = [
      'rgba(52, 211, 153, ',  // emerald light
      'rgba(16, 185, 129, ',  // emerald
      'rgba(245, 158, 11, ',  // golden corn / warm
      'rgba(6, 182, 212, ',   // cyan
    ];

    // Reduced particle count for smooth 60fps performance & eye comfort
    const particleCount = Math.min(32, Math.floor((width * height) / 38000));
    const particles: Particle[] = Array.from({ length: particleCount }, () => {
      const baseOpacity = Math.random() * 0.3 + 0.15;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.2 + 0.8,
        speedY: -(Math.random() * 0.32 + 0.1),
        speedX: (Math.random() - 0.5) * 0.2,
        opacity: baseOpacity,
        baseOpacity,
        color: colors[Math.floor(Math.random() * colors.length)],
        pulseSpeed: Math.random() * 0.02 + 0.008,
        pulseOffset: Math.random() * Math.PI * 2,
      };
    });

    let time = 0;
    const render = () => {
      time += 1;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(time * 0.01 + i) * 0.15;

        // Pulse opacity smoothly
        const pulse = (Math.sin(time * p.pulseSpeed + p.pulseOffset) + 1) / 2;
        p.opacity = p.baseOpacity * (0.6 + 0.4 * pulse);

        // Wrap around screen
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        // Draw soft glowing particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.opacity})`;
        ctx.shadowColor = `${p.color}0.7)`;
        ctx.shadowBlur = p.size * 3.5;
        ctx.fill();
      }

      ctx.shadowBlur = 0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="bg-atmosphere" aria-hidden="true">
      {/* Top Cyber Horizon Glow */}
      <div className="bg-top-accent-line" />

      {/* Dynamic Aurora Glow Orbs */}
      <div className="bg-orb bg-orb-emerald" />
      <div className="bg-orb bg-orb-cyan" />
      <div className="bg-orb bg-orb-gold" />
      <div className="bg-orb bg-orb-mint" />

      {/* Cyber-Farm Precision Grid Matrix */}
      <div className="bg-cyber-grid" />
      <div className="bg-dot-matrix" />

      {/* Floating Ambient Farm Motes Canvas */}
      <canvas ref={canvasRef} className="bg-particles-canvas" />

      {/* Radial Vignette & Soft Gradient Wash for Depth & Eye Comfort */}
      <div className="bg-vignette-overlay" />
    </div>
  );
}
