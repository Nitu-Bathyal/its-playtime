import React, { useEffect, useRef } from 'react';
import soundManager from '../services/soundManager';

export default function BalloonCanvas({ onPopBalloon }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Balloons array
    const balloonCount = Math.min(16, Math.floor(width / 90));
    const balloons = [];
    const particles = [];

    class Balloon {
      constructor(isInitial = false) {
        this.reset(isInitial);
      }

      reset(isInitial = false) {
        this.x = Math.random() * width;
        this.y = isInitial ? Math.random() * height : height + 100 + Math.random() * 150;
        this.radiusX = 18 + Math.random() * 16;
        this.radiusY = this.radiusX * 1.25;
        this.speedY = 0.5 + Math.random() * 0.9;
        this.swayAngle = Math.random() * Math.PI * 2;
        this.swaySpeed = 0.015 + Math.random() * 0.02;
        this.swayAmplitude = 0.8 + Math.random() * 1.2;
        this.opacity = 0.55 + Math.random() * 0.4;
        this.colorGradient = Math.random() > 0.2 ? '#A51F2B' : '#75131C';
        this.popped = false;
      }

      update() {
        this.y -= this.speedY;
        this.swayAngle += this.swaySpeed;
        this.x += Math.sin(this.swayAngle) * this.swayAmplitude;

        if (this.y < -120) {
          this.reset(false);
        }
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;

        // Balloon Body
        const grad = ctx.createRadialGradient(
          this.x - this.radiusX * 0.3,
          this.y - this.radiusY * 0.3,
          this.radiusX * 0.1,
          this.x,
          this.y,
          this.radiusX * 1.3
        );
        grad.addColorStop(0, '#FF4D5A');
        grad.addColorStop(0.4, this.colorGradient);
        grad.addColorStop(1, '#4B1018');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, this.radiusX, this.radiusY, 0, 0, Math.PI * 2);
        ctx.fill();

        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.ellipse(
          this.x - this.radiusX * 0.38,
          this.y - this.radiusY * 0.4,
          this.radiusX * 0.25,
          this.radiusY * 0.12,
          -Math.PI / 4,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Knot
        ctx.fillStyle = '#630D14';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + this.radiusY);
        ctx.lineTo(this.x - 4, this.y + this.radiusY + 7);
        ctx.lineTo(this.x + 4, this.y + this.radiusY + 7);
        ctx.closePath();
        ctx.fill();

        // String
        ctx.strokeStyle = 'rgba(214, 165, 108, 0.6)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + this.radiusY + 7);
        const ctrl1X = this.x - Math.sin(this.swayAngle) * 8;
        const ctrl1Y = this.y + this.radiusY + 30;
        const ctrl2X = this.x + Math.sin(this.swayAngle) * 10;
        const ctrl2Y = this.y + this.radiusY + 55;
        const endX = this.x;
        const endY = this.y + this.radiusY + 85;
        ctx.bezierCurveTo(ctrl1X, ctrl1Y, ctrl2X, ctrl2Y, endX, endY);
        ctx.stroke();

        ctx.restore();
      }
    }

    // Initialize balloons
    for (let i = 0; i < balloonCount; i++) {
      balloons.push(new Balloon(true));
    }

    // Particle Burst for Popping
    class PopParticle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 5;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.size = 2 + Math.random() * 4;
        this.alpha = 1;
        this.decay = 0.025 + Math.random() * 0.03;
        this.color = Math.random() > 0.4 ? '#E62A3B' : '#FFD700';
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.15; // Gravity
        this.alpha -= this.decay;
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Click handler to POP balloon
    const handleCanvasClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      for (let i = balloons.length - 1; i >= 0; i--) {
        const b = balloons[i];
        const dist = Math.hypot(clickX - b.x, clickY - b.y);
        if (dist <= b.radiusX * 1.3) {
          // POP!
          soundManager.playBalloonPop();
          for (let p = 0; p < 18; p++) {
            particles.push(new PopParticle(b.x, b.y));
          }
          b.reset(false);
          if (onPopBalloon) {
            onPopBalloon();
          }
          break;
        }
      }
    };

    canvas.addEventListener('click', handleCanvasClick);

    // Animation Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render & Update Balloons
      balloons.forEach((b) => {
        b.update();
        b.draw();
      });

      // Render & Update Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw();
        if (p.alpha <= 0) {
          particles.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('click', handleCanvasClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, [onPopBalloon]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-auto z-10"
      style={{ pointerEvents: 'auto' }}
      title="Click floating balloons to pop them for extra points!"
    />
  );
}
