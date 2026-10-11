import React, { useEffect, useRef, useState } from 'react';

export type BackgroundTheme = 'cyber_mesh' | 'radar_gov' | 'deep_matrix' | 'sunset_pulse';

interface TechBackgroundProps {
  theme?: BackgroundTheme;
  showHudElements?: boolean;
}

export const TechBackground: React.FC<TechBackgroundProps> = ({
  theme = 'cyber_mesh',
  showHudElements = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Mouse move spotlight listener
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Interactive Particle & Fiber Optic Node Network Canvas
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
    window.addEventListener('resize', handleResize);

    // Color palettes based on theme
    const themeColors = {
      cyber_mesh: {
        nodes: 'rgba(0, 229, 255, ',
        lines: 'rgba(168, 85, 247, ',
        pulses: '#00e5ff',
        glow: 'rgba(0, 229, 255, 0.15)'
      },
      radar_gov: {
        nodes: 'rgba(34, 255, 154, ',
        lines: 'rgba(16, 185, 129, ',
        pulses: '#22ff9a',
        glow: 'rgba(34, 255, 154, 0.15)'
      },
      deep_matrix: {
        nodes: 'rgba(56, 189, 248, ',
        lines: 'rgba(30, 58, 138, ',
        pulses: '#38bdf8',
        glow: 'rgba(56, 189, 248, 0.12)'
      },
      sunset_pulse: {
        nodes: 'rgba(255, 159, 28, ',
        lines: 'rgba(255, 59, 92, ',
        pulses: '#ff9f1c',
        glow: 'rgba(255, 159, 28, 0.15)'
      }
    }[theme];

    // Generate ISP & Infrastructure Nodes
    const nodeCount = Math.floor((width * height) / 22000);
    const nodes: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      pulseOffset: number;
      label?: string;
    }> = [];

    const ispLabels = ['TELKOM', 'LINKNET', 'BIZNET', 'XLAXIATA', 'MORATEL', 'INDOSAT', 'GOV-NODE-01', 'GOV-NODE-02'];

    for (let i = 0; i < Math.max(30, nodeCount); i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1.2,
        pulseOffset: Math.random() * Math.PI * 2,
        label: i < ispLabels.length ? ispLabels[i] : undefined
      });
    }

    // Signals traveling along lines
    const signals: Array<{
      from: number;
      to: number;
      progress: number;
      speed: number;
    }> = [];

    let frame = 0;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      // Update and draw nodes
      nodes.forEach((node, i) => {
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off edges
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        // Draw node dot
        const pulse = Math.sin(frame * 0.03 + node.pulseOffset) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * pulse, 0, Math.PI * 2);
        ctx.fillStyle = `${themeColors.nodes}${pulse * 0.8})`;
        ctx.fill();

        // Optional node halo
        if (node.label) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius * 2.5, 0, Math.PI * 2);
          ctx.strokeStyle = `${themeColors.nodes}0.25)`;
          ctx.lineWidth = 0.75;
          ctx.stroke();

          // Node label tag
          ctx.font = '8px "JetBrains Mono", monospace';
          ctx.fillStyle = 'rgba(226, 232, 240, 0.45)';
          ctx.fillText(node.label, node.x + 8, node.y + 3);
        }

        // Draw connections to nearby nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const dx = other.x - node.x;
          const dy = other.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const maxDist = 140;
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.35;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `${themeColors.lines}${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();

            // Randomly spawn traveling signal
            if (Math.random() < 0.002 && signals.length < 15) {
              signals.push({
                from: i,
                to: j,
                progress: 0,
                speed: 0.015 + Math.random() * 0.02
              });
            }
          }
        }
      });

      // Draw active traveling signals (data packets / fiber light pulses)
      for (let s = signals.length - 1; s >= 0; s--) {
        const sig = signals[s];
        sig.progress += sig.speed;

        if (sig.progress >= 1) {
          signals.splice(s, 1);
          continue;
        }

        const n1 = nodes[sig.from];
        const n2 = nodes[sig.to];
        if (!n1 || !n2) continue;

        const sx = n1.x + (n2.x - n1.x) * sig.progress;
        const sy = n1.y + (n2.y - n1.y) * sig.progress;

        ctx.beginPath();
        ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = themeColors.pulses;
        ctx.shadowColor = themeColors.pulses;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Deep Obsidian Gradient Canvas Layer */}
      <div
        className="absolute inset-0 transition-colors duration-1000"
        style={{
          background:
            theme === 'cyber_mesh'
              ? 'radial-gradient(ellipse at top left, #0b0f26 0%, #050714 50%, #020308 100%)'
              : theme === 'radar_gov'
              ? 'radial-gradient(ellipse at top right, #041f17 0%, #03100c 50%, #010806 100%)'
              : theme === 'deep_matrix'
              ? 'radial-gradient(ellipse at center, #081229 0%, #040917 50%, #02040a 100%)'
              : 'radial-gradient(ellipse at bottom left, #1f0b18 0%, #0f0510 50%, #050106 100%)'
        }}
      />

      {/* Interactive Cursor Glow Spotlight */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full blur-[120px] opacity-20 transition-transform duration-75 ease-out"
        style={{
          transform: `translate(${mousePos.x - 300}px, ${mousePos.y - 300}px)`,
          background:
            theme === 'cyber_mesh'
              ? 'radial-gradient(circle, rgba(0,229,255,0.8), rgba(168,85,247,0.4), transparent)'
              : theme === 'radar_gov'
              ? 'radial-gradient(circle, rgba(34,255,154,0.8), rgba(16,185,129,0.4), transparent)'
              : theme === 'deep_matrix'
              ? 'radial-gradient(circle, rgba(56,189,248,0.8), rgba(30,58,138,0.4), transparent)'
              : 'radial-gradient(circle, rgba(255,159,28,0.8), rgba(255,59,92,0.4), transparent)'
        }}
      />

      {/* Cyber Grid Vector Mesh with Perspective Sweeps */}
      <div
        className="absolute inset-0 opacity-[0.12] bg-[length:40px_40px]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `
        }}
      />

      {/* Animated Light Beams & Laser Waves */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[140px] animate-pulse duration-10000" />
        <div className="absolute top-1/2 -right-32 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[160px] animate-pulse duration-7000" />
        <div className="absolute -bottom-32 left-1/3 w-[550px] h-[550px] bg-amber-500/15 rounded-full blur-[150px] animate-pulse duration-12000" />
      </div>

      {/* Fiber Optic Node Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-80" />

      {/* Radar Sweep Arc at Top Right */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full border border-cyan-500/10 pointer-events-none flex items-center justify-center animate-[spin_20s_linear_infinite]">
        <div className="w-80 h-80 rounded-full border border-dashed border-purple-500/15" />
        <div className="w-60 h-60 rounded-full border border-cyan-400/20" />
        <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
        <div className="absolute h-full w-[1px] bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent" />
      </div>

      {/* HUD Corner Framing Brackets */}
      {showHudElements && (
        <div className="absolute inset-4 sm:inset-6 pointer-events-none flex flex-col justify-between opacity-35">
          {/* Top Corners */}
          <div className="flex justify-between items-start">
            <div className="w-6 h-6 border-t-2 border-l-2 border-cyan-400/60 rounded-tl-sm flex items-center justify-center">
              <span className="text-[8px] text-cyan-400 font-mono pl-1 pt-1">GOV</span>
            </div>
            <div className="w-6 h-6 border-t-2 border-r-2 border-cyan-400/60 rounded-tr-sm" />
          </div>

          {/* Bottom Corners */}
          <div className="flex justify-between items-end">
            <div className="w-6 h-6 border-b-2 border-l-2 border-cyan-400/60 rounded-bl-sm" />
            <div className="w-6 h-6 border-b-2 border-r-2 border-cyan-400/60 rounded-br-sm flex items-center justify-center">
              <span className="text-[8px] text-cyan-400 font-mono pr-1 pb-1">JWS</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
