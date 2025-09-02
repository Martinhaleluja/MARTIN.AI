// Particle Background System
class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('particles-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.animationId = null;
        
        this.init();
        this.setupEventListeners();
    }
    
    init() {
        this.resizeCanvas();
        this.createParticles();
        this.animate();
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.createParticles();
        });
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createParticles() {
        const particleCount = Math.min(100, Math.floor((this.canvas.width * this.canvas.height) / 10000));
        this.particles = [];
        
        const colors = [
            'hsl(264, 83%, 57%)', // primary
            'hsl(290, 70%, 60%)', // secondary  
            'hsl(210, 100%, 56%)', // accent
        ];
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 3 + 1,
                color: colors[Math.floor(Math.random() * colors.length)],
                opacity: Math.random() * 0.5 + 0.2,
            });
        }
    }
    
    updateParticles() {
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Bounce off edges
            if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;
            
            // Keep particles in bounds
            particle.x = Math.max(0, Math.min(this.canvas.width, particle.x));
            particle.y = Math.max(0, Math.min(this.canvas.height, particle.y));
            
            // Slight opacity variation
            particle.opacity += (Math.random() - 0.5) * 0.01;
            particle.opacity = Math.max(0.1, Math.min(0.7, particle.opacity));
        });
    }
    
    drawParticles() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw connections between nearby particles
        this.particles.forEach((particle, i) => {
            this.particles.slice(i + 1).forEach(otherParticle => {
                const dx = particle.x - otherParticle.x;
                const dy = particle.y - otherParticle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    const opacity = (100 - distance) / 100 * 0.2;
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `hsla(264, 83%, 57%, ${opacity})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(otherParticle.x, otherParticle.y);
                    this.ctx.stroke();
                }
            });
        });
        
        // Draw particles
        this.particles.forEach(particle => {
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color.replace(')', `, ${particle.opacity})`).replace('hsl', 'hsla');
            this.ctx.fill();
            
            // Add glow effect
            this.ctx.shadowColor = particle.color;
            this.ctx.shadowBlur = particle.size * 2;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size * 0.5, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        });
    }
    
    animate() {
        this.updateParticles();
        this.drawParticles();
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        window.removeEventListener('resize', this.resizeCanvas);
    }
}

// Initialize particle system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.particleSystem = new ParticleSystem();
});
