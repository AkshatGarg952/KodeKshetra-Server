import { useEffect, useRef } from "react";

function CanvasEffect({ className, setupScene, drawFrame, clear = "clear" }) {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.className = className;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    document.body.appendChild(canvas);
    canvasRef.current = canvas;

    const context = canvas.getContext("2d");
    const scene = setupScene(canvas, context);

    const animate = () => {
      if (clear === "fade") {
        context.fillStyle = "rgba(0, 0, 0, 0.08)";
        context.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        context.clearRect(0, 0, canvas.width, canvas.height);
      }

      drawFrame({ canvas, context, scene });
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (canvasRef.current && document.body.contains(canvasRef.current)) {
        document.body.removeChild(canvasRef.current);
      }
    };
  }, [className, clear, drawFrame, setupScene]);

  return null;
}

export function FireworksEffect() {
  return (
    <CanvasEffect
      className="fixed inset-0 h-full w-full pointer-events-none z-40"
      clear="fade"
      setupScene={() => ({
        particles: [],
        rockets: [],
      })}
      drawFrame={({ canvas, context, scene }) => {
        class Particle {
          constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.color = color;
            this.velocity = {
              x: (Math.random() - 0.5) * 10,
              y: (Math.random() - 0.5) * 10,
            };
            this.alpha = 1;
            this.decay = Math.random() * 0.015 + 0.015;
            this.size = Math.random() * 4 + 2;
          }

          update() {
            this.velocity.y += 0.15;
            this.x += this.velocity.x;
            this.y += this.velocity.y;
            this.alpha -= this.decay;
          }

          draw() {
            context.save();
            context.globalAlpha = this.alpha;
            context.fillStyle = this.color;
            context.shadowBlur = 15;
            context.shadowColor = this.color;
            context.beginPath();
            context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            context.fill();
            context.restore();
          }
        }

        class Rocket {
          constructor() {
            this.x = Math.random() * canvas.width;
            this.y = canvas.height;
            this.targetY = Math.random() * canvas.height * 0.4 + 100;
            this.color = `hsl(${Math.random() * 360}, 100%, 60%)`;
            this.exploded = false;
            this.trail = [];
          }

          update() {
            if (this.exploded) {
              return;
            }

            this.y -= 5;
            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > 10) {
              this.trail.shift();
            }

            if (this.y <= this.targetY) {
              this.exploded = true;
              const particleCount = Math.random() * 80 + 120;
              for (let index = 0; index < particleCount; index += 1) {
                scene.particles.push(new Particle(this.x, this.y, this.color));
              }
            }
          }

          draw() {
            if (this.exploded) {
              return;
            }

            this.trail.forEach((point, index) => {
              context.globalAlpha = (index / this.trail.length) * 0.5;
              context.fillStyle = this.color;
              context.beginPath();
              context.arc(point.x, point.y, 2, 0, Math.PI * 2);
              context.fill();
            });

            context.globalAlpha = 1;
            context.fillStyle = this.color;
            context.shadowBlur = 10;
            context.shadowColor = this.color;
            context.beginPath();
            context.arc(this.x, this.y, 3, 0, Math.PI * 2);
            context.fill();
          }
        }

        if (Math.random() < 0.08 && scene.rockets.length < 6) {
          scene.rockets.push(new Rocket());
        }

        scene.rockets = scene.rockets.filter((rocket) => {
          rocket.update();
          rocket.draw();
          return !rocket.exploded || rocket.y < canvas.height;
        });

        scene.particles = scene.particles.filter((particle) => {
          particle.update();
          particle.draw();
          return particle.alpha > 0;
        });
      }}
    />
  );
}

export function FallingTearsEffect() {
  return (
    <CanvasEffect
      className="fixed inset-0 h-full w-full pointer-events-none z-40"
      setupScene={(canvas) => ({
        tears: Array.from({ length: 60 }, () => ({
          x: Math.random() * canvas.width,
          y: Math.random() * -canvas.height,
          length: Math.random() * 30 + 15,
          speed: Math.random() * 4 + 3,
          opacity: Math.random() * 0.6 + 0.4,
          wobble: Math.random() * 2 - 1,
        })),
      })}
      drawFrame={({ canvas, context, scene }) => {
        scene.tears.forEach((tear) => {
          tear.y += tear.speed;
          tear.x += Math.sin(tear.y * 0.01) * tear.wobble;

          if (tear.y > canvas.height + tear.length) {
            tear.y = -tear.length;
            tear.x = Math.random() * canvas.width;
          }

          const gradient = context.createLinearGradient(tear.x, tear.y, tear.x, tear.y + tear.length);
          gradient.addColorStop(0, "rgba(100, 149, 237, 0)");
          gradient.addColorStop(0.5, `rgba(100, 149, 237, ${tear.opacity})`);
          gradient.addColorStop(1, `rgba(100, 149, 237, ${tear.opacity * 0.5})`);

          context.strokeStyle = gradient;
          context.lineWidth = 2.5;
          context.lineCap = "round";
          context.beginPath();
          context.moveTo(tear.x, tear.y);
          context.lineTo(tear.x, tear.y + tear.length);
          context.stroke();

          context.fillStyle = `rgba(100, 149, 237, ${tear.opacity})`;
          context.shadowBlur = 8;
          context.shadowColor = "rgba(100, 149, 237, 0.8)";
          context.beginPath();
          context.arc(tear.x, tear.y + tear.length, 4, 0, Math.PI * 2);
          context.fill();
        });
      }}
    />
  );
}

export function SparkleEffect() {
  return (
    <CanvasEffect
      className="fixed inset-0 h-full w-full pointer-events-none z-40"
      clear="fade"
      setupScene={(canvas) => ({
        sparkles: Array.from({ length: 100 }, () => ({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 4 + 2,
          speedX: (Math.random() - 0.5) * 2,
          speedY: Math.random() * 2 + 1,
          life: 100,
          maxLife: 100,
          color: `hsl(${Math.random() * 60 + 30}, 100%, ${Math.random() * 30 + 60}%)`,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.1,
        })),
      })}
      drawFrame={({ canvas, context, scene }) => {
        scene.sparkles.forEach((sparkle) => {
          sparkle.x += sparkle.speedX;
          sparkle.y += sparkle.speedY;
          sparkle.rotation += sparkle.rotationSpeed;
          sparkle.life -= 1;

          if (sparkle.life <= 0 || sparkle.y > canvas.height) {
            sparkle.x = Math.random() * canvas.width;
            sparkle.y = Math.random() * -100;
            sparkle.life = sparkle.maxLife;
            sparkle.size = Math.random() * 4 + 2;
          }

          const opacity = sparkle.life / sparkle.maxLife;
          context.save();
          context.globalAlpha = opacity;
          context.translate(sparkle.x, sparkle.y);
          context.rotate(sparkle.rotation);
          context.fillStyle = sparkle.color;
          context.shadowBlur = 15;
          context.shadowColor = sparkle.color;

          context.beginPath();
          for (let index = 0; index < 5; index += 1) {
            const angle = (Math.PI * 2 * index) / 5 - Math.PI / 2;
            const x = Math.cos(angle) * sparkle.size;
            const y = Math.sin(angle) * sparkle.size;

            if (index === 0) {
              context.moveTo(x, y);
            } else {
              context.lineTo(x, y);
            }

            const innerAngle = angle + Math.PI / 5;
            context.lineTo(
              Math.cos(innerAngle) * (sparkle.size / 2),
              Math.sin(innerAngle) * (sparkle.size / 2),
            );
          }

          context.closePath();
          context.fill();
          context.restore();
        });
      }}
    />
  );
}
