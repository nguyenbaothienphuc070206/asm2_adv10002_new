/**
 * Interactive 3D Perspective Tilt Utility (Phase 3)
 * Applies subtle, hardware-accelerated CSS 3D perspective tilt on product cards
 * and studio showcases while strictly respecting prefers-reduced-motion.
 */

export function init3DTiltInteraction() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let activeCard = null;
  let rafId = 0;

  document.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType === 'touch') return;
      const card = e.target.closest('.product, .pd-studio-stage');
      if (!card) {
        if (activeCard) {
          activeCard.style.transform = '';
          activeCard = null;
        }
        return;
      }

      if (activeCard && activeCard !== card) {
        activeCard.style.transform = '';
      }
      activeCard = card;

      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        if (!activeCard) return;
        const rect = activeCard.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return;
        const nx = (e.clientX - rect.left) / rect.width - 0.5;
        const ny = (e.clientY - rect.top) / rect.height - 0.5;
        const rotX = (-ny * 5.5).toFixed(2);
        const rotY = (nx * 6.5).toFixed(2);
        activeCard.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
      });
    },
    { passive: true }
  );

  document.addEventListener(
    'pointerleave',
    () => {
      if (activeCard) {
        activeCard.style.transform = '';
        activeCard = null;
      }
    },
    { passive: true }
  );
}
