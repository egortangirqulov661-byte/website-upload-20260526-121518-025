(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".main-nav");

    if (menuButton && nav) {
      menuButton.addEventListener("click", function () {
        var open = nav.classList.toggle("is-open");
        menuButton.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var next = document.querySelector(".hero-arrow.next");
    var prev = document.querySelector(".hero-arrow.prev");
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("is-active", itemIndex === current);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("is-active", itemIndex === current);
      });
    }

    function startHero() {
      if (slides.length < 2) {
        return;
      }
      clearInterval(timer);
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    if (slides.length) {
      startHero();
      if (next) {
        next.addEventListener("click", function () {
          showSlide(current + 1);
          startHero();
        });
      }
      if (prev) {
        prev.addEventListener("click", function () {
          showSlide(current - 1);
          startHero();
        });
      }
      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          showSlide(index);
          startHero();
        });
      });
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]")).forEach(function (panel) {
      var root = panel.parentElement || document;
      var cards = Array.prototype.slice.call(root.querySelectorAll(".js-movie-card"));
      var search = panel.querySelector(".js-search-input");
      var region = panel.querySelector(".js-filter-region");
      var year = panel.querySelector(".js-filter-year");
      var category = panel.querySelector(".js-filter-category");

      function normalize(value) {
        return String(value || "").toLowerCase().trim();
      }

      function update() {
        var q = normalize(search && search.value);
        var selectedRegion = normalize(region && region.value);
        var selectedYear = normalize(year && year.value);
        var selectedCategory = normalize(category && category.value);

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-category")
          ].join(" "));
          var ok = true;

          if (q && haystack.indexOf(q) === -1) {
            ok = false;
          }
          if (selectedRegion && normalize(card.getAttribute("data-region")).indexOf(selectedRegion) === -1) {
            ok = false;
          }
          if (selectedYear && normalize(card.getAttribute("data-year")) !== selectedYear) {
            ok = false;
          }
          if (selectedCategory && normalize(card.getAttribute("data-category")) !== selectedCategory) {
            ok = false;
          }

          card.classList.toggle("is-hidden-card", !ok);
        });
      }

      [search, region, year, category].forEach(function (control) {
        if (control) {
          control.addEventListener("input", update);
          control.addEventListener("change", update);
        }
      });
    });
  });
})();

function initMoviePlayer(streamUrl) {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var video = document.getElementById("movie-player");
    var overlay = document.querySelector(".player-overlay");
    var attached = false;
    var hls = null;

    if (!video || !streamUrl) {
      return;
    }

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    }

    function playVideo() {
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {});
      }
    }

    function attachStream() {
      if (attached) {
        playVideo();
        return;
      }

      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        video.addEventListener("loadedmetadata", playVideo, { once: true });
        playVideo();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
        return;
      }

      video.src = streamUrl;
      video.addEventListener("loadedmetadata", playVideo, { once: true });
      playVideo();
    }

    function start() {
      hideOverlay();
      attachStream();
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener("play", hideOverlay);

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  });
}
