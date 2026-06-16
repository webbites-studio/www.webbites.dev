const portfolioItems = [
    {
        href: 'https://quietmusic1.webbites.dev',
        image: 'images/portfolio/quietmusic1.png',
        title: 'Modern Musician Portfolio',
        category: 'Web Design',
        description: 'A sophisticated digital showcase crafted for musicians and performers, featuring a clean aesthetic, captivating visuals, and an intuitive browsing experience that highlights artistic talent and upcoming events.'
    },
    {
        href: 'https://quietmusic2.webbites.dev',
        image: 'images/portfolio/quietmusic2.png',
        title: 'Project Two',
        category: 'E-commerce',
        description: 'An e-commerce platform with a sleek and user-friendly interface.'
    },
    {
        href: 'https://quietmusic3.webbites.dev',
        image: 'images/portfolio/quietmusic3.png',
        title: 'Project Three',
        category: 'Branding',
        description: 'A complete branding package for a new fashion brand.'
    },
    {
        href: 'https://raisasewing1.webbites.dev',
        image: 'images/portfolio/raisasewing1.png',
        title: 'Project Four',
        category: 'Mobile App',
        description: 'A mobile app design for a fitness tracking application.'
    },
    {
        href: 'https://raisasewing2.webbites.dev',
        image: 'images/portfolio/raisasewing2.png',
        title: 'Project Five',
        category: 'UI/UX',
        description: 'A user interface and experience design for a social media platform.'
    },
    {
        href: 'https://raisasewing3.webbites.dev',
        image: 'images/portfolio/raisasewing3.png',
        title: 'Elegant Sewing & Accessories Boutique',
        category: 'UI/UX',
        description: 'A sophisticated handcrafted fashion website showcasing custom sewing, alterations, and unique accessories through refined visuals, seamless navigation, and a warm, artisan-inspired aesthetic.'
    },
    {
        href: 'https://raisasewing4.webbites.dev',
        image: 'images/portfolio/raisasewing4.png',
        title: 'Project Seven',
        category: 'UI/UX',
        description: 'A user interface and experience design for a social media platform.'
    },
    {
        href: 'https://www.weingllcnh.com',
        image: 'images/portfolio/weingllcnh.png',
        title: 'Project Eight',
        category: 'UI/UX',
        description: 'A user interface and experience design for a social media platform.'
    },
    {
        href: 'https://www.inspiremeeventplanner.com',
        image: 'images/portfolio/inspiremeeventplanner.png',
        title: 'Project Nine',
        category: 'Event Planning',
        description: 'A comprehensive event planning platform for organizing and managing events efficiently.'
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
        portfolioItem.setAttribute('data-interactive-panel', '');
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
