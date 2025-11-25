let listings = [];

async function fetchListings() {
    const request = await fetch("/api/cards");
    const data = await request.json();

    listings = data;
}

function getCurrentCategory() {
    const path = window.location.pathname;
    if (path.includes("sports.html")) return "sports";
    if (path.includes("tcg.html")) return "tcg";
    return "home";
}

let currentCategory = getCurrentCategory();
const listingModal = document.getElementById("listingModal");
const addListingBtn = document.getElementById("addListingBtn");
const listingsGrid = document.getElementById("listingsGrid");
const loadingSpinner = document.getElementById("loadingSpinner");
const emptyState = document.getElementById("emptyState");
let bootstrapModal;

function init() {
    bootstrapModal = new bootstrap.Modal(listingModal);
    setupEventListeners();
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("input", () => handleFilter());
    }
    loadListings();
}

function setupEventListeners() {
    addListingBtn.addEventListener("click", openListingModal);
    document
        .getElementById("listingForm")
        .addEventListener("submit", handleCreateListing);
    document
        .getElementById("filterBtn")
        .addEventListener("click", handleFilter);
    document
        .getElementById("clearFilterBtn")
        .addEventListener("click", clearFilters);
}

function openListingModal() {
    bootstrapModal.show();
}

async function handleCreateListing(e) {
    e.preventDefault();
    let newListing;
    // if (currentCategory === "sports") {
    //     newListing = {
    //     category: currentCategory, // ← This assigns the category!
    //     playerName: document.getElementById("playerName").value,
    //     sport: document.getElementById("sport").value,
    //     year: document.getElementById("year").value,
    //     brand: document.getElementById("brand").value,
    //     cardNumber: document.getElementById("cardNumber").value,
    //     condition: document.getElementById("condition").value,
    //     price: document.getElementById("price").value,
    //     description: document.getElementById("description").value,
    //     imageUrl: document.getElementById("imageUrl").value || null,
    //     };

    //     await fetch("/api/cards/sports", {
    //     headers: {
    //         Accept: "application/json",
    //         "Content-Type": "application/json",
    //     },
    //     method: "POST",
    //     body: JSON.stringify(newListing),
    //     });
    // } else if (currentCategory === "tcg") {
    //     newListing = {
    //     category: currentCategory, // ← This assigns the category!
    //     cardName: document.getElementById("cardName").value, //cardname
    //     tcg: document.getElementById("tcg").value,
    //     set: document.getElementById("set").value,
    //     year: document.getElementById("year").value,
    //     cardNumber: document.getElementById("cardNumber").value,
    //     condition: document.getElementById("condition").value,
    //     price: document.getElementById("price").value,
    //     description: document.getElementById("description").value,
    //     imageUrl: document.getElementById("imageUrl").value || null,
    //     };

    //     await fetch("/api/cards/tcgs", {
    //     headers: {
    //         Accept: "application/json",
    //         "Content-Type": "application/json",
    //     },
    //     method: "POST",
    //     body: JSON.stringify(newListing),
    //     });
    // }

    newListing = {
        category: currentCategory, // ← This assigns the category!
        cardName: document.getElementById("cardName").value,
        type: document.getElementById("type").value,
        year: document.getElementById("year").value,
        brand: document.getElementById("brand").value,
        cardNumber: document.getElementById("cardNumber").value,
        condition: document.getElementById("condition").value,
        price: document.getElementById("price").value,
        description: document.getElementById("description").value,
        imageUrl: document.getElementById("imageUrl").value || null,
        };

        await fetch("/api/cards", {
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(newListing),
        });

    bootstrapModal.hide();
    document.getElementById("listingForm").reset();
    loadListings();
}

async function loadListings(filters = {}) {
    loadingSpinner.style.display = "block";
    listingsGrid.innerHTML = "";
    emptyState.style.display = "none";

    try {
        await fetchListings();

        let baseListings;
        if (currentCategory === "home") {
            baseListings = [...listings];
        } else {
            baseListings = listings.filter(
                (l) => l.category === currentCategory
            );
        }

        const byId = new Map();
        for (const l of baseListings) {
            if (!byId.has(l.id)) byId.set(l.id, l);
        }
        let filteredListings = Array.from(byId.values());

        if (filters.type) {
            filteredListings = filteredListings.filter(
                (l) => l.type === filters.type
            );
        }
        if (filters.year) {
            filteredListings = filteredListings.filter(
                (l) => l.year === filters.year
            );
        }
        if (filters.condition) {
            filteredListings = filteredListings.filter(
                (l) => l.condition === filters.condition
            );
        }
        if (filters.searchTerm) {
            const term = filters.searchTerm.toLowerCase();
            filteredListings = filteredListings.filter((listing) =>
                Object.values(listing).some((value) => {
                    if (value === null || value === undefined) return false;
                    return String(value).toLowerCase().includes(term);
                })
            );
        }

        if (filteredListings.length === 0) {
            emptyState.style.display = "block";
            return;
        }

        filteredListings.forEach((listing) => {
            const cardElement = createCardElement(listing);
            listingsGrid.appendChild(cardElement);
        });
    } catch (err) {
        console.error("Error while loading listings:", err);
        emptyState.style.display = "block";
    } finally {
        loadingSpinner.style.display = "none";
    }
}

function createCardElement(listing) {
    const col = document.createElement("div");
    col.className = "col";
    // if (listing.category === "tcg") {
    //     const imageHtml = listing.imageUrl
    //     ? `<img src="${listing.imageUrl}" class="card-img-top" alt="${listing.cardname}" style="height: 200px; object-fit: cover;">`
    //     : `<div class="card-img-top bg-primary text-white d-flex align-items-center justify-content-center" style="height: 200px; font-size: 1.2rem; font-weight: 600;">${listing.cardname}</div>`;


    //     col.innerHTML = `
    //             <div class="card playcard h-100 shadow-sm">
    //                 ${imageHtml}
    //                 <div class="card-body">
    //                     <h5 class="card-title">${listing.cardname}</h5>
    //                     <p class="card-text text-muted mb-1">${listing.year} ${listing.set}</p>
    //                     <p class="card-text text-muted mb-1">${listing.tcg}${listing.cardnumber ? " • #" + listing.cardnumber : ""}</p>
    //                     <p class="mb-2"><span class="badge bg-success">${listing.condition}</span></p>
    //                     <h4 class="text-success fw-bold">$${listing.price}</h4>
    //                     ${
    //                     listing.description
    //                         ? `<p class="card-text">${listing.description}</p>`
    //                         : ""
    //                     }
    //                 </div>
    //                 <div class="card-footer bg-white border-top-0">
    //                     <button class="btn btn-danger w-100" onclick="deleteListing(${listing.id})">Delete</button>
    //                 </div>
    //             </div>
    //         `;
    // } else if (listing.category === "sports") {
    //     const imageHtml = listing.imageUrl
    //     ? `<img src="${listing.imageUrl}" class="card-img-top" alt="${listing.playername}" style="height: 200px; object-fit: cover;">`
    //     : `<div class="card-img-top bg-primary text-white d-flex align-items-center justify-content-center" style="height: 200px; font-size: 1.2rem; font-weight: 600;">${listing.playername}</div>`;

    //     col.innerHTML = `
    //             <div class="card playcard h-100 shadow-sm">
    //                 ${imageHtml}
    //                 <div class="card-body">
    //                     <h5 class="card-title">${listing.playername}</h5>
    //                     <p class="card-text text-muted mb-1">${listing.year} ${listing.brand}</p>
    //                     <p class="card-text text-muted mb-1">${listing.sport}${listing.cardnumber ? " • #" + listing.cardnumber : ""}</p>
    //                     <p class="mb-2"><span class="badge bg-success">${listing.condition}</span></p>
    //                     <h4 class="text-success fw-bold">$${listing.price}</h4>
    //                     ${
    //                     listing.description
    //                         ? `<p class="card-text">${listing.description}</p>`
    //                         : ""
    //                     }
    //                 </div>
    //                 <div class="card-footer bg-white border-top-0">
    //                     <button class="btn btn-danger w-100" onclick="deleteListing(${listing.id})">Delete</button>
    //                 </div>
    //             </div>
    //         `;
    // } 

    const imageHtml = listing.imageUrl
        ? `<img src="${listing.imageUrl}" class="card-img-top" alt="${listing.cardname}" style="height: 200px; object-fit: cover;">`
        : `<div class="card-img-top bg-primary text-white d-flex align-items-center justify-content-center" style="height: 200px; font-size: 1.2rem; font-weight: 600;">${listing.cardname}</div>`;

        col.innerHTML = `
                <div class="card h-100 shadow-sm">
                    ${imageHtml}
                    <div class="card-body">
                        <h5 class="card-title">${listing.cardname}</h5>
                        <p class="card-text text-muted mb-1">${listing.year} ${listing.brand}</p>
                        <p class="card-text text-muted mb-1">${listing.type}${listing.cardnumber ? " • #" + listing.cardnumber : ""}</p>
                        <p class="mb-2"><span class="badge bg-success">${listing.condition}</span></p>
                        <h4 class="text-success fw-bold">$${listing.price}</h4>
                        ${
                        listing.description
                            ? `<p class="card-text">${listing.description}</p>`
                            : ""
                        }
                    </div>
                    <div class="card-footer bg-white border-top-0">
                        <button class="btn btn-danger w-100" onclick="deleteListing(${listing.id})">Delete</button>
                    </div>
                </div>
            `;

    return col;
}

async function deleteListing(id) {
    if (confirm("Are you sure you want to delete this listing?")) {
        await fetch("/api/cards", {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            method: "DELETE",
            body: JSON.stringify({id}),
        });
        loadListings();
    }
}

function handleFilter() {
    const filters = {
        type: document.getElementById("typeFilter").value,
        year: document.getElementById("yearFilter").value
            ? parseInt(document.getElementById("yearFilter").value)
            : null,
        condition: document.getElementById("conditionFilter").value,
        searchTerm: document.getElementById("searchInput")?.value.trim() || ""
    };

    const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== "" && v !== null)
    );

    loadListings(cleanFilters);
}

function clearFilters() {
  const typeSelect = document.getElementById("typeFilter");
  if (typeSelect) typeSelect.value = "";

  const yearInput = document.getElementById("yearFilter");
  if (yearInput) yearInput.value = "";

  const conditionSelect = document.getElementById("conditionFilter");
  if (conditionSelect) conditionSelect.value = "";

  const searchInput = document.getElementById("searchInput");
  if (searchInput) searchInput.value = "";

  loadListings();
}

window.deleteListing = deleteListing;

init();
