var AdminService = {
  init: function () {
    // Check if user is admin
    if (!Utils.isAdmin()) {
      window.location.href = "#home";
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
      { title: "Brand", data: "brand" },
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
          { title: "City", data: "city" },
          { title: "Role", data: "role" },
          {
            title: "Actions",
            data: function (row) {
              return (
                '<button class="btn btn-sm btn-warning me-2" onclick="AdminService.editUser(' +
                encodeURIComponent(JSON.stringify(row)) +
                ')">Edit</button>' +
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
    RestClient.get(
      "order",
      function (response) {
        const orders = response.data || response || [];
        const columns = [
          { title: "Order ID", data: "order_id" },
          { title: "Buyer", data: "buyer_name" },
          { title: "Car", data: "car_title" },
          {
            title: "Price",
            data: function (row) {
              return Utils.formatPrice(row.price);
            },
          },
          { title: "Status", data: "status" },
          { title: "Date", data: "created_at" },
          {
            title: "Actions",
            data: function (row) {
              return (
                '<button class="btn btn-sm btn-info me-2" onclick="AdminService.viewOrder(' +
                row.order_id +
                ')">View</button>' +
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
  },

  loadAllCars: function () {
    RestClient.get(
      "car",
      function (response) {
        const cars = response.data || response || [];
        const columns = [
          { title: "ID", data: "car_id" },
          { title: "Title", data: "title" },
          { title: "Brand", data: "brand" },
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
          {
            title: "Actions",
            data: function (row) {
              return (
                '<button class="btn btn-sm btn-warning me-2" onclick="CarService.openEditModal(' +
                encodeURIComponent(JSON.stringify(row)) +
                ')">Edit</button>' +
                '<button class="btn btn-sm btn-danger" onclick="CarService.openDeleteModal(' +
                row.car_id +
                ')">Delete</button>'
              );
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
};
