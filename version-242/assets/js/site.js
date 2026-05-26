(function () {
    function ready(callback) {
        if (document.readyState !== 'loading') {
            callback();
            return;
        }
        document.addEventListener('DOMContentLoaded', callback);
    }

    function initMobileMenu() {
        var button = document.querySelector('[data-mobile-menu-button]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            var open = menu.classList.toggle('is-open');
            button.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function initHeroSlider() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });
        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initFilters() {
        var panel = document.querySelector('[data-filter-panel]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('.filter-card'));
        if (!panel || !cards.length) {
            return;
        }
        var keyword = panel.querySelector('[data-filter-keyword]');
        var category = panel.querySelector('[data-filter-category]');
        var year = panel.querySelector('[data-filter-year]');
        var type = panel.querySelector('[data-filter-type]');
        var clear = panel.querySelector('[data-filter-clear]');
        var count = document.querySelector('[data-result-count]');
        var empty = document.querySelector('[data-empty-result]');
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q');
        if (initialQuery && keyword) {
            keyword.value = initialQuery;
        }

        function norm(value) {
            return String(value || '').trim().toLowerCase();
        }

        function apply() {
            var q = norm(keyword && keyword.value);
            var c = category ? category.value : '';
            var y = year ? year.value : '';
            var t = type ? type.value : '';
            var visible = 0;
            cards.forEach(function (card) {
                var ok = true;
                if (q) {
                    ok = card.getAttribute('data-search').indexOf(q) !== -1;
                }
                if (ok && c) {
                    ok = card.getAttribute('data-category') === c;
                }
                if (ok && y) {
                    ok = card.getAttribute('data-year') === y;
                }
                if (ok && t) {
                    ok = card.getAttribute('data-type') === t;
                }
                card.style.display = ok ? '' : 'none';
                if (ok) {
                    visible += 1;
                }
            });
            if (count) {
                count.textContent = '当前显示 ' + visible + ' 部影片';
            }
            if (empty) {
                empty.style.display = visible ? 'none' : 'block';
            }
        }

        [keyword, category, year, type].forEach(function (el) {
            if (!el) {
                return;
            }
            el.addEventListener('input', apply);
            el.addEventListener('change', apply);
        });
        if (clear) {
            clear.addEventListener('click', function () {
                if (keyword) {
                    keyword.value = '';
                }
                if (category) {
                    category.value = '';
                }
                if (year) {
                    year.value = '';
                }
                if (type) {
                    type.value = '';
                }
                apply();
            });
        }
        apply();
    }

    function attachHls(video) {
        var source = video.getAttribute('data-hls-src');
        if (!source || video.getAttribute('data-bound') === '1') {
            return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.setAttribute('data-bound', '1');
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            video.hlsInstance = hls;
            video.setAttribute('data-bound', '1');
            return;
        }
        video.src = source;
        video.setAttribute('data-bound', '1');
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-video-player]'));
        players.forEach(function (player) {
            var video = player.querySelector('video[data-hls-src]');
            var overlay = player.querySelector('[data-play-overlay]');
            if (!video) {
                return;
            }
            attachHls(video);

            function playVideo() {
                attachHls(video);
                var playPromise = video.play();
                if (overlay) {
                    overlay.hidden = true;
                }
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        if (overlay) {
                            overlay.hidden = false;
                        }
                    });
                }
            }

            if (overlay) {
                overlay.addEventListener('click', playVideo);
            }
            video.addEventListener('play', function () {
                if (overlay) {
                    overlay.hidden = true;
                }
            });
            video.addEventListener('pause', function () {
                if (overlay && !video.ended) {
                    overlay.hidden = false;
                }
            });
            video.addEventListener('ended', function () {
                if (overlay) {
                    overlay.hidden = false;
                }
            });
        });
    }

    ready(function () {
        initMobileMenu();
        initHeroSlider();
        initFilters();
        initPlayers();
    });
}());
