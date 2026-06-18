const portfolioItems = [
    {
        href: 'https://quietmusic1.webbites.dev',
        image: 'images/portfolio/quietmusic1.png',
        title: 'Modern Musician Portfolio',
        category: 'Web Design',
        description: 'A clear, easy-to-use site that lists music services and booking information for jazz musicians.'
    },
    {
        href: 'https://quietmusic2.webbites.dev',
        image: 'images/portfolio/quietmusic2.png',
        title: 'Live jazz entertainment services',
        category: 'Web Design',
        description: 'A one-page layout for a music group to show their services, share audio clips, display images, and collect booking requests.'
    },
    {
        href: 'https://quietmusic3.webbites.dev',
        image: 'images/portfolio/quietmusic3.png',
        title: 'Live music booking and portfolio site',
        category: 'Web Design',
        description: 'A split-screen layout for event musicians to display service offerings, media samples, and a booking form for client inquiries.'
    },
    {
        href: 'https://raisasewing1.webbites.dev',
        image: 'images/portfolio/raisasewing1.png',
        title: 'Sewing, alterations, and custom accessories studio',
        category: 'Portfolio & Sevice Showcase',
        description: 'A minimalist, multi-section site for a professional seamstress to showcase her background, service offerings, work gallery, client testimonials, and booking information.'
    },
    {
        href: 'https://raisasewing2.webbites.dev',
        image: 'images/portfolio/raisasewing2.png',
        title: 'Sewing and tailoring service portfolio',
        category: 'Small Business Website',
        description: 'A sidebar-navigated, editorial-style layout for a professional seamstress to showcase her history, service offerings, work gallery, and client feedback with an integrated booking inquiry form.'
    },
    {
        href: 'https://raisasewing3.webbites.dev',
        image: 'images/portfolio/raisasewing3.png',
        title: 'Professional sewing, tailoring, and accessory design',
        category: 'Portfolio & Service Showcase',
        description: 'A bold, high-contrast, asymmetric website for a seamstress to display her background, service offerings, work gallery, and contact information.'
    },
    {
        href: 'https://raisasewing4.webbites.dev',
        image: 'images/portfolio/raisasewing4.png',
        title: 'Sewing and craft services portfolio',
        category: 'Web Design',
        description: 'A personal website featuring a biography, service details, and a gallery for a sewing and accessory business.'
    },
    {
        href: 'https://www.wingllcnh.com',
        image: 'images/portfolio/wingllcnh.png',
        title: 'Business collective membership portal',
        category: 'Web Design',
        description: 'A high-end platform for professional networking, featuring membership tiers, an upcoming events list, and a member directory.'
    },
    {
        href: 'https://www.inspiremeeventplanner.com',
        image: 'images/portfolio/inspiremeeventplanner.png',
        title: 'Luxury event planning service',
        category: 'Event Planning',
        description: 'A high-end site showcasing event planning services, featuring a project portfolio, client testimonials, and a contact form for inquiries.'
    }
];

// Function to generate portfolio items
function generatePortfolio() {
    const container = document.getElementById('portfolio-container');
    // Select 3 random items from the portfolioItems array
    const selectedItems = portfolioItems.sort(() => 0.5 - Math.random()).slice(0, 3);
    selectedItems.forEach(item => {
        const portfolioItem = document.createElement('div');
        portfolioItem.className = 'overflow-hidden rounded-3xl bg-slate-900/80';
        portfolioItem.innerHTML = `
            <a href="${item.href}" target="_blank" rel="noopener noreferrer">
            <img src="${item.image}" alt="${item.title}" class="h-72 w-full object-cover" />
            <div class="p-6">
                <p class="text-xs uppercase tracking-[0.35em] text-sky-300 mb-2">${item.category}</p>
                <h3 class="text-xl font-semibold text-white">${item.title}</h3>
                <p class="mt-3 text-slate-400 text-sm leading-6">${item.description}</p>
            </div>
            </a>
        `;
        container.appendChild(portfolioItem);
    });
}

// Call the function to generate portfolio items
generatePortfolio();
