let listings = JSON.parse(localStorage.getItem('sportCardListings')) || [];

function getCurrentCategory() {
    const path = window.location.pathname;
    if (path.includes('sports.html')) return 'sports';
    if (path.includes('tcg.html')) return 'tcg';
    return 'home';
}

let currentCategory = getCurrentCategory();
const listingModal = document.getElementById('listingModal');
const addListingBtn = document.getElementById('addListingBtn');
const listingsGrid = document.getElementById('listingsGrid');
const loadingSpinner = document.getElementById('loadingSpinner');
const emptyState = document.getElementById('emptyState');
let bootstrapModal;

function init() {
    bootstrapModal = new bootstrap.Modal(listingModal);
    setupEventListeners();
    loadListings();
}

function setupEventListeners() {
    addListingBtn.addEventListener('click', openListingModal);
    document.getElementById('listingForm').addEventListener('submit', handleCreateListing);
    document.getElementById('filterBtn').addEventListener('click', handleFilter);
    document.getElementById('clearFilterBtn').addEventListener('click', clearFilters);
}

function openListingModal() {
    bootstrapModal.show();
}

function handleCreateListing(e) {
    e.preventDefault();
    
    if (currentCategory === 'sports') {
        const newSportListing = {
            id: Date.now(),
            category: currentCategory,  // ← This assigns the category!
            playerName: document.getElementById('playerName').value,
            sport: document.getElementById('sport').value,
            year: parseInt(document.getElementById('year').value),
            brand: document.getElementById('brand').value,
            cardNumber: document.getElementById('cardNumber').value,
            condition: document.getElementById('condition').value,
            price: parseFloat(document.getElementById('price').value),
            description: document.getElementById('description').value,
            imageUrl: document.getElementById('imageUrl').value || null,
            createdAt: new Date().toISOString()
        };
        listings.unshift(newSportListing);
    } 
    else if (currentCategory === 'tcg') {
        const newTCGListing = {
            id: Date.now(),
            category: currentCategory,  // ← This assigns the category!
            cardName: document.getElementById('cardName').value, //playername
            tcg: document.getElementById('tcg').value,
            set: document.getElementById('set').value,
            year: parseInt(document.getElementById('year').value),
            cardNumber: document.getElementById('cardNumber').value,
            condition: document.getElementById('condition').value,
            price: parseFloat(document.getElementById('price').value),
            description: document.getElementById('description').value,
            imageUrl: document.getElementById('imageUrl').value || null,
            createdAt: new Date().toISOString()
        };
        listings.unshift(newTCGListing);
    } 
    localStorage.setItem('sportCardListings', JSON.stringify(listings));

    bootstrapModal.hide();
    document.getElementById('listingForm').reset();
    loadListings();
}

function loadListings(filters = {}) {
    loadingSpinner.style.display = 'block';
    listingsGrid.innerHTML = '';
    emptyState.style.display = 'none';

    setTimeout(() => {
        let filteredListings;

        // Home shows all cards, other pages filter by category
        if (currentCategory === 'home') {
            filteredListings = [...listings];
        } else {
            filteredListings = listings.filter(l => l.category === currentCategory);
        }

        if (filters.sport) {
            filteredListings = filteredListings.filter(l => l.sport === filters.sport);
        }
        if (filters.year) {
            filteredListings = filteredListings.filter(l => l.year === filters.year);
        }
        if (filters.condition) {
            filteredListings = filteredListings.filter(l => l.condition === filters.condition);
        }

        loadingSpinner.style.display = 'none';

        if (filteredListings.length === 0) {
            emptyState.style.display = 'block';
            return;
        }

        filteredListings.forEach(listing => {
            const cardElement = createCardElement(listing);
            listingsGrid.appendChild(cardElement);
        });
    }, 300);
}

function createCardElement(listing) {
    const col = document.createElement('div');
    col.className = 'col';
    if (currentCategory === 'tcg') {
        const imageHtml = listing.imageUrl
        ? `<img src="${listing.imageUrl}" class="card-img-top" alt="${listing.cardName}" style="height: 200px; object-fit: cover;">`
        : `<div class="card-img-top bg-primary text-white d-flex align-items-center justify-content-center" style="height: 200px; font-size: 1.2rem; font-weight: 600;">${listing.cardName}</div>`;

        col.innerHTML = `
            <div class="card h-100 shadow-sm">
                ${imageHtml}
                <div class="card-body">
                    <h5 class="card-title">${listing.cardName}</h5>
                    <p class="card-text text-muted mb-1">${listing.year} ${listing.set}</p>
                    <p class="card-text text-muted mb-1">${listing.tcg}${listing.cardNumber ? ' • #' + listing.cardNumber : ''}</p>
                    <p class="mb-2"><span class="badge bg-success">${listing.condition}</span></p>
                    <h4 class="text-success fw-bold">$${listing.price.toFixed(2)}</h4>
                    ${listing.description ? `<p class="card-text">${listing.description}</p>` : ''}
                </div>
                <div class="card-footer bg-white border-top-0">
                    <button class="btn btn-danger w-100" onclick="deleteListing(${listing.id})">Delete</button>
                </div>
            </div>
        `;
    } else if (currentCategory === 'sports') {
        const imageHtml = listing.imageUrl
            ? `<img src="${listing.imageUrl}" class="card-img-top" alt="${listing.playerName}" style="height: 200px; object-fit: cover;">`
            : `<div class="card-img-top bg-primary text-white d-flex align-items-center justify-content-center" style="height: 200px; font-size: 1.2rem; font-weight: 600;">${listing.playerName}</div>`;

        col.innerHTML = `
            <div class="card h-100 shadow-sm">
                ${imageHtml}
                <div class="card-body">
                    <h5 class="card-title">${listing.playerName}</h5>
                    <p class="card-text text-muted mb-1">${listing.year} ${listing.brand}</p>
                    <p class="card-text text-muted mb-1">${listing.sport}${listing.cardNumber ? ' • #' + listing.cardNumber : ''}</p>
                    <p class="mb-2"><span class="badge bg-success">${listing.condition}</span></p>
                    <h4 class="text-success fw-bold">$${listing.price.toFixed(2)}</h4>
                    ${listing.description ? `<p class="card-text">${listing.description}</p>` : ''}
                </div>
                <div class="card-footer bg-white border-top-0">
                    <button class="btn btn-danger w-100" onclick="deleteListing(${listing.id})">Delete</button>
                </div>
            </div>
        `;
    } else {
        const imageHtml = listing.imageUrl
            ? `<img src="${listing.imageUrl}" class="card-img-top" alt="${listing.playerName ? listing.playerName : listing.cardName}" style="height: 200px; object-fit: cover;">`
            : `<div class="card-img-top bg-primary text-white d-flex align-items-center justify-content-center" style="height: 200px; font-size: 1.2rem; font-weight: 600;">${listing.playerName ? listing.playerName : listing.cardName}</div>`;

        col.innerHTML = `
            <div class="card h-100 shadow-sm">
                ${imageHtml}
                <div class="card-body">
                    <h5 class="card-title">${listing.playerName ? listing.playerName : listing.cardName}</h5>
                    <p class="card-text text-muted mb-1">${listing.year} ${listing.brand ? listing.brand : listing.set}</p>
                    <p class="card-text text-muted mb-1">${listing.sport ? listing.sport : listing.tcg}${listing.cardNumber ? ' • #' + listing.cardNumber : ''}</p>
                    <p class="mb-2"><span class="badge bg-success">${listing.condition}</span></p>
                    <h4 class="text-success fw-bold">$${listing.price.toFixed(2)}</h4>
                    ${listing.description ? `<p class="card-text">${listing.description}</p>` : ''}
                </div>
                <div class="card-footer bg-white border-top-0">
                    <button class="btn btn-danger w-100" onclick="deleteListing(${listing.id})">Delete</button>
                </div>
            </div>
        `;
    }

    return col;
}

function deleteListing(id) {
    if (confirm('Are you sure you want to delete this listing?')) {
        listings = listings.filter(l => l.id !== id);
        localStorage.setItem('sportCardListings', JSON.stringify(listings));
        loadListings();
    }
}

function handleFilter() {
    const filters = {
        sport: document.getElementById('sportFilter').value,
        year: document.getElementById('yearFilter').value ? parseInt(document.getElementById('yearFilter').value) : null,
        condition: document.getElementById('conditionFilter').value
    };

    const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '' && v !== null)
    );

    loadListings(cleanFilters);
}

function clearFilters() {
    document.getElementById('sportFilter').value = '';
    document.getElementById('yearFilter').value = '';
    document.getElementById('conditionFilter').value = '';
    loadListings();
}

window.deleteListing = deleteListing;

init();
