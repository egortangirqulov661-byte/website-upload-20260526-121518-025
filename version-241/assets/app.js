(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    setupMobileNav();
    setupHero();
    setupFilters();
    setupPlayers();
  });

  function setupMobileNav() {
    var toggle = document.querySelector(".mobile-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      document.body.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHero() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function activate(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        activate(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var next = Number(dot.getAttribute("data-hero-dot"));
        activate(next);
        start();
      });
    });

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    start();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      var scope = panel.parentElement || document;
      var input = panel.querySelector("[data-filter-input]");
      var type = panel.querySelector("[data-filter-type]");
      var clear = panel.querySelector("[data-filter-clear]");
      var status = panel.querySelector("[data-filter-status]");
      var list = scope.querySelector("[data-filter-list]");
      if (!list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));

      function apply() {
        var keyword = normalize(input && input.value);
        var typeValue = normalize(type && type.value);
        cards.forEach(function (card) {
          var haystack = normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.tags,
            card.dataset.category
          ].join(" "));
          var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchedType = !typeValue || normalize(card.dataset.type).indexOf(typeValue) !== -1;
          card.classList.toggle("is-hidden", !(matchedKeyword && matchedType));
        });
        if (status) {
          status.textContent = keyword || typeValue ? "筛选结果已更新" : "筛选结果将即时更新";
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      if (type) {
        type.addEventListener("change", apply);
      }
      if (clear) {
        clear.addEventListener("click", function () {
          if (input) {
            input.value = "";
          }
          if (type) {
            type.value = "";
          }
          apply();
        });
      }
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video[data-src]");
      var shell = player.querySelector(".video-shell");
      var playButton = player.querySelector(".player-play");
      if (!video) {
        return;
      }
      var source = video.getAttribute("data-src");
      var initialized = false;
      var hlsInstance = null;

      function initialize() {
        if (initialized || !source) {
          return;
        }
        initialized = true;
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else {
          video.src = source;
        }
      }

      function playOrPause() {
        initialize();
        if (video.paused) {
          var playPromise = video.play();
          if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {});
          }
        } else {
          video.pause();
        }
      }

      if (playButton) {
        playButton.addEventListener("click", playOrPause);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          playOrPause();
        }
      });
      video.addEventListener("play", function () {
        if (shell) {
          shell.classList.add("is-playing");
        }
      });
      video.addEventListener("pause", function () {
        if (shell) {
          shell.classList.remove("is-playing");
        }
      });
      video.addEventListener("loadedmetadata", function () {
        if (playButton) {
          playButton.removeAttribute("disabled");
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }
})();
