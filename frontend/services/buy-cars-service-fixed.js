// This is a temporary fix version - will be merged back to buy-cars-service.js

var BuyCarsServiceFixed = {
  showCarModal: function (car) {
    // Log for debugging
    console.log("===== SHOW CAR MODAL DEBUG =====");
    console.log("Car object:", car);
    console.log("Car title:", car.title);
    console.log("Car description:", car.description);
    console.log("Car ID:", car.car_id || car.id);

    // Get modal from BuyCarsService
    const modal = BuyCarsService && BuyCarsService.buyCarModal;
    if (!modal) {
      console.error(
        "FATAL: Modal not found. BuyCarsService.buyCarModal =",
        modal
      );
      // Try to get element directly and create modal if needed
      const modalEl = document.getElementById("buyCarModal");
      if (modalEl) {
        console.log("Modal element found, trying to initialize...");
        const newModal = new bootstrap.Modal(modalEl);
        BuyCarsService.buyCarModal = newModal;
      } else {
        toastr.error("Modal not available. Please refresh the page.");
        return;
      }
    }

    try {
      // Set all text content
      const titleEl = document.getElementById("buyCarModalTitle");
      const title2El = document.getElementById("buyCarModalTitle2");
      const specsEl = document.getElementById("buyCarModalSpecs");
      const priceEl = document.getElementById("buyCarModalPrice");
      const descEl = document.getElementById("buyCarModalDescription");
      const sellerEl = document.getElementById("buySeller");
      const phoneEl = document.getElementById("buyPhone");
      const locationEl = document.getElementById("buyLocation");
      const detailsEl = document.getElementById("buyCarModalDetails");

      if (titleEl) titleEl.textContent = car.title || "Car Details";
      if (title2El) title2El.textContent = car.title || "Car Details";
      if (specsEl) specsEl.textContent = car.specs || "";
      if (priceEl) priceEl.textContent = "$" + (car.price || "0");

      // IMPORTANT: Set description with fallback
      if (descEl) {
        descEl.textContent =
          car.description && car.description.trim()
            ? car.description
            : "No description provided for this vehicle.";
        descEl.style.display = "block";
        console.log("✓ Description set to:", descEl.textContent);
      } else {
        console.error("✗ Description element NOT FOUND");
      }

      if (sellerEl) sellerEl.textContent = car.seller_id || "Unknown";
      if (phoneEl) phoneEl.textContent = car.phone || "N/A";
      if (locationEl) locationEl.textContent = car.location || "N/A";

      if (detailsEl) {
        detailsEl.innerHTML =
          "<p><strong>Category:</strong> " +
          (car.category_id || "N/A") +
          "</p>" +
          "<p><strong>Status:</strong> " +
          (car.status || "Available") +
          "</p>";
      }

      // Handle image
      const imgEl = document.getElementById("buyCarModalImage");
      if (imgEl) {
        const imageUrl = car.image_url || car.image;
        const isValidUrl =
          imageUrl &&
          (imageUrl.startsWith("http://") ||
            imageUrl.startsWith("https://") ||
            imageUrl.startsWith("/") ||
            imageUrl.startsWith("./") ||
            imageUrl.startsWith("../"));

        if (isValidUrl) {
          imgEl.src = imageUrl;
          imgEl.style.display = "block";
          imgEl.onerror = function () {
            this.style.display = "none";
          };
        } else {
          imgEl.style.display = "none";
        }
      }

      // Handle purchase button
      const purchaseBtn = document.getElementById("buyCarPurchaseBtn");
      if (purchaseBtn) {
        const carId = car.car_id || car.id;
        const canPurchase =
          Utils.isLoggedIn() &&
          String(car.status || "available").toLowerCase() === "available";
        if (canPurchase && carId) {
          purchaseBtn.style.display = "block";
          purchaseBtn.onclick = () => BuyCarsService.purchaseCar(car, carId);
        } else {
          purchaseBtn.style.display = "none";
          purchaseBtn.onclick = null;
        }
      }

      // Show modal
      console.log("Showing modal...");
      BuyCarsService.buyCarModal.show();
      console.log("✓ Modal displayed");
      console.log("===== END DEBUG =====");
    } catch (error) {
      console.error("ERROR in showCarModal:", error);
      toastr.error("Failed to load car details");
    }
  },
};

// Copy fixed version to main service
BuyCarsService.showCarModal = BuyCarsServiceFixed.showCarModal;
