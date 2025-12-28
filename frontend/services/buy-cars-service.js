let BuyCarsService = {
  allCars: [],
  currentCar: null,
  buyCarModal: null,
  table: null,

  init: function () {
    console.log("BuyCarsService: Initializing...");

    // Show debug info
    const debugDiv = document.getElementById("debugInfo");
    const debugContent = document.getElementById("debugContent");
    if (debugDiv && debugContent) {
      const token = localStorage.getItem("user_token");
      const user = Utils.getCurrentUser();
      debugContent.innerHTML = `
        <p>Logged in: ${Utils.isLoggedIn() ? "Yes" : "No"}</p>
        <p>Token: ${token ? "Present" : "Missing"}</p>
        <p>User: ${user ? JSON.stringify(user) : "None"}</p>
        <p>API URL: ${Constants.PROJECT_BASE_URL}car</p>
      `;
      debugDiv.style.display = "block";
    }

    this.buyCarModal = document.getElementById("buyCarModal")
      ? new bootstrap.Modal(document.getElementById("buyCarModal"))
      : null;
    console.log(
      "BuyCarsService: Modal initialized",
      this.buyCarModal ? "Success" : "Failed"
    );
    this.setupEventListeners();
    this.loadAllCars();
  },

  setupEventListeners: function () {
    const searchBtn = document.getElementById("buyCarsSearchBtn");
    const searchInput = document.getElementById("buyCarsSearch");
    if (searchBtn)
      searchBtn.addEventListener("click", () => this.handleSearch());
    if (searchInput)
      searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") this.handleSearch();
      });
  },

  loadAllCars: function () {
    const self = this;
    console.log("BuyCarsService: Loading cars from API...");

    // Check if user is logged in
    if (!Utils.isLoggedIn()) {
      console.error("User not logged in");
      toastr.error("Please login to view available cars");
      setTimeout(() => {
        window.location.hash = "#login";
      }, 2000);
      return;
    }

    RestClient.get(
      "car",
      function (response) {
        console.log("BuyCarsService: API response received", response);
        const allCars =
          response && response.data
            ? response.data
            : Array.isArray(response)
            ? response
            : [];
        // Filter out SOLD cars - only show AVAILABLE cars
        const cars = allCars.filter(
          (car) => String(car.status || "").toUpperCase() === "AVAILABLE"
        );
        console.log(
          "BuyCarsService: Total cars:",
          allCars.length,
          "Available:",
          cars.length
        );
        self.allCars = cars;

        if (cars.length === 0) {
          console.warn("No available cars found in database");
          toastr.info("No cars available for purchase at the moment");
        }

        self.renderTable(self.allCars);
      },
      function (error) {
        console.error("Failed to load cars", error);
        const errorMsg =
          error.responseJSON?.message ||
          error.statusText ||
          "Failed to load cars";
        toastr.error(errorMsg);

        // If authentication error, redirect to login
        if (error.status === 401 || error.status === 403) {
          setTimeout(() => {
            window.location.hash = "#login";
          }, 2000);
        }
      }
    );
  },

  renderTable: function (cars) {
    const rows = Array.isArray(cars) ? cars : [];
    console.log("BuyCarsService: Rendering table with", rows.length, "cars");

    // Check if table element exists
    const tableElement = document.getElementById("buyCarsTable");
    if (!tableElement) {
      console.error("Table element #buyCarsTable not found in DOM!");
      toastr.error("Table element not found. Please refresh the page.");
      return;
    }

    // Check if jQuery is available
    if (typeof $ === "undefined" || typeof $.fn.dataTable === "undefined") {
      console.error("jQuery or DataTables not loaded!");
      toastr.error("Required libraries not loaded. Please refresh the page.");
      return;
    }

    const columns = [
      { title: "ID", data: "car_id" },
      { title: "Title", data: "title" },
      {
        title: "Price",
        data: function (row) {
          return Utils.formatPrice(row.price || 0);
        },
      },
      {
        title: "Status",
        data: function (row) {
          const st = String(row.status || "available").toLowerCase();
          const cls =
            st === "available"
              ? "success"
              : st === "pending"
              ? "warning"
              : "secondary";
          return '<span class="badge bg-' + cls + '">' + st + "</span>";
        },
      },
      {
        title: "Actions",
        data: function (row) {
          const st = String(row.status || "available").toLowerCase();
          const disabled = st !== "available" ? "disabled" : "";
          const id = row.car_id || row.id;
          return (
            '<button class="btn btn-sm btn-info me-2" onclick="BuyCarsService.openDetails(\'' +
            id +
            "')\">Details</button>" +
            '<button class="btn btn-sm btn-success me-2" ' +
            disabled +
            " onclick=\"BuyCarsService.purchaseById('" +
            id +
            "')\">Purchase</button>" +
            '<button class="btn btn-sm btn-warning" onclick="BuyCarsService.toggleReviewForm(\'' +
            id +
            "')\">Review</button>"
          );
        },
      },
    ];

    if ($.fn.dataTable.isDataTable("#buyCarsTable")) {
      console.log("Destroying existing DataTable...");
      $("#buyCarsTable").DataTable().destroy();
      $("#buyCarsTable tbody").empty();
    }

    try {
      console.log("Calling Utils.datatable with", rows.length, "rows");
      Utils.datatable("buyCarsTable", columns, rows, 10);
      this.table = $("#buyCarsTable").DataTable();
      console.log(
        "BuyCarsService: DataTable initialized successfully with",
        rows.length,
        "rows"
      );
      toastr.success(`Loaded ${rows.length} cars successfully`);
    } catch (error) {
      console.error("Failed to initialize DataTable", error);
      toastr.error("Failed to display cars table: " + error.message);
    }
  },

  handleSearch: function () {
    const term = (document.getElementById("buyCarsSearch").value || "").trim();
    if (this.table) this.table.search(term).draw();
  },

  showCarModal: function (car) {
    this.currentCar = car;
    const carId = car.car_id || car.id;
    document.getElementById("buyCarModalTitle").textContent =
      car.title || "Car Details";
    document.getElementById("buyCarModalTitle2").textContent =
      car.title || "Car Details";
    document.getElementById("buyCarModalSpecs").textContent = car.specs || "";
    document.getElementById("buyCarModalPrice").textContent =
      "$" + (car.price || "0");

    // Handle car image - only show if valid URL, hide otherwise
    const imgElement = document.getElementById("buyCarModalImage");
    const imageUrl = car.image_url || car.image;

    // Check if image URL is valid (starts with http/https or is a proper path with /)
    const isValidUrl =
      imageUrl &&
      (imageUrl.startsWith("http://") ||
        imageUrl.startsWith("https://") ||
        imageUrl.startsWith("/") ||
        imageUrl.startsWith("./") ||
        imageUrl.startsWith("../"));

    if (isValidUrl) {
      imgElement.src = imageUrl;
      imgElement.style.display = "block";
      imgElement.onerror = function () {
        this.style.display = "none";
      };
    } else {
      imgElement.style.display = "none";
    }

    document.getElementById("buyCarModalDescription").textContent =
      car.description || "No description available";
    document.getElementById("buySeller").textContent =
      car.seller_id || "Unknown";
    document.getElementById("buyPhone").textContent = car.phone || "N/A";
    document.getElementById("buyLocation").textContent = car.location || "N/A";
    document.getElementById("buyCarModalDetails").innerHTML =
      "<p><strong>Category:</strong> " +
      (car.category_id || "N/A") +
      "</p>" +
      "<p><strong>Status:</strong> " +
      (car.status || "Available") +
      "</p>";

    const purchaseBtn = document.getElementById("buyCarPurchaseBtn");
    const canPurchase =
      Utils.isLoggedIn() &&
      String(car.status || "available").toLowerCase() === "available";
    if (canPurchase && carId) {
      purchaseBtn.style.display = "block";
      purchaseBtn.onclick = () => this.purchaseCar(car, carId);
    } else {
      purchaseBtn.style.display = "none";
      purchaseBtn.onclick = null;
      if (!Utils.isLoggedIn()) toastr.info("Please login to purchase a car");
    }

    if (this.buyCarModal) this.buyCarModal.show();
  },

  purchaseCar: function (car, carId) {
    if (typeof OrderService === "undefined") {
      toastr.error("OrderService not available");
      return;
    }
    if (!carId) {
      toastr.error("Invalid car ID");
      return;
    }
    OrderService.createOrder(carId, () => {
      if (this.buyCarModal) this.buyCarModal.hide();
      toastr.success(
        "Car purchased successfully! Redirecting to your dashboard..."
      );
      // Refresh the Buy Cars table to remove the purchased car
      BuyCarsService.loadAllCars();
      setTimeout(() => {
        window.location.hash = "#dashboard";
      }, 1500);
    });
  },

  toggleReviewForm: function (carId) {
    const formId = "reviewForm_" + carId;
    let form = document.getElementById(formId);

    if (form) {
      // Toggle visibility
      if (form.style.display === "none") {
        form.style.display = "block";
      } else {
        form.style.display = "none";
      }
    } else {
      // Create the review form
      form = this.createReviewForm(carId);
      const table = document.getElementById("buyCarsTable");
      if (table && table.parentNode) {
        table.parentNode.appendChild(form);
      }
    }
  },

  createReviewForm: function (carId) {
    const formId = "reviewForm_" + carId;
    const formDiv = document.createElement("div");
    formDiv.id = formId;
    formDiv.style.cssText =
      "padding: 20px; border: 1px solid #ddd; border-radius: 5px; margin-top: 20px; background: #f9f9f9;";

    const car = this.allCars.find(
      (c) => String(c.car_id || c.id) === String(carId)
    );
    const carTitle = car ? car.title : "Car";

    formDiv.innerHTML = `
      <div style="margin-bottom: 15px;">
        <h5>Review: ${carTitle}</h5>
      </div>
      
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Rating (1-5 stars)</label>
        <select id="rating_${carId}" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
          <option value="">Select rating...</option>
          <option value="1">1 - Poor</option>
          <option value="2">2 - Fair</option>
          <option value="3">3 - Good</option>
          <option value="4">4 - Very Good</option>
          <option value="5">5 - Excellent</option>
        </select>
      </div>

      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Your Review</label>
        <textarea id="comment_${carId}" 
                  placeholder="Write your review here..." 
                  style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-family: Arial; resize: vertical; min-height: 100px;"></textarea>
      </div>

      <div style="display: flex; gap: 10px;">
        <button class="btn btn-primary" onclick="BuyCarsService.submitReview('${carId}')">Submit Review</button>
        <button class="btn btn-secondary" onclick="BuyCarsService.closeReviewForm('${carId}')">Cancel</button>
      </div>
    `;

    return formDiv;
  },

  submitReview: function (carId) {
    const rating = document.getElementById("rating_" + carId).value;
    const comment = document.getElementById("comment_" + carId).value;

    if (!rating) {
      toastr.error("Please select a rating");
      return;
    }

    if (!comment || comment.trim().length === 0) {
      toastr.error("Please write a review");
      return;
    }

    if (typeof ReviewService === "undefined") {
      toastr.error("ReviewService not available");
      return;
    }

    ReviewService.createReview(
      carId,
      rating,
      comment,
      () => {
        // Clear form
        document.getElementById("comment_" + carId).value = "";
        document.getElementById("rating_" + carId).value = "";
        this.closeReviewForm(carId);
        toastr.success("Review posted successfully!");
      },
      () => {
        // Error handled by ReviewService
      }
    );
  },

  closeReviewForm: function (carId) {
    const formId = "reviewForm_" + carId;
    const form = document.getElementById(formId);
    if (form) {
      form.style.display = "none";
    }
  },
};

// Inline handlers used by the table
BuyCarsService.openDetails = function (id) {
  const car = BuyCarsService.allCars.find(
    (c) => String(c.car_id || c.id) === String(id)
  );
  if (car) BuyCarsService.showCarModal(car);
  else toastr.error("Car not found");
};

BuyCarsService.purchaseById = function (id) {
  const car = BuyCarsService.allCars.find(
    (c) => String(c.car_id || c.id) === String(id)
  );
  if (car) BuyCarsService.purchaseCar(car, car.car_id || car.id);
  else toastr.error("Car not found");
};
