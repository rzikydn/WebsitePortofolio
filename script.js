import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({
    smoothWheel: true,
    syncTouch: false,
});

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time)=>{
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

function init() {
    const greetings = [
        "Hello",
        "Bonjour",
        "Hola",
        "Ciao",
        "Guten Tag",
        "안녕하세요",
        "Привет",
        "Namaste",
        "Merhaba",
        "Halo"
    ];
    
    const greetingText = document.getElementById("greeting-text");
    const greetingContainer = document.querySelector(".greeting-container");
    const preloaderWrap = document.querySelector(".preloader-wrap");
    
    let currentIndex = 1; // Start at 1 because index 0 ("Hello") is already in HTML
    
    // Function to cycle through greetings
    function changeGreeting() {
        if (currentIndex < greetings.length) {
            greetingText.textContent = greetings[currentIndex];
            currentIndex++;
            
            if (currentIndex === greetings.length) {
                // Last word reached, pause for a moment before finishing
                setTimeout(finishPreloader, 1000);
            } else {
                // Slower speed between words so it's readable
                setTimeout(changeGreeting, 250);
            }
        }
    }
    
    function finishPreloader() {
        // 1. Fade out the text
        greetingContainer.classList.add("fade-out");
        
        // 2. Slide up the background after text fades out
        setTimeout(() => {
            preloaderWrap.classList.add("slide-up");
            
            // Allow scrolling on the main body
            document.body.style.overflow = "auto";
            
            // 3. Drop the lanyard after preloader clears
            setTimeout(() => {
                window.dispatchEvent(new CustomEvent('lanyard-drop'));
            }, 600);
            
            // 4. Remove preloader from DOM after transition completes (1.4s)
            setTimeout(() => {
                preloaderWrap.style.display = "none";
            }, 1400);
            
        }, 400); // Wait 400ms for text fade-out
    }
    
    // Initial Sequence: Fade in the first word
    setTimeout(() => {
        // Trigger fade-in by removing the fade-out class
        greetingContainer.classList.remove("fade-out");
        
        // Wait for fade-in to finish, let "Hello" stay a bit, then start cycling
        setTimeout(changeGreeting, 800);
    }, 100);
    
    // --- Dark Mode Toggle Logic ---
    const themeToggleBtn = document.querySelector('.theme-toggle');
    const themeIcon = themeToggleBtn.querySelector('i');

    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        
        // Switch between moon and sun icon
        if (document.body.classList.contains('dark-mode')) {
            themeIcon.classList.remove('ph-moon-stars');
            themeIcon.classList.add('ph-sun');
        } else {
            themeIcon.classList.remove('ph-sun');
            themeIcon.classList.add('ph-moon-stars');
        }
    });
}

// Module scripts are deferred — DOM may already be loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
