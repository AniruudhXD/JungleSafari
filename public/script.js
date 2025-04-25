// Home page slideshow functionality
let slideIndex = 0;
showSlides(slideIndex + 1); // Call showSlides with the correct starting index

let slideTimeout;

function showSlides(n) {
    let i;
    let slides = document.getElementsByClassName("home-slide");
    let dots = document.getElementsByClassName("dot");

    clearTimeout(slideTimeout);

    if (n > slides.length) {slideIndex = 1}
    if (n < 1) {slideIndex = slides.length}
    else {slideIndex = n;} // Set slideIndex directly from n

    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    for (i = 0; i < dots.length; i++) {
        dots[slideIndex - 1].style.display = "block";
        if (dots.length > 0) {
            for (let j = 0; j < dots.length; j++) {
                dots[j].className = dots[j].className.replace(" active", "");
            }
            dots[slideIndex - 1].className += " active";
        }
    }

    slideTimeout = setTimeout(() => {
        showSlides(slideIndex + 1);
    }, 5000);
}

function plusSlides(n) {
    showSlides(slideIndex + n);
}

function currentSlide(n) {
    showSlides(n);
}


let gallerySlideIndex = 0; // Start from the first slide

function showGallerySlides() {
    let slides = document.getElementsByClassName("slide");

    // Hide all slides
    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }

    gallerySlideIndex++;

    // Reset back to the first slide if we've gone past the last one
    if (gallerySlideIndex > slides.length) {
        gallerySlideIndex = 1;
    }

    // Display the current slide
    slides[gallerySlideIndex - 1].style.display = "block";

    // Set a timeout to change the slide every 3 seconds
    setTimeout(showGallerySlides, 3000); 
}

// Initialize the slideshow
showGallerySlides();