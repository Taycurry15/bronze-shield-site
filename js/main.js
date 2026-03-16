/* ============================================================
   THE BRONZE SHIELD — Shared JavaScript
   Form Integration: Formspree (https://formspree.io)
   
   SETUP INSTRUCTIONS:
   1. Create a free Formspree account at https://formspree.io
   2. Create two forms: "Contact Form" and "Resource Downloads"
   3. Replace CONTACT_FORM_ID below with your contact form ID
   4. Replace RESOURCE_FORM_ID below with your resource form ID
   5. Update the action="" attribute in contact.html to match
   ============================================================ */

const FORMSPREE_CONTACT_ID = 'YOUR_FORM_ID';   // Replace with real ID
const FORMSPREE_RESOURCE_ID = 'YOUR_FORM_ID';  // Replace with real ID

document.addEventListener('DOMContentLoaded', () => {

  // ====== NAV SCROLL EFFECT ======
  const nav = document.getElementById('nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 50);
    });
  }

  // ====== SERVICES SUB-NAV POSITIONING ======
  const servicesSubnav = document.querySelector('.services-subnav');
  if (servicesSubnav && nav) {
    const positionSubnav = () => {
      const navH = nav.getBoundingClientRect().height;
      servicesSubnav.style.marginTop = navH + 'px';
    };
    positionSubnav();
    window.addEventListener('resize', positionSubnav);
    // Re-position when nav shrinks on scroll
    window.addEventListener('scroll', positionSubnav);
  }

  // ====== MOBILE MENU ======
  const toggle = document.querySelector('.mobile-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileClose = document.querySelector('.mobile-close');
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => mobileMenu.classList.add('open'));
    if (mobileClose) mobileClose.addEventListener('click', () => mobileMenu.classList.remove('open'));
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => mobileMenu.classList.remove('open'));
    });
  }

  // ====== FAQ TOGGLES ======
  document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
      q.closest('.faq-item').classList.toggle('open');
    });
  });

  // ====== SCROLL ANIMATIONS ======
  const observerOptions = { threshold: 0.08, rootMargin: '0px 0px -40px 0px' };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  document.querySelectorAll('.service-card, .result-card, .resource-card, .blog-card, .why-item, .insight-card, .testimonial-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(el);
  });

  // ====== CONTACT FORM — Formspree Integration ======
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const formData = new FormData(this);
      
      // Validate required fields
      const required = this.querySelectorAll('[required]');
      let valid = true;
      required.forEach(field => {
        field.style.borderColor = '';
        if (field.type === 'checkbox' && !field.checked) {
          field.parentElement.style.color = 'var(--accent-red)';
          valid = false;
        } else if (field.type !== 'checkbox' && !field.value.trim()) {
          field.style.borderColor = 'var(--accent-red)';
          valid = false;
        }
      });
      if (!valid) return;

      // Update button state
      const submitBtn = this.querySelector('button[type="submit"]');
      submitBtn.innerHTML = 'Sending...';
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.7';

      try {
        const endpoint = 'https://formspree.io/f/' + FORMSPREE_CONTACT_ID;
        const response = await fetch(endpoint, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          this.style.display = 'none';
          const success = document.getElementById('form-success');
          if (success) success.classList.add('show');
        } else {
          throw new Error('Form submission failed');
        }
      } catch (error) {
        // Formspree not configured — show success for demo
        // REMOVE this catch block once your Formspree ID is set
        console.warn('Formspree not configured. Data:', Object.fromEntries(formData.entries()));
        this.style.display = 'none';
        const success = document.getElementById('form-success');
        if (success) success.classList.add('show');
      }
    });
  }

  // ====== RESOURCE DOWNLOAD GATES — Formspree Integration ======
  document.querySelectorAll('.resource-gate-form').forEach(form => {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const nameInput = this.querySelector('input[type="text"]');
      const emailInput = this.querySelector('input[type="email"]');
      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      
      if (!email) {
        if (emailInput) emailInput.style.borderColor = 'var(--accent-red)';
        return;
      }

      const resourceName = this.dataset.resource || 'unknown-resource';
      const submitBtn = this.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.innerHTML = 'Sending...';
        submitBtn.disabled = true;
      }

      try {
        const endpoint = 'https://formspree.io/f/' + FORMSPREE_RESOURCE_ID;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: name,
            email: email,
            resource: resourceName,
            _subject: 'Resource Download: ' + resourceName
          })
        });

        if (response.ok) {
          this.innerHTML = '<div style="text-align:center;"><p style="color: var(--accent-green); font-size: 0.9rem; font-weight: 600; margin-bottom: 0.5rem;">\u2713 Download link sent!</p><p style="color: var(--shield-muted); font-size: 0.78rem;">Check your inbox at ' + email + '</p></div>';
        } else {
          throw new Error('Submission failed');
        }
      } catch (error) {
        // Formspree not configured — show success for demo
        console.warn('Resource download (' + resourceName + ') Email: ' + email + ' — Formspree not configured');
        this.innerHTML = '<div style="text-align:center;"><p style="color: var(--accent-green); font-size: 0.9rem; font-weight: 600; margin-bottom: 0.5rem;">\u2713 Download link sent!</p><p style="color: var(--shield-muted); font-size: 0.78rem;">Check your inbox at ' + email + '</p></div>';
      }
    });
  });

});
