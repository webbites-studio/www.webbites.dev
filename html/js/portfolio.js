const portfolioItems = [
    {
        image: 'images/portfolio1.jpg',
        title: 'Project One',
        category: 'Web Design',
        description: 'A modern and responsive website design for a tech startup.'
    },
    {
        image: 'images/portfolio2.jpg',
        title: 'Project Two',
        category: 'E-commerce',
        description: 'An e-commerce platform with a sleek and user-friendly interface.'
    },
    {
        image: 'images/portfolio3.jpg',
        title: 'Project Three',
        category: 'Branding',
        description: 'A complete branding package for a new fashion brand.'
    },
    {
        image: 'images/portfolio4.jpg',
        title: 'Project Four',
        category: 'Mobile App',
        description: 'A mobile app design for a fitness tracking application.'
    },
    {
        image: 'images/portfolio5.jpg',
        title: 'Project Five',
        category: 'UI/UX',
        description: 'A user interface and experience design for a social media platform.'
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
            <img src="${item.image}" alt="${item.title}" class="h-72 w-full object-cover" />
            <div class="p-6">
                <p class="text-xs uppercase tracking-[0.35em] text-sky-300 mb-2">${item.category}</p>
                <h3 class="text-xl font-semibold text-white">${item.title}</h3>
                <p class="mt-3 text-slate-400 text-sm leading-6">${item.description}</p>
            </div>
        `;
        container.appendChild(portfolioItem);
    });
}

// Call the function to generate portfolio items
generatePortfolio();
