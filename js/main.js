document.addEventListener("DOMContentLoaded", () => {
  const navbarLeft = document.getElementById("navbar-left");
  const navbarRight = document.getElementById("navbar-right");

  // Example auth check (replace with real logic)
  const loggedIn = false;

  // ===== NAVBAR POPULATION =====
  function populateNavbar() {
    if (loggedIn) {
      // LEFT: Dashboard label
      navbarLeft.innerHTML = `<span class="page-label active">Sites</span>`;

      // RIGHT: Billing, User, Settings
      navbarRight.innerHTML = `
        <a href="/pricing/index.html" class="nav-btn">Billing</a>
        <div class="user-circle">U</div>
        <a href="/settings/index.html" class="nav-btn">Settings</a>
      `;
    } else {
      // LEFT: Logo + Site Name
      navbarLeft.innerHTML = `
        <img src="/assets/images/pipboyapp.png" alt="Pipboy Logo" class="navbar-logo">
      `;

      // RIGHT: Pricing, Sign Up, Sign In
      navbarRight.innerHTML = `
        <a href="/pricing/index.html" class="nav-btn">
          <img src="/assets/images/pricing.png" class="nav-icon" alt="Pricing">
          <span>Pricing</span>
        </a>
        <a href="/webfront/auth/signup.html" class="nav-btn">
          <img src="/assets/images/signup.png" class="nav-icon" alt="Sign Up">
          <span>Sign Up</span>
        </a>
        <a href="/webfront/auth/signin.html" class="nav-btn">
          <img src="/assets/images/signin.png" class="nav-icon" alt="Sign In">
          <span>Sign In</span>
        </a>
      `;
    }

// Smooth scroll for Pricing link
const pricingLink = document.querySelector('.nav-btn[href*="pricing"]');
if (pricingLink) {
  pricingLink.addEventListener('click', (e) => {
    e.preventDefault(); // stop default navigation
    const target = document.getElementById('terminal-pricing');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // update URL hash without page reload
      history.pushState(null, null, '#pricing');
    }
  });
}

  }

  populateNavbar();

  // ===== HERO TYPED TEXT =====
  const heroTarget = document.getElementById("hero-typed");
  if (heroTarget && !loggedIn) {
    const text = "Old-school retro interface meets modern website tracking -fast & friendly-- A dashboard that cuts through noise, provides deep insights and joyful features while respecting your visitors' privacy.";

    const glitchSet = ["▓", "▒", "░", "▢", "◇", "#", "@", "%", "&"];
    const matrixSet = "abCdEFGHIJKLmNOpQRSTUVWXYz0123456789#$%&@".split("");

    const glitchProbability = 0.25;
    const typingMinDelay = 10;
    const typingMaxDelay = 30;
    const decodeMinCycles = 5;
    const decodeMaxCycles = 8;

    let index = 0;

    function randomFrom(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    }

    function typeNext() {
      if (index >= text.length) {
        // Typing finished — add gradient animation
        heroTarget.classList.add("hero-text-gradient");
        return;
      }

      const realChar = text[index];
      const span = document.createElement("span");

      const shouldGlitch = Math.random() < glitchProbability && realChar !== " ";
      if (shouldGlitch) {
        span.textContent = randomFrom(glitchSet);
        span.classList.add("glitch");
        heroTarget.appendChild(span);
        decodeCharacter(span, realChar);
      } else {
        span.textContent = realChar;
        heroTarget.appendChild(span);
      }

      index++;
      const delay = typingMinDelay + Math.random() * (typingMaxDelay - typingMinDelay);
      setTimeout(typeNext, delay);
    }

    function decodeCharacter(span, finalChar) {
      let cycles = 0;
      const maxCycles = decodeMinCycles + Math.floor(Math.random() * (decodeMaxCycles - decodeMinCycles + 1));

      const interval = setInterval(() => {
        span.textContent = randomFrom(matrixSet);
        cycles++;
        if (cycles >= maxCycles) {
          clearInterval(interval);
          span.textContent = finalChar;
          span.classList.remove("glitch");
        }
      }, 45 + Math.random() * 40);
    }

    setTimeout(typeNext, 250);
  }

  // ===== EXAMPLE IMAGE HOVER =====
  const exampleBox = document.querySelector('.example-box');
  const exampleImg = document.querySelector('.example-img');

  if (exampleBox && exampleImg) {
    exampleBox.addEventListener('mouseenter', () => {
      const angle = Math.random() < 0.5 ? -30 : 30;
      exampleImg.style.transform = `rotateY(${angle}deg)`;
    });

    exampleBox.addEventListener('mouseleave', () => {
      exampleImg.style.transform = `rotateY(0deg)`;
    });
  }

  // ===== PLANS DATA =====
  const plans = {
    blogger: {
      image: "/assets/images/hex-kudos.png",
      monthly: `$4 / MONTH

SITES: 2
HITS / MONTH: 10,000
STATUS: ACTIVE
FEATURES: ALL INCLUDED`,
      yearly: `$40 / YEAR

SITES: 2
HITS / MONTH: 10,000
STATUS: ACTIVE
FEATURES: ALL INCLUDED`
    },
    business: {
      image: "/assets/images/hex-content.png",
      monthly: `$7 / MONTH

SITES: 20
HITS / MONTH: 100,000
STATUS: MOST POPULAR
FEATURES: FULL ACCESS`,
      yearly: `$70 / YEAR

SITES: 20
HITS / MONTH: 100,000
STATUS: MOST POPULAR
FEATURES: FULL ACCESS`
    },
    enterprise: {
      image: "/assets/images/hex-uptime.png",
      monthly: `$15 / MONTH

ENTERPRISE MODULES:
• REAL-TIME WEBHOOK EVENTS
• MULTIPLE EMAIL RECIPIENTS
• CUSTOM UPTIME INTERVALS
• SECURED PUBLIC STATS
• GROUPED SITE REPORTING
• MORE FEATURES IN DEVELOPMENT`,
      yearly: `$150 / YEAR

ENTERPRISE MODULES:
• REAL-TIME WEBHOOK EVENTS
• MULTIPLE EMAIL RECIPIENTS
• CUSTOM UPTIME INTERVALS
• SECURE PUBLIC STATS (PASSCODE)
• GROUPED SITE REPORTING
• MORE FEATURES IN DEVELOPMENT`
    }
  };

  // ===== ELEMENTS =====
  const tabs = document.querySelectorAll(".tab");
  const output = document.getElementById("planOutput");
  const planImage = document.getElementById("planImage");
  const billingSwitch = document.getElementById("billingSwitch");

  let currentPlan = "blogger";
  let billingMode = "monthly";
  let typingInterval = null;

  // ===== TYPEWRITER EFFECT =====
  function typeText(text) {
    clearInterval(typingInterval);
    output.textContent = "";
    let i = 0;
    typingInterval = setInterval(() => {
      if (i < text.length) {
        output.textContent += text.charAt(i);
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, 12);
  }

  // ===== LOAD PLAN =====
  function loadPlan(planKey) {
    currentPlan = planKey;

    // Update image
    planImage.src = plans[planKey].image;

    // Typewriter content
    typeText(plans[planKey][billingMode]);

    // Highlight active tab
    tabs.forEach(tab => {
      const isActive = tab.dataset.plan === planKey;
      tab.classList.toggle("active", isActive);
      tab.setAttribute("aria-selected", isActive ? "true" : "false");
    });
  }

  // ===== TAB CLICK =====
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      loadPlan(tab.dataset.plan);
    });
  });

  // ===== BILLING TOGGLE =====
  billingSwitch.addEventListener("click", () => {
    billingMode = billingMode === "monthly" ? "yearly" : "monthly";
    billingSwitch.classList.toggle("yearly", billingMode === "yearly");
    loadPlan(currentPlan);
  });

  // ===== INITIALIZE =====
  loadPlan(currentPlan);

  // ===== FALL OUT BUTTON TYPEWRITER DELAYS =====
  // Free Trial Button - 9s delay on page load
  const freeTrialBtn = document.getElementById("free-trial-btn");
  if (freeTrialBtn) {
    const freeTrialText = freeTrialBtn.querySelector(".btn-text");
    freeTrialText.style.width = "0"; // hide initially

    setTimeout(() => {
      freeTrialText.style.animation = "typewriter 3s steps(60) forwards, blink 0.75s step-end infinite";
    }, 9000); // 9 second delay
  }

  // Need Something Else Badge - trigger when visible
  const needElseBtn = document.getElementById("need-something-else");
  if (needElseBtn) {
    const needElseText = needElseBtn.querySelector(".btn-text");
    needElseText.style.width = "0"; // hide initially

    const observer = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              needElseText.style.animation = "typewriter 2.5s steps(24) forwards, blink 0.75s step-end infinite";
            }, 2500); // 2.5s delay when visible
            observer.unobserve(entry.target); // only trigger once
          }
        });
      },
      { threshold: 0.5 } // 50% visible
    );

    observer.observe(needElseBtn);
  }

});
