const schemaData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://mytuitioncenter.pk/#organization",
        "name": "My Tuition Center",
        "url": "https://mytuitioncenter.pk/",
        "logo": "https://mytuitioncenter.pk/logo-black.png",
        "description": "Leading educational institution in Karachi, Pakistan offering hands-on Shopify dropshipping and eCommerce training."
      },
      {
        "@type": "Course",
        "name": "Shopify Dropshipping Mastery",
        "description": "A comprehensive course on building, managing, and scaling a successful Shopify dropshipping business in Pakistan.",
        "provider": {
          "@id": "https://mytuitioncenter.pk/#organization"
        },
        "author": {
          "@type": "Person",
          "name": "M Numan Latif"
        },
        "audience": {
          "@type": "Audience",
          "audienceType": "Beginners and Intermediate Entrepreneurs in Karachi, Pakistan"
        }
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Do I need prior coding experience?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No. Our Shopify development module starts from scratch and utilizes visual builders alongside easy-to-understand code tweaks."
            }
          },
          {
            "@type": "Question",
            "name": "Is this possible from Pakistan?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, 100%. We dedicate an entire module to LLC/LTD formation to ensure you have legal standing to use global payment gateways."
            }
          },
          {
            "@type": "Question",
            "name": "What is the Shopify/Business split?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "70% of the course focuses on high-level Shopify UI/UX development, while 30% focuses on the logistics and legalities of business setup."
            }
          }
        ]
      }
    ]
  }

const API_BASE = 'https://cms.mytuitioncenter.pk/wp-json/mtc/v1';

    function navigate(pageId) {
      // Show Loader
      const loader = document.getElementById('loader-overlay');
      loader.classList.add('active');

      // Close mobile menu
      document.getElementById('navLinks').classList.remove('active');
      window.scrollTo(0, 0);

      // Simulate network transition
      setTimeout(() => {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
          page.classList.remove('active');
          page.classList.remove('shimmer-active');
        });
        
        // Show target page
        const targetPage = document.getElementById('page-' + pageId);
        if (targetPage) {
          targetPage.classList.add('active');
          
          // Trigger shimmer effect
          requestAnimationFrame(() => {
            targetPage.classList.add('shimmer-active');
          });

          // Remove shimmer class after animation completes
          setTimeout(() => {
            targetPage.classList.remove('shimmer-active');
          }, 1000);
          
          // Update body theme (Dark vs Light track)
          const theme = targetPage.getAttribute('data-theme');
          document.body.className = theme;

          // Update Header buttons based on theme
          const btnOut = document.getElementById('headerBtnOut');
          const btnPrimary = document.getElementById('headerBtnPrimary');
          
          if (theme === 'transactional-light') {
            btnOut.className = 'btn btn-outline-light';
            btnPrimary.className = 'btn btn-primary';
            document.querySelectorAll('.footer-links div').forEach(el => el.style.color = 'var(--ink)');
          } else {
            btnOut.className = 'btn btn-outline-dark';
            btnPrimary.className = 'btn btn-outline-dark';
            document.querySelectorAll('.footer-links div').forEach(el => el.style.color = 'var(--on-primary)');
          }
        }
        
        // Hide loader
        loader.classList.remove('active');
      }, 600); // 600ms SVG loading duration
    }

    // Modal Logic
    function openModal(plan) {
      const modal = document.getElementById('enroll-modal');
      const select = document.getElementById('enroll-plan');
      
      if(plan === 'Basic' || plan === 'Mastery') {
        select.value = plan;
      }
      
      // Reset form view
      document.getElementById('enrollment-form').style.display = 'block';
      document.getElementById('enroll-success').style.display = 'none';
      document.getElementById('file-error').innerText = '';
      
      modal.classList.add('active');
    }

    function closeModal() {
      document.getElementById('enroll-modal').classList.remove('active');
    }

    let ocrPromise = null;
    let ocrStatus = null;

    document.addEventListener('DOMContentLoaded', () => {
      const fileInput = document.getElementById('enroll-receipt');
      const planSelect = document.getElementById('enroll-plan');
      const statusText = document.getElementById('ocr-status');
      
      fileInput.addEventListener('change', async () => {
        statusText.innerText = '';
        ocrStatus = null;
        ocrPromise = null;

        if (fileInput.files.length === 0 || typeof Tesseract === 'undefined') return;

        const file = fileInput.files[0];
        if (!file.type.startsWith('image/')) return;

        statusText.style.color = 'var(--shade-50)';
        statusText.innerText = 'Scanning receipt for payment amount... ⏳';

        const plan = planSelect.value;
        
        ocrPromise = (async () => {
          try {
            const worker = await Tesseract.createWorker('eng');
            const ret = await worker.recognize(file);
            const text = ret.data.text.replace(/,/g, '');
            await worker.terminate();

            let foundAmount = false;
            if (plan === 'Basic' && (text.includes('15000') || text.includes('15 000'))) {
              foundAmount = true;
            } else if (plan === 'Mastery' && (text.includes('35000') || text.includes('35 000'))) {
              foundAmount = true;
            }

            if (foundAmount) {
              ocrStatus = 'success';
              statusText.style.color = 'green';
              statusText.innerText = '✅ Amount verified!';
            } else {
              ocrStatus = 'warning';
              statusText.style.color = '#d97706';
              statusText.innerText = '⚠️ Warning: We couldn\'t automatically verify the payment amount. Your application will require manual review.';
            }
          } catch (e) {
            console.error("OCR Failed:", e);
            statusText.innerText = ''; 
            ocrStatus = 'warning';
          }
        })();
      });

      planSelect.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
          fileInput.dispatchEvent(new Event('change'));
        }
      });
    });

    // API Handlers
    async function submitEnrollment(event) {
      event.preventDefault();
      
      const fileInput = document.getElementById('enroll-receipt');
      const fileError = document.getElementById('file-error');
      const btn = document.getElementById('enroll-submit-btn');
      
      // File Size Validation (Max 5MB = 5 * 1024 * 1024 bytes)
      if (fileInput.files.length > 0) {
        const fileSize = fileInput.files[0].size;
        if (fileSize > 5242880) {
          fileError.innerText = '❌ File is too large. Maximum size is 5MB.';
          fileError.style.color = 'red';
          return;
        } else {
          fileError.innerText = '';
        }
      }

      const spinnerSvg = `<svg viewBox="0 0 50 50" style="width: 18px; height: 18px; margin-right: 8px; animation: spin 1s linear infinite;"><circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-dasharray="80" stroke-dashoffset="60"></circle></svg>`;
      
      if (ocrPromise) {
        btn.innerHTML = `${spinnerSvg} Finalizing scan...`;
        btn.disabled = true;
        await ocrPromise;
      }

      btn.innerHTML = `${spinnerSvg} Submitting Application...`;

      // Prepare FormData for multipart/form-data upload
      const form = document.getElementById('enrollment-form');
      const formData = new FormData(form);
      

      // Mocking API call so the UI flow can be seen locally
      setTimeout(() => {
        form.reset();
        form.style.display = 'none';
        document.getElementById('enroll-success').style.display = 'block';
        
        btn.innerText = 'Submit Application';
        btn.disabled = false;
      }, 1500);
    }

    async function submitContact(event) {
      event.preventDefault();
      const name = document.getElementById('contact-name').value;
      const email = document.getElementById('contact-email').value;
      const message = document.getElementById('contact-message').value;
      const btn = event.target.querySelector('button[type="submit"]');
      const originalText = btn ? btn.innerText : 'Send Message';
      
      if (btn) {
        const spinnerSvg = `<svg viewBox="0 0 50 50" style="width: 18px; height: 18px; margin-right: 8px; animation: spin 1s linear infinite;"><circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-dasharray="80" stroke-dashoffset="60"></circle></svg>`;
        btn.innerHTML = `${spinnerSvg} Sending...`;
        btn.disabled = true;
      }

      // Mocking API call so the UI flow can be seen locally
      setTimeout(() => {
        const container = document.getElementById('contact-form-container');
        if (container) {
          container.innerHTML = `<div style="text-align: center; padding: 40px;"><h3 style="color: green;">✅ Message Sent!</h3><p style="margin-top: 10px;">Thank you, ${name}. We will get back to you shortly.</p></div>`;
        }
      }, 1500);
    }

    async function submitLead() {
      const email = document.getElementById('lead-email').value;
      if (!email) { alert('Please enter an email address'); return; }

      const btn = document.querySelector('#lead-form-container button');
      const originalText = btn.innerText;
      const spinnerSvg = `<svg viewBox="0 0 50 50" style="width: 18px; height: 18px; margin-right: 8px; animation: spin 1s linear infinite;"><circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-dasharray="80" stroke-dashoffset="60"></circle></svg>`;
      btn.innerHTML = `${spinnerSvg} Processing...`;
      btn.disabled = true;

      try {
        const response = await fetch(`${API_BASE}/leads`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, source: 'guide' })
        });
        if (response.ok) {
          const container = document.getElementById('lead-form-container');
          container.innerHTML = `<div style="padding: 12px; background-color: var(--canvas-light); border-radius: 8px; color: green; font-weight: 500;">✅ Guide sent to ${email}</div>`;
        } else {
          alert('Failed to submit. Please try again.');
          btn.innerHTML = originalText;
          btn.disabled = false;
        }
      } catch (err) {
        alert('Failed to submit. Please try again.');
        btn.innerHTML = originalText;
        btn.disabled = false;
      }
    }

