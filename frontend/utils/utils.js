let Utils = {
  datatable: function (table_id, columns, data, pageLength = 15) {
    if ($.fn.dataTable.isDataTable("#" + table_id)) {
      $("#" + table_id)
        .DataTable()
        .destroy();
    }
    $("#" + table_id).DataTable({
      data: data,
      columns: columns,
      pageLength: pageLength,
      lengthMenu: [5, 10, 15, 25, 50, 100, "All"],
    });
  },
  parseJwt: function (token) {
    if (!token) return null;
    try {
      const payload = token.split(".")[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (e) {
      console.error("Invalid JWT token", e);
      return null;
    }
  },
  getCurrentUser: function () {
    const token = localStorage.getItem("user_token");
    if (!token) return null;
    const decoded = Utils.parseJwt(token);
    return decoded ? decoded.user : null;
  },
  isLoggedIn: function () {
    return localStorage.getItem("user_token") !== null;
  },
  isAdmin: function () {
    const user = Utils.getCurrentUser();
    return user && user.role === Constants.ADMIN_ROLE;
  },
  isSeller: function () {
    const user = Utils.getCurrentUser();
    return user && user.role === Constants.USER_ROLE;
  },
  formatPrice: function (price) {
    return "$" + parseFloat(price).toFixed(2);
  },
  formatCarStatus: function (status) {
    const statusMap = {
      AVAILABLE: "Available",
      SOLD: "Sold",
      PENDING: "Pending",
    };
    return statusMap[status] || status;
  },
  getCarImage: function (carId) {
    return Constants.PROJECT_BASE_URL + "cars/" + carId + "/image.jpg";
  },
  showNotification: function (message, type = "success") {
    if (typeof toastr !== "undefined") {
      toastr[type](message);
    } else {
      alert(message);
    }
  },
  logout: function () {
    localStorage.removeItem("user_token");
    localStorage.removeItem("user_data");
    window.location.href = "index.html#/login";
  },
  redirectToLogin: function () {
    if (!Utils.isLoggedIn()) {
      window.location.href = "index.html#/login";
    }
  },
  redirectToHome: function () {
    window.location.href = "index.html#/home";
  },
};
