// 모션 감소를 요청한 경우 SECTION 01 배경 영상의 자동 재생을 중지합니다.
const heroVideo = document.querySelector(".hero-video");
const heroMotionPreference = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
);

if (heroVideo && heroMotionPreference.matches) {
    heroVideo.pause();
    heroVideo.removeAttribute("autoplay");
}

heroMotionPreference.addEventListener("change", (event) => {
    if (!heroVideo) {
        return;
    }

    if (event.matches) {
        heroVideo.pause();
        heroVideo.removeAttribute("autoplay");
        return;
    }

    heroVideo.setAttribute("autoplay", "");
    heroVideo.play().catch((error) => {
        if (error.name !== "AbortError") {
            console.error("히어로 배경 영상 재생에 실패했습니다.", error);
        }
    });
});

// EXPERIENCE 전체 화면 컨셉 슬라이드
const experienceGallery = document.querySelector("#experience-gallery");
const experienceGalleryTrigger = document.querySelector(".immersive-scroll");

if (experienceGallery && experienceGalleryTrigger) {
    const experienceSlides = [
        ...experienceGallery.querySelectorAll(".experience-gallery-slide")
    ];
    const experienceTrack = experienceGallery.querySelector(
        ".experience-gallery-track"
    );
    const closeGalleryButton = experienceGallery.querySelector(
        ".experience-gallery-close"
    );
    let activeSlide = 0;

    const updateExperienceSlide = (moveFocus = false) => {
        experienceSlides.forEach((slide, index) => {
            slide.setAttribute("aria-hidden", String(index !== activeSlide));
            slide.querySelector(".experience-gallery-logo").setAttribute(
                "tabindex",
                index === activeSlide ? "0" : "-1"
            );
        });
        experienceTrack.style.transform =
            `translateX(-${activeSlide * 100}%)`;

        if (moveFocus) {
            experienceSlides[activeSlide]
                .querySelector(".experience-gallery-logo")
                .focus({ preventScroll: true });
        }
    };

    const advanceExperienceSlide = () => {
        activeSlide = (activeSlide + 1) % experienceSlides.length;
        updateExperienceSlide(true);
    };

    const openExperienceGallery = () => {
        activeSlide = 0;
        updateExperienceSlide();
        experienceGallery.hidden = false;
        experienceGallery.setAttribute("aria-hidden", "false");
        document.body.classList.add("experience-gallery-open");
        closeGalleryButton.focus();
    };

    const closeExperienceGallery = () => {
        experienceGallery.hidden = true;
        experienceGallery.setAttribute("aria-hidden", "true");
        document.body.classList.remove("experience-gallery-open");
        experienceGalleryTrigger.focus();
    };

    experienceGalleryTrigger.addEventListener(
        "click",
        openExperienceGallery
    );
    closeGalleryButton.addEventListener("click", closeExperienceGallery);

    experienceSlides.forEach((slide) => {
        const logoButton = slide.querySelector(".experience-gallery-logo");
        logoButton.addEventListener("click", advanceExperienceSlide);
        logoButton.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                advanceExperienceSlide();
            }
        });
    });

    document.addEventListener("keydown", (event) => {
        if (experienceGallery.hidden) {
            return;
        }

        if (event.key === "Escape") {
            closeExperienceGallery();
        } else if (event.key === "ArrowRight") {
            advanceExperienceSlide();
        } else if (event.key === "Tab") {
            const activeLogo = experienceSlides[activeSlide].querySelector(
                ".experience-gallery-logo"
            );

            if (event.shiftKey && document.activeElement === closeGalleryButton) {
                event.preventDefault();
                activeLogo.focus();
            } else if (!event.shiftKey && document.activeElement === activeLogo) {
                event.preventDefault();
                closeGalleryButton.focus();
            }
        }
    });
}

const languageToggle = document.querySelector(".language-toggle");
const languageMenu = document.querySelector("#language-menu");
const languageCurrent = document.querySelector(".language-current");
const languageOptions = document.querySelectorAll(".language-option");

languageToggle.addEventListener("click", () => {
    const isExpanded = languageToggle.getAttribute("aria-expanded") === "true";
    languageToggle.setAttribute("aria-expanded", String(!isExpanded));
    languageMenu.hidden = isExpanded;
});

languageOptions.forEach((option) => {
    option.addEventListener("click", () => {
        languageCurrent.textContent = option.textContent.trim();
        document.documentElement.lang = option.dataset.language;

        languageOptions.forEach((languageOption) => {
            languageOption.setAttribute(
                "aria-pressed",
                String(languageOption === option)
            );
        });

        languageMenu.hidden = true;
        languageToggle.setAttribute("aria-expanded", "false");
        languageToggle.focus();
    });
});

document.addEventListener("click", (event) => {
    if (!event.target.closest(".language-selector")) {
        languageMenu.hidden = true;
        languageToggle.setAttribute("aria-expanded", "false");
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !languageMenu.hidden) {
        languageMenu.hidden = true;
        languageToggle.setAttribute("aria-expanded", "false");
        languageToggle.focus();
    }
});

const siteMenuToggle = document.querySelector(".site-menu-toggle");
const siteMenu = document.querySelector("#site-menu");
const siteMenuClose = document.querySelector(".site-menu-close");
const siteMenuLinks = document.querySelectorAll(".site-menu-link");

const closeSiteMenu = (returnFocus = false) => {
    siteMenu.hidden = true;
    siteMenuToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("site-menu-open");

    if (returnFocus) {
        siteMenuToggle.focus();
    }
};

siteMenuToggle.addEventListener("click", () => {
    const isExpanded = siteMenuToggle.getAttribute("aria-expanded") === "true";
    siteMenu.hidden = isExpanded;
    siteMenuToggle.setAttribute("aria-expanded", String(!isExpanded));
    document.body.classList.toggle("site-menu-open", !isExpanded);

    if (!isExpanded) {
        siteMenuClose.focus();
    }
});

siteMenuClose.addEventListener("click", () => closeSiteMenu(true));

siteMenuLinks.forEach((link) => {
    link.addEventListener("click", () => closeSiteMenu());
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !siteMenu.hidden) {
        closeSiteMenu(true);
    }
});

const aboutSection = document.querySelector(".about-section");
const aboutSticky = document.querySelector(".about-sticky");
const aboutReveals = document.querySelectorAll(".about-reveal");
let aboutScrollFrame = 0;

const updateAboutStage = () => {
    const sectionTop = aboutSection.getBoundingClientRect().top + window.scrollY;
    const stickyTop = parseFloat(window.getComputedStyle(aboutSticky).top);
    const stageStart = sectionTop - stickyTop;
    const progress = Math.max(0, window.scrollY - stageStart);
    const stage = Math.min(6, Math.floor(progress / window.innerHeight));

    aboutSection.dataset.stage = String(stage);
    aboutReveals.forEach((element) => {
        const elementStage = Number(element.dataset.aboutStep);
        const isCard = element.classList.contains("about-card");
        element.classList.toggle(
            "is-visible",
            isCard ? stage >= 4 : elementStage <= stage
        );
        element.classList.toggle("is-current", elementStage === stage);
    });

    aboutScrollFrame = 0;
};

window.addEventListener("scroll", () => {
    if (!aboutScrollFrame) {
        aboutScrollFrame = window.requestAnimationFrame(updateAboutStage);
    }
}, { passive: true });

window.addEventListener("resize", updateAboutStage);
updateAboutStage();

const worldsSection = document.querySelector(".worlds-section");
const conceptStage = worldsSection?.querySelector(".concept-stage");
const conceptDescription = worldsSection?.querySelector(".worlds-description");
const firstConceptItem = worldsSection?.querySelector(".concept-item");
const conceptList = worldsSection?.querySelector(".concept-list");
const worldsImageLayer = worldsSection?.querySelector(".worlds-image-layer");
const conceptButtons = worldsSection?.querySelectorAll(".concept-button");

if (
    worldsSection &&
    conceptStage &&
    conceptDescription &&
    firstConceptItem &&
    conceptList &&
    worldsImageLayer &&
    conceptButtons
) {
    let worldsScrollFrame = 0;

    worldsImageLayer.addEventListener("transitionend", (event) => {
        if (
            event.target === worldsImageLayer &&
            event.propertyName === "opacity" &&
            !worldsImageLayer.classList.contains("is-visible")
        ) {
            worldsImageLayer.style.removeProperty("background-image");
        }
    });

    const resetConceptImage = () => {
        worldsImageLayer.classList.remove("is-visible");
        worldsSection.classList.remove("has-selected-concept");

        conceptButtons.forEach((button) => {
            button.classList.remove("is-active");
            button.setAttribute("aria-pressed", "false");
        });
    };

    const updateWorldsScroll = () => {
        const sectionTop =
            worldsSection.getBoundingClientRect().top + window.scrollY;
        const scrollDistance = Math.max(
            1,
            worldsSection.offsetHeight - conceptStage.offsetHeight
        );
        const progress = Math.min(
            1,
            Math.max(0, (window.scrollY - sectionTop) / scrollDistance)
        );
        const shift = (1 - progress) * conceptStage.offsetHeight * 0.65;

        worldsSection.style.setProperty(
            "--concept-scroll-shift",
            `${shift}px`
        );
        worldsSection.classList.toggle(
            "concepts-over-description",
            firstConceptItem.getBoundingClientRect().top <=
                conceptDescription.getBoundingClientRect().bottom + 24
        );
        worldsScrollFrame = 0;
    };

    const scheduleWorldsScrollUpdate = () => {
        if (!worldsScrollFrame) {
            worldsScrollFrame = window.requestAnimationFrame(updateWorldsScroll);
        }
    };

    window.addEventListener("scroll", scheduleWorldsScrollUpdate, {
        passive: true
    });
    window.addEventListener("resize", updateWorldsScroll);
    updateWorldsScroll();

    conceptList.addEventListener("pointerleave", resetConceptImage);

    conceptButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const concept = button.dataset.concept;

            if (!concept) {
                return;
            }

            const imageUrl = new URL(
                `assets/images/${concept}.jpg`,
                document.baseURI
            ).href;

            worldsImageLayer.style.backgroundImage =
                `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url("${imageUrl}")`;
            worldsSection.classList.add("has-selected-concept");
            worldsImageLayer.classList.remove("is-visible");
            void worldsImageLayer.offsetWidth;
            worldsImageLayer.classList.add("is-visible");

            conceptButtons.forEach((conceptButton) => {
                const isActive = conceptButton === button;
                conceptButton.classList.toggle("is-active", isActive);
                conceptButton.setAttribute("aria-pressed", String(isActive));
            });
        });
    });
}