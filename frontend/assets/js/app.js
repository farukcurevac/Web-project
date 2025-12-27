// Configure SPAPP routes and initialize page-specific logic when views are shown
var app = $.spapp({
  defaultView: "#home",
  templateDir: "./views/",
});

// Home view: initialize search/featured cars once the view is ready
app.route({
  view: "home",
  onReady: function () {
    if (window.initHomePage) window.initHomePage();
  },
});

// Add car view
app.route({
  view: "add",
  onReady: function () {
    if (window.initAddPage) window.initAddPage();
  },
});

// Profile view
app.route({
  view: "profile",
  onReady: function () {
    if (window.initProfilePage) window.initProfilePage();
  },
});

// Simple routes for login/register
app.route({
  view: "login",
  onReady: function () {
    if (window.UserService && typeof UserService.init === "function") {
      UserService.init();
    }
  },
});

app.route({
  view: "register",
  onReady: function () {
    if (window.RegisterService && typeof RegisterService.init === "function") {
      RegisterService.init();
    }
  },
});

// Dashboard view: user profile and listings
app.route({
  view: "dashboard",
  onReady: function () {
    if (
      window.DashboardService &&
      typeof DashboardService.init === "function"
    ) {
      DashboardService.init();
    }
  },
});

// Admin panel view
app.route({
  view: "admin",
  onReady: function () {
    if (window.AdminService && typeof AdminService.init === "function") {
      AdminService.init();
    }
  },
});

// Cars management view
app.route({
  view: "cars",
  onReady: function () {
    if (window.CarService && typeof CarService.init === "function") {
      CarService.init();
    }
  },
});

// Buy Cars view
app.route({
  view: "buy-cars",
  onReady: function () {
    console.log("Buy Cars route onReady triggered");
    // Small delay to ensure DOM is fully loaded
    setTimeout(function () {
      if (window.BuyCarsService && typeof BuyCarsService.init === "function") {
        console.log("Calling BuyCarsService.init()");
        BuyCarsService.init();
      } else {
        console.error("BuyCarsService not available!");
      }
    }, 100);
  },
});

app.run();

// Update navigation based on authentication status
$(document).ready(function () {
  updateNavigation();
});

// Function to update navigation based on user role
function updateNavigation() {
  const nav = document.getElementById("mainNav");
  const token = localStorage.getItem("user_token");

  if (!token) {
    // Not logged in - show login and register
    nav.innerHTML = `
      <li><a href="#home">Home</a></li>
      <li><a href="#login">Login</a></li>
      <li><a href="#register">Register</a></li>
    `;
  } else {
    // Logged in - check role
    const user = Utils.getCurrentUser();
    if (user && user.role === Constants.ADMIN_ROLE) {
      // Admin navigation
      nav.innerHTML = `
        <li><a href="#home">Home</a></li>
        <li><a href="#admin">Admin Panel</a></li>
        <li><a href="#cars">Manage Cars</a></li>
        <li><a href="#dashboard">My Profile</a></li>
        <li><a href="#" onclick="UserService.logout()" class="btn-logout">Logout</a></li>
      `;
    } else if (user && user.role === Constants.USER_ROLE) {
      // Regular user navigation
      nav.innerHTML = `
        <li><a href="#home">Home</a></li>
        <li><a href="#buy-cars">Buy Cars</a></li>
        <li><a href="#dashboard">My Dashboard</a></li>
        <li><a href="#add">Sell a Car</a></li>
        <li><a href="#" onclick="UserService.logout()" class="btn-logout">Logout</a></li>
      `;
    }
  }
}

// Update navigation on hash change (when navigating between views)
window.addEventListener("hashchange", function () {
  updateNavigation();
});
