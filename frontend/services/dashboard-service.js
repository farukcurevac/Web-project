var DashboardService = {
  init: function () {
    // Check if user is logged in
    if (!Utils.isLoggedIn()) {
      window.location.href = "#login";
      return;
    }

    const user = Utils.getCurrentUser();

    // Populate user info
    if (user) {
      document.getElementById("userFullName").textContent = user.name || "User";
      document.getElementById("firstName").value = (user.name || "").split(
        " "
      )[0];
      document.getElementById("lastName").value = (user.name || "")
        .split(" ")
        .slice(1)
        .join(" ");
      document.getElementById("profileEmail").value = user.email || "";
      document.getElementById("profilePhone").value = user.phone || "";
      document.getElementById("profileCity").value = user.city || "";
    }

    // Setup form validation
    $("#profileForm").validate({
      submitHandler: function (form) {
        DashboardService.updateProfile();
      },
    });

    // Load user's listings
    DashboardService.loadMyListings();

    // Load user's orders
    DashboardService.loadMyOrders();
  },

  showSection: function (section) {
    // Hide all sections
    document.querySelectorAll(".content-section").forEach((el) => {
      el.classList.add("d-none");
    });

    // Show selected section
    document.getElementById(section + "-section").classList.remove("d-none");

    // Update active link
    document.querySelectorAll(".list-group-item").forEach((el) => {
      el.classList.remove("active");
    });
    event.target.closest(".list-group-item").classList.add("active");
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
      city: document.getElementById("profileCity").value,
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

    RestClient.get(
      "car?seller_id=" + user.id,
      function (response) {
        const data = response.data || response || [];
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

        if ($.fn.dataTable.isDataTable("#myListingsTable")) {
          $("#myListingsTable").DataTable().destroy();
        }
        Utils.datatable("myListingsTable", columns, data, 10);
      },
      function (error) {
        toastr.error("Failed to load listings");
      }
    );
  },

  loadMyOrders: function () {
    const user = Utils.getCurrentUser();

    RestClient.get(
      "order?buyer_id=" + user.id,
      function (response) {
        const data = response.data || response || [];
        const columns = [
          { title: "Order ID", data: "order_id" },
          { title: "Car", data: "car_title" },
          {
            title: "Price",
            data: function (row) {
              return Utils.formatPrice(row.price);
            },
          },
          { title: "Status", data: "status" },
          { title: "Date", data: "created_at" },
        ];

        if ($.fn.dataTable.isDataTable("#myOrdersTable")) {
          $("#myOrdersTable").DataTable().destroy();
        }
        Utils.datatable("myOrdersTable", columns, data, 10);
      },
      function (error) {
        // Orders may not exist yet
        console.log("No orders found");
      }
    );
  },
};
