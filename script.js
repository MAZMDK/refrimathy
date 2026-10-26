const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
  const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isExpanded));
  menuToggle.setAttribute('aria-label', isExpanded ? 'Abrir menú' : 'Cerrar menú');
  navLinks.classList.toggle('open', !isExpanded);
});

navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Abrir menú');
    navLinks.classList.remove('open');
  });
});

const slideData = [
  {
    title: 'Neveras',
    alt: 'Profesionales realizando una reparación de refrigeración',
    src: 'https://images.pexels.com/photos/32391499/pexels-photo-32391499/free-photo-of-repair-technicians-fixing-industrial-freezer.jpeg?auto=compress&cs=tinysrgb&w=1400'
  },
  {
    title: 'Lavadoras',
    alt: 'Zona de lavado con electrodomésticos para el hogar',
    src: 'https://images.pexels.com/photos/7282378/pexels-photo-7282378.jpeg?auto=compress&cs=tinysrgb&w=1400'
  },
  {
    title: 'Estufas y calentadores',
    alt: 'Profesional revisando un equipo eléctrico del hogar',
    src: 'https://images.pexels.com/photos/37340084/pexels-photo-37340084/free-photo-of-technician-repairing-electrical-equipment.jpeg?auto=compress&cs=tinysrgb&w=1400'
  },
  {
    title: 'Aire acondicionado',
    alt: 'Profesional trabajando en un equipo de aire acondicionado',
    src: 'https://images.pexels.com/photos/33671149/pexels-photo-33671149/free-photo-of-air-conditioner-repair-technician-in-workshop.jpeg?auto=compress&cs=tinysrgb&w=1400'
  }
];

const heroImage = document.querySelector('.hero-photo');
const heroLabel = document.querySelector('.hero-active-label');
const imageCount = document.querySelector('.image-count');
const heroDots = [...document.querySelectorAll('.hero-dot')];
const heroCarousel = document.querySelector('.hero-visual');
let activeSlide = 0;
let carouselTimer;
let pointerInsideCarousel = false;
let focusInsideCarousel = false;

function showSlide(index) {
  activeSlide = (index + slideData.length) % slideData.length;
  const slide = slideData[activeSlide];

  heroImage.classList.add('is-changing');
  heroImage.src = slide.src;
  heroImage.alt = slide.alt;
  heroLabel.textContent = slide.title;
  imageCount.innerHTML = `${String(activeSlide + 1).padStart(2, '0')} <span>/ ${String(slideData.length).padStart(2, '0')}</span>`;

  heroDots.forEach((dot, dotIndex) => {
    const isActive = dotIndex === activeSlide;
    dot.classList.toggle('active', isActive);
    dot.setAttribute('aria-selected', String(isActive));
    dot.tabIndex = isActive ? 0 : -1;
  });
  heroImage.setAttribute('aria-labelledby', heroDots[activeSlide].id);
}

heroImage.addEventListener('load', () => {
  heroImage.classList.remove('is-changing');
});

heroImage.addEventListener('error', () => {
  heroImage.classList.remove('is-changing');
  console.error(`No se pudo cargar la imagen del carrusel: ${heroImage.src}`);
});

function startCarousel() {
  clearInterval(carouselTimer);
  if (!pointerInsideCarousel && !focusInsideCarousel) {
    carouselTimer = setInterval(() => showSlide(activeSlide + 1), 5000);
  }
}

heroDots.forEach((dot, index) => {
  dot.addEventListener('click', () => {
    showSlide(index);
    startCarousel();
  });

  dot.addEventListener('keydown', (event) => {
    let nextIndex = index;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % heroDots.length;
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + heroDots.length) % heroDots.length;
    if (nextIndex !== index) {
      event.preventDefault();
      heroDots[nextIndex].focus();
      showSlide(nextIndex);
    }
  });
});

document.querySelector('.hero-prev').addEventListener('click', () => {
  showSlide(activeSlide - 1);
  startCarousel();
});

document.querySelector('.hero-next').addEventListener('click', () => {
  showSlide(activeSlide + 1);
  startCarousel();
});

heroCarousel.addEventListener('pointerenter', () => {
  pointerInsideCarousel = true;
  startCarousel();
});

heroCarousel.addEventListener('pointerleave', () => {
  pointerInsideCarousel = false;
  startCarousel();
});

heroCarousel.addEventListener('focusin', () => {
  focusInsideCarousel = true;
  startCarousel();
});

heroCarousel.addEventListener('focusout', (event) => {
  if (!heroCarousel.contains(event.relatedTarget)) {
    focusInsideCarousel = false;
    startCarousel();
  }
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    clearInterval(carouselTimer);
  } else {
    startCarousel();
  }
});

document.querySelector('#year').textContent = new Date().getFullYear();
startCarousel();
