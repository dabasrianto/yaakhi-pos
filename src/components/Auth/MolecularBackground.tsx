import React, { useEffect, useRef } from 'react';

interface Molecule {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

const MolecularBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const moleculesRef = useRef<Molecule[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize molecules
    const initMolecules = () => {
      const molecules: Molecule[] = [];
      const numMolecules = Math.floor((canvas.width * canvas.height) / 15000);

      for (let i = 0; i < numMolecules; i++) {
        molecules.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 2 + 1,
          color: `rgba(99, 102, 241, ${Math.random() * 0.5 + 0.2})`
        });
      }

      moleculesRef.current = molecules;
    };

    initMolecules();

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY
      };
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const molecules = moleculesRef.current;
      const mouse = mouseRef.current;

      // Update and draw molecules
      molecules.forEach((molecule, i) => {
        // Mouse attraction
        const dx = mouse.x - molecule.x;
        const dy = mouse.y - molecule.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 150) {
          const force = (150 - distance) / 150;
          molecule.vx += (dx / distance) * force * 0.01;
          molecule.vy += (dy / distance) * force * 0.01;
        }

        // Update position
        molecule.x += molecule.vx;
        molecule.y += molecule.vy;

        // Friction
        molecule.vx *= 0.99;
        molecule.vy *= 0.99;

        // Boundary collision
        if (molecule.x < 0 || molecule.x > canvas.width) {
          molecule.vx *= -0.8;
          molecule.x = Math.max(0, Math.min(canvas.width, molecule.x));
        }
        if (molecule.y < 0 || molecule.y > canvas.height) {
          molecule.vy *= -0.8;
          molecule.y = Math.max(0, Math.min(canvas.height, molecule.y));
        }

        // Draw molecule
        ctx.beginPath();
        ctx.arc(molecule.x, molecule.y, molecule.radius, 0, Math.PI * 2);
        ctx.fillStyle = molecule.color;
        ctx.fill();

        // Draw connections
        molecules.forEach((otherMolecule, j) => {
          if (i !== j) {
            const dx = molecule.x - otherMolecule.x;
            const dy = molecule.y - otherMolecule.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) {
              const opacity = (100 - distance) / 100 * 0.3;
              ctx.beginPath();
              ctx.moveTo(molecule.x, molecule.y);
              ctx.lineTo(otherMolecule.x, otherMolecule.y);
              ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        });

        // Connection to mouse
        const mouseDistance = Math.sqrt(
          (mouse.x - molecule.x) ** 2 + (mouse.y - molecule.y) ** 2
        );

        if (mouseDistance < 120) {
          const opacity = (120 - mouseDistance) / 120 * 0.4;
          ctx.beginPath();
          ctx.moveTo(molecule.x, molecule.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.stroke();

          // Highlight molecule near mouse
          ctx.beginPath();
          ctx.arc(molecule.x, molecule.y, molecule.radius + 2, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      // Draw mouse cursor effect
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(139, 92, 246, 0.3)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(139, 92, 246, 0.6)';
      ctx.fill();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}
    />
  );
};

export default MolecularBackground;