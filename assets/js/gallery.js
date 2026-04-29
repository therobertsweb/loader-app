
      const carousel = document.querySelector(".screen-carousel");

      if (carousel) {
        const track = carousel.querySelector(".carousel-track");
        const slides = Array.from(carousel.querySelectorAll(".carousel-slide"));
        const dots = Array.from(carousel.querySelectorAll("[data-carousel-dot]"));
        const prevButton = carousel.querySelector("[data-carousel-prev]");
        const nextButton = carousel.querySelector("[data-carousel-next]");
        let activeIndex = 0;
        let autoplayId;

        const setSlide = (index) => {
          activeIndex = (index + slides.length) % slides.length;
          track.style.transform = `translateX(-${activeIndex * 100}%)`;

          dots.forEach((dot, dotIndex) => {
            dot.classList.toggle("is-active", dotIndex === activeIndex);
          });
        };

        const restartAutoplay = () => {
          window.clearInterval(autoplayId);
          autoplayId = window.setInterval(() => setSlide(activeIndex + 1), 4800);
        };

        prevButton.addEventListener("click", () => {
          setSlide(activeIndex - 1);
          restartAutoplay();
        });

        nextButton.addEventListener("click", () => {
          setSlide(activeIndex + 1);
          restartAutoplay();
        });

        dots.forEach((dot) => {
          dot.addEventListener("click", () => {
            setSlide(Number(dot.dataset.carouselDot));
            restartAutoplay();
          });
        });

        setSlide(0);
        restartAutoplay();
      }

      const macGallery = document.querySelector(".mac-window");

      if (macGallery) {
        const mainShot = macGallery.querySelector("[data-mac-main-shot]");
        const shotButtons = Array.from(macGallery.querySelectorAll("[data-mac-shot]"));

        shotButtons.forEach((button) => {
          button.addEventListener("click", () => {
            mainShot.src = button.dataset.macShot;
            mainShot.alt = button.dataset.macAlt;

            shotButtons.forEach((shotButton) => {
              shotButton.classList.toggle("is-active", shotButton === button);
              shotButton.setAttribute("aria-pressed", shotButton === button ? "true" : "false");
            });
          });
        });
      }
   