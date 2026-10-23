(() => {
    const gallery = document.querySelector(".season-gallery");

    // 갤러리가 없는 페이지에서는 실행하지 않음
    if (!gallery) return;

    const sticky = gallery.querySelector(".season-gallery-sticky");
    const slides = gallery.querySelectorAll(".season-gallery-slide");

    if (!sticky || slides.length === 0) return;

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    let isScheduled = false;

    // 값을 최솟값과 최댓값 사이로 제한
    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    function updateSlides() {
        isScheduled = false;

        // 움직임 감소 설정에서는 CSS의 세로 배치를 사용
        if (reducedMotion.matches) {
            slides.forEach((slide) => {
                slide.style.removeProperty("transform");
            });
            return;
        }

        const galleryRect = gallery.getBoundingClientRect();

        // 갤러리가 고정된 채 움직일 수 있는 전체 스크롤 거리
        const scrollDistance =
            galleryRect.height - sticky.getBoundingClientRect().height;

        if (scrollDistance <= 0) return;

        // 갤러리 시작은 0, 갤러리 끝은 1
        const progress = clamp(
            -galleryRect.top / scrollDistance,
            0,
            1
        );

        // 이미지 3장일 때 0 → 1 → 2로 진행
        const position = progress * (slides.length - 1);

        slides.forEach((slide, index) => {
            // 아래쪽 100%에서 제자리 0%까지 이동
            const translateY = clamp(
                (index - position) * 100,
                0,
                100
            );

            slide.style.transform = `translateY(${translateY}%)`;
        });
    }

    // 화면을 그리는 시점에 맞춰 업데이트
    function requestUpdate() {
        if (isScheduled) return;

        isScheduled = true;
        window.requestAnimationFrame(updateSlides);
    }

    window.addEventListener("scroll", requestUpdate, {
        passive: true
    });

    window.addEventListener("resize", requestUpdate);
    window.addEventListener("load", requestUpdate);
    reducedMotion.addEventListener("change", requestUpdate);

    // 처음 접속하거나 중간 위치에서 새로고침했을 때도 적용
    requestUpdate();
})();