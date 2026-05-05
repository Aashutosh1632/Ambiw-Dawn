function initCarousel() {
    var e = document.querySelector(".featured-carousel");
    if (e) {
        window.innerWidth <= 768 &&
            document.querySelectorAll(".featured-carousel .swiper-slide.no-mobile-image").forEach(function (e) {
                e.remove();
            });
        var i = Array.from(document.querySelectorAll(".featured-carousel .swiper-slide")),
            n =
                new Set(
                    i.map(function (e) {
                        return e.dataset.realIndex;
                    })
                ).size || 1,
            a = document.querySelector(".swiper-button-prev");
        a && a.classList.add("hidden");
        var s = window.innerWidth <= 768;
        new Swiper(".featured-carousel", {
            slidesPerView: s ? 1 : 2.5,
            spaceBetween: s ? 15 : 20,
            loop: !0,
            loopedSlides: n,
            autoplay: { delay: 5e3, disableOnInteraction: !0, pauseOnMouseEnter: !0 },
            navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
            pagination: {
                el: ".swiper-pagination",
                clickable: !0,
                renderBullet: function (e, i) {
                    return e < n ? '<span class="' + i + '"></span>' : "";
                },
            },
            breakpoints: {
                1024: { slidesPerView: 2.5, spaceBetween: 20 },
                768: { slidesPerView: 1, spaceBetween: 15 },
                0: { slidesPerView: 1, spaceBetween: 10 },
            },
            on: {
                slideChange: function () {
                    !this.isBeginning && a ? a.classList.remove("hidden") : a && a.classList.add("hidden");
                    var e = this.realIndex % n,
                        i = document.querySelectorAll(".swiper-pagination span");
                    i.forEach(function (e) {
                        e.classList.remove("swiper-pagination-bullet-active");
                    }),
                        i[e] && i[e].classList.add("swiper-pagination-bullet-active");
                },
            },
        }),
            e.classList.add("swiper-initialized");
var wrapper = document.querySelector(".featured-carousel-wrapper");
if(wrapper) wrapper.classList.add("carousel-ready");

            
    }
}
initCarousel();
