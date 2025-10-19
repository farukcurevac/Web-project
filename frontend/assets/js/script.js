// Car data and modal functionality
// SPA-friendly: expose an init function that can be called when the Home view is rendered
window.initHomePage = function () {
  const carModalEl = document.getElementById("carModal");
  // Modal container exists in index.html
  const carModal = carModalEl ? new bootstrap.Modal(carModalEl) : null;
  const searchInput = document.querySelector(".hero-search-bar input");
  const searchButton = document.querySelector(
    ".hero-search-bar button[type='submit']"
  );
  const clearButton = document.querySelector(".clear-search-btn");
  const featuredCarsGrid = document.getElementById("featuredCarsGrid");

  // If home DOM isn't present yet, skip (SPAPP will call this after render)
  if (!featuredCarsGrid || !searchButton || !clearButton) return;

  // Prevent double-initialization when navigating back to #home
  if (featuredCarsGrid.dataset.initialized === "true") return;
  featuredCarsGrid.dataset.initialized = "true";

  let additionalCarsData = [];
  let featuredCarsData = [];
  let allCarCards = [];

  // Load featured cars and additional cars from JSON files
  Promise.all([
    fetch("assets/json/featured-cars.json").then((response) => response.json()),
    fetch("assets/json/cars-data.json").then((response) => response.json()),
  ])
    .then(([featuredData, additionalData]) => {
      featuredCarsData = featuredData.featuredCars;
      additionalCarsData = additionalData.cars;

      // Load featured cars on page
      loadFeaturedCars();
    })
    .catch((error) => {
      console.log("Could not load cars data:", error);
    });

  // Load featured cars into the grid
  function loadFeaturedCars() {
    featuredCarsGrid.innerHTML = "";

    featuredCarsData.forEach((car) => {
      const cardHTML = createFeaturedCarCard(car);
      featuredCarsGrid.insertAdjacentHTML("beforeend", cardHTML);
    });

    // Update car cards reference and add event listeners
    allCarCards = document.querySelectorAll(".car-card");
    addModalListeners();
  }

  // Create featured car card HTML
  function createFeaturedCarCard(car) {
    return `
      <div class="col-md-4 mb-4">
        <div
          class="card car-card"
          data-title="${car.title}"
          data-specs="${car.specs}"
          data-price="${car.price}"
          data-engine="${car.engine}"
          data-fuel="${car.fuel}"
          data-color="${car.color}"
          data-location="${car.location}"
          data-seller="${car.seller}"
          data-phone="${car.phone}"
          data-description="${car.description}"
          data-image="${car.image}"
        >
          <img src="${car.image}" class="card-img-top" alt="${car.title}" />
          <div class="card-body">
            <h5 class="card-title">${car.title}</h5>
            <p class="card-text">${car.specs}</p>
            <p class="price">${car.price}</p>
            <div class="card-details" style="display: none">
              <p><strong>Engine:</strong> ${car.engine}</p>
              <p><strong>Fuel:</strong> ${car.fuel}</p>
              <p><strong>Color:</strong> ${car.color}</p>
              <p><strong>Location:</strong> ${car.location}</p>
            </div>
            <button class="btn btn-primary view-more-btn">
              View More
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // Add modal event listeners to featured cars
  function addModalListeners() {
    const viewMoreBtns = document.querySelectorAll(".view-more-btn");
    viewMoreBtns.forEach((btn) => {
      btn.addEventListener("click", function () {
        const card = this.closest(".car-card");
        showCarModal(card);
      });
    });
  }

  // Show car modal with data
  function showCarModal(card) {
    const carData = {
      title: card.dataset.title,
      specs: card.dataset.specs,
      price: card.dataset.price,
      engine: card.dataset.engine,
      fuel: card.dataset.fuel,
      color: card.dataset.color,
      location: card.dataset.location,
      seller: card.dataset.seller,
      phone: card.dataset.phone,
      description: card.dataset.description,
      image: card.dataset.image,
    };

    // Populate modal with car data
    document.getElementById("modalCarTitle").textContent = carData.title;
    document.getElementById("modalCarSpecs").textContent = carData.specs;
    document.getElementById("modalCarPrice").textContent = carData.price;
    document.getElementById("modalCarImage").src = carData.image;

    // Technical specifications
    document.getElementById("modalCarDetails").innerHTML = `
      <p><strong>Engine:</strong> ${carData.engine}</p>
      <p><strong>Fuel:</strong> ${carData.fuel}</p>
      <p><strong>Color:</strong> ${carData.color}</p>
      <p><strong>Location:</strong> ${carData.location}</p>
    `;

    // Description and contact info
    document.getElementById("modalCarDescription").textContent =
      carData.description;
    document.getElementById("modalSellerName").textContent = carData.seller;
    document.getElementById("modalSellerPhone").textContent = carData.phone;
    document.getElementById("modalCarLocation").textContent = carData.location;

    // Show modal
    carModal.show();
  }

  // Create car card HTML
  function createCarCard(car) {
    return `
      <div class="col-md-4 mb-4 search-result-card">
        <div class="card car-card" 
             data-title="${car.title}" 
             data-specs="${car.specs}"
             data-price="${car.price}"
             data-engine="${car.engine}"
             data-fuel="${car.fuel}"
             data-color="${car.color}"
             data-location="${car.location}"
             data-seller="${car.seller}"
             data-phone="${car.phone}"
             data-description="${car.description}"
             data-image="${car.image}">
          <img src="${car.image}" class="card-img-top" alt="${car.title}">
          <div class="card-body">
            <h5 class="card-title">${car.title}</h5>
            <p class="card-text">${car.specs}</p>
            <p class="price">${car.price}</p>
            <div class="card-details" style="display: none">
              <p><strong>Engine:</strong> ${car.engine}</p>
              <p><strong>Fuel:</strong> ${car.fuel}</p>
              <p><strong>Color:</strong> ${car.color}</p>
              <p><strong>Location:</strong> ${car.location}</p>
            </div>
            <button class="btn btn-primary view-more-btn-dynamic">
              View More
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // Add event listeners to dynamically created buttons
  function addModalListenerToCard(card) {
    const btn = card.querySelector(".view-more-btn-dynamic");
    btn.addEventListener("click", function () {
      // Get data from card attributes
      const carData = {
        title: card.dataset.title,
        specs: card.dataset.specs,
        price: card.dataset.price,
        engine: card.dataset.engine,
        fuel: card.dataset.fuel,
        color: card.dataset.color,
        location: card.dataset.location,
        seller: card.dataset.seller,
        phone: card.dataset.phone,
        description: card.dataset.description,
        image: card.dataset.image,
      };

      // Populate modal with car data
      document.getElementById("modalCarTitle").textContent = carData.title;
      document.getElementById("modalCarSpecs").textContent = carData.specs;
      document.getElementById("modalCarPrice").textContent = carData.price;
      document.getElementById("modalCarImage").src = carData.image;

      // Technical specifications
      document.getElementById("modalCarDetails").innerHTML = `
        <p><strong>Engine:</strong> ${carData.engine}</p>
        <p><strong>Fuel:</strong> ${carData.fuel}</p>
        <p><strong>Color:</strong> ${carData.color}</p>
      `;

      // Description and contact info
      document.getElementById("modalCarDescription").textContent =
        carData.description;
      document.getElementById("modalSellerName").textContent = carData.seller;
      document.getElementById("modalSellerPhone").textContent = carData.phone;
      document.getElementById("modalCarLocation").textContent =
        carData.location;

      // Show modal
      carModal.show();
    });
  }

  // Enhanced search functionality
  function searchCars(searchTerm) {
    const normalizedSearch = searchTerm.toLowerCase().trim();
    let foundFeaturedCards = [];
    let foundAdditionalCars = [];

    // Hide other sections when searching
    hideOtherSections();

    // Remove existing search result cards
    document.querySelectorAll(".search-result-card").forEach((card) => {
      card.remove();
    });

    // Search in featured cars
    allCarCards.forEach((card) => {
      const cardContainer = card.closest(".col-md-4");
      const carTitle = card.dataset.title.toLowerCase();
      const carSpecs = card.dataset.specs.toLowerCase();
      const carColor = card.dataset.color.toLowerCase();
      const carLocation = card.dataset.location.toLowerCase();

      // Check if search term matches car title, specs, color, or location
      if (
        carTitle.includes(normalizedSearch) ||
        carSpecs.includes(normalizedSearch) ||
        carColor.includes(normalizedSearch) ||
        carLocation.includes(normalizedSearch)
      ) {
        cardContainer.style.display = "block";
        foundFeaturedCards.push(card);
      } else {
        cardContainer.style.display = "none";
      }
    });

    // Search in additional cars from JSON
    additionalCarsData.forEach((car) => {
      const carTitle = car.title.toLowerCase();
      const carSpecs = car.specs.toLowerCase();
      const carColor = car.color.toLowerCase();
      const carLocation = car.location.toLowerCase();

      if (
        carTitle.includes(normalizedSearch) ||
        carSpecs.includes(normalizedSearch) ||
        carColor.includes(normalizedSearch) ||
        carLocation.includes(normalizedSearch)
      ) {
        foundAdditionalCars.push(car);
      }
    });

    // Search in cars added by users (from localStorage)
    const userAddedCars = JSON.parse(
      localStorage.getItem("additionalCars") || "[]"
    );
    userAddedCars.forEach((car) => {
      const carTitle = car.title.toLowerCase();
      const carSpecs = car.specs.toLowerCase();
      const carColor = car.color.toLowerCase();
      const carLocation = car.location.toLowerCase();

      if (
        carTitle.includes(normalizedSearch) ||
        carSpecs.includes(normalizedSearch) ||
        carColor.includes(normalizedSearch) ||
        carLocation.includes(normalizedSearch)
      ) {
        foundAdditionalCars.push(car);
      }
    });

    // Add additional cars to the results
    const carsRow = document.querySelector(".cars-section .row");
    foundAdditionalCars.forEach((car) => {
      const cardHTML = createCarCard(car);
      carsRow.insertAdjacentHTML("beforeend", cardHTML);

      // Add modal functionality to the new card
      const newCard = carsRow.lastElementChild.querySelector(".car-card");
      addModalListenerToCard(newCard);
    });

    const totalFound = foundFeaturedCards.length + foundAdditionalCars.length;
    const allFoundCards = [
      ...foundFeaturedCards,
      ...document.querySelectorAll(".search-result-card .car-card"),
    ];

    // If only one car found, highlight it
    if (totalFound === 1) {
      allFoundCards[0].style.border = "3px solid #f39c12";
      allFoundCards[0].style.boxShadow = "0 8px 25px rgba(243, 156, 18, 0.3)";

      // Scroll to the found car
      allFoundCards[0].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    } else {
      // Remove highlighting from all cards
      [
        ...carCards,
        ...document.querySelectorAll(".search-result-card .car-card"),
      ].forEach((card) => {
        card.style.border = "none";
        card.style.boxShadow = "";
      });
    }

    // Show message
    updateSearchMessage(
      totalFound,
      normalizedSearch,
      foundFeaturedCards.length,
      foundAdditionalCars.length
    );
  }

  // Hide other sections when searching
  function hideOtherSections() {
    const heroAboutSection = document.getElementById("hero-about");
    const aboutContent = document.querySelector(".about-content");
    const faqSection = document.getElementById("faq");

    // Add search mode class to make hero section more compact
    if (heroAboutSection) heroAboutSection.classList.add("search-mode");

    // Hide only the about content, keep the search bar visible
    if (aboutContent) aboutContent.style.display = "none";
    if (faqSection) faqSection.style.display = "none";

    // Update cars section title to show it's search results
    const sectionTitle = document.querySelector(".cars-section .section-title");
    if (sectionTitle) {
      sectionTitle.textContent = "Search Results";
    }
  }

  // Show all sections when not searching
  function showAllSections() {
    const heroAboutSection = document.getElementById("hero-about");
    const aboutContent = document.querySelector(".about-content");
    const faqSection = document.getElementById("faq");

    // Remove search mode class to restore full hero section
    if (heroAboutSection) heroAboutSection.classList.remove("search-mode");

    // Show the about content and FAQ section back
    if (aboutContent) aboutContent.style.display = "block";
    if (faqSection) faqSection.style.display = "block";

    // Restore original cars section title
    const sectionTitle = document.querySelector(".cars-section .section-title");
    if (sectionTitle) {
      sectionTitle.textContent = "Featured Cars";
    }
  }
  function updateSearchMessage(
    totalFound,
    searchTerm,
    featuredCount,
    additionalCount
  ) {
    let existingMessage = document.getElementById("search-message");

    // Remove existing message
    if (existingMessage) {
      existingMessage.remove();
    }

    if (searchTerm && totalFound === 0) {
      // Create "no results" message
      const messageDiv = document.createElement("div");
      messageDiv.id = "search-message";
      messageDiv.className = "alert alert-warning text-center mt-3";
      messageDiv.innerHTML = `
        <h5>No cars found for "${searchTerm}"</h5>
        <p>Try searching for: BMW, Audi, Mercedes, Ford, Opel, Skoda, or colors like Black, White, Silver, etc.</p>
      `;

      const carsSection = document.querySelector(".cars-section .container");
      carsSection.appendChild(messageDiv);
    } else if (searchTerm && totalFound > 0) {
      // Create "results found" message
      const messageDiv = document.createElement("div");
      messageDiv.id = "search-message";
      messageDiv.className = "alert alert-success text-center mt-3";
      let messageText = `<h5>Found ${totalFound} car${
        totalFound > 1 ? "s" : ""
      } matching "${searchTerm}"</h5>`;

      if (featuredCount > 0 && additionalCount > 0) {
        messageText += `<p>${featuredCount} from featured cars, ${additionalCount} from our extended inventory</p>`;
      } else if (additionalCount > 0) {
        messageText += `<p>Results from our extended inventory</p>`;
      } else {
        messageText += `<p>Results from featured cars</p>`;
      }

      messageDiv.innerHTML = messageText;

      const carsSection = document.querySelector(".cars-section .container");
      carsSection.appendChild(messageDiv);
    }
  }

  function resetSearch() {
    // Show all sections again
    showAllSections();

    // Show all featured cars
    allCarCards.forEach((card) => {
      const cardContainer = card.closest(".col-md-4");
      cardContainer.style.display = "block";
      card.style.border = "none";
      card.style.boxShadow = "";
    });

    // Remove additional search result cards
    document.querySelectorAll(".search-result-card").forEach((card) => {
      card.remove();
    });

    // Remove search message
    const existingMessage = document.getElementById("search-message");
    if (existingMessage) {
      existingMessage.remove();
    }
  }

  // Search event listeners
  searchButton.addEventListener("click", function (e) {
    e.preventDefault();
    const searchTerm = searchInput.value;

    if (searchTerm.trim() === "") {
      resetSearch();
    } else {
      searchCars(searchTerm);
    }
  });

  // Real-time search as user types
  searchInput.addEventListener("input", function () {
    const searchTerm = this.value;

    // Show/hide clear button based on input
    if (searchTerm.trim() !== "") {
      clearButton.style.display = "flex";
    } else {
      clearButton.style.display = "none";
    }

    if (searchTerm.trim() === "") {
      resetSearch();
    } else {
      searchCars(searchTerm);
    }
  });

  // Search on Enter key
  searchInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      const searchTerm = this.value;

      if (searchTerm.trim() === "") {
        resetSearch();
      } else {
        searchCars(searchTerm);
      }
    }
  });

  // Clear search button functionality
  clearButton.addEventListener("click", function () {
    searchInput.value = "";
    clearButton.style.display = "none";
    resetSearch();
  });

  // Modal functionality for featured car details
  const viewMoreBtns = document.querySelectorAll(".view-more-btn");
  viewMoreBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const card = this.closest(".car-card");

      // Get data from card attributes
      const carData = {
        title: card.dataset.title,
        specs: card.dataset.specs,
        price: card.dataset.price,
        engine: card.dataset.engine,
        fuel: card.dataset.fuel,
        color: card.dataset.color,
        location: card.dataset.location,
        seller: card.dataset.seller,
        phone: card.dataset.phone,
        description: card.dataset.description,
        image: card.dataset.image,
      };

      // Populate modal with car data
      document.getElementById("modalCarTitle").textContent = carData.title;
      document.getElementById("modalCarSpecs").textContent = carData.specs;
      document.getElementById("modalCarPrice").textContent = carData.price;
      document.getElementById("modalCarImage").src = carData.image;

      // Technical specifications
      document.getElementById("modalCarDetails").innerHTML = `
        <p><strong>Engine:</strong> ${carData.engine}</p>
        <p><strong>Fuel:</strong> ${carData.fuel}</p>
        <p><strong>Color:</strong> ${carData.color}</p>
      `;

      // Description and contact info
      document.getElementById("modalCarDescription").textContent =
        carData.description;
      document.getElementById("modalSellerName").textContent = carData.seller;
      document.getElementById("modalSellerPhone").textContent = carData.phone;
      document.getElementById("modalCarLocation").textContent =
        carData.location;

      // Show modal
      carModal.show();
    });
  });

  // Listen for new cars added from the add car page
  window.addEventListener("carAdded", function (event) {
    // If there's currently a search active, refresh the results
    const currentSearchTerm = searchInput.value.trim();
    if (currentSearchTerm) {
      searchCars(currentSearchTerm);
    }
  });
};

// Fallback for non-SPA direct load: if home is present on initial DOM, initialize once
document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("featuredCarsGrid")) {
    window.initHomePage();
  }
});
