// Add Car Form Functionality (SPA-ready)
window.initAddPage = function () {
  const addCarForm = document.getElementById("addCarForm");
  const formMessage = document.getElementById("formMessage");
  const imageInput = document.getElementById("image_url");

  // Check if user is logged in
  if (!Utils.isLoggedIn()) {
    if (formMessage) {
      formMessage.className = "alert alert-warning mt-3";
      formMessage.innerHTML =
        '<strong>Please login first</strong> to sell a car. <a href="#login">Go to login</a>';
      formMessage.style.display = "block";
    }
    return;
  }

  // Ensure elements exist and avoid double init
  if (!addCarForm || addCarForm.dataset.initialized === "true") return;
  addCarForm.dataset.initialized = "true";

  // Image preview functionality
  if (imageInput) {
    imageInput.addEventListener("input", function () {
      const imageUrl = this.value;
      const existingPreview = document.querySelector(".image-preview");

      if (existingPreview) {
        existingPreview.remove();
      }

      if (imageUrl && isValidImageUrl(imageUrl)) {
        const previewDiv = document.createElement("div");
        previewDiv.className = "image-preview";
        previewDiv.innerHTML = `
          <img src="${imageUrl}" alt="Car preview" onerror="this.style.display='none'" />
        `;
        imageInput.parentNode.appendChild(previewDiv);
      }
    });
  }

  // Form submission
  addCarForm.addEventListener("submit", function (e) {
    e.preventDefault();

    if (!validateForm()) {
      showMessage("Please fill in all required fields correctly.", "danger");
      return;
    }

    // Show loading state
    const submitBtn = addCarForm.querySelector('button[type="submit"]');
    const originalBtnContent = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML =
      '<span class="loading-spinner"></span> Posting Car...';

    // Collect form data - only send fields that backend expects
    const formData = new FormData(addCarForm);
    const user = Utils.getCurrentUser();

    console.log("=== SELLING CAR ===");
    console.log("Current user:", user);
    console.log("User ID field:", user ? user.user_id : "NO USER");

    const carData = {
      title: formData.get("title"),
      price: parseFloat(formData.get("price")),
      category_id: parseInt(formData.get("category_id")),
      seller_id: user ? user.user_id : null,
      description: formData.get("description") || "",
      image_url: formData.get("image_url") || "",
      status: "AVAILABLE",
    };

    console.log("Posting car data to /car:", carData);

    // Use CarService to post car
    CarService.addCar(
      carData,
      function (response) {
        console.log("Car posted successfully:", response);

        // Show success message
        showMessage(
          "Your car has been successfully posted! It will appear in the Buy Cars listing immediately.",
          "success"
        );

        // Reset form
        addCarForm.reset();
        const imagePreview = document.querySelector(".image-preview");
        if (imagePreview) {
          imagePreview.remove();
        }

        // Reset button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnContent;

        // Clear all validation classes
        clearValidationClasses();

        // Refresh Buy Cars page if it's loaded
        if (
          window.BuyCarsService &&
          typeof BuyCarsService.loadAllCars === "function"
        ) {
          setTimeout(() => {
            BuyCarsService.loadAllCars();
          }, 1000);
        }
      },
      function (error) {
        console.error("Failed to post car:", error);
        console.error("Error status:", error.status);
        console.error("Error response text:", error.responseText);
        console.error("Error JSON:", error.responseJSON);

        const errorMsg =
          error.responseJSON?.message ||
          error.responseJSON?.error ||
          error.statusText ||
          "Failed to post car. Check browser console for details.";
        showMessage("Error: " + errorMsg, "danger");

        // Reset button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnContent;
      }
    );
  });

  // Form validation
  function validateForm() {
    let isValid = true;
    const requiredFields = addCarForm.querySelectorAll("[required]");

    // Clear previous validation classes
    clearValidationClasses();

    requiredFields.forEach((field) => {
      const value = field.value.trim();

      if (!value) {
        markFieldInvalid(field, "This field is required.");
        isValid = false;
      } else {
        // Additional specific validations
        if (field.name === "price") {
          const price = parseFloat(value);
          if (isNaN(price) || price < 0) {
            markFieldInvalid(field, "Please enter a valid price.");
            isValid = false;
          } else {
            markFieldValid(field);
          }
        } else if (field.name === "category_id") {
          if (value === "") {
            markFieldInvalid(field, "Please select a category.");
            isValid = false;
          } else {
            markFieldValid(field);
          }
        } else {
          markFieldValid(field);
        }
      }
    });

    return isValid;
  }

  // Validation helper functions
  function isValidImageUrl(url) {
    try {
      new URL(url);
      return /\.(jpg|jpeg|png|webp|gif)$/i.test(url);
    } catch {
      return false;
    }
  }

  function markFieldInvalid(field, message) {
    field.classList.remove("is-valid");
    field.classList.add("is-invalid");

    // Remove existing feedback
    const existingFeedback =
      field.parentNode.querySelector(".invalid-feedback");
    if (existingFeedback) {
      existingFeedback.remove();
    }

    // Add new feedback
    const feedback = document.createElement("div");
    feedback.className = "invalid-feedback";
    feedback.textContent = message;
    field.parentNode.appendChild(feedback);
  }

  function markFieldValid(field) {
    field.classList.remove("is-invalid");
    field.classList.add("is-valid");

    // Remove existing feedback
    const existingFeedback =
      field.parentNode.querySelector(".invalid-feedback");
    if (existingFeedback) {
      existingFeedback.remove();
    }
  }

  function clearValidationClasses() {
    const fields = addCarForm.querySelectorAll(".form-control, .form-select");
    fields.forEach((field) => {
      field.classList.remove("is-valid", "is-invalid");
    });

    // Remove all feedback messages
    const feedbacks = addCarForm.querySelectorAll(
      ".invalid-feedback, .valid-feedback"
    );
    feedbacks.forEach((feedback) => feedback.remove());
  }

  function showMessage(message, type) {
    formMessage.style.display = "block";
    formMessage.className = `alert alert-${type} mt-3`;
    formMessage.textContent = message;

    // Auto-hide success messages after 5 seconds
    if (type === "success") {
      setTimeout(() => {
        formMessage.style.display = "none";
      }, 5000);
    }
  }

  // Add car to localStorage (since we can't modify JSON file from client-side)
  function addCarToLocalStorage(carData) {
    let storedCars = JSON.parse(localStorage.getItem("additionalCars") || "[]");
    storedCars.push(carData);
    localStorage.setItem("additionalCars", JSON.stringify(storedCars));

    // Trigger custom event to notify other parts of the application
    window.dispatchEvent(new CustomEvent("carAdded", { detail: carData }));
  }

  // Real-time validation on input
  const formInputs = addCarForm.querySelectorAll("input, select, textarea");
  formInputs.forEach((input) => {
    input.addEventListener("blur", function () {
      if (this.value.trim()) {
        // Validate this specific field
        validateSingleField(this);
      }
    });

    // Clear validation on input
    input.addEventListener("input", function () {
      if (this.classList.contains("is-invalid")) {
        this.classList.remove("is-invalid");
        const feedback = this.parentNode.querySelector(".invalid-feedback");
        if (feedback) {
          feedback.remove();
        }
      }
    });
  });

  function validateSingleField(field) {
    const value = field.value.trim();

    if (field.required && !value) {
      markFieldInvalid(field, "This field is required.");
    } else if (field.name === "price" && value) {
      const price = parseFloat(value);
      if (isNaN(price) || price < 0) {
        markFieldInvalid(field, "Please enter a valid price.");
      } else {
        markFieldValid(field);
      }
    } else if (field.name === "category_id" && value) {
      if (value === "") {
        markFieldInvalid(field, "Please select a category.");
      } else {
        markFieldValid(field);
      }
    } else if (field.name === "image_url" && value) {
      if (!isValidImageUrl(value)) {
        markFieldInvalid(
          field,
          "Please enter a valid image URL (jpg, png, webp, gif)."
        );
      } else {
        markFieldValid(field);
      }
    } else if (value) {
      markFieldValid(field);
    }
  }
};

// Fallback for non-SPA direct load
document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("addCarForm")) {
    window.initAddPage();
  }
});
