var CarService = {
  init: function () {
    // Hide Add button for non-admins
    if (!Utils.isAdmin()) {
      document.getElementById("addCarBtn")?.classList.add("d-none");
    }

    // Setup validations for add form
    $("#addCarForm").validate({
      submitHandler: function (form) {
        var car = Object.fromEntries(new FormData(form).entries());
        // Ensure title/model requirement satisfied
        if (!car.title && car.model) car.title = car.model;
        // Attach seller_id from token
        const user = Utils.getCurrentUser();
        if (user?.id) car.seller_id = user.id;
        CarService.addCar(car);
        form.reset();
      },
    });

    // Setup validations for edit form
    $("#editCarForm").validate({
      submitHandler: function (form) {
        var car = Object.fromEntries(new FormData(form).entries());
        CarService.editCar(car);
      },
    });

    // Load all cars into table
    CarService.getAllCars();
  },

  columns: [
    { title: "ID", data: "car_id" },
    {
      title: "Title",
      data: function (row) {
        return row.title || row.model || "";
      },
    },
    { title: "Brand", data: "brand" },
    {
      title: "Price",
      data: function (row) {
        return row.price ? Utils.formatPrice(row.price) : "";
      },
    },
    {
      title: "Status",
      data: function (row) {
        return Utils.formatCarStatus(row.status);
      },
    },
    { title: "Category", data: "category_id" },
    { title: "Seller", data: "seller_id" },
    {
      title: "Actions",
      data: function (row) {
        var editBtn =
          '<button class="btn btn-sm btn-outline-primary me-2" onclick="CarService.openEditModal(' +
          encodeURIComponent(JSON.stringify(row)) +
          ')">Edit</button>';
        var delBtn =
          '<button class="btn btn-sm btn-outline-danger" onclick="CarService.openDeleteModal(' +
          row.car_id +
          ')">Delete</button>';
        if (Utils.isAdmin()) {
          return editBtn + delBtn;
        }
        return "";
      },
    },
  ],

  openAddModal: function () {
    $("#addCarModal").show();
    $("#addCarForm")[0].reset();
  },

  addCar: function (car) {
    $.blockUI({ message: "<h3>Processing...</h3>" });
    RestClient.post(
      "car",
      JSON.stringify(car),
      function (response) {
        toastr.success("Car added successfully");
        $.unblockUI();
        CarService.getAllCars();
        CarService.closeModal();
      },
      function (response) {
        CarService.closeModal();
        const message =
          response.responseJSON?.error?.message || "Add car failed";
        toastr.error(message);
        $.unblockUI();
      }
    );
  },

  getAllCars: function () {
    RestClient.get(
      "car",
      function (data) {
        Utils.datatable(
          "cars-table",
          [
            { data: "car_id", title: "ID" },
            {
              data: function (row) {
                return row.title || row.model || "";
              },
              title: "Title",
            },
            { data: "brand", title: "Brand" },
            {
              data: function (row) {
                return row.price ? Utils.formatPrice(row.price) : "";
              },
              title: "Price",
            },
            {
              data: function (row) {
                return Utils.formatCarStatus(row.status);
              },
              title: "Status",
            },
            { data: "category_id", title: "Category" },
            { data: "seller_id", title: "Seller" },
            {
              title: "Actions",
              render: function (data, type, row, meta) {
                const rowStr = encodeURIComponent(JSON.stringify(row));
                let actions =
                  '<div class="d-flex justify-content-center gap-2">';
                if (Utils.isAdmin()) {
                  actions +=
                    '<button class="btn btn-sm btn-primary" onclick="CarService.openEditModal(\'' +
                    row.car_id +
                    "')\">Edit</button>";
                  actions +=
                    '<button class="btn btn-sm btn-danger" onclick="CarService.openConfirmationDialog(decodeURIComponent(\'' +
                    rowStr +
                    "'))\">Delete</button>";
                }
                actions += "</div>";
                return actions;
              },
            },
          ],
          data,
          10
        );
      },
      function (xhr, status, error) {
        console.error("Error fetching cars:", error);
        toastr.error("Failed to load cars");
      }
    );
  },

  getCarById: function (id) {
    $.blockUI({ message: "<h3>Processing...</h3>" });
    RestClient.get(
      "car/" + id,
      function (data) {
        $("#edit_car_id").val(data.car_id);
        $("#edit_title").val(data.title || data.model || "");
        $("#edit_brand").val(data.brand || "");
        $("#edit_price").val(data.price || "");
        $("#edit_category_id").val(data.category_id || "");
        $("#edit_description").val(data.description || "");
        $.unblockUI();
      },
      function (xhr, status, error) {
        console.error("Error fetching car");
        toastr.error("Failed to load car details");
        $.unblockUI();
      }
    );
  },

  openEditModal: function (id) {
    $.blockUI({ message: "<h3>Processing...</h3>" });
    $("#editCarModal").show();
    CarService.getCarById(id);
  },

  closeModal: function () {
    $("#editCarModal").hide();
    $("#deleteCarModal").hide();
    $("#addCarModal").hide();
  },

  editCar: function (car) {
    console.log(car);
    $.blockUI({ message: "<h3>Processing...</h3>" });
    RestClient.put(
      "car/" + car.id,
      JSON.stringify(car),
      function (data) {
        $.unblockUI();
        toastr.success("Car edited successfully");
        CarService.closeModal();
        CarService.getAllCars();
      },
      function (xhr, status, error) {
        console.error("Error");
        toastr.error("Failed to update car");
        $.unblockUI();
      }
    );
  },

  openConfirmationDialog: function (car) {
    car = JSON.parse(car);
    $("#deleteCarModal").show();
    $("#delete-car-body").html(
      "Do you want to delete car: " + (car.title || car.model || car.car_id)
    );
    $("#delete_car_id").val(car.car_id);
  },

  deleteCar: function () {
    $.blockUI({ message: "<h3>Processing...</h3>" });
    RestClient.delete(
      "car/" + $("#delete_car_id").val(),
      null,
      function (response) {
        CarService.closeModal();
        toastr.success("Car deleted successfully");
        $.unblockUI();
        CarService.getAllCars();
      },
      function (response) {
        CarService.closeModal();
        const message =
          response.responseJSON?.error?.message || "Delete failed";
        toastr.error(message);
        $.unblockUI();
      }
    );
  },
};
