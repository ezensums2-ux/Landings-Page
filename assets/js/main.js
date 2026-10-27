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
    const stage = Math.min(5, Math.floor(progress / window.innerHeight));

    aboutSection.dataset.stage = String(stage);
    aboutReveals.forEach((element) => {
        const elementStage = Number(element.dataset.aboutStep);
        element.classList.toggle(
            "is-visible",
            elementStage <= stage
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