(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-main-nav]');
  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) return;
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  const localForm = document.querySelector('[data-local-search]');
  const filterButtons = Array.from(document.querySelectorAll('[data-filter-value]'));
  const cards = Array.from(document.querySelectorAll('[data-filter-card]'));
  let activeCategory = 'all';
  let query = '';

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilters() {
    const terms = normalize(query).split(/\s+/).filter(Boolean);
    cards.forEach(function (card) {
      const text = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-year'),
        card.getAttribute('data-category'),
        card.textContent
      ].join(' '));
      const categoryOk = activeCategory === 'all' || card.getAttribute('data-category') === activeCategory;
      const queryOk = terms.length === 0 || terms.every(function (term) { return text.indexOf(term) !== -1; });
      card.classList.toggle('is-hidden-card', !(categoryOk && queryOk));
    });
  }

  if (localForm && cards.length) {
    const input = localForm.querySelector('input[type="search"]');
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q') || '';
    if (input && q) {
      input.value = q;
      query = q;
      applyFilters();
    }
    localForm.addEventListener('submit', function (event) {
      event.preventDefault();
      query = input ? input.value : '';
      applyFilters();
    });
    if (input) {
      input.addEventListener('input', function () {
        query = input.value;
        applyFilters();
      });
    }
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activeCategory = button.getAttribute('data-filter-value') || 'all';
      filterButtons.forEach(function (item) {
        item.classList.toggle('is-active', item === button);
      });
      applyFilters();
    });
  });
})();
