// Add Car Form Functionality (SPA-ready)
window.initAddPage = function () {
  const addCarForm = document.getElementById("addCarForm");
  const formMessage = document.getElementById("formMessage");
  const imageInput = document.getElementById("image");

  // Ensure elements exist and avoid double init
  if (!addCarForm || addCarForm.dataset.initialized === "true") return;
  addCarForm.dataset.initialized = "true";

  // Image preview functionality
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
    submitBtn.innerHTML = '<span class="loading-spinner"></span> Adding Car...';

    // Collect form data
    const formData = new FormData(addCarForm);
    const carData = {
      id: Date.now(), // Simple ID generation using timestamp
      title: formData.get("carTitle"),
      specs: `${formData.get("year")} • ${Number(
        formData.get("mileage")
      ).toLocaleString()} km • ${formData.get("transmission")}`,
      price: formatPrice(formData.get("price")),
      engine: formData.get("engine"),
      fuel: formData.get("fuel"),
      color: formData.get("color"),
      location: formData.get("location"),
      seller: formData.get("seller"),
      phone: formData.get("phone"),
      description: formData.get("description"),
      image: formData.get("image"),
    };

    // Simulate API call (since we can't actually modify JSON file from client-side)
    setTimeout(() => {
      // Add to localStorage for demonstration
      addCarToLocalStorage(carData);

      // Show success message
      showMessage(
        "Your car has been successfully added! It will appear in search results.",
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
    }, 2000);
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
        if (field.type === "email" && !isValidEmail(value)) {
          markFieldInvalid(field, "Please enter a valid email address.");
          isValid = false;
        } else if (field.type === "url" && !isValidImageUrl(value)) {
          markFieldInvalid(field, "Please enter a valid image URL.");
          isValid = false;
        } else if (field.name === "year") {
          const year = parseInt(value);
          const currentYear = new Date().getFullYear();
          if (year < 1980 || year > currentYear) {
            markFieldInvalid(
              field,
              `Year must be between 1980 and ${currentYear}.`
            );
            isValid = false;
          } else {
            markFieldValid(field);
          }
        } else if (field.name === "mileage") {
          const mileage = parseInt(value);
          if (mileage < 0 || mileage > 1000000) {
            markFieldInvalid(field, "Please enter a valid mileage.");
            isValid = false;
          } else {
            markFieldValid(field);
          }
        } else if (field.name === "phone" && !isValidPhone(value)) {
          // Phone validation removed - allow any format
          markFieldValid(field);
        } else {
          markFieldValid(field);
        }
      }
    });

    return isValid;
  }

  // Validation helper functions
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function isValidImageUrl(url) {
    try {
      new URL(url);
      return /\.(jpg|jpeg|png|webp|gif)$/i.test(url);
    } catch {
      return false;
    }
  }

  function isValidPhone(phone) {
    // Simple phone validation for Bosnia and Herzegovina format
    const phoneRegex = /^\+387\s?\d{2}\s?\d{3}\s?\d{3,4}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  }

  function formatPrice(price) {
    // Ensure price starts with € if not already formatted
    if (price && !price.includes("€")) {
      // Remove any existing currency symbols and clean up
      const cleanPrice = price.replace(/[^\d,]/g, "");
      return `€${cleanPrice}`;
    }
    return price;
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
    } else if (field.name === "year" && value) {
      const year = parseInt(value);
      const currentYear = new Date().getFullYear();
      if (year < 1980 || year > currentYear) {
        markFieldInvalid(
          field,
          `Year must be between 1980 and ${currentYear}.`
        );
      } else {
        markFieldValid(field);
      }
    } else if (field.name === "mileage" && value) {
      const mileage = parseInt(value);
      if (mileage < 0 || mileage > 1000000) {
        markFieldInvalid(field, "Please enter a valid mileage.");
      } else {
        markFieldValid(field);
      }
    } else if (field.name === "phone" && value) {
      // Phone validation removed - allow any format
      markFieldValid(field);
    } else if (field.type === "url" && value) {
      if (!isValidImageUrl(value)) {
        markFieldInvalid(field, "Please enter a valid image URL.");
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

// Function to get cars from localStorage (for use in search)
function getCarsFromLocalStorage() {
  return JSON.parse(localStorage.getItem("additionalCars") || "[]");
}
