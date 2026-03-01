(function () {
  'use strict';

  // Gold particle animation for hero section
  var canvas = document.querySelector('.hero-particles');
  if (canvas) {
    var ctx = canvas.getContext('2d');
    var particles = [];
    var particleCount = 45;

    function resizeCanvas() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function createParticle() {
      return {
        x: Math.random() * canvas.width,
        y: canvas.height + Math.random() * 20,
        size: Math.random() * 2 + 0.5,
        speedY: -(Math.random() * 0.4 + 0.15),
        speedX: (Math.random() - 0.5) * 0.3,
        opacity: 0,
        maxOpacity: Math.random() * 0.6 + 0.3,
        fadeIn: true,
        life: 0,
        maxLife: Math.random() * 400 + 300
      };
    }

    for (var i = 0; i < particleCount; i++) {
      var p = createParticle();
      p.y = Math.random() * canvas.height;
      p.life = Math.random() * p.maxLife;
      p.opacity = p.maxOpacity * 0.5;
      p.fadeIn = false;
      particles.push(p);
    }

    function animateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (var j = 0; j < particles.length; j++) {
        var pt = particles[j];
        pt.x += pt.speedX;
        pt.y += pt.speedY;
        pt.life++;

        if (pt.fadeIn && pt.opacity < pt.maxOpacity) {
          pt.opacity += 0.005;
          if (pt.opacity >= pt.maxOpacity) pt.fadeIn = false;
        }

        if (pt.life > pt.maxLife * 0.7) {
          pt.opacity -= 0.003;
        }

        if (pt.opacity <= 0 || pt.y < -10) {
          particles[j] = createParticle();
          particles[j].fadeIn = true;
          continue;
        }

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(200, 210, 225, ' + pt.opacity + ')';
        ctx.fill();
      }

      requestAnimationFrame(animateParticles);
    }

    animateParticles();
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;
      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Handle nav anchor links that include path (e.g., /#products)
  document.querySelectorAll('a[href^="/#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var hash = this.getAttribute('href').substring(1);
      var target = document.querySelector(hash);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Close mobile menu when a nav link is clicked
  var mobileMenu = document.querySelector('#main-menu-mobile');
  var menuToggle = document.querySelector('#toggle-main-menu-mobile');
  if (mobileMenu && menuToggle) {
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileMenu.classList.remove('open');
        menuToggle.classList.remove('is-active');
        document.body.classList.remove('lock-scroll');
      });
    });
  }

  // Scroll-triggered fade-in animations
  var fadeElements = document.querySelectorAll(
    '.section-story .container,' +
    '.product-card,' +
    '.benefit,' +
    '.review-card,' +
    '.blog-card,' +
    '.corporate-form-wrapper,' +
    '.section-instagram .container,' +
    '.section-contact .container'
  );

  fadeElements.forEach(function (el) {
    el.classList.add('fade-in');
  });

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    fadeElements.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    fadeElements.forEach(function (el) {
      el.classList.add('visible');
    });
  }


  // Active nav highlight on scroll
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.main-menu a, .main-menu-mobile a');

  function highlightNav() {
    var scrollPos = window.scrollY + 100;
    sections.forEach(function (section) {
      var top = section.offsetTop;
      var height = section.offsetHeight;
      var id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(function (link) {
          link.style.color = '';
          var href = link.getAttribute('href');
          if (href === '#' + id || href === '/#' + id) {
            link.style.color = '#c9a84c';
          }
        });
      }
    });
  }

  window.addEventListener('scroll', highlightNav, { passive: true });
  highlightNav();
})();
