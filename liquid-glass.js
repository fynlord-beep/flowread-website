/* FlowRead · Liquid Glass interactions
 * - Cursor-tracked specular highlight on every glass surface
 * - Subtle 3D parallax tilt on cards
 * - Liquid ripple on button press
 * - Smooth scroll-reveal (fallback, respects reduced motion)
 */
(function () {
    'use strict';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

    const glassSelector = [
        '.glass-card', '.feature-card', '.support-card', '.legal-section',
        '.contact-form', '.impressum-card', '.rsvp-demo',
        '.primary-contact-card', '.bug-template',
        '.header-content'
    ].join(',');

    function bindGlassSpotlight() {
        if (isTouch || prefersReducedMotion) return;
        document.querySelectorAll(glassSelector).forEach((el) => {
            el.addEventListener('pointermove', (e) => {
                const r = el.getBoundingClientRect();
                const x = ((e.clientX - r.left) / r.width) * 100;
                const y = ((e.clientY - r.top) / r.height) * 100;
                el.style.setProperty('--lg-mx', x + '%');
                el.style.setProperty('--lg-my', y + '%');
            });
            el.addEventListener('pointerleave', () => {
                el.style.setProperty('--lg-mx', '50%');
                el.style.setProperty('--lg-my', '50%');
            });
        });
    }

    function bindCardTilt() {
        if (isTouch || prefersReducedMotion) return;
        const cards = document.querySelectorAll('.feature-card, .support-card, .primary-contact-card');
        cards.forEach((card) => {
            card.style.transformStyle = 'preserve-3d';
            card.style.willChange = 'transform';
            let raf = 0;
            card.addEventListener('pointermove', (e) => {
                if (raf) cancelAnimationFrame(raf);
                raf = requestAnimationFrame(() => {
                    const r = card.getBoundingClientRect();
                    const cx = (e.clientX - r.left) / r.width - 0.5;
                    const cy = (e.clientY - r.top) / r.height - 0.5;
                    const rx = (-cy * 6).toFixed(2);
                    const ry = (cx * 6).toFixed(2);
                    card.style.transform =
                        'perspective(900px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateY(-8px)';
                });
            });
            card.addEventListener('pointerleave', () => {
                if (raf) cancelAnimationFrame(raf);
                card.style.transform = '';
            });
        });
    }

    function bindRipples() {
        if (prefersReducedMotion) return;
        document.querySelectorAll('.btn-primary, .btn-secondary, .copy-btn').forEach((btn) => {
            btn.addEventListener('pointerdown', (e) => {
                const r = btn.getBoundingClientRect();
                const ripple = document.createElement('span');
                ripple.className = 'lg-ripple';
                const size = Math.max(r.width, r.height) * 1.2;
                ripple.style.width = size + 'px';
                ripple.style.height = size + 'px';
                ripple.style.left = (e.clientX - r.left) + 'px';
                ripple.style.top = (e.clientY - r.top) + 'px';
                btn.appendChild(ripple);
                setTimeout(() => ripple.remove(), 850);
            });
        });
    }

    function bindReveal() {
        if (!('IntersectionObserver' in window)) {
            document.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'));
            return;
        }
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
    }

    function init() {
        bindGlassSpotlight();
        bindCardTilt();
        bindRipples();
        bindReveal();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
