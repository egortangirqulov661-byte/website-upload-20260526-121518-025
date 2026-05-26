(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    bindMobileMenu();
    bindHeroCarousel();
    bindFilters();
    bindPlayer();
  });

  function bindMobileMenu() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function bindHeroCarousel() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(
      carousel.querySelectorAll(".hero-slide"),
    );
    var dots = Array.prototype.slice.call(
      carousel.querySelectorAll(".hero-dot"),
    );
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
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

    function move(step) {
      show(current + step);
      restart();
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        move(-1);
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        move(1);
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        restart();
      });
    });
    show(0);
    restart();
  }

  function normalize(value) {
    return (value || "").toString().toLowerCase().replace(/\s+/g, " ").trim();
  }

  function bindFilters() {
    var scopes = Array.prototype.slice.call(
      document.querySelectorAll("[data-filter-scope]"),
    );
    var urlQuery = new URLSearchParams(window.location.search).get("q") || "";
    scopes.forEach(function (scope) {
      var input = scope.querySelector("[data-page-search]");
      var cards = Array.prototype.slice.call(
        document.querySelectorAll("[data-movie-card]"),
      );
      var categoryButtons = Array.prototype.slice.call(
        scope.querySelectorAll("[data-filter-value]"),
      );
      var kindButtons = Array.prototype.slice.call(
        scope.querySelectorAll("[data-kind-value]"),
      );
      var activeCategory = "all";
      var activeKind = "all";

      if (input && urlQuery) {
        input.value = urlQuery;
      }

      function apply() {
        var query = normalize(input ? input.value : "");
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-filter-text"));
          var category = card.getAttribute("data-category") || "";
          var kind = card.getAttribute("data-kind") || "";
          var matchQuery = !query || text.indexOf(query) !== -1;
          var matchCategory =
            activeCategory === "all" || category === activeCategory;
          var matchKind = activeKind === "all" || kind === activeKind;
          card.classList.toggle(
            "is-hidden-card",
            !(matchQuery && matchCategory && matchKind),
          );
        });
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      categoryButtons.forEach(function (button) {
        button.addEventListener("click", function () {
          activeCategory = button.getAttribute("data-filter-value") || "all";
          categoryButtons.forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });
          apply();
        });
      });
      kindButtons.forEach(function (button) {
        button.addEventListener("click", function () {
          activeKind = button.getAttribute("data-kind-value") || "all";
          kindButtons.forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });
          apply();
        });
      });
      apply();
    });
  }

  function bindPlayer() {
    var config = document.getElementById("player-config");
    var video = document.getElementById("movie-player");
    if (!config || !video) {
      return;
    }
    var parsed = {};
    try {
      parsed = JSON.parse(config.textContent || "{}");
    } catch (error) {
      parsed = {};
    }
    var streamUrl = parsed.stream || "";
    var overlay = document.getElementById("player-overlay");
    var loaded = false;
    var hls = null;

    function attach() {
      if (loaded || !streamUrl) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        return;
      }
      video.src = streamUrl;
    }

    function start() {
      attach();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }

    function toggle(event) {
      if (event) {
        event.preventDefault();
      }
      if (video.paused) {
        start();
      } else {
        video.pause();
      }
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }
    video.addEventListener("click", toggle);
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
    video.addEventListener("ended", function () {
      if (overlay) {
        overlay.classList.remove("is-hidden");
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  }
})();
