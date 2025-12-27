var OrderService = {
  init: function () {
    // Initialize order management
  },

  // Create new order (purchase car)
  createOrder: function (carId, callback, errorCallback) {
    const user = Utils.getCurrentUser();
    if (!user) {
      toastr.error("Please login to purchase a car");
      return;
    }

    const orderData = {
      car_id: carId,
      buyer_id: user.user_id,
      order_date: new Date().toISOString().split("T")[0],
      status: "pending",
    };

    $.blockUI({ message: "Processing your order..." });

    RestClient.post(
      "order",
      orderData,
      function (response) {
        $.unblockUI();
        toastr.success("Car purchased successfully!");
        if (callback) callback(response);
      },
      function (error) {
        $.unblockUI();
        const errorMsg =
          error.responseJSON?.error ||
          error.responseJSON?.message ||
          "Failed to create order. Please try again.";
        toastr.error(errorMsg);
        if (errorCallback) errorCallback(error);
      }
    );
  },

  // Get all orders (Admin only)
  getAllOrders: function (callback, errorCallback) {
    RestClient.get(
      "order",
      function (response) {
        const orders = response.data || response || [];
        if (callback) callback(orders);
      },
      function (error) {
        toastr.error("Failed to load orders");
        if (errorCallback) errorCallback(error);
      }
    );
  },

  // Get orders by buyer (user's orders)
  getMyOrders: function (callback, errorCallback) {
    const user = Utils.getCurrentUser();
    if (!user) {
      if (errorCallback) errorCallback({ message: "User not logged in" });
      return;
    }

    RestClient.get(
      "order",
      function (response) {
        const orders = response.data || response || [];
        // Filter orders by current user
        const myOrders = orders.filter(
          (order) => order.buyer_id === user.user_id
        );
        if (callback) callback(myOrders);
      },
      function (error) {
        console.log("Failed to load orders", error);
        if (errorCallback) errorCallback(error);
      }
    );
  },

  // Get order by ID
  getOrderById: function (orderId, callback, errorCallback) {
    RestClient.get(
      "order/" + orderId,
      function (response) {
        if (callback) callback(response);
      },
      function (error) {
        toastr.error("Failed to load order details");
        if (errorCallback) errorCallback(error);
      }
    );
  },

  // Update order status (Admin only)
  updateOrderStatus: function (orderId, status, callback, errorCallback) {
    const updateData = { status: status };

    $.blockUI({ message: "Updating order..." });

    RestClient.patch(
      "order/" + orderId,
      updateData,
      function (response) {
        $.unblockUI();
        toastr.success("Order status updated successfully!");
        if (callback) callback(response);
      },
      function (error) {
        $.unblockUI();
        toastr.error("Failed to update order status");
        if (errorCallback) errorCallback(error);
      }
    );
  },

  // Delete order (Admin only)
  deleteOrder: function (orderId, callback, errorCallback) {
    if (!confirm("Are you sure you want to delete this order?")) {
      return;
    }

    $.blockUI({ message: "Deleting order..." });

    RestClient.delete(
      "order/" + orderId,
      {},
      function (response) {
        $.unblockUI();
        toastr.success("Order deleted successfully!");
        if (callback) callback(response);
      },
      function (error) {
        $.unblockUI();
        toastr.error("Failed to delete order");
        if (errorCallback) errorCallback(error);
      }
    );
  },
};
