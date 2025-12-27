var DashboardService = {
  init: function () {
    // Check if user is logged in
    if (!Utils.isLoggedIn()) {
      window.location.href = "index.html#login";
      return;
    }

    // Add small delay to ensure DOM is fully rendered by SPAPP
    setTimeout(function () {
      console.log("DashboardService.init() called");

      const user = Utils.getCurrentUser();

      // Populate user info
      if (user) {
        const userFullNameEl = document.getElementById("userFullName");
        const firstNameEl = document.getElementById("firstName");
        const lastNameEl = document.getElementById("lastName");
        const profileEmailEl = document.getElementById("profileEmail");
        const profilePhoneEl = document.getElementById("profilePhone");

        if (userFullNameEl) userFullNameEl.textContent = user.name || "User";
        if (firstNameEl) firstNameEl.value = (user.name || "").split(" ")[0];
        if (lastNameEl)
          lastNameEl.value = (user.name || "").split(" ").slice(1).join(" ");
        if (profileEmailEl) profileEmailEl.value = user.email || "";
        if (profilePhoneEl) profilePhoneEl.value = user.phone || "";
      }

      // Setup form validation
      const profileForm = document.getElementById("profileForm");
      if (profileForm) {
        $(profileForm).validate({
          submitHandler: function (form) {
            DashboardService.updateProfile();
          },
        });
      }

      // Load user's listings
      DashboardService.loadMyListings();

      // Load user's orders
      DashboardService.loadMyOrders();

      console.log("DashboardService.init() completed");
    }, 300);
  },

  updateProfile: function () {
    $.blockUI({ message: "Updating profile..." });

    const user = Utils.getCurrentUser();
    const updated = {
      name:
        document.getElementById("firstName").value +
        " " +
        document.getElementById("lastName").value,
      email: document.getElementById("profileEmail").value,
      phone: document.getElementById("profilePhone").value,
    };

    RestClient.put(
      "user/" + user.id,
      updated,
      function (response) {
        $.unblockUI();
        toastr.success("Profile updated successfully");
        // Update localStorage
        const updatedUser = { ...user, ...updated };
        localStorage.setItem("user_data", JSON.stringify(updatedUser));
      },
      function (error) {
        $.unblockUI();
        toastr.error(error.responseJSON?.message || "Update failed");
      }
    );
  },

  loadMyListings: function () {
    const user = Utils.getCurrentUser();

    console.log("Loading my listings for user:", user);
    console.log("User ID:", user ? user.user_id : "NO USER");

    // Check if table element exists before attempting to load
    const tableElement = document.getElementById("myListingsTable");
    if (!tableElement) {
      console.warn("myListingsTable element not found, retrying in 200ms");
      setTimeout(function () {
        DashboardService.loadMyListings();
      }, 200);
      return;
    }

    RestClient.get(
      "car",
      function (response) {
        const allCars = response.data || response || [];
        // Filter cars by seller_id
        const myCars = allCars.filter((car) => car.seller_id === user.user_id);

        console.log("All cars:", allCars.length, "My cars:", myCars.length);

        const columns = [
          { title: "ID", data: "car_id" },
          {
            title: "Title",
            data: function (row) {
              return row.title || row.model || "N/A";
            },
          },
          {
            title: "Price",
            data: function (row) {
              return Utils.formatPrice(row.price);
            },
          },
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
                '<button class="btn btn-sm btn-warning" onclick="CarService.openEditModal(' +
                encodeURIComponent(JSON.stringify(row)) +
                ')">Edit</button>'
              );
            },
          },
        ];

        if ($.fn.dataTable.isDataTable("#myListingsTable")) {
          $("#myListingsTable").DataTable().destroy();
        }
        Utils.datatable("myListingsTable", columns, myCars, 10);
      },
      function (error) {
        console.error("Failed to load listings:", error);
        toastr.error("Failed to load listings");
      }
    );
  },

  loadMyOrders: function () {
    const user = Utils.getCurrentUser();

    // Check if table element exists before attempting to load
    const tableElement = document.getElementById("myOrdersTable");
    if (!tableElement) {
      console.warn("myOrdersTable element not found, retrying in 200ms");
      setTimeout(function () {
        DashboardService.loadMyOrders();
      }, 200);
      return;
    }

    if (typeof OrderService !== "undefined") {
      OrderService.getMyOrders(
        function (orders) {
          const columns = [
            { title: "Order ID", data: "order_id" },
            {
              title: "Car ID",
              data: "car_id",
            },
            {
              title: "Status",
              data: function (row) {
                const statusClass =
                  row.status === "completed"
                    ? "success"
                    : row.status === "pending"
                    ? "warning"
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
          ];

          if ($.fn.dataTable.isDataTable("#myOrdersTable")) {
            $("#myOrdersTable").DataTable().destroy();
          }
          Utils.datatable("myOrdersTable", columns, orders, 10);
        },
        function (error) {
          console.log("Failed to load orders", error);
          // Show empty table
          if ($.fn.dataTable.isDataTable("#myOrdersTable")) {
            $("#myOrdersTable").DataTable().destroy();
          }
          Utils.datatable(
            "myOrdersTable",
            [
              { title: "Order ID", data: "order_id" },
              { title: "Car ID", data: "car_id" },
              { title: "Status", data: "status" },
              { title: "Order Date", data: "order_date" },
            ],
            [],
            10
          );
        }
      );
    }
  },
};
