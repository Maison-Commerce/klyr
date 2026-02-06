// @ts-nocheck
document.addEventListener("DOMContentLoaded", function () {
  // product slider js
  let swiper = new Swiper(".ff-product-slider", {
    slidesPerView: 'auto',
    spaceBetween: 8,
    scrollbar: {
      el: ".ff-scrollbar",
      draggable: true,
      snapOnRelease: true, // Optional: enable snapping behavior
    },
    breakpoints: {
      0: {
        slidesPerView: 'auto',
        spaceBetween: 8,
      },
      768: {
        slidesPerView: 'auto',
        spaceBetween: 8,
      },
      992: {
        slidesPerView: 'auto',
        spaceBetween: 8,
      },
      1200: {
        slidesPerView: 'auto',
        spaceBetween: 8,
      },
    },
  });

  // accordion js
  function setupAccordions(containerSelector) {
    const accordions = document.querySelectorAll(`${containerSelector} .accordion`);

    const openAccordion = (accordion) => {
      const content = accordion.querySelector(".accordion__content");
      accordion.classList.add("accordion__active");
      content.style.maxHeight = content.scrollHeight + "px";
    };

    const closeAccordion = (accordion) => {
      const content = accordion.querySelector(".accordion__content");
      accordion.classList.remove("accordion__active");
      content.style.maxHeight = null;
    };

    accordions.forEach((accordion) => {
      const intro = accordion.querySelector(".accordion__intro");
      const content = accordion.querySelector(".accordion__content");

      intro.onclick = () => {
        if (content.style.maxHeight) {
          closeAccordion(accordion);
        } else {
          accordions.forEach((acc) => closeAccordion(acc));
          openAccordion(accordion);
        }
      };
    });

    // if (accordions.length > 0) {
    //   openAccordion(accordions[0]);
    // }
  }

  // Call this function for each accordion section separately
  setupAccordions(".product-main-faq");
  setupAccordions(".product-main-faq02");
  setupAccordions(".footer-links-acc");

  function updateBodyScroll() {
    const anySidebarActive = document.querySelectorAll(".quickview-sidebar.active").length > 0;
    if (anySidebarActive) {
      document.body.classList.add("scroll_hidden");
    } else {
      document.body.classList.remove("scroll_hidden");
    }
  }

  document.querySelectorAll(".menu-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      document.getElementById(targetId)?.classList.add("active");
      document.querySelector(`.sidebar_overlay[data-target="${targetId}"]`)?.classList.add("active");

      updateBodyScroll();
    });
  });

  document.querySelectorAll(".close-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      document.getElementById(targetId)?.classList.remove("active");
      document.querySelector(`.sidebar_overlay[data-target="${targetId}"]`)?.classList.remove("active");

      updateBodyScroll();
    });
  });

  document.querySelectorAll(".sidebar_overlay").forEach((overlay) => {
    overlay.addEventListener("click", () => {
      const targetId = overlay.getAttribute("data-target");
      document.getElementById(targetId)?.classList.remove("active");
      overlay.classList.remove("active");

      updateBodyScroll();
    });
  });

  // sidebar product slider js
  // let swiper2 = new Swiper(".sd-product-slider", {
  //   slidesPerView: 3,
  //   spaceBetween: 'auto',
  //   scrollbar: {
  //     el: ".sd-scrollbar",
  //     draggable: true,
  //     snapOnRelease: true, // Optional: enable snapping behavior
  //   },
  //   navigation: {
  //     nextEl: ".swiper-button-next",
  //     prevEl: ".swiper-button-prev",
  //   },
  //   breakpoints: {
  //     0: {
  //       slidesPerView: 'auto',
  //       spaceBetween: 4,
  //     },
  //     1200: {
  //       slidesPerView: 'auto',
  //       spaceBetween: 4,
  //     },
  //   },
  // });

  function initUpsellSwiper() {
    const sliderEl = document.querySelector('.sd-product-slider');
    if (!sliderEl) return;

    // destroy old Swiper instance if exists
    if (sliderEl.swiper) {
      sliderEl.swiper.destroy(true, true);
    }

    new Swiper(sliderEl, {
      slidesPerView: 'auto',
      spaceBetween: 4,
      scrollbar: { el: ".sd-scrollbar", draggable: true, snapOnRelease: true },
      navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" }
    });
  }

  // target the cart drawer content
  const drawer = document.querySelector('.cart-drawer__inner');
  const drawerButton = document.querySelector('.cart-drawer .header-actions__action');
  drawerButton?.addEventListener('click', () => {
    setTimeout(() => {
      initUpsellSwiper();
    }, 100);
  });

  if (drawer) {
    // initialize once at page load
    initUpsellSwiper();

    // setup mutation observer
    const observer = new MutationObserver(() => {
      observer.disconnect(); // stop watching while we update
      initUpsellSwiper();
      setTimeout(() => {
        observer.observe(drawer, { childList: true, subtree: true });
      }, 100); // delay to avoid infinite loop
    });

    observer.observe(drawer, { childList: true, subtree: true });
  }


  // navbar menu js code
  const menuToggle = document.querySelector(".nav-menu-toggle");
  const headerGroup = document.querySelector("#header-group");
  const offcanvas = document.getElementById("offcanvas");
  const closeBtn = document.querySelector(".nav-close-btn");
  const overlay = document.querySelector(".nav-overlay");

  menuToggle?.addEventListener("click", () => {
    headerGroup.classList.toggle('mobile_menu_active');
    offcanvas?.classList.remove("closing");
    offcanvas?.classList.add("active");
    overlay?.classList.add("active");
    document.body.classList.add("scroll_hidden");
  });

  closeBtn?.addEventListener("click", () => {
    headerGroup.classList.toggle('mobile_menu_active');
    offcanvas?.classList.remove("active");
    offcanvas?.classList.add("closing");
    overlay?.classList.remove("active");
    document.body.classList.remove("scroll_hidden");
  });

  overlay?.addEventListener("click", () => {
    offcanvas?.classList.remove("active");
    overlay.classList.remove("active");
    document.body.classList.remove("scroll_hidden");
  });

  // Menu sticky
  window.addEventListener("scroll", function () {
    const scrollTopValue = window.scrollY;
    const menuArea = document.querySelector(".header-navbar");

    if (scrollTopValue > 110) {
      menuArea?.classList.add("menu-sticky");
    } else {
      menuArea?.classList.remove("menu-sticky");
    }
  });

  // sidebar product slider js
  let swiper3 = new Swiper(".single-product-slider", {
    slidesPerView: 1,
    spaceBetween: 0,
    scrollbar: {
      el: ".sng-slider-scrollbar",
      draggable: true,
      snapOnRelease: true,
    },
    navigation: {
      nextEl: ".sng-slider-next",
      prevEl: ".sng-slider-prev",
    },
    on: {
      init: function () {
        toggleVideos(this); // initial slide
      },
      slideChangeTransitionEnd: function () {
        toggleVideos(this); // run after transition completes
      }
    }
  });

  function toggleVideos(swiperInstance) {
    swiperInstance.slides.forEach((slide) => {
      const video = slide.querySelector('video');
      if (video) {
        if (slide.classList.contains('swiper-slide-active')) {
          video.play().catch(() => {}); // Play active video
        } else {
          video.pause(); // Pause inactive videos
        }
      }
    });
  }

  const activeVideo = document.querySelector('.swiper-slide-active video');
  if (activeVideo) activeVideo.play().catch(() => {});

  document.querySelectorAll('.product-details .variant-option__button-label--has-swatch').forEach(label => {
    label.addEventListener('click', function () {
      const imageId = this.getAttribute('data-image-id');
      const swiper = document.querySelector('.single-product-slider')?.swiper;

      if (!swiper || !imageId) return;

      // Find the slide index that matches the image ID
      const slides = document.querySelectorAll('.single-product-slider .swiper-slide img');
      for (let i = 0; i < slides.length; i++) {
        if (slides[i].getAttribute('data-image-id') === imageId) {
          swiper.slideTo(i);
          break;
        }
      }
    });
  });


  // find your shade modal
  const openModalBtn = document.querySelector(".open-modal-btn");
  const modalOverlay = document.getElementById("customModalOverlay");
  const closeButtons = document.querySelectorAll(".custom-close-btn, .custom-modal-close");

  openModalBtn?.addEventListener("click", () => {
    modalOverlay.style.display = "flex";
    document.body.classList.add('scroll_hidden');
  });

  closeButtons?.forEach((btn) =>
    btn.addEventListener("click", () => {
      modalOverlay.style.display = "none";
      document.body.classList.remove('scroll_hidden');
    })
  );

  modalOverlay?.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
      modalOverlay.style.display = "none";
      document.body.classList.remove('scroll_hidden');
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      modalOverlay.style.display = "none";
      document.body.classList.remove('scroll_hidden');
    }
  });


  //  tab js
  const tabLinks = document.querySelectorAll(".tab-link");
  const tabContents = document.querySelectorAll(".tab-content");

  tabLinks.forEach(function (tab) {
    tab.addEventListener("click", function () {
      const tabId = this.getAttribute("data-tab");

      tabLinks.forEach((t) => t.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));

      this.classList.add("active");
      document.getElementById(tabId)?.classList.add("active");
    });
  });

  // show more less content js
  const toggleButton = document.querySelector(".tab-content .toggle-btn");

  toggleButton?.addEventListener("click", function () {
    // toggleButton.style.display = 'none';
    const tabContent = toggleButton.closest(".tab-content");
    const tabInner = toggleButton.closest(".tab-inner");
    const description = tabInner.querySelector(".tab-description");
    const label = toggleButton.querySelector(".label");

    description.classList.toggle("expanded");
    toggleButton.classList.toggle("active");

    if (description.classList.contains("expanded")) {
      label.textContent = "Show Less";
      tabContent.classList.add("after-none");
    } else {
      label.textContent = "Show More";
      tabContent.classList.remove("after-none");
    }
  });

  // logo slide cloned
  // if (window.matchMedia("(max-width: 575px)").matches) {
  //   const logoContainer = document.querySelector(".brands-logos-inner");

  //   if (logoContainer && !logoContainer.dataset.copied) {
  //     const logos = logoContainer.querySelectorAll('.single-logo');
  //     logoContainer.classList.add('marquee');

  //     logos.forEach(logo => {
  //       const clone = logo.cloneNode(true); // Deep clone the node
  //       logoContainer.appendChild(clone);   // Append the clone
  //     });

  //     // Set flag to prevent future duplication
  //     logoContainer.dataset.copied = 'true';
  //   }
  // }

  // pp-product-slider js
  let swiper4 = new Swiper(".pp-product-slider", {
    slidesPerView: 'auto',
    spaceBetween: 8,
    scrollbar: {
      el: ".pp-product-scrollbar",
      draggable: true,
      snapOnRelease: true, // Optional: enable snapping behavior
    },
    breakpoints: {
      0: {
        slidesPerView: 'auto',
        spaceBetween: 8,
      },
      575: {
        slidesPerView: 'auto',
        spaceBetween: 8,
      },
      768: {
        slidesPerView: 'auto',
        spaceBetween: 8,
      },
      1200: {
        slidesPerView: 'auto',
        spaceBetween: 8,
      },
    },
  });


  // get section width
  function setSectionWidth() {
    const root = document.documentElement;
    root.style.setProperty("--full-width",`${root.clientWidth}px`);
  };
  // setSectionWidth();
  window.addEventListener("resize", setSectionWidth);
  window.addEventListener('load', setSectionWidth);

  // toggle fixed/absolute
  // function handleScroll() {
  //   const headerComp = document.getElementById('header-component');
  //   if (window.scrollY === 0) {
  //     headerComp.classList.add('top');
  //     headerComp.classList.remove('scrolled');
  //   } else {
  //     headerComp.classList.add('scrolled');
  //     headerComp.classList.remove('top');
  //   }
  // }

  // window.addEventListener('scroll', handleScroll);
  // window.addEventListener('load', handleScroll);
});
