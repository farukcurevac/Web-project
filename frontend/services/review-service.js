var ReviewService = {
  // Create a new review
  createReview: function (carId, rating, comment, callback, errorCallback) {
    const user = Utils.getCurrentUser();
    if (!user) {
      toastr.error("Please login to write a review");
      return;
    }

    const reviewData = {
      car_id: carId,
      user_id: user.user_id,
      rating: parseInt(rating),
      comment: comment,
      review_date: new Date().toISOString().split("T")[0],
    };

    RestClient.post(
      "review",
      reviewData,
      function (response) {
        toastr.success("Review posted successfully!");
        if (callback) callback(response);
      },
      function (error) {
        const errorMsg =
          error.responseJSON?.message ||
          error.responseJSON?.error ||
          "Failed to post review";
        toastr.error(errorMsg);
        if (errorCallback) errorCallback(error);
      }
    );
  },

  // Get all reviews for a car
  getCarReviews: function (carId, callback, errorCallback) {
    RestClient.get(
      "review",
      function (response) {
        const allReviews = response.data || response || [];
        // Filter reviews by car_id
        const carReviews = allReviews.filter(
          (review) => review.car_id === carId
        );
        if (callback) callback(carReviews);
      },
      function (error) {
        console.error("Failed to load reviews:", error);
        if (errorCallback) errorCallback(error);
      }
    );
  },

  // Get all reviews (admin)
  getAllReviews: function (callback, errorCallback) {
    RestClient.get(
      "review",
      function (response) {
        const reviews = response.data || response || [];
        if (callback) callback(reviews);
      },
      function (error) {
        console.error("Failed to load reviews:", error);
        if (errorCallback) errorCallback(error);
      }
    );
  },

  // Delete review (admin or owner)
  deleteReview: function (reviewId, callback, errorCallback) {
    if (!confirm("Are you sure you want to delete this review?")) {
      return;
    }

    $.blockUI({ message: "Deleting review..." });
    RestClient.delete(
      "review/" + reviewId,
      {},
      function (response) {
        $.unblockUI();
        toastr.success("Review deleted");
        if (callback) callback(response);
      },
      function (error) {
        $.unblockUI();
        const errorMsg =
          error.responseJSON?.message || "Failed to delete review";
        toastr.error(errorMsg);
        if (errorCallback) errorCallback(error);
      }
    );
  },
};
