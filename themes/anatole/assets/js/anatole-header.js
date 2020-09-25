// initialize default value
function getTheme(){
    return localStorage.getItem('theme') ? localStorage.getItem('theme') : null;
}

function setTheme(style){
    document.documentElement.setAttribute('data-theme', style);
    localStorage.setItem('theme', style);  
}

function init(){
    // initialize default value
    var theme = getTheme();

    // check if a prefered color theme is set for users that have never been to our site
    const userPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (theme === null) {
        if(userPrefersDark){
            setTheme('dark');
        }
        else{
            setTheme('light');
        }
    }
    else {
        // load a stored theme
        if (theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
        }
        else {
            document.documentElement.setAttribute('data-theme', 'dark');
        }    
    }    
}


// switch themes
function switchTheme(e) {
    var theme = getTheme();
    if (theme === 'light') {
        setTheme('dark');
    }
    else {
        setTheme('light');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    var themeSwitcher = document.querySelector('.theme-switch');
    themeSwitcher.addEventListener('click', switchTheme, false);
}, false);

init();

let lastKnownScrollPosition = 0;
let ticking = false;
const topArrow = document.getElementById('topArrow');

const setCookie = (cname, cvalue, exdays) => {
    const d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    const expires = `expires=${d.toUTCString()}`;
    document.cookie = `${cname}=${cvalue};${expires};path=/`;
};

const getCookie = (cname) => {
    const name = `${cname}=`;
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');

    for (let i = 0; i < ca.length; i += 1) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return '';
};

const switchLang = (lang) => {
    setCookie('lang', lang, 365);
    if (window.location.pathname === '/' && lang === 'ro') {
        window.location.href = '/ro/';
    }

    if (window.location.pathname === '/ro/' && lang === 'en') {
        window.location.href = '/';
    }
};

// Automatically switch language on home
const lang = getCookie('lang');
if (lang) {
    switchLang(lang);
} else {
    // No cookie? Are we on home page? Let's detect the navigator language and redirect accordingly!
    const navLang = navigator.language.slice(0, 2);
    const currentPath = window.location.pathname;
    if (currentPath === '/' && navLang === 'ro') {
        switchLang('ro');
    } else if (currentPath === '/ro/' && navLang === 'ro') {
        switchLang('en');
    }
}

const getAll = (selector) => {
    return Array.prototype.slice.call(document.querySelectorAll(selector), 0);
};

const closeModals = () => {
    const modals = getAll('.modal');
    modals.forEach((el) => {
        el.classList.remove('is-active');
    });
};

const domReady = (callback) => {
    if (
        document.readyState === 'interactive' ||
        document.readyState === 'complete'
    ) {
        callback();
    } else {
        document.addEventListener('DOMContentLoaded', callback);
    }
};

const displayTopArrow = (el, scrollPos) => {
    const arrow = el;
    if (scrollPos > 100) {
        arrow.style.opacity = 1;
        arrow.style.bottom = '80px';
    } else {
        arrow.style.opacity = 0;
        arrow.style.bottom = '60px';
    }
};

window.addEventListener('scroll', () => {
    lastKnownScrollPosition = window.scrollY;

    if (!ticking) {
        window.requestAnimationFrame(() => {
            // Go to top arrow
            if (topArrow) {
                displayTopArrow(topArrow, lastKnownScrollPosition);
            }
            ticking = false;
        });
        ticking = true;
    }
});

// DOM is ready and waiting
domReady(() => {
    const colorChanger = getAll('.is-color-changer');
    const langSwitcher = getAll('.is-lang-switcher');

    // Displaying page
    document.body.style.visibility = 'visible';

    // Lazyload images
    [].forEach.call(document.querySelectorAll('img[data-src]'), (img) => {
        const el = img;
        el.setAttribute('src', el.getAttribute('data-src'));
        el.onload = () => {
            el.removeAttribute('data-src');
        };
    });

    // Get all "navbar-burger" elements
    const $navbarBurgers = Array.prototype.slice.call(
        document.querySelectorAll('.navbar-burger'),
        0,
    );

    // Check if there are any navbar burgers
    if ($navbarBurgers.length > 0) {
        // Add a click event on each of them
        $navbarBurgers.forEach(($el) => {
            $el.addEventListener('click', () => {
                // Get the target from the "data-target" attribute
                const { target } = $el.dataset;
                const $target = document.getElementById(target);

                // Toggle the class on both the "navbar-burger" and the "navbar-menu"
                $el.classList.toggle('is-active');
                $target.classList.toggle('is-active');
            });
        });
    }

    // Checking if a color is set for blog articles
    const blogColor = getCookie('blogColor');
    const blogPostContainer = document.getElementById('blogPostContainer');
    if (blogColor && blogPostContainer) {
        blogPostContainer.classList.add(blogColor);
    }

    // Blog article color changer
    if (colorChanger && colorChanger.length > 0) {
        colorChanger.forEach((el) => {
            el.addEventListener('click', (event) => {
                event.preventDefault();
                const changer = event.target;
                const { color } = changer.dataset;
                blogPostContainer.classList.remove('is-dark');
                blogPostContainer.classList.remove('is-sand');
                setCookie('blogColor', '', -1);

                if (color && color !== 'undefined') {
                    setCookie('blogColor', color, 365);
                    blogPostContainer.classList.add(color);
                }
            });
        });
    }

    if (langSwitcher && langSwitcher.length > 0) {
        langSwitcher.forEach((el) => {
            el.addEventListener('click', (event) => {
                const langSwitch = event.target;
                switchLang(langSwitch.dataset.lang);
            });
        });
    }

    // Copy link on code blocks
    // Thank you Danny Guo! <3
    // https://www.dannyguo.com/blog/how-to-add-copy-to-clipboard-buttons-to-code-blocks-in-hugo/
    document.querySelectorAll('pre > code').forEach((codeBlock) => {
        const button = document.createElement('button');
        button.className = 'copy-code-button';
        button.type = 'button';
        button.innerText = 'Copy';

        const pre = codeBlock.parentNode;
        if (pre.parentNode.classList.contains('highlight')) {
            const highlight = pre.parentNode;
            highlight.parentNode.insertBefore(button, highlight);
        } else {
            pre.parentNode.insertBefore(button, pre);
        }

        button.addEventListener('click', () => {
            navigator.clipboard.writeText(codeBlock.innerText).then(
                () => {
                    /* Chrome doesn't seem to blur automatically,
                             leaving the button in a focused state. */
                    button.blur();

                    button.innerText = 'Copied!';

                    setTimeout(() => {
                        button.innerText = 'Copy';
                    }, 2000);
                },
                () => {
                    button.innerText = 'Error';
                },
            );
        });
    });
});