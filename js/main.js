document.addEventListener("DOMContentLoaded", () => {
    initMobileMenu();
    initNavbarShadow();
    initScrollReveal();
    initSmoothAnchors();
    initFooterYear();
    initCoverflows();
});

// ── Coverflow: tarjeta central grande + laterales desvanecidas ──────────────
function initCoverflows() {
    document.querySelectorAll("[data-coverflow]").forEach(setupCoverflow);
}

function setupCoverflow(coverflow) {
    const slides = Array.from(coverflow.querySelectorAll(".coverflow-slide"));
    const btnPrev = coverflow.querySelector("[data-coverflow-prev]");
    const btnNext = coverflow.querySelector("[data-coverflow-next]");
    const total = slides.length;
    if (!total) return;

    const INTERVALO_MS = 3000;
    let indiceActivo = 0;
    let temporizador = null;

    const pasoRelativo = parseFloat(coverflow.dataset.coverflowStep);

    function obtenerPaso() {
        return pasoRelativo ? slides[0].offsetWidth * pasoRelativo : 105;
    }

    function distanciaCircular(desde, hasta) {
        let diff = hasta - desde;
        if (diff > total / 2) diff -= total;
        if (diff < -total / 2) diff += total;
        return diff;
    }

    function render() {
        const paso = obtenerPaso();

        slides.forEach((slide, i) => {
            const offset = distanciaCircular(indiceActivo, i);
            const distanciaAbs = Math.abs(offset);

            if (distanciaAbs > 2) {
                const lejos = paso * 2.5;
                slide.style.opacity = "0";
                slide.style.transform = `translate(-50%, -50%) translateX(${offset > 0 ? lejos : -lejos}px) scale(0.6)`;
                slide.style.zIndex = "0";
                slide.style.pointerEvents = "none";
                return;
            }

            const desplazamientoX = offset * paso;
            const escala = 1 - distanciaAbs * 0.22;
            const opacidad = 1 - distanciaAbs * 0.4;

            slide.style.transform = `translate(-50%, -50%) translateX(${desplazamientoX}px) scale(${escala})`;
            slide.style.opacity = String(opacidad);
            slide.style.zIndex = String(10 - distanciaAbs);
            slide.style.pointerEvents = distanciaAbs === 0 ? "auto" : "none";
        });
    }

    function irA(nuevoIndice) {
        indiceActivo = (nuevoIndice + total) % total;
        render();
    }

    function siguiente() { irA(indiceActivo + 1); }
    function anterior() { irA(indiceActivo - 1); }

    function iniciarAutoplay() {
        detenerAutoplay();
        temporizador = setInterval(siguiente, INTERVALO_MS);
    }

    function detenerAutoplay() {
        if (temporizador) clearInterval(temporizador);
    }

    btnNext?.addEventListener("click", () => { siguiente(); iniciarAutoplay(); });
    btnPrev?.addEventListener("click", () => { anterior(); iniciarAutoplay(); });

    window.addEventListener("resize", render);

    render();
    iniciarAutoplay();
}

// ── Menú móvil (hamburguesa) ────────────────────────────────────────────────
function initMobileMenu() {
    const toggle = document.querySelector(".nav-toggle");
    const links = document.querySelector(".nav-links");
    if (!toggle || !links) return;

    toggle.addEventListener("click", () => {
        const isOpen = links.classList.toggle("is-open");
        toggle.classList.toggle("is-open", isOpen);
        toggle.setAttribute("aria-expanded", String(isOpen));
    });

    links.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            links.classList.remove("is-open");
            toggle.classList.remove("is-open");
        });
    });
}

// ── Sombra en el navbar al hacer scroll ─────────────────────────────────────
function initNavbarShadow() {
    const navbar = document.querySelector(".navbar");
    if (!navbar) return;

    const onScroll = () => {
        navbar.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
}

// ── Animación de aparición al hacer scroll ──────────────────────────────────
function initScrollReveal() {
    const items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
        items.forEach((el) => el.classList.add("is-visible"));
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15 }
    );

    items.forEach((el) => observer.observe(el));
}

// ── Scroll suave para los links internos (#funciones, etc.) ────────────────
function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener("click", (e) => {
            const id = link.getAttribute("href");
            if (id.length <= 1) return;
            const target = document.querySelector(id);
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });
}

// ── Año automático en el footer ─────────────────────────────────────────────
function initFooterYear() {
    const el = document.querySelector("[data-year]");
    if (el) el.textContent = new Date().getFullYear();
}