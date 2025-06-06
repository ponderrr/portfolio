// Particle effect
function createParticles(id, count, animationPrefix = "floatDot") {
  const container = document.getElementById(id);
  if (!container) return;

  for (let i = 0; i < count; i++) {
    const dot = document.createElement("div");
    dot.style.position = "absolute";
    dot.style.left = `${Math.random() * 100}%`;
    dot.style.top = `${Math.random() * 100}%`;
    const size = 4 + Math.random() * 6;
    dot.style.width = `${size}px`;
    dot.style.height = `${size}px`;
    dot.style.borderRadius = "50%";
    dot.style.background = "rgba(79,195,247,0.13)";
    dot.style.filter = "blur(1.5px)";
    const animName = `${animationPrefix}${i}`;
    dot.style.animation = `${animName} ${5 + Math.random() * 6}s ease-in-out ${
      Math.random() * 6
    }s infinite alternate`;
    container.appendChild(dot);

    const styleSheet = document.styleSheets[document.styleSheets.length - 1];
    const moveY = -25 + Math.random() * 50;
    styleSheet.insertRule(
      `@keyframes ${animName} {
        0% { transform: translateY(0px); }
        100% { transform: translateY(${moveY}px); }
      }`,
      styleSheet.cssRules.length
    );
  }
}

// Run particles on load
window.addEventListener("DOMContentLoaded", () => {
  createParticles("particle-background", 32);
});
