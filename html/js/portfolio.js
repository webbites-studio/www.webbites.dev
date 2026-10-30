// Each slug has three screenshots in images/portfolio/: <slug>.jpg (1280x800), <slug>-640.jpg, <slug>-mobile.jpg (390x844).
const portfolioItems = [
    {
        href: 'https://quietmusic1.webbites.dev',
        slug: 'quietmusic1',
        title: 'Modern Musician Portfolio',
        category: 'Web Design',
        description: 'A clear, easy-to-use site that lists music services and booking information for jazz musicians.'
    },
    {
        href: 'https://quietmusic2.webbites.dev',
        slug: 'quietmusic2',
        title: 'Live jazz entertainment services',
        category: 'Web Design',
        description: 'A one-page layout for a music group to show their services, share audio clips, display images, and collect booking requests.'
    },
    // Hidden until the live site's hero and gallery images are fixed (they currently 404).
    // {
    //     href: 'https://quietmusic3.webbites.dev',
    //     slug: 'quietmusic3',
    //     title: 'Live music booking and portfolio site',
    //     category: 'Web Design',
    //     description: 'A split-screen layout for event musicians to display service offerings, media samples, and a booking form for client inquiries.'
    // },
    {
        href: 'https://raisasewing1.webbites.dev',
        slug: 'raisasewing1',
        title: 'Sewing, alterations, and custom accessories studio',
        category: 'Portfolio & Service Showcase',
        description: 'A minimalist, multi-section site for a professional seamstress to showcase her background, service offerings, work gallery, client testimonials, and booking information.'
    },
    {
        href: 'https://raisasewing2.webbites.dev',
        slug: 'raisasewing2',
        title: 'Sewing and tailoring service portfolio',
        category: 'Small Business Website',
        description: 'A sidebar-navigated, editorial-style layout for a professional seamstress to showcase her history, service offerings, work gallery, and client feedback with an integrated booking inquiry form.'
    },
    {
        href: 'https://raisasewing3.webbites.dev',
        slug: 'raisasewing3',
        title: 'Professional sewing, tailoring, and accessory design',
        category: 'Portfolio & Service Showcase',
        description: 'A bold, high-contrast, asymmetric website for a seamstress to display her background, service offerings, work gallery, and contact information.'
    },
    {
        href: 'https://raisasewing4.webbites.dev',
        slug: 'raisasewing4',
        title: 'Sewing and craft services portfolio',
        category: 'Web Design',
        description: 'A personal website featuring a biography, service details, and a gallery for a sewing and accessory business.'
    },
    {
        href: 'https://www.wingllcnh.com',
        slug: 'wingllcnh',
        title: 'Business collective membership portal',
        category: 'Web Design',
        description: 'A high-end platform for professional networking, featuring membership tiers, an upcoming events list, and a member directory.'
    },
    {
        href: 'https://www.inspiremeeventplanner.com',
        slug: 'inspiremeeventplanner',
        title: 'Luxury event planning service',
        category: 'Event Planning',
        description: 'A high-end site showcasing event planning services, featuring a project portfolio, client testimonials, and a contact form for inquiries.'
    }
];

// Picks one random site for the hero mockup and three different ones for #portfolio-container.
// Must run before stagger-load.js so the new cards get stagger indexes.
(function () {
    const IMG_DIR = 'images/portfolio/';
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    function shuffle(list) {
        const a = list.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    function hostOf(item) {
        return new URL(item.href).hostname.replace(/^www\./, '');
    }

    function srcset(item) {
        return `${IMG_DIR}${item.slug}-640.jpg 640w, ${IMG_DIR}${item.slug}.jpg 1280w`;
    }

    function renderHero(item) {
        const showcase = document.querySelector('[data-hero-showcase]');
        if (!showcase) return;
        const img = showcase.querySelector('[data-hero-img]');
        img.srcset = srcset(item);
        img.src = `${IMG_DIR}${item.slug}-640.jpg`;
        img.alt = `${item.title}: website designed by WebBites`;
        showcase.querySelector('[data-hero-mobile]').src = `${IMG_DIR}${item.slug}-mobile.jpg`;
        showcase.querySelector('[data-hero-link]').href = item.href;
        showcase.querySelector('[data-hero-host]').textContent = hostOf(item);
        showcase.querySelector('[data-hero-title]').textContent = item.title;
    }

    function renderCards(items) {
        const container = document.getElementById('portfolio-container');
        if (!container) return;
        container.replaceChildren();
        items.forEach(item => {
            const card = document.createElement('article');
            card.className = 'site-card overflow-hidden rounded-3xl bg-card';
            card.setAttribute('data-interactive-panel', '');
            card.innerHTML = `
                <a href="${item.href}" target="_blank" rel="noopener noreferrer" class="group flex h-full flex-col">
                    <div class="site-card-stage p-5">
                        <div class="site-frame">
                            <div class="site-frame-bar flex items-center gap-1.5 px-3 py-2" aria-hidden="true">
                                <span class="h-2.5 w-2.5 rounded-full bg-rose-400"></span>
                                <span class="h-2.5 w-2.5 rounded-full bg-amber-400"></span>
                                <span class="h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
                                <span class="ml-2 flex-1 truncate rounded-full bg-chip px-3 py-0.5 text-[11px] text-fg-muted">${hostOf(item)}</span>
                            </div>
                            <img src="${IMG_DIR}${item.slug}-640.jpg" srcset="${srcset(item)}" sizes="(min-width: 768px) 340px, 92vw"
                                alt="${item.title}" width="1280" height="800" loading="lazy" decoding="async" class="block h-auto w-full" />
                        </div>
                    </div>
                    <div class="flex flex-1 flex-col px-6 pb-6 pt-1">
                        <p class="text-xs uppercase tracking-[0.2em] text-accent mb-2">${item.category}</p>
                        <h3 class="text-xl font-semibold text-fg">${item.title}</h3>
                        <p class="mt-3 text-fg-soft text-sm leading-6">${item.description}</p>
                        <span class="mt-auto pt-5 inline-flex items-center gap-1 text-sm font-semibold text-accent">Visit live site
                            <span aria-hidden="true" class="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span></span>
                    </div>
                </a>
            `;
            container.appendChild(card);
        });
    }

    // Pointer-driven 3D tilt: writes --rx/--ry/--gx/--gy on the target; CSS falls back to its resting tilt.
    function addTilt(area, target, maxX, maxY) {
        if (!area || !target) return;
        area.addEventListener('pointermove', e => {
            if (e.pointerType !== 'mouse' || reduceMotion.matches) return;
            const r = area.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width;
            const py = (e.clientY - r.top) / r.height;
            target.style.setProperty('--rx', ((0.5 - py) * 2 * maxX).toFixed(2) + 'deg');
            target.style.setProperty('--ry', ((px - 0.5) * 2 * maxY).toFixed(2) + 'deg');
            target.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
            target.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
            target.classList.add('is-tilting');
        });
        area.addEventListener('pointerleave', () => {
            ['--rx', '--ry', '--gx', '--gy'].forEach(p => target.style.removeProperty(p));
            target.classList.remove('is-tilting');
        });
    }

    const [heroItem, ...rest] = shuffle(portfolioItems);
    renderHero(heroItem);
    renderCards(rest.slice(0, 3));

    const showcase = document.querySelector('[data-hero-showcase]');
    addTilt(showcase, showcase && showcase.querySelector('.hero-tilt'), 6, 10);
    document.querySelectorAll('.site-card').forEach(card => addTilt(card, card.querySelector('.site-frame'), 8, 10));
})();
