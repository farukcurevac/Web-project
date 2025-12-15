var RegisterService = {
  init: function () {
    // Setup form validation
    $("#register-form").validate({
      rules: {
        firstName: {
          required: true,
          minlength: 2,
        },
        lastName: {
          required: true,
          minlength: 2,
        },
        email: {
          required: true,
          email: true,
        },
        phone: {
          required: true,
          minlength: 9,
        },
        city: {
          required: true,
        },
        password: {
          required: true,
          minlength: 6,
        },
        confirmPassword: {
          required: true,
          equalTo: "#password",
        },
      },
      messages: {
        firstName: {
          required: "Please enter your first name",
          minlength: "First name must be at least 2 characters",
        },
        lastName: {
          required: "Please enter your last name",
          minlength: "Last name must be at least 2 characters",
        },
        email: {
          required: "Please enter your email",
          email: "Please enter a valid email address",
        },
        phone: {
          required: "Please enter your phone number",
          minlength: "Phone number must be at least 9 digits",
        },
        city: {
          required: "Please select your city",
        },
        password: {
          required: "Please enter a password",
          minlength: "Password must be at least 6 characters",
        },
        confirmPassword: {
          required: "Please confirm your password",
          equalTo: "Passwords do not match",
        },
      },
      submitHandler: function (form, event) {
        event.preventDefault();
        RegisterService.register();
      },
    });
  },

  register: function () {
    $.blockUI({ message: "Creating your account..." });

    var entity = {
      name: $("#firstName").val() + " " + $("#lastName").val(),
      email: $("#email").val(),
      password: $("#password").val(),
      phone: $("#phone").val(),
      city: $("#city").val(),
      role: "user", // Default role for new registrations
    };

    RestClient.post(
      "auth/register",
      entity,
      function (data) {
        $.unblockUI();
        toastr.success(
          "Registration successful! You can now login.",
          "Success"
        );

        // Redirect to login page after 2 seconds
        setTimeout(function () {
          window.location.href = "#login";
        }, 2000);
      },
      function (error) {
        $.unblockUI();
        toastr.error(
          error.responseJSON?.message ||
            "Registration failed. Please try again.",
          "Error"
        );
      }
    );
  },
};
