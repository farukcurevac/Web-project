// Profile Page Functionality (SPA-ready)
window.initProfilePage = function () {
  const myCarsGrid = document.getElementById("myCarsGrid");
  const emptyState = document.getElementById("emptyState");
  const totalCarsElement = document.getElementById("totalCars");
  const carModalEl = document.getElementById("carModal");
  const carModal = carModalEl ? new bootstrap.Modal(carModalEl) : null;
  const deleteCarBtn = document.getElementById("deleteCarBtn");

  // Guard against missing DOM and double init
  if (!myCarsGrid || myCarsGrid.dataset.initialized === "true") return;
  myCarsGrid.dataset.initialized = "true";

  let currentCarId = null;

  // Load user's cars on page load
  loadMyCars();

  // Create car card HTML for profile
  function createProfileCarCard(car) {
    return `
      <div class="col-lg-4 col-md-6 col-sm-12 profile-car-card" data-car-id="${car.id}">
        <div class="card">
          <div class="position-relative">
            <img src="${car.image}" class="card-img-top" alt="${car.title}" onerror="this.src='https://via.placeholder.com/350x220?text=No+Image'">
            <div class="car-badge">My Car</div>
          </div>
          <div class="card-body">
            <h5 class="card-title">${car.title}</h5>
            <p class="card-text">${car.specs}</p>
            <p class="price">${car.price}</p>
            
            <div class="car-details mb-3">
              <small class="text-muted">
                <strong>Engine:</strong> ${car.engine} • 
                <strong>Fuel:</strong> ${car.fuel} • 
                <strong>Color:</strong> ${car.color}
              </small>
            </div>
            
            <div class="card-actions">
              <button class="btn btn-outline-primary btn-sm view-details-btn" data-car-id="${car.id}">
                <i class="fas fa-eye"></i>
                View Details
              </button>
              <button class="btn btn-outline-danger btn-sm delete-car-btn" data-car-id="${car.id}">
                <i class="fas fa-trash"></i>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Load user's cars from localStorage
  function loadMyCars() {
    const storedCars = JSON.parse(
      localStorage.getItem("additionalCars") || "[]"
    );

    // Update total cars count
    totalCarsElement.textContent = storedCars.length;

    if (storedCars.length === 0) {
      // Show empty state
      myCarsGrid.style.display = "none";
      emptyState.style.display = "block";
    } else {
      // Show cars grid
      emptyState.style.display = "none";
      myCarsGrid.style.display = "flex";

      // Clear existing cards
      myCarsGrid.innerHTML = "";

      // Add car cards
      storedCars.forEach((car) => {
        const cardHTML = createProfileCarCard(car);
        myCarsGrid.insertAdjacentHTML("beforeend", cardHTML);
      });

      // Add event listeners to new cards
      addEventListeners();
    }
  }

  // Add event listeners to car cards
  function addEventListeners() {
    // View details buttons
    const viewDetailsBtns = document.querySelectorAll(".view-details-btn");
    viewDetailsBtns.forEach((btn) => {
      btn.addEventListener("click", function () {
        const carId = parseInt(this.dataset.carId);
        showCarDetails(carId);
      });
    });

    // Delete buttons
    const deleteCarBtns = document.querySelectorAll(".delete-car-btn");
    deleteCarBtns.forEach((btn) => {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        const carId = parseInt(this.dataset.carId);
        confirmDeleteCar(carId);
      });
    });
  }

  // Show car details in modal
  function showCarDetails(carId) {
    const storedCars = JSON.parse(
      localStorage.getItem("additionalCars") || "[]"
    );
    const car = storedCars.find((c) => c.id === carId);

    if (!car) {
      alert("Car not found!");
      return;
    }

    currentCarId = carId;

    // Populate modal with car data
    document.getElementById("modalCarTitle").textContent = car.title;
    document.getElementById("modalCarSpecs").textContent = car.specs;
    document.getElementById("modalCarPrice").textContent = car.price;
    document.getElementById("modalCarImage").src = car.image;

    // Technical specifications
    document.getElementById("modalCarDetails").innerHTML = `
      <p><strong>Engine:</strong> ${car.engine}</p>
      <p><strong>Fuel:</strong> ${car.fuel}</p>
      <p><strong>Color:</strong> ${car.color}</p>
      <p><strong>Location:</strong> ${car.location}</p>
    `;

    // Description and contact info
    document.getElementById("modalCarDescription").textContent =
      car.description;
    document.getElementById("modalSellerName").textContent = car.seller;
    document.getElementById("modalSellerPhone").textContent = car.phone;
    document.getElementById("modalCarLocation").textContent = car.location;

    // Ensure delete button is visible only in this context
    if (deleteCarBtn) deleteCarBtn.style.display = "inline-block";
    // Show modal
    if (carModal) carModal.show();
  }

  // Confirm car deletion
  function confirmDeleteCar(carId) {
    const storedCars = JSON.parse(
      localStorage.getItem("additionalCars") || "[]"
    );
    const car = storedCars.find((c) => c.id === carId);

    if (!car) {
      alert("Car not found!");
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to delete "${car.title}"? This action cannot be undone.`
    );

    if (confirmed) {
      deleteCar(carId);
    }
  }

  // Delete car from localStorage
  function deleteCar(carId) {
    let storedCars = JSON.parse(localStorage.getItem("additionalCars") || "[]");

    // Filter out the car to delete
    storedCars = storedCars.filter((car) => car.id !== carId);

    // Update localStorage
    localStorage.setItem("additionalCars", JSON.stringify(storedCars));

    // Refresh the display
    loadMyCars();

    // Show success message
    showNotification("Car deleted successfully!", "success");

    // Trigger event for other parts of the application
    window.dispatchEvent(new CustomEvent("carDeleted", { detail: { carId } }));
  }

  // Delete car from modal
  if (deleteCarBtn) {
    deleteCarBtn.addEventListener("click", function () {
      if (currentCarId) {
        const confirmed = confirm(
          "Are you sure you want to delete this car? This action cannot be undone."
        );

        if (confirmed) {
          deleteCar(currentCarId);
          if (carModal) carModal.hide();
          currentCarId = null;
          // Hide delete button after use
          deleteCarBtn.style.display = "none";
        }
      }
    });
  }

  // Show notification
  function showNotification(message, type = "info") {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = `alert alert-${type} notification`;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      max-width: 300px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      animation: slideIn 0.3s ease-out;
    `;
    notification.innerHTML = `
      <div class="d-flex align-items-center">
        <div class="flex-grow-1">${message}</div>
        <button type="button" class="btn-close btn-close-sm ms-2" onclick="this.parentElement.parentElement.remove()"></button>
      </div>
    `;

    // Add to page
    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
      if (notification && notification.parentElement) {
        notification.remove();
      }
    }, 3000);
  }

  // Listen for new cars added (from add page)
  window.addEventListener("carAdded", function () {
    loadMyCars();
    showNotification("New car added to your profile!", "success");
  });

  // Refresh cars when page becomes visible (in case cars were added in another tab)
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) {
      loadMyCars();
    }
  });

  // Hide the delete button when the modal is closed
  if (carModalEl) {
    carModalEl.addEventListener("hidden.bs.modal", function () {
      if (deleteCarBtn) deleteCarBtn.style.display = "none";
    });
  }
};

// Fallback for non-SPA direct load
document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("myCarsGrid")) {
    window.initProfilePage();
  }
});

// Add notification styles
const notificationStyles = document.createElement("style");
notificationStyles.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  .notification {
    animation: slideIn 0.3s ease-out;
  }
  
  .alert-success {
    background-color: #d4edda;
    border-color: #c3e6cb;
    color: #155724;
  }
  
  .alert-info {
    background-color: #cce7ff;
    border-color: #bee5eb;
    color: #0c5460;
  }
`;
document.head.appendChild(notificationStyles);
