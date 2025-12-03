let listings = [];
let loadTimeoutId = null;

async function fetchListings() {

    const request = await fetch("/api/cards/load");
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
    const image = document.getElementById("imageFile").files[0];

    if (image === undefined || image === '' || image === null) {
      const newListing = {
        category: currentCategory,
        cardName: document.getElementById("cardName").value,
        type: document.getElementById("type").value,
        year: document.getElementById("year").value,
        brand: document.getElementById("brand").value,
        cardNumber: document.getElementById("cardNumber").value,
        condition: document.getElementById("condition").value,
        price: document.getElementById("price").value,
        description: document.getElementById("description").value,
      };
      try {
        const response = await fetch("/api/cards", {
          headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify(newListing),
        });
        if (!response.ok) {
          throw new Error(`Failed to save card data: ${response.statusText}`);
        }
      } catch (error) {
          console.error("Error creating card:", error);
      }
    } else {
      const formData = new FormData();
      formData.append("imageFile", document.getElementById("imageFile").files[0]);

      formData.append("category", currentCategory);
      formData.append("cardName", document.getElementById("cardName").value);
      formData.append("type", document.getElementById("type").value);
      formData.append("year", document.getElementById("year").value);
      formData.append("brand", document.getElementById("brand").value);
      formData.append("cardNumber", document.getElementById("cardNumber").value);
      formData.append("condition", document.getElementById("condition").value);
      formData.append("price", document.getElementById("price").value);
      formData.append("description", document.getElementById("description").value);

      // formData.append("category", "sports");
      // formData.append("cardName", "Name");
      // formData.append("type", "Type");
      // formData.append("year", "2024");
      // formData.append("brand", "Brand");
      // formData.append("cardNumber", "123");
      // formData.append("condition", "New");
      // formData.append("price", "9.99");
      // formData.append("description", "Description");

      try {
        const uploadResponse = await fetch("/api/cards/upload", {
            method: "POST",
            body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error(`Failed to save card data: ${uploadResponse.statusText}`);
        }
      } catch (error) {
          console.error("Error uploading image:", error);
      }
    }

    bootstrapModal.hide();
    document.getElementById("listingForm").reset();
    loadListings();
}

function loadListings(filters = {}) {
  loadingSpinner.style.display = "block";
  listingsGrid.innerHTML = "";
  emptyState.style.display = "none";

  fetchListings();

  if (loadTimeoutId) {
    clearTimeout(loadTimeoutId);
  }

  loadTimeoutId = setTimeout(() => {
    let filteredListings;

    if (currentCategory === "home") {
      filteredListings = [...listings];
    } else {
      filteredListings = listings.filter((l) => l.category === currentCategory);
    }

    if (filters.type) {
      if (currentCategory === "tcg") {
        filteredListings = filteredListings.filter(
          (l) => l.brand === filters.type
        );
      } else {
        filteredListings = filteredListings.filter(
          (l) => l.type === filters.type
        );
      }
    }

    if (filters.year) {
      filteredListings = filteredListings.filter(
        (l) => String(l.year) === String(filters.year)
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

    loadingSpinner.style.display = "none";

    if (filteredListings.length === 0) {
      emptyState.style.display = "block";
      return;
    }

    listingsGrid.innerHTML = "";
    filteredListings.forEach((listing) => {
      const cardElement = createCardElement(listing);
      listingsGrid.appendChild(cardElement);
    });
  }, 300);
}

function createCardElement(listing) {
    const col = document.createElement("div");
    col.className = "col";

    const imageHtml = listing.imagename
        ? `<img src="${listing.imagedata}" class="card-img-top object-fit-contain bg-light" alt="${listing.cardname}" style="height: 200px; object-fit: cover;">`
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
