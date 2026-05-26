(function () {
  var toggle = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var heroIndex = 0;
  var heroTimer = null;

  function showHero(index) {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, current) {
      slide.classList.toggle('is-active', current === heroIndex);
    });
    dots.forEach(function (dot, current) {
      dot.classList.toggle('is-active', current === heroIndex);
    });
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }

    heroTimer = window.setInterval(function () {
      showHero(heroIndex + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      window.clearInterval(heroTimer);
      showHero(Number(dot.getAttribute('data-hero-dot')) || 0);
      startHero();
    });
  });

  startHero();

  var params = new URLSearchParams(window.location.search);
  var searchInput = document.querySelector('.js-movie-search');
  var regionSelect = document.querySelector('.js-region-filter');
  var yearSelect = document.querySelector('.js-year-filter');
  var categorySelect = document.querySelector('.js-category-filter');
  var resetButton = document.querySelector('.filter-reset');
  var grid = document.querySelector('.filterable-grid');
  var emptyState = document.querySelector('.empty-state');

  function valueOf(element) {
    return element ? String(element.value || '').trim().toLowerCase() : '';
  }

  function applyInitialValues() {
    if (searchInput && params.get('q')) {
      searchInput.value = params.get('q');
    }
    if (regionSelect && params.get('region')) {
      regionSelect.value = params.get('region');
    }
    if (yearSelect && params.get('year')) {
      yearSelect.value = params.get('year');
    }
    if (categorySelect && params.get('category')) {
      categorySelect.value = params.get('category');
    }
  }

  function filterItems() {
    if (!grid) {
      return;
    }

    var keyword = valueOf(searchInput);
    var region = valueOf(regionSelect);
    var year = valueOf(yearSelect);
    var category = valueOf(categorySelect);
    var cards = Array.prototype.slice.call(grid.children);
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-category'),
        card.textContent
      ].join(' ').toLowerCase();
      var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchRegion = !region || valueOf({ value: card.getAttribute('data-region') }) === region;
      var matchYear = !year || valueOf({ value: card.getAttribute('data-year') }) === year;
      var matchCategory = !category || valueOf({ value: card.getAttribute('data-category') }) === category;
      var show = matchKeyword && matchRegion && matchYear && matchCategory;

      card.hidden = !show;
      if (show) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.hidden = visible !== 0;
    }
  }

  [searchInput, regionSelect, yearSelect, categorySelect].forEach(function (element) {
    if (element) {
      element.addEventListener('input', filterItems);
      element.addEventListener('change', filterItems);
    }
  });

  if (resetButton) {
    resetButton.addEventListener('click', function () {
      [searchInput, regionSelect, yearSelect, categorySelect].forEach(function (element) {
        if (element) {
          element.value = '';
        }
      });
      filterItems();
    });
  }

  applyInitialValues();
  filterItems();
})();
