const portfolioItems = [
    {
        href: 'https://quietmusic1.webbites.dev',
        image: 'images/portfolio/quietmusic1.jpg',
        title: 'Modern Musician Portfolio',
        category: 'Web Design',
        description: 'A clear, easy-to-use site that lists music services and booking information for jazz musicians.'
    },
    {
        href: 'https://quietmusic2.webbites.dev',
        image: 'images/portfolio/quietmusic2.jpg',
        title: 'Live jazz entertainment services',
        category: 'Web Design',
        description: 'A one-page layout for a music group to show their services, share audio clips, display images, and collect booking requests.'
    },
    {
        href: 'https://quietmusic3.webbites.dev',
        image: 'images/portfolio/quietmusic3.jpg',
        title: 'Live music booking and portfolio site',
        category: 'Web Design',
        description: 'A split-screen layout for event musicians to display service offerings, media samples, and a booking form for client inquiries.'
    },
    {
        href: 'https://raisasewing1.webbites.dev',
        image: 'images/portfolio/raisasewing1.jpg',
        title: 'Sewing, alterations, and custom accessories studio',
        category: 'Portfolio & Service Showcase',
        description: 'A minimalist, multi-section site for a professional seamstress to showcase her background, service offerings, work gallery, client testimonials, and booking information.'
    },
    {
        href: 'https://raisasewing2.webbites.dev',
        image: 'images/portfolio/raisasewing2.jpg',
        title: 'Sewing and tailoring service portfolio',
        category: 'Small Business Website',
        description: 'A sidebar-navigated, editorial-style layout for a professional seamstress to showcase her history, service offerings, work gallery, and client feedback with an integrated booking inquiry form.'
    },
    {
        href: 'https://raisasewing3.webbites.dev',
        image: 'images/portfolio/raisasewing3.jpg',
        title: 'Professional sewing, tailoring, and accessory design',
        category: 'Portfolio & Service Showcase',
        description: 'A bold, high-contrast, asymmetric website for a seamstress to display her background, service offerings, work gallery, and contact information.'
    },
    {
        href: 'https://raisasewing4.webbites.dev',
        image: 'images/portfolio/raisasewing4.jpg',
        title: 'Sewing and craft services portfolio',
        category: 'Web Design',
        description: 'A personal website featuring a biography, service details, and a gallery for a sewing and accessory business.'
    },
    {
        href: 'https://www.wingllcnh.com',
        image: 'images/portfolio/wingllcnh.jpg',
        title: 'Business collective membership portal',
        category: 'Web Design',
        description: 'A high-end platform for professional networking, featuring membership tiers, an upcoming events list, and a member directory.'
    },
    {
        href: 'https://www.inspiremeeventplanner.com',
        image: 'images/portfolio/inspiremeeventplanner.jpg',
        title: 'Luxury event planning service',
        category: 'Event Planning',
        description: 'A high-end site showcasing event planning services, featuring a project portfolio, client testimonials, and a contact form for inquiries.'
    }
];

// Replaces the static fallback cards in #portfolio-container with a random selection.
// Must run before stagger-load.js so the new cards get stagger indexes.
function generatePortfolio() {
    const container = document.getElementById('portfolio-container');
    if (!container) return;
    const selectedItems = portfolioItems.sort(() => 0.5 - Math.random()).slice(0, 3);
    container.replaceChildren();
    selectedItems.forEach(item => {
        const portfolioItem = document.createElement('div');
        portfolioItem.className = 'overflow-hidden rounded-3xl bg-card';
        portfolioItem.setAttribute('data-interactive-panel', '');
        portfolioItem.innerHTML = `
            <a href="${item.href}" target="_blank" rel="noopener noreferrer">
            <img src="${item.image}" alt="${item.title}" width="500" height="288" loading="lazy" decoding="async" class="h-72 w-full object-cover" />
            <div class="p-6">
                <p class="text-xs uppercase tracking-[0.2em] text-accent mb-2">${item.category}</p>
                <h3 class="text-xl font-semibold text-fg">${item.title}</h3>
                <p class="mt-3 text-fg-soft text-sm leading-6">${item.description}</p>
            </div>
            </a>
        `;
        container.appendChild(portfolioItem);
    });
}

generatePortfolio();
