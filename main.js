/**
 * @file main.js
 * @description Main JavaScript file for the wedding website. 
 * Handles client-side routing (single-page application feel), 
 * dynamic content sorting, content updates, and initialisation of interactive elements like tabs and forms.
 */

// -----------------------------------------------------------------------------
// NAVIGATION & PAGE LOADING
// -----------------------------------------------------------------------------

/**
 * Attaches click event listeners to navigation links to generic smooth page transitions
 * instead of full page reloads.
 */
function handleNavigation() {
    // Select all anchor tags inside the header element
    const links = document.querySelectorAll('header a');
    
    // Iterate over each link
    links.forEach(link => {
        // Add a click event listener
        link.addEventListener('click', function (e) {
            // Check if the link is internal (same hostname)
            if (this.hostname === window.location.hostname) {
                // Prevent the default browser navigation behavior
                e.preventDefault();
                
                // Get the URL from the link
                const url = this.href;
                
                // Call loadPage to fetch and display the new content
                loadPage(url);

                // Check for the mobile hamburger menu elements
                const hamMenu = document.querySelector('.ham-menu');
                const offScreenMenu = document.querySelector('.menu');
                
                // If the mobile menu is open, close it after clicking a link
                if (hamMenu && hamMenu.classList.contains('open')) {
                    hamMenu.classList.remove('open');
                    offScreenMenu.classList.remove('visible');
                }
            }
        });
    });
}

/**
 * Fetches the content of a URL and updates the DOM, simulating a page navigation.
 * 
 * @param {string} url - The URL to load.
 * @param {boolean} [pushState=true] - Whether to push the new state to the history API.
 */
function loadPage(url, pushState = true) {
    // Fetch the HTML content from the given URL
    fetch(url)
        .then(response => response.text()) // Convert the response to text
        .then(html => {
            // Create a temporary DOM parser to parse the fetched HTML string
            const parser = new DOMParser();
            
            // Parse the HTML string into a Document object
            const doc = parser.parseFromString(html, 'text/html');

            // Update the body's class name to match the new page (e.g., for background images)
            document.body.className = doc.body.className;

            // -- CSS HANDLING --
            // Select the page-specific style link in the *new* document
            const newCssLink = doc.getElementById('page-specific-css');
            
            // Select the page-specific style link in the *current* document
            const currentCssLink = document.getElementById('page-specific-css');

            // Check if the new page has a specific stylesheet
            if (newCssLink) {
                // If we already have a page-specific stylesheet element
                if (currentCssLink) {
                    // Just update its href to the new stylesheet
                    currentCssLink.href = newCssLink.getAttribute('href');
                } else {
                    // If not, create a new link element
                    const head = document.head;
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.type = 'text/css';
                    link.id = 'page-specific-css'; // Set the ID for future reference
                    link.href = newCssLink.getAttribute('href');
                    
                    // Add the new link to the head
                    document.head.appendChild(link);
                }
            }
            // Note: If the new page *doesn't* have a specific CSS, we might want to remove the old one,
            // but the current logic effectively leaves the old one or relies on global styles.
            // A more robust approach might be to remove currentCssLink if newCssLink is null.

            // -- CONTENT UPDATE --
            // Select the main content container (.text) from the new document
            const newContent = doc.querySelector('.text');
            // Select the main content container in the current document
            const currentContent = document.querySelector('.text');
            
            // If both exist, swap the HTML content
            if (newContent && currentContent) {
                currentContent.innerHTML = newContent.innerHTML;
            }

            // Update the document title to match the new page
            document.title = doc.title;

            // If we should push this state to browser history (normal navigation)
            if (pushState) {
                window.history.pushState({}, '', url);
            }

            // Re-initialise any scripts or dynamic elements for the new page
            initPageScripts();
        })
        .catch(err => console.error('Failed to load page', err)); // Log any errors during fetch
}

/**
 * Adds a signature footer to the body if it doesn't already exist.
 */
function addSignature() {
    // Check if the signature element already exists
    if (!document.querySelector('.site-signature')) {
        // Create a new anchor element that preserves existing styling
        const signature = document.createElement('a');
        
        // Assign the class name for styling
        signature.className = 'site-signature';
        
        // Preserve visual text while making it a link to the repo
        signature.textContent = "A Ruairí O'Connor Website";
        signature.href = 'https://github.com/roconnor98/weddingWebsite';
        signature.target = '_blank';
        signature.rel = 'noopener noreferrer';
        // Append it to the end of the body
        document.body.appendChild(signature);
    }
}

// -----------------------------------------------------------------------------
// INITIALIsATION
// -----------------------------------------------------------------------------

// Fetch and inject the header (navigation menu) on initial load
fetch('/header.html')
    .then(response => response.text()) // Convert response to text
    .then(data => {
        // Insert the header HTML at the beginning of the body
        document.body.insertAdjacentHTML('afterbegin', data);

        // Select the hamburger menu icon
        const hamMenu = document.querySelector('.ham-menu');
        
        // Select the off-screen menu container
        const offScreenMenu = document.querySelector('.menu');

        // Add click listener to hamburger menu for mobile toggling
        hamMenu.addEventListener('click', () => {
            hamMenu.classList.toggle('open');  // Animate hamburger icon
            offScreenMenu.classList.toggle('visible'); // Slide in/out menu
        });

        // Initialise navigation handling for the newly injected links
        handleNavigation();
        
        // Populate environment variables (text content)
        addEnvVars();
        
        // Add the site signature
        addSignature();
    });

// Listen for browser "Back" or "Forward" button clicks
window.addEventListener('popstate', () => {
    // Load the URL of the state we popped to, but don't push a new state
    loadPage(window.location.href, false);
});

/**
 * Initialises generic scripts and checks for specific elements on the current page
 * to run their respective initialisation functions.
 */
function initPageScripts() {
    // Populate text from config.js
    addEnvVars();
    
    // If the RSVP attendance section exists, initialise RSVP logic
    if (document.getElementById('attendance-section')) {
        initRSVP();
    }
    
    // If tabs exist (e.g., accommodation or schedule), initialise them
    if (document.querySelector('.tabs')) {
        initTabs();
    }

    // Initialise horizontal card scrollers
    if (document.querySelector('.card-scroller')) {
        initCardScrollers();
    }

    // Initialise "Read more" truncation for long descriptions
    if (document.querySelector('.description-text')) {
        initReadMore();
    }
}

/**
 * Populates HTML elements with text/values from the global window.env object (config.js).
 * Iterates through various mappings of IDs to environment variables.
 */
function addEnvVars() {
    // Check if the environment object exists
    if (window.env) {
        
        // Set Wedding Title
        if (window.env.WEDDING_TITLE) {
            const titleElement = document.getElementById('wedding-title');
            if (titleElement) {
                titleElement.textContent = window.env.WEDDING_TITLE;
            }
            document.title = window.env.WEDDING_TITLE;
        }

        // Set Wedding Date
        if (window.env.WEDDING_DATE) {
            const dateElement = document.getElementById('wedding-date');
            if (dateElement) {
                // innerHTML used here to allow HTML tags like <sup>
                dateElement.innerHTML = window.env.WEDDING_DATE;
            }
        }

        // Set Wedding Initials
        if (window.env.WEDDING_INITIALS) {
            const initialsElement = document.getElementById('wedding-initials');
            if (initialsElement) {
                initialsElement.textContent = window.env.WEDDING_INITIALS;
            }
        }

        // Set Bride Name
        if (window.env.BRIDE_NAME) {
            const el = document.getElementById('faq-contact-name');
            if (el) el.textContent = window.env.BRIDE_NAME;
        }

        // --- Accommodation Text Mapping ---
        // Map HTML IDs to keys in window.env
        const accommMap = {
            'accomm-onsite-intro': 'ACCOMM_ONSITE_INTRO',
            'accomm-desc-1': 'ACCOMM_DESC_1',
            'accomm-desc-2': 'ACCOMM_DESC_2',
            'accomm-desc-3': 'ACCOMM_DESC_3',
            'accomm-alternate-intro': 'ACCOMM_ALTERNATE_INTRO',
            'accomm-alt-desc-1': 'ACCOMM_ALT_DESC_1',
            'accomm-alt-desc-2': 'ACCOMM_ALT_DESC_2',
            'accomm-alt-desc-3': 'ACCOMM_ALT_DESC_3',
            'accomm-alt-desc-4': 'ACCOMM_ALT_DESC_4',
            'accomm-alt-desc-5': 'ACCOMM_ALT_DESC_5',
            'accomm-title-1': 'ACCOMM_TITLE_1',
            'accomm-title-2': 'ACCOMM_TITLE_2',
            'accomm-title-3': 'ACCOMM_TITLE_3',
            'accomm-alt-title-1': 'ACCOMM_ALT_TITLE_1',
            'accomm-alt-title-2': 'ACCOMM_ALT_TITLE_2',
            'accomm-alt-title-3': 'ACCOMM_ALT_TITLE_3',
            'accomm-alt-title-4': 'ACCOMM_ALT_TITLE_4',
            'accomm-alt-title-5': 'ACCOMM_ALT_TITLE_5'
        };

        // --- Image Alt Text Mapping ---
        // Map image IDs to keys in window.env (using Titles for alt text)
        const imgMap = {
            'img-1': 'ACCOMM_TITLE_1',
            'img-2': 'ACCOMM_TITLE_2',
            'img-3': 'ACCOMM_TITLE_3',
            'alt-img-1': 'ACCOMM_ALT_TITLE_1',
            'alt-img-2': 'ACCOMM_ALT_TITLE_2',
            'alt-img-3': 'ACCOMM_ALT_TITLE_3',
            'alt-img-4': 'ACCOMM_ALT_TITLE_4',
            'alt-img-5': 'ACCOMM_ALT_TITLE_5'
        };

        // Loop through text mappings and update content
        for (const [id, envKey] of Object.entries(accommMap)) {
            if (window.env[envKey]) {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = window.env[envKey];
                }
            }
        }

        // Loop through image mappings and update alt text
        for (const [id, envKey] of Object.entries(imgMap)) {
            if (window.env[envKey]) {
                const element = document.getElementById(id);
                if (element) {
                    element.alt = window.env[envKey];
                }
            }
        }

        // --- Image Source Mapping ---
        const imgSrcMap = {
            'img-1': 'ACCOMM_IMG_1',
            'img-2': 'ACCOMM_IMG_2',
            'img-3': 'ACCOMM_IMG_3',
            'alt-img-1': 'ACCOMM_ALT_IMG_1',
            'alt-img-2': 'ACCOMM_ALT_IMG_2',
            'alt-img-3': 'ACCOMM_ALT_IMG_3',
            'alt-img-4': 'ACCOMM_ALT_IMG_4',
            'alt-img-5': 'ACCOMM_ALT_IMG_5'
        };

        // Loop through image source mappings
        for (const [id, envKey] of Object.entries(imgSrcMap)) {
            if (window.env[envKey]) {
                const element = document.getElementById(id);
                if (element) {
                    element.src = window.env[envKey];
                }
            }
        }

        // --- Alternate Accommodation Buttons ---
        function updateCardButtons(imgId, telKey, emailKey, webKey) {
            const imgEl = document.getElementById(imgId);
            if (imgEl) {
                const card = imgEl.closest('.display-card');
                if (card) {
                    const buttons = card.querySelectorAll('.card-actions button');
                    if (buttons.length >= 3) {
                        // Call Button
                        if (window.env[telKey]) {
                            buttons[0].onclick = () => window.open('tel:' + window.env[telKey], '_blank');
                        }
                        // Email Button
                        if (window.env[emailKey]) {
                            buttons[1].onclick = () => window.open('mailto:' + window.env[emailKey], '_blank');
                        }
                        // Web Button
                        if (window.env[webKey]) {
                            buttons[2].onclick = () => window.open(window.env[webKey], '_blank');
                        }
                    }
                }
            }
        }

        // Update buttons for each alternate accommodation card
        if (window.env.ACCOMM_ALT_1_TEL) updateCardButtons('alt-img-1', 'ACCOMM_ALT_1_TEL', 'ACCOMM_ALT_1_EMAIL', 'ACCOMM_ALT_1_WEB');
        if (window.env.ACCOMM_ALT_2_TEL) updateCardButtons('alt-img-2', 'ACCOMM_ALT_2_TEL', 'ACCOMM_ALT_2_EMAIL', 'ACCOMM_ALT_2_WEB');
        if (window.env.ACCOMM_ALT_3_TEL) updateCardButtons('alt-img-3', 'ACCOMM_ALT_3_TEL', 'ACCOMM_ALT_3_EMAIL', 'ACCOMM_ALT_3_WEB');
        if (window.env.ACCOMM_ALT_4_TEL) updateCardButtons('alt-img-4', 'ACCOMM_ALT_4_TEL', 'ACCOMM_ALT_4_EMAIL', 'ACCOMM_ALT_4_WEB');
        if (window.env.ACCOMM_ALT_5_TEL) updateCardButtons('alt-img-5', 'ACCOMM_ALT_5_TEL', 'ACCOMM_ALT_5_EMAIL', 'ACCOMM_ALT_5_WEB');


        // --- RSVP Form Configuration ---
        if (window.env.RSVP_FORM_ACTION) {
            const form = document.getElementById('rsvp-form');
            if (form) {
                form.action = window.env.RSVP_FORM_ACTION;
            }
        }
        // Set configured Entry IDs for Google Form inputs
        if (window.env.RSVP_ENTRY_EMAIL) {
            const email = document.getElementById('email');
            if (email) email.name = window.env.RSVP_ENTRY_EMAIL;
        }
        if (window.env.RSVP_ENTRY_NAME) {
            const name = document.getElementById('name');
            if (name) name.name = window.env.RSVP_ENTRY_NAME;
        }
        if (window.env.RSVP_ENTRY_ATTENDANCE) {
            const attendanceRadios = document.querySelectorAll('.attendance-radio');
            attendanceRadios.forEach(radio => radio.name = window.env.RSVP_ENTRY_ATTENDANCE);
        }
        if (window.env.RSVP_ENTRY_ACCOMMODATION) {
            const accommodationRadios = document.querySelectorAll('.accommodation-radio');
            accommodationRadios.forEach(radio => radio.name = window.env.RSVP_ENTRY_ACCOMMODATION);
        }

        // --- Schedule & Location Links ---
        // Set Ceremony Name and Map Link
        if (window.env.CEREMONY_LOCATION_NAME) {
            const ceremonyLink = document.getElementById('ceremony-link');
            if (ceremonyLink) {
                ceremonyLink.textContent = window.env.CEREMONY_LOCATION_NAME;
            }
        }
        if (window.env.CEREMONY_LOCATION_MAP_URL) {
            const ceremonyLink = document.getElementById('ceremony-link');
            if (ceremonyLink) {
                ceremonyLink.href = window.env.CEREMONY_LOCATION_MAP_URL;
            }
        }
        // Set Reception Name and Map Link
        if (window.env.RECEPTION_LOCATION_NAME) {
            const receptionLink = document.getElementById('reception-link');
            if (receptionLink) {
                receptionLink.textContent = window.env.RECEPTION_LOCATION_NAME;
            }
        }
        if (window.env.RECEPTION_LOCATION_MAP_URL) {
            const receptionLink = document.getElementById('reception-link');
            if (receptionLink) {
                receptionLink.href = window.env.RECEPTION_LOCATION_MAP_URL;
            }
        }
    }
}

// -----------------------------------------------------------------------------
// PAGE SPECIFIC INTERACTIONS
// -----------------------------------------------------------------------------

/**
 * Initialises the tab system based on URL parameters (e.g., ?tab=xyz).
 */
function initTabs() {
    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const tabName = urlParams.get('tab');

    if (tabName) {
        // Find the button that corresponds to this tab
        const buttons = document.querySelectorAll('.tab-button');
        let targetButton = null;

        buttons.forEach(btn => {
            // Check the onclick attribute to see if it opens the requested tab
            const onclick = btn.getAttribute('onclick');
            if (onclick && onclick.includes(`'${tabName}'`)) {
                targetButton = btn;
            }
        });

        if (targetButton) {
            // Trigger the tab opening, passing a mock event object with the button as currentTarget
            window.openTab({ currentTarget: targetButton }, tabName);
        }
    }
}

/**
 * Performs a custom smooth scroll with a specified duration.
 * @param {HTMLElement} element - The element to scroll.
 * @param {number} target - The target scrollLeft position.
 * @param {number} duration - Animation duration in milliseconds.
 */
function slowSmoothScroll(element, target, duration) {
    if (element.dataset.isScrolling === 'true') return;
    
    const start = element.scrollLeft;
    const change = target - start;
    if (Math.abs(change) < 1) return; // Already there

    const startTime = performance.now();
    element.dataset.isScrolling = 'true';
    
    // Temporarily disable scroll snapping and smooth behavior
    const originalSnapType = element.style.scrollSnapType;
    const originalScrollBehavior = element.style.scrollBehavior;
    
    element.style.scrollSnapType = 'none';
    element.style.scrollBehavior = 'auto';

    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function: easeInOutQuad
        const ease = progress < 0.5 
            ? 2 * progress * progress 
            : -1 + (4 - 2 * progress) * progress;

        element.scrollLeft = start + change * ease;

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Restore original styles
            if (originalSnapType) {
                element.style.scrollSnapType = originalSnapType;
            } else {
                element.style.removeProperty('scroll-snap-type');
            }
            element.style.scrollBehavior = originalScrollBehavior;
            element.dataset.isScrolling = 'false';
        }
    }

    requestAnimationFrame(animate);
}

/**
 * Initialises the horizontal card scrollers with click-to-center navigation.
 */
function initCardScrollers() {
    const wrappers = document.querySelectorAll('.scroller-wrapper');

    wrappers.forEach(wrapper => {
        const scroller = wrapper.querySelector('.card-scroller');
        const cards = scroller.querySelectorAll('.display-card');

        /**
         * Updates the 'active' class on cards based on their scroll position.
         */
        const updateActiveCard = () => {
            const scrollerCenter = scroller.scrollLeft + scroller.clientWidth / 2;
            let closestCard = null;
            let minDistance = Infinity;

            cards.forEach(card => {
                const cardCenter = card.offsetLeft + card.clientWidth / 2;
                const distance = Math.abs(scrollerCenter - cardCenter);

                if (distance < minDistance) {
                    minDistance = distance;
                    closestCard = card;
                }
            });

            cards.forEach(card => {
                const isActive = card === closestCard;
                card.classList.toggle('active', isActive);

                // Mark inactive cards and update interactive elements so only the active card is operable
                card.classList.toggle('inactive', !isActive);

                const interactives = card.querySelectorAll('button, a, input, select, textarea');
                interactives.forEach(el => {
                    if (!isActive) {
                        // Don't use disabled attribute so clicks can bubble to the card; instead remove from tab order and mark aria-disabled
                        el.setAttribute('aria-disabled', 'true');
                        el.tabIndex = -1;
                    } else {
                        el.removeAttribute('aria-disabled');
                        el.tabIndex = 0;
                    }
                });

                // Auto-collapse if scrolled away
                if (!isActive) {
                    const desc = card.querySelector('.description-text.expanded');
                    if (desc && desc.toggleReadMore) {
                        desc.toggleReadMore();
                    }
                }
            });
        };

        // Add click listener to each card to center it on click
        cards.forEach(card => {
            card.addEventListener('click', (e) => {
                const isActiveCard = card.classList.contains('active');

                // If clicking a button inside an active card, allow the button's own handler to run
                if (e.target.tagName === 'BUTTON' && isActiveCard) return;

                // Otherwise (including clicking buttons on non-active cards), make this card active by centering it
                const scrollerRect = scroller.getBoundingClientRect();
                const cardRect = card.getBoundingClientRect();
                
                // Calculate target scroll position relative to scroller's current scroll
                const relativeCardLeft = cardRect.left - scrollerRect.left;
                const scrollTarget = scroller.scrollLeft + relativeCardLeft - (scroller.clientWidth / 2) + (card.clientWidth / 2);
                
                slowSmoothScroll(scroller, scrollTarget, 500);
            });
        });

        // Sync active class on scroll
        scroller.addEventListener('scroll', updateActiveCard);
        
        // Initial run to set active card
        updateActiveCard();

        // Hide gradient if scroller isn't scrollable
        if (scroller.scrollWidth <= scroller.offsetWidth) {
            wrapper.classList.add('no-scroll');
        }
    });
}

/**
 * Initialises the "Read more" toggle for long descriptions.
 * Truncates text to 3 lines and appends "more..." inline.
 */
function initReadMore() {
    const descriptions = document.querySelectorAll('.description-text');

    // Increase delay to ensure text is rendered, styles are applied, and tab animations finish
    setTimeout(() => {
        // Build baseline heights per scroller: tallest header + image + actions among its cards.
        const scrollerBaselines = new Map();
        descriptions.forEach(desc => {
            const scroller = desc.closest('.card-scroller');
            if (!scroller || scrollerBaselines.has(scroller)) return;

            let tallestParts = 0;
            scroller.querySelectorAll('.display-card').forEach(card => {
                const headerEl = card.querySelector('.card-header');
                const imgEl = card.querySelector('.room-image');
                const actionsEl = card.querySelector('.card-actions');
                const headerH = headerEl ? headerEl.offsetHeight : 0;
                const imgH = imgEl ? imgEl.offsetHeight : 0;
                const actionsH = actionsEl ? actionsEl.offsetHeight : 0;
                tallestParts = Math.max(tallestParts, headerH + imgH + actionsH);
            });

            scrollerBaselines.set(scroller, tallestParts);
        });

        descriptions.forEach(desc => {
            // Skip if already truncated or if effectively hidden
            if (desc.classList.contains('truncated') || 
                desc.offsetParent === null || 
                window.getComputedStyle(desc).display === 'none') {
                return;
            }

            const fullText = desc.textContent.trim();
            if (!fullText) return;

            // Get exact line height in pixels
            const style = window.getComputedStyle(desc);
            const lineHeight = parseFloat(style.lineHeight);
            
            // If lineHeight is "normal", fallback to approx font-size * 1.2
            const effectiveLineHeight = isNaN(lineHeight) ? parseFloat(style.fontSize) * 1.2 : lineHeight;

            // Determine baseline card height so the tallest (by title) ends up with ~3 lines initially
            const scroller = desc.closest('.card-scroller');
            const baselineParts = scrollerBaselines.get(scroller) || 0;
            const baselineCardHeight = Math.max(baselineParts + Math.floor(effectiveLineHeight * 3) + 20, 0);

            // Calculate available height for this specific description inside that baseline
            const card = desc.closest('.display-card');
            let availableHeight = 0;
            if (card) {
                const headerEl = card.querySelector('.card-header');
                const imgEl = card.querySelector('.room-image');
                const actionsEl = card.querySelector('.card-actions');
                const headerHeight = headerEl ? headerEl.offsetHeight : 0;
                const imgHeight = imgEl ? imgEl.offsetHeight : 0;
                const actionsHeight = actionsEl ? actionsEl.offsetHeight : 0;
                const detailsVerticalFudge = 10; // small padding/margin fudge
                availableHeight = Math.max(0, baselineCardHeight - headerHeight - imgHeight - actionsHeight - detailsVerticalFudge);
            } else {
                availableHeight = Math.floor(effectiveLineHeight * 3);
            }

            const maxLines = Math.max(1, Math.floor(availableHeight / effectiveLineHeight));
            const maxHeight = Math.floor(effectiveLineHeight * maxLines) + 1;

            // Only truncate if the text actually overflows the calculated available height
            if (desc.scrollHeight > maxHeight) {
                desc.classList.add('truncated');
                desc.dataset.fullText = fullText;

                // Find truncation point for the calculated maxHeight
                let text = fullText;
                
                while (desc.scrollHeight > maxHeight && text.length > 0) {
                    text = text.slice(0, -1);
                    desc.textContent = text + '...';
                }

                // Back up 8 characters as requested for the inline link
                const truncatedText = text.slice(0, -8);
                desc.textContent = truncatedText;
                desc.dataset.truncatedText = truncatedText;

                // Create the literal inline toggle link
                const moreLink = document.createElement('a');
                moreLink.className = 'read-more-link';
                moreLink.href = 'javascript:void(0)';
                moreLink.textContent = 'more...';
                desc.moreLink = moreLink;
                
                const updateScrollerExpandedState = (d) => {
                    const scrollerEl = d.closest('.card-scroller');
                    if (!scrollerEl) return;
                    const anyExpanded = scrollerEl.querySelector('.description-text.expanded');
                    scrollerEl.classList.toggle('has-expanded', !!anyExpanded);
                };

                const toggle = () => {
                    const isExpanded = desc.classList.contains('expanded');
                    if (isExpanded) {
                        // Collapse
                        desc.textContent = truncatedText;
                        moreLink.textContent = 'more...';
                        desc.appendChild(moreLink);
                        desc.classList.remove('expanded');
                    } else {
                        // Expand
                        desc.textContent = desc.dataset.fullText + ' ';
                        moreLink.textContent = 'less';
                        desc.appendChild(moreLink);
                        desc.classList.add('expanded');
                    }
                    // Update scroller state whenever a description toggles
                    updateScrollerExpandedState(desc);
                };
                
                desc.toggleReadMore = toggle;
                // Ensure scroller has correct state on initialisation
                updateScrollerExpandedState(desc);

                moreLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggle();
                });

                desc.appendChild(moreLink);
            }
        });
    }, 100);
}

/**
 * Initialises the RSVP form logic, including toggling the accommodation section
 * and handling the hidden iframe submission (to avoid page redirect).
 */
function initRSVP() {
    // Check if the accommodation section exists
    const accommodationSection = document.getElementById('accommodation-section');
    if (!accommodationSection) return;

    // Select all attendance radio buttons
    const attendanceRadios = document.querySelectorAll('#attendance-section input[type="radio"]');

    /**
     * Toggles visibility of the accommodation section based on attendance.
     */
    function toggleAccommodation() {
        // Check which attendance option is selected
        const selected = document.querySelector('#attendance-section input[type="radio"]:checked');
        
        // If "Yes", show accommodation options
        if (selected && selected.value === "Yes, I'll be there") {
            accommodationSection.style.display = 'block';
            
            // Make accommodation fields required
            const accRadios = accommodationSection.querySelectorAll('input[type="radio"]');
            accRadios.forEach(r => r.required = true);
        } else {
            // If "No" (or nothing), hide accommodation options
            accommodationSection.style.display = 'none';
            
            // Remove required attribute and uncheck selections
            const accRadios = accommodationSection.querySelectorAll('input[type="radio"]');
            accRadios.forEach(r => {
                r.required = false;
                r.checked = false;
            });
        }
    }

    // Add change listeners to attendance radios to trigger the toggle
    attendanceRadios.forEach(radio => {
        radio.addEventListener('change', toggleAccommodation);
    });

    // Run once on load to set initial state
    toggleAccommodation();

    // -- Hidden Iframe Logic for Form Submission --
    // Check if hidden iframe exists, if not create it
    let iframe = document.getElementById('hidden_iframe');
    if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.name = 'hidden_iframe';
        iframe.id = 'hidden_iframe';
        iframe.style.display = 'none'; // Keep it invisible
        document.body.appendChild(iframe);
    }

    // Flag to track if form was actually submitted
    const form = document.querySelector('form');
    let submitted = false;

    if (form) {
        // When form submits, set flag to true
        form.addEventListener('submit', () => {
            submitted = true;
        });
    }

    // When the iframe loads (response received from Google), check if it was our submission
    if (iframe) {
        iframe.onload = function () {
            if (submitted) {
                // If we submitted, redirect to the thank you page
                loadPage('/thanks');
            }
        };
    }
}

/**
 * Global function to switch tabs.
 * Exposed on window so it can be called from inline onclick handlers.
 * 
 * @param {Event} evt - The click event.
 * @param {string} tabName - The ID of the tab content to show.
 */
window.openTab = function (evt, tabName) {
    // Hide all tab content elements
    const tabcontent = document.getElementsByClassName("tab-content");
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].classList.remove("active");
    }

    // Remove "active" class from all tab buttons
    const tablinks = document.getElementsByClassName("tab-button");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active");
    }

    // Show the selected tab content
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.classList.add("active");
    }

    // Highlight the button that was clicked
    if (evt && evt.currentTarget) {
        evt.currentTarget.classList.add("active");
    }

    // Update the URL to include the tab parameter without reloading
    const url = new URL(window.location);
    url.searchParams.set('tab', tabName);
    window.history.replaceState({}, '', url);

    // Re-initialise Read More for newly visible content
    initReadMore();
};

// Ensure scripts run on initial page load, handling DOM Content Loaded state
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPageScripts);
} else {
    initPageScripts();
}
