// ===== Scroll Reveal =====
const revealSections = document.querySelectorAll('.reveal-section');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, {
  threshold: 0.15,
  rootMargin: '0px 0px -50px 0px'
});

revealSections.forEach(section => revealObserver.observe(section));

// ===== Video Play/Pause =====
const video = document.getElementById('demoVideo');
const overlay = document.getElementById('videoOverlay');

overlay.addEventListener('click', () => {
  video.play();
  overlay.classList.add('hidden');
});

video.addEventListener('click', () => {
  if (video.paused) {
    video.play();
    overlay.classList.add('hidden');
  } else {
    video.pause();
    overlay.classList.remove('hidden');
  }
});

// ===== Reveal secret words on scroll =====
const secretContent = document.getElementById('secretContent');

const secretObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      secretContent.classList.add('revealed');

      const words = secretContent.querySelectorAll('.word-animate');
      words.forEach((el, i) => {
        el.style.animationDelay = (i * 0.12) + 's';
        el.classList.add('word-in');
      });

      // After all words are done, typewrite the kicker
      const wordsDuration = words.length * 120 + 500; // ms
      setTimeout(() => {
        typewrite('secretKicker', 'Yeah, we went there.', 60, () => {
          // After typewriter done, show reveal button
          const btnWrapper = document.querySelector('.reveal-btn-wrapper');
          btnWrapper.classList.add('show');
        });
      }, wordsDuration);

      secretObserver.disconnect();
    }
  });
}, {
  threshold: 0.3
});

secretObserver.observe(document.getElementById('secret'));

// ===== Typewriter =====
function typewrite(elementId, text, speed, callback) {
  const el = document.getElementById(elementId);
  const cursor = document.createElement('span');
  cursor.className = 'typewriter-cursor';
  el.appendChild(cursor);

  let i = 0;
  function type() {
    if (i < text.length) {
      el.insertBefore(document.createTextNode(text.charAt(i)), cursor);
      i++;
      setTimeout(type, speed);
    } else {
      // Remove cursor after a short pause
      setTimeout(() => {
        cursor.remove();
        if (callback) callback();
      }, 800);
    }
  }
  type();
}

// ===== Reveal Button — Show second video below text =====
document.getElementById('revealBtn').addEventListener('click', () => {
  const videoWrapper = document.getElementById('secretVideoWrapper');
  const secretVideo = document.getElementById('secretVideo');

  // Hide the reveal button
  document.querySelector('.reveal-btn-wrapper').style.display = 'none';

  // Show video below the text
  videoWrapper.style.display = 'block';
  requestAnimationFrame(() => {
    videoWrapper.classList.add('visible');
    videoWrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
    secretVideo.play();

    // Unhide remaining sections after scroll settles
    setTimeout(() => {
      document.querySelectorAll('.hidden-until-reveal').forEach(el => {
        el.classList.remove('hidden-until-reveal');
      });
    }, 1200);
  });
});
