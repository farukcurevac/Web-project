var AdminService = {
  init: function () {
    // Check if user is admin
    if (!Utils.isAdmin()) {
      toastr.error("Access denied. Admin privileges required.");
      window.location.href = "index.html#home";
      return;
    }

    // Load dashboard stats
    AdminService.loadStats();

    // Setup tab change listeners
    document
      .getElementById("users-tab")
      .addEventListener("click", AdminService.loadAllUsers);
    document
      .getElementById("orders-tab")
      .addEventListener("click", AdminService.loadAllOrders);
    document
      .getElementById("cars-tab")
      .addEventListener("click", AdminService.loadAllCars);
    document
      .getElementById("reviews-tab")
      .addEventListener("click", AdminService.loadAllReviews);
  },

  loadStats: function () {
    // Load total users
    RestClient.get(
      "user",
      function (response) {
        const users = response.data || response || [];
        document.getElementById("totalUsersCard").textContent = users.length;
        AdminService.loadRecentUsers(users.slice(-5));
      },
      function (error) {
        console.log("Failed to load users");
      }
    );

    // Load total cars
    RestClient.get(
      "car",
      function (response) {
        const cars = response.data || response || [];
        document.getElementById("totalCarsCard").textContent = cars.length;
        const active = cars.filter((c) => c.status === "active").length;
        document.getElementById("activeListingsCard").textContent = active;
        AdminService.loadRecentCars(cars.slice(-5));
      },
      function (error) {
        console.log("Failed to load cars");
      }
    );

    // Load total orders
    RestClient.get(
      "order",
      function (response) {
        const orders = response.data || response || [];
        document.getElementById("totalOrdersCard").textContent = orders.length;
      },
      function (error) {
        console.log("Failed to load orders");
      }
    );
  },

  loadRecentUsers: function (users) {
    const columns = [
      { title: "ID", data: "user_id" },
      { title: "Name", data: "name" },
      { title: "Email", data: "email" },
      { title: "Role", data: "role" },
    ];

    if ($.fn.dataTable.isDataTable("#recentUsersTable")) {
      $("#recentUsersTable").DataTable().destroy();
    }
    Utils.datatable("recentUsersTable", columns, users, 5);
  },

  loadRecentCars: function (cars) {
    const columns = [
      { title: "ID", data: "car_id" },
      { title: "Title", data: "title" },
      {
        title: "Price",
        data: function (row) {
          return Utils.formatPrice(row.price);
        },
      },
    ];

    if ($.fn.dataTable.isDataTable("#recentCarsTable")) {
      $("#recentCarsTable").DataTable().destroy();
    }
    Utils.datatable("recentCarsTable", columns, cars, 5);
  },

  loadAllUsers: function () {
    RestClient.get(
      "user",
      function (response) {
        const users = response.data || response || [];
        const columns = [
          { title: "ID", data: "user_id" },
          { title: "Name", data: "name" },
          { title: "Email", data: "email" },
          { title: "Phone", data: "phone" },
          { title: "Role", data: "role" },
          {
            title: "Actions",
            data: function (row) {
              return (
                '<button class="btn btn-sm btn-danger" onclick="AdminService.deleteUser(' +
                row.user_id +
                ')">Delete</button>'
              );
            },
          },
        ];

        if ($.fn.dataTable.isDataTable("#adminUsersTable")) {
          $("#adminUsersTable").DataTable().destroy();
        }
        Utils.datatable("adminUsersTable", columns, users, 10);
      },
      function (error) {
        toastr.error("Failed to load users");
      }
    );
  },

  loadAllOrders: function () {
    if (typeof OrderService !== "undefined") {
      OrderService.getAllOrders(
        function (orders) {
          const columns = [
            { title: "Order ID", data: "order_id" },
            { title: "Buyer ID", data: "buyer_id" },
            { title: "Car ID", data: "car_id" },
            {
              title: "Status",
              data: function (row) {
                const statusClass =
                  row.status === "completed"
                    ? "success"
                    : row.status === "pending"
                    ? "warning"
                    : row.status === "cancelled"
                    ? "danger"
                    : "info";
                return `<span class="badge bg-${statusClass}">${row.status}</span>`;
              },
            },
            {
              title: "Order Date",
              data: function (row) {
                return row.order_date || "N/A";
              },
            },
            {
              title: "Actions",
              data: function (row) {
                return (
                  '<button class="btn btn-sm btn-success me-2" onclick="AdminService.updateOrderStatus(' +
                  row.order_id +
                  ", 'completed')\">Complete</button>" +
                  '<button class="btn btn-sm btn-danger" onclick="AdminService.deleteOrder(' +
                  row.order_id +
                  ')">Delete</button>'
                );
              },
            },
          ];

          if ($.fn.dataTable.isDataTable("#adminOrdersTable")) {
            $("#adminOrdersTable").DataTable().destroy();
          }
          Utils.datatable("adminOrdersTable", columns, orders, 10);
        },
        function (error) {
          toastr.error("Failed to load orders");
        }
      );
    }
  },

  updateOrderStatus: function (orderId, status) {
    if (typeof OrderService !== "undefined") {
      OrderService.updateOrderStatus(orderId, status, function () {
        // Reload orders table
        AdminService.loadAllOrders();
      });
    }
  },

  deleteOrder: function (orderId) {
    if (typeof OrderService !== "undefined") {
      OrderService.deleteOrder(orderId, function () {
        // Reload orders table
        AdminService.loadAllOrders();
      });
    }
  },

  loadAllCars: function () {
    RestClient.get(
      "car",
      function (response) {
        const cars = response.data || response || [];
        const columns = [
          { title: "ID", data: "car_id" },
          { title: "Title", data: "title" },
          {
            title: "Price",
            data: function (row) {
              return Utils.formatPrice(row.price);
            },
          },
          { title: "Seller", data: "seller_id" },
          {
            title: "Status",
            data: function (row) {
              return Utils.formatCarStatus(row.status);
            },
          },
        ];

        if ($.fn.dataTable.isDataTable("#adminCarsTable")) {
          $("#adminCarsTable").DataTable().destroy();
        }
        Utils.datatable("adminCarsTable", columns, cars, 10);
      },
      function (error) {
        toastr.error("Failed to load cars");
      }
    );
  },

  deleteUser: function (userId) {
    if (confirm("Are you sure you want to delete this user?")) {
      $.blockUI({ message: "Deleting..." });
      RestClient.delete(
        "user/" + userId,
        {},
        function () {
          $.unblockUI();
          toastr.success("User deleted");
          AdminService.loadAllUsers();
        },
        function (error) {
          $.unblockUI();
          toastr.error("Delete failed");
        }
      );
    }
  },

  deleteOrder: function (orderId) {
    if (confirm("Are you sure you want to delete this order?")) {
      $.blockUI({ message: "Deleting..." });
      RestClient.delete(
        "order/" + orderId,
        {},
        function () {
          $.unblockUI();
          toastr.success("Order deleted");
          AdminService.loadAllOrders();
        },
        function (error) {
          $.unblockUI();
          toastr.error("Delete failed");
        }
      );
    }
  },

  loadAllReviews: function () {
    if (typeof ReviewService === "undefined") {
      toastr.error("ReviewService not available");
      return;
    }

    ReviewService.getAllReviews(
      function (reviews) {
        const columns = [
          { title: "Review ID", data: "review_id" },
          { title: "Car ID", data: "car_id" },
          { title: "User ID", data: "user_id" },
          {
            title: "Rating",
            data: function (row) {
              const stars = "⭐".repeat(row.rating || 0);
              return (
                '<span title="' +
                (row.rating || 0) +
                ' stars">' +
                stars +
                " (" +
                (row.rating || 0) +
                "/5)</span>"
              );
            },
          },
          {
            title: "Comment",
            data: function (row) {
              const comment = row.comment || "No comment";
              const truncated =
                comment.length > 50
                  ? comment.substring(0, 50) + "..."
                  : comment;
              return (
                '<div title="' +
                comment.replace(/"/g, "&quot;") +
                '">' +
                truncated +
                "</div>"
              );
            },
          },
          {
            title: "Date",
            data: function (row) {
              return row.review_date || "N/A";
            },
          },
          {
            title: "Actions",
            data: function (row) {
              return (
                '<button class="btn btn-sm btn-danger" onclick="AdminService.deleteReview(' +
                row.review_id +
                ')">Delete</button>'
              );
            },
          },
        ];

        if ($.fn.dataTable.isDataTable("#adminReviewsTable")) {
          $("#adminReviewsTable").DataTable().destroy();
        }
        Utils.datatable("adminReviewsTable", columns, reviews, 10);
      },
      function (error) {
        toastr.error("Failed to load reviews");
      }
    );
  },

  deleteReview: function (reviewId) {
    if (confirm("Are you sure you want to delete this review?")) {
      $.blockUI({ message: "Deleting..." });
      if (typeof ReviewService === "undefined") {
        $.unblockUI();
        toastr.error("ReviewService not available");
        return;
      }

      ReviewService.deleteReview(
        reviewId,
        function () {
          $.unblockUI();
          toastr.success("Review deleted");
          AdminService.loadAllReviews();
        },
        function (error) {
          $.unblockUI();
          toastr.error("Delete failed");
        }
      );
    }
  },
};
