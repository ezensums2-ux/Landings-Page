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

// SEASON 섹션의 experience-card 슬라이더 및 배경 이미지 연동
const seasonSection = document.querySelector(".sec02.season, #season");
const experienceCardContainer = document.querySelector(".experience-card-swiper");

if (experienceCardContainer && typeof Swiper !== "undefined") {
    // 배경 이미지 동적 레이어 준비 및 동기화
    let backdropContainer = seasonSection ? seasonSection.querySelector(".season-backdrop") : null;
    if (seasonSection && !backdropContainer) {
        backdropContainer = document.createElement("div");
        backdropContainer.className = "season-backdrop";
        backdropContainer.setAttribute("aria-hidden", "true");
        seasonSection.prepend(backdropContainer);
    }

    // 슬라이드 이미지와 배경 레이어 매핑 (HTML에 항목이 없을 경우 슬라이드로부터 자동 생성)
    if (seasonSection && backdropContainer) {
        let backdropItems = backdropContainer.querySelectorAll(".season-backdrop-item");
        const originalSlideImages = experienceCardContainer.querySelectorAll(".swiper-slide:not(.swiper-slide-duplicate) img");
        if (backdropItems.length === 0 && originalSlideImages.length > 0) {
            originalSlideImages.forEach((img, idx) => {
                const item = document.createElement("div");
                item.className = "season-backdrop-item" + (idx === 0 ? " is-active" : "");
                item.style.backgroundImage = "url('" + img.getAttribute("src") + "')";
                backdropContainer.appendChild(item);
            });
        }
    }

    // 슬라이드 인덱스에 따라 시즌 배경 이미지 전환 함수
    const updateSeasonBackground = (realIndex) => {
        if (!seasonSection) return;
        const items = seasonSection.querySelectorAll(".season-backdrop-item");
        if (!items || !items.length) return;
        const targetIndex = typeof realIndex === "number" ? realIndex : 0;
        items.forEach((item, idx) => {
            if (idx === targetIndex) {
                item.classList.add("is-active");
            } else {
                item.classList.remove("is-active");
            }
        });
    };

    const experienceCardSwiper = new Swiper(".experience-card-swiper", {
        slidesPerView: 1,
        spaceBetween: 0,
        loop: true,
        speed: 600,
        grabCursor: true,
        autoplay: {
            delay: 3500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
        },
        navigation: {
            prevEl: ".experience-card-prev",
            nextEl: ".experience-card-next",
        },
        keyboard: {
            enabled: true,
            onlyInViewport: true,
        },
        on: {
            init: function () {
                updateSeasonBackground(this.realIndex);
            },
            slideChange: function () {
                updateSeasonBackground(this.realIndex);
            },
        },
    });

    // Swiper 초기화 직후 및 realIndex 변경 시 강제 동기화
    if (experienceCardSwiper) {
        updateSeasonBackground(experienceCardSwiper.realIndex || 0);
        experienceCardSwiper.on("realIndexChange", function () {
            updateSeasonBackground(this.realIndex);
        });
    }
}

// EXPERIENCE 전체 화면 컨셉 슬라이드 (Swiper 및 고정 앵커 적용)
const experienceGallery = document.querySelector("#experience-gallery");
const experienceGalleryTrigger = document.querySelector(".immersive-scroll");

if (experienceGallery && experienceGalleryTrigger) {
    document.body.appendChild(experienceGallery);

    const closeGalleryButton = experienceGallery.querySelector(".experience-gallery-close");
    const navIcons = experienceGallery.querySelectorAll(".experience-gallery-logo");
    const navAnchors = experienceGallery.querySelectorAll(".experience-gallery-anchor");
    let experienceSwiper = null;

    const updateExperienceNav = (activeIndex) => {
        navIcons.forEach((icon, index) => {
            const isActive = index === activeIndex;
            icon.classList.toggle("is-active", isActive);
            icon.setAttribute("aria-hidden", String(!isActive));
        });

        navAnchors.forEach((anchor, index) => {
            const isActive = index === activeIndex;
            anchor.classList.toggle("is-active", isActive);
            anchor.setAttribute("aria-current", isActive ? "true" : "false");
        });
    };

    const initExperienceSwiper = () => {
        if (experienceSwiper) {
            experienceSwiper.update();
            return;
        }

        if (typeof Swiper !== "undefined") {
            experienceSwiper = new Swiper(".experience-gallery-swiper", {
                slidesPerView: 1,
                spaceBetween: 0,
                speed: 600,
                loop: true,
                grabCursor: true,
                keyboard: {
                    enabled: true,
                    onlyInViewport: false,
                },
                observer: true,
                observeParents: true,
                on: {
                    slideChange: function () {
                        updateExperienceNav(this.realIndex);
                    },
                },
            });
        }
    };

    const openExperienceGallery = () => {
        experienceGallery.hidden = false;
        experienceGallery.setAttribute("aria-hidden", "false");
        document.body.classList.add("experience-gallery-open");

        initExperienceSwiper();
        if (experienceSwiper) {
            experienceSwiper.slideToLoop(0, 0);
        }
        updateExperienceNav(0);
        closeGalleryButton.focus();
    };

    const closeExperienceGallery = () => {
        experienceGallery.hidden = true;
        experienceGallery.setAttribute("aria-hidden", "true");
        document.body.classList.remove("experience-gallery-open");
        experienceGalleryTrigger.focus();
    };

    experienceGalleryTrigger.addEventListener("click", openExperienceGallery);
    closeGalleryButton.addEventListener("click", closeExperienceGallery);

    // 고정 앵커 클릭 시 해당 슬라이드로 이동 (전체 변경 방지 및 고정 유지)
    navAnchors.forEach((anchor) => {
        anchor.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            const targetIndex = parseInt(anchor.dataset.index, 10);
            if (experienceSwiper && !isNaN(targetIndex)) {
                experienceSwiper.slideToLoop(targetIndex);
            }
        });
    });

    document.addEventListener("keydown", (event) => {
        if (experienceGallery.hidden) {
            return;
        }

        if (event.key === "Escape") {
            closeExperienceGallery();
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

// SECTION 03 ABOUT - GSAP ScrollTrigger를 활용한 부드러운 Pin & 스크롤 타임라인 인터랙션
const aboutSection = document.querySelector(".about-section");
const aboutSticky = document.querySelector(".about-sticky");

if (aboutSection && aboutSticky && typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    // 초기 상태: 투명도 0 및 아래로 살짝 이동
    gsap.set(".about-symbol, .about-label", { opacity: 0, y: 25 });
    gsap.set(".about-title", { opacity: 0, y: 30 });
    gsap.set(".about-description p", { opacity: 0, y: 30 });
    gsap.set(".about-card", { opacity: 0, y: 35 });

    const aboutTl = gsap.timeline({
        scrollTrigger: {
            trigger: aboutSection,
            start: () => window.innerWidth <= 768 ? "top 72px" : "top 100px",
            end: "+=2400",
            pin: aboutSticky,
            pinSpacing: true,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
        }
    });

    aboutTl
        // 1. 심볼 & 라벨 등장
        .to(".about-symbol, .about-label", {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "power2.out"
        })
        // 2. 메인 타이틀 등장
        .to(".about-title", {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out"
        }, "+=0.15")
        // 3. 첫 번째 설명 문구 등장
        .to(".about-description p:nth-child(1)", {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out"
        }, "+=0.15")
        // 4. 두 번째 설명 문구 등장
        .to(".about-description p:nth-child(2)", {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out"
        }, "+=0.15")
        // 5. 카드 3개 순차 팝업 등장 (stagger)
        .to(".about-card", {
            opacity: 1,
            y: 0,
            duration: 1.2,
            stagger: 0.25,
            ease: "power2.out"
        }, "+=0.25")
        // 6. 완성된 상태로 스크롤 여유 유지
        .to({}, { duration: 0.8 });
}

// SECTION 04 WORLDS - GSAP ScrollTrigger를 활용한 부드러운 Pin & 컨셉 리스트 전환 타임라인
const worldsSection = document.querySelector(".worlds-section");
const worldsStage = worldsSection?.querySelector(".worlds-stage");
const conceptStage = worldsSection?.querySelector(".concept-stage");
const conceptDescription = worldsSection?.querySelector(".worlds-description");
const conceptList = worldsSection?.querySelector(".concept-list");
const conceptItems = worldsSection?.querySelectorAll(".concept-item");
const worldsImageLayer = worldsSection?.querySelector(".worlds-image-layer");
const conceptButtons = worldsSection?.querySelectorAll(".concept-button");

if (
    worldsSection &&
    worldsStage &&
    conceptStage &&
    conceptDescription &&
    conceptList &&
    conceptButtons &&
    typeof gsap !== "undefined" &&
    typeof ScrollTrigger !== "undefined"
) {
    gsap.registerPlugin(ScrollTrigger);

    // 초기 상태 세팅:
    // 1단계(소개): 우측 하단 설명문 표시, concept-stage는 아래쪽에 투명 상태로 대기
    gsap.set(conceptDescription, { opacity: 1, y: 0 });
    gsap.set(conceptStage, { opacity: 0, y: 40, pointerEvents: "none" });
    if (conceptItems && conceptItems.length) {
        gsap.set(conceptItems, { opacity: 0, y: 20 });
    }

    // GSAP ScrollTrigger Pin & 스크롤 타임라인 생성
    const worldsTl = gsap.timeline({
        scrollTrigger: {
            trigger: worldsSection,
            start: () => (window.innerWidth <= 768 ? "top 72px" : "top 80px"),
            end: "+=2000",
            pin: worldsStage,
            pinSpacing: true,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
        },
    });

    worldsTl
        // 1. 초기 인트로 노출 시간 확보
        .to({}, { duration: 0.3 })
        // 2. 우측 하단 설명문(worlds-description) 서서히 페이드아웃
        .to(conceptDescription, {
            opacity: 0,
            y: -15,
            duration: 0.6,
            ease: "power2.out",
        })
        // 3. concept-stage 서서히 페이드인 및 정해진 위치로 부드럽게 안착 (worlds-subtitle과 겹치지 않음)
        .to(conceptStage, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power2.out",
            onStart: () => {
                conceptStage.style.pointerEvents = "auto";
            },
            onReverseComplete: () => {
                conceptStage.style.pointerEvents = "none";
            },
        }, "-=0.2")
        // 4. 컨셉 항목들 순차적 페이드인 & 살짝 올라오며 등장
        .to(conceptItems, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
        }, "-=0.4")
        // 5. 사용자가 컨셉 목록을 살펴보고 클릭할 수 있도록 핀 상태 유지
        .to({}, { duration: 1.0 });

    // 컨셉 이미지 리셋 함수
    const resetConceptImage = () => {
        if (worldsImageLayer) {
            worldsImageLayer.classList.remove("is-visible");
        }
        worldsSection.classList.remove("has-selected-concept");
        conceptButtons.forEach((button) => {
            button.classList.remove("is-active");
            button.setAttribute("aria-pressed", "false");
        });
    };

    if (worldsImageLayer) {
        worldsImageLayer.addEventListener("transitionend", (event) => {
            if (
                event.target === worldsImageLayer &&
                event.propertyName === "opacity" &&
                !worldsImageLayer.classList.contains("is-visible")
            ) {
                worldsImageLayer.style.removeProperty("background-image");
            }
        });
    }

    conceptList.addEventListener("pointerleave", resetConceptImage);

    // 컨셉 버튼 클릭 시 해당 세계관 배경 이미지 전환
    conceptButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const concept = button.dataset.concept;
            if (!concept || !worldsImageLayer) return;

            const imageUrl = new URL(
                `assets/images/${concept}.jpg`,
                document.baseURI
            ).href;

            worldsImageLayer.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url("${imageUrl}")`;
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