var UserService = {
  init: function () {
    var token = localStorage.getItem("user_token");
    if (token && token !== undefined) {
      // User already logged in, redirect to dashboard
      const user = Utils.getCurrentUser();
      if (user && user.role === Constants.ADMIN_ROLE) {
        window.location.replace("index.html#admin");
      } else {
        window.location.replace("index.html#dashboard");
      }
      return;
    }

    // Pre-fill email if user just registered
    const registrationEmail = localStorage.getItem("registration_email");
    if (registrationEmail) {
      $("#email").val(registrationEmail);
      localStorage.removeItem("registration_email");
    }

    $("#login-form").validate({
      submitHandler: function (form) {
        var entity = Object.fromEntries(new FormData(form).entries());
        UserService.login(entity);
      },
    });
  },

  login: function (entity) {
    $.ajax({
      url: Constants.PROJECT_BASE_URL + "auth/login",
      type: "POST",
      data: JSON.stringify(entity),
      contentType: "application/json",
      dataType: "json",
      success: function (result) {
        console.log(result);
        localStorage.setItem("user_token", result.data.token);
        localStorage.setItem("user_data", JSON.stringify(result.data));
        toastr.success("Login successful!");
        // Redirect based on role
        const user = Utils.parseJwt(result.data.token)?.user;
        if (user && user.role === Constants.ADMIN_ROLE) {
          window.location.replace("index.html#admin");
        } else {
          window.location.replace("index.html#dashboard");
        }
      },
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        const errorMsg =
          XMLHttpRequest?.responseJSON?.error ||
          XMLHttpRequest?.responseJSON?.message ||
          XMLHttpRequest?.responseText ||
          "Login failed. Please check your credentials.";
        toastr.error(errorMsg);
      },
    });
  },

  logout: function () {
    localStorage.clear();
    window.location.replace("index.html#home");
  },

  generateMenuItems: function () {
    const token = localStorage.getItem("user_token");
    if (!token) {
      window.location.replace("login.html");
      return;
    }

    const decoded = Utils.parseJwt(token);
    const user = decoded ? decoded.user : null;

    if (user && user.role) {
      let nav = "";
      let main = "";

      switch (user.role) {
        case Constants.USER_ROLE:
          // Seller/User role - can list and sell cars
          nav =
            '<li class="nav-item">' +
            '<a class="nav-link" href="#dashboard">My Dashboard</a>' +
            "</li>" +
            '<li class="nav-item">' +
            '<a class="nav-link" href="#add">Sell a Car</a>' +
            "</li>" +
            '<li class="nav-item">' +
            '<button class="btn btn-sm btn-danger" onclick="UserService.logout()">Logout</button>' +
            "</li>";

          main =
            '<section id="dashboard" data-load="dashboard.html"></section>' +
            '<section id="add" data-load="add.html"></section>';

          if ($("#tabs").length) $("#tabs").html(nav);
          if ($("#spapp").length) $("#spapp").html(main);
          break;

        case Constants.ADMIN_ROLE:
          // Admin role - manage entire platform
          nav =
            '<li class="nav-item">' +
            '<a class="nav-link" href="#admin">Admin Panel</a>' +
            "</li>" +
            '<li class="nav-item">' +
            '<a class="nav-link" href="#dashboard">My Profile</a>' +
            "</li>" +
            '<li class="nav-item">' +
            '<button class="btn btn-sm btn-danger" onclick="UserService.logout()">Logout</button>' +
            "</li>";

          main =
            '<section id="admin" data-load="admin.html"></section>' +
            '<section id="dashboard" data-load="dashboard.html"></section>';

          if ($("#tabs").length) $("#tabs").html(nav);
          if ($("#spapp").length) $("#spapp").html(main);
          break;

        default:
          console.error("Unknown user role:", user.role);
          window.location.replace("login.html");
      }
    } else {
      window.location.replace("login.html");
    }
  },
};
