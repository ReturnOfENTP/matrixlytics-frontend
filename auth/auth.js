document.addEventListener("DOMContentLoaded", () => {
  const signinForm = document.getElementById("signin-form");
  const signupForm = document.getElementById("signup-form");

  // ===== SIGN IN =====
  if (signinForm) {
    signinForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const payload = Object.fromEntries(new FormData(signinForm));

      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.error || "Login failed");
          return;
        }

        localStorage.setItem("token", data.token);
        window.location.href = "/";
      } catch (err) {
        console.error("Login error:", err);
        alert("Unable to connect. Please try again.");
      }
    });
  }

  // ===== SIGN UP =====
  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const payload = Object.fromEntries(new FormData(signupForm));

      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.error || "Signup failed");
          return;
        }

        if (data.token) {
          localStorage.setItem("token", data.token);
        }

        window.location.href = "/";
      } catch (err) {
        console.error("Signup error:", err);
        alert("Unable to connect. Please try again.");
      }
    });
  }
  
  });