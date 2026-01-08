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
  
      // Right: pricing, sign up, sign in ++ ICONS 01/07/26
      navbarRight.innerHTML = `
      <a href="/pricing/index.html" class="nav-btn">
        <img src="/assets/images/pricing.png" class="nav-icon" alt="Pricing">
        <span>Pricing</span>
      </a>
      <a href="/auth/sign_up.html" class="nav-btn">
        <img src="/assets/images/signup.png" class="nav-icon" alt="Sign Up">
        <span>Sign Up</span>
      </a>
      <a href="/auth/sign_in.html" class="nav-btn">
        <img src="/assets/images/signin.png" class="nav-icon" alt="Sign In">
        <span>Sign In</span>
      </a>
    `;
  }

  
});
  
document.addEventListener("DOMContentLoaded", () => {
  const target = document.getElementById("hero-typed");
  if (!target) return;

  // Only run on homepage when NOT logged in
  const loggedIn = false; // replace later with real auth logic
  if (loggedIn) return;

  const text = "Old-school retro interface meets modern website tracking.";

  // Character pools
  const glitchSet = ["▓", "▒", "░", "▢", "◇", "#", "@", "%", "&"];
  const matrixSet = "abCdEFGHIJKLmNOpQRSTUVWXYz0123456789#$%&@".split("");

  // Tuning parameters
  const glitchProbability = 0.25; // % of characters that spawn "wrong"
  const typingMinDelay = 10;
  const typingMaxDelay = 30;
  const decodeMinCycles = 5;
  const decodeMaxCycles = 8;

  let index = 0;

  function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function typeNext() {
    if (index >= text.length) return;

    const realChar = text[index];
    const span = document.createElement("span");

    // Decide if this character is "born wrong"
    const shouldGlitch = Math.random() < glitchProbability && realChar !== " ";

    if (shouldGlitch) {
      // Start with a wrong character
      span.textContent = randomFrom(glitchSet);
      span.classList.add("glitch");
      target.appendChild(span);

      // Begin live decoding immediately
      decodeCharacter(span, realChar);
    } else {
      // Normal typing
      span.textContent = realChar;
      target.appendChild(span);
    }

    index++;

    const delay =
      typingMinDelay + Math.random() * (typingMaxDelay - typingMinDelay);
    setTimeout(typeNext, delay);
  }

  function decodeCharacter(span, finalChar) {
    let cycles = 0;
    const maxCycles =
      decodeMinCycles +
      Math.floor(Math.random() * (decodeMaxCycles - decodeMinCycles + 1));

    const interval = setInterval(() => {
      // Cycle through Matrix-style characters
      span.textContent = randomFrom(matrixSet);
      cycles++;

      if (cycles >= maxCycles) {
        clearInterval(interval);
        span.textContent = finalChar;
        span.classList.remove("glitch");
      }
    }, 45 + Math.random() * 40);
  }

  // Start typing shortly after load
  setTimeout(typeNext, 250);
});

//*HOVER OVER EXAMPLE IMAGE **// 

const exampleBox = document.querySelector('.example-box');
const exampleImg = document.querySelector('.example-img');

exampleBox.addEventListener('mouseenter', () => {
  const angle = Math.random() < 0.5 ? -30 : 30; // 50/50 chance
  exampleImg.style.transform = `rotateY(${angle}deg)`;
});

exampleBox.addEventListener('mouseleave', () => {
  exampleImg.style.transform = `rotateY(0deg)`; // return to normal
});

