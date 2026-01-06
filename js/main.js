document.addEventListener("DOMContentLoaded", () => {
    const navbarLeft = document.getElementById("navbar-left");
    const navbarRight = document.getElementById("navbar-right");
  
    // Example: Check if user is logged in
    const loggedIn = false; // Replace with actual auth check
  
    if (loggedIn) {
      // Left: dashboard page label
      navbarLeft.innerHTML = `<span class="page-label active">Sites</span>`;
  
      // Right: billing, user-circle, settings
      navbarRight.innerHTML = `
        <a href="/pricing/index.html" class="nav-btn">Billing</a>
        <div class="user-circle">U</div>
        <a href="/settings/index.html" class="nav-btn">Settings</a>
      `;
    } else {
      // Left: logo + site name
      navbarLeft.innerHTML = `
        <div class="logo"></div>
        <span class="site-name">pipboy.app</span>
      `;
  
      // Right: pricing, sign up, sign in
      navbarRight.innerHTML = `
        <a href="/pricing/index.html" class="nav-btn">Pricing</a>
        <a href="/auth/sign_up.html" class="nav-btn">Sign Up</a>
        <a href="/auth/sign_in.html" class="nav-btn">Sign In</a>
      `;
    }
  });
  