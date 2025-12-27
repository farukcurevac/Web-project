var RegisterService = {
  init: function () {
    // Add custom password strength validator
    $.validator.addMethod(
      "strongPassword",
      function (value, element) {
        // Must be at least 8 chars, with uppercase, lowercase, number, and special char
        const strongRegex =
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return this.optional(element) || strongRegex.test(value);
      },
      "Password must be at least 8 characters with uppercase, lowercase, number, and special character (@$!%*?&)"
    );

    // Setup form validation
    $("#register-form").validate({
      rules: {
        firstName: {
          required: true,
          minlength: 2,
          maxlength: 50,
        },
        lastName: {
          required: true,
          minlength: 2,
          maxlength: 50,
        },
        email: {
          required: true,
          email: true,
          maxlength: 255,
        },
        phone: {
          required: true,
          minlength: 9,
          maxlength: 20,
        },
        role: {
          required: true,
        },
        password: {
          required: true,
          minlength: 8,
          strongPassword: true,
        },
        confirmPassword: {
          required: true,
          minlength: 8,
          strongPassword: true,
          equalTo: "#password",
        },
      },
      messages: {
        firstName: {
          required: "Please enter your first name",
          minlength: "First name must be at least 2 characters",
          maxlength: "First name must not exceed 50 characters",
        },
        lastName: {
          required: "Please enter your last name",
          minlength: "Last name must be at least 2 characters",
          maxlength: "Last name must not exceed 50 characters",
        },
        email: {
          required: "Please enter your email",
          email: "Please enter a valid email address",
          maxlength: "Email must not exceed 255 characters",
        },
        phone: {
          required: "Please enter your phone number",
          minlength: "Phone number must be at least 9 digits",
          maxlength: "Phone number must not exceed 20 characters",
        },
        role: {
          required: "Please select your role",
        },
        password: {
          required: "Please enter a password",
          minlength: "Password must be at least 8 characters",
        },
        confirmPassword: {
          required: "Please confirm your password",
          minlength: "Confirm password must be at least 8 characters",
          equalTo: "Passwords do not match",
        },
      },
      submitHandler: function (form, event) {
        event.preventDefault();
        RegisterService.register();
        return false;
      },
    });
  },

  register: function () {
    $.blockUI({ message: "Creating your account..." });

    var email = $("#email").val();
    var entity = {
      name: $("#firstName").val() + " " + $("#lastName").val(),
      email: email,
      password: $("#password").val(),
      phone: $("#phone").val(),
      role: $("#role").val(),
    };

    RestClient.post(
      "auth/register",
      entity,
      function (data) {
        $.unblockUI();
        toastr.success(
          "Registration successful! Redirecting to login...",
          "Success"
        );

        // Store email for pre-fill on login page
        localStorage.setItem("registration_email", email);

        // Clear form
        $("#register-form")[0].reset();

        // Redirect to login page after 1.5 seconds
        setTimeout(function () {
          window.location.href = "#login";
        }, 1500);
      },
      function (error) {
        $.unblockUI();
        const errorMsg =
          error.responseJSON?.error ||
          error.responseJSON?.message ||
          error.responseText ||
          "Registration failed. Please try again.";
        toastr.error(errorMsg, "Error");
      }
    );
  },
};
