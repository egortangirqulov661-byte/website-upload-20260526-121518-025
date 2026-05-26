(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var nextButton = hero.querySelector("[data-hero-next]");
      var prevButton = hero.querySelector("[data-hero-prev]");
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }

        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });

        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5000);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
        }
      }

      if (nextButton) {
        nextButton.addEventListener("click", function () {
          show(current + 1);
          start();
        });
      }

      if (prevButton) {
        prevButton.addEventListener("click", function () {
          show(current - 1);
          start();
        });
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
          start();
        });
      });

      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      show(0);
      start();
    }

    var filterForm = document.querySelector("[data-filter-form]");

    if (filterForm) {
      var searchInput = filterForm.querySelector("[data-filter-search]");
      var yearSelect = filterForm.querySelector("[data-filter-year]");
      var regionSelect = filterForm.querySelector("[data-filter-region]");
      var genreSelect = filterForm.querySelector("[data-filter-genre]");
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-title]"));
      var resultCount = document.querySelector("[data-result-count]");

      function includes(value, query) {
        return String(value || "").toLowerCase().indexOf(String(query || "").toLowerCase()) !== -1;
      }

      function applyFilter() {
        var query = searchInput ? searchInput.value.trim() : "";
        var year = yearSelect ? yearSelect.value : "";
        var region = regionSelect ? regionSelect.value : "";
        var genre = genreSelect ? genreSelect.value : "";
        var count = 0;

        cards.forEach(function (card) {
          var cardTitle = card.getAttribute("data-title") || "";
          var cardYear = card.getAttribute("data-year") || "";
          var cardRegion = card.getAttribute("data-region") || "";
          var cardGenre = card.getAttribute("data-genre") || "";
          var cardCategory = card.getAttribute("data-category") || "";
          var ok = true;

          if (query) {
            ok = includes(cardTitle + " " + cardRegion + " " + cardGenre + " " + cardCategory, query);
          }

          if (ok && year) {
            ok = cardYear === year;
          }

          if (ok && region) {
            ok = includes(cardRegion, region);
          }

          if (ok && genre) {
            ok = includes(cardGenre + " " + cardCategory, genre);
          }

          card.style.display = ok ? "" : "none";

          if (ok) {
            count += 1;
          }
        });

        if (resultCount) {
          resultCount.textContent = String(count);
        }
      }

      [searchInput, yearSelect, regionSelect, genreSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilter);
          control.addEventListener("change", applyFilter);
        }
      });

      applyFilter();
    }
  });
})();
