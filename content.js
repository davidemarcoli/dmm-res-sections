// Global variable to track the current URL
let currentUrl = location.href;
let activeObserver = null;  // Store the active MutationObserver
let customElementsInjected = false; // To track if we've already injected custom elements
let urlChangeObserver = null; // Store URL change observer

// Function to initialize the MutationObserver
function initObserver() {
    console.log("Initializing MutationObserver with delay...");
    
    // Ensure we're on a /movie/* page
    if (!currentUrl.includes('://debridmediamanager.com/movie')) {
        console.log("Not a /movie/* page. Skipping observer initialization.");
        return;
    }

    // Set a delay before running MutationObserver to ensure all content loads
    setTimeout(() => {
        // Disconnect any existing observer before creating a new one
        if (activeObserver) {
            console.log("Disconnecting previous observer.");
            activeObserver.disconnect();
        }

        activeObserver = new MutationObserver((mutations, observer) => {
            const parentContainer = document.querySelector('.mx-1');
            if (parentContainer) {
                console.log(".mx-1 element found.");
                observer.disconnect();  // Stop observing once we find the element

                // Step 1 - Inject new UI elements below the background top section
                if (!customElementsInjected) {
                    removeAndInjectCustomSearchUI(); // Add only if not yet added
                    injectCustomSectionBelowBackground(); // Ensure we're injecting the custom section below the background top section
                    customElementsInjected = true;
                }

                // Step 2 - Perform categorization based on resolution and version
                categorizeByResolutionAndVersion();
            } else {
                console.warn(".mx-1 container not yet found.");
            }
        });

        // Observe changes in the document body
        activeObserver.observe(document.body, { childList: true, subtree: true });
    }, 3000); // Adjust the timeout delay (3 seconds here) as per your needs
}

// Function to clean up observers
function cleanupObservers() {
    if (activeObserver) {
        activeObserver.disconnect();
        activeObserver = null;
    }
    if (urlChangeObserver) {
        urlChangeObserver.disconnect();
        urlChangeObserver = null;
    }
}

// Function to remove the custom elements before leaving the /movie/* page
function removeCustomElements() {
    console.log("Removing custom elements...");

    // Remove the custom search/filter container
    const customSearchFilter = document.querySelector('.custom-search-filter');
    if (customSearchFilter) {
        customSearchFilter.remove();
        console.log("Removed custom search/filter elements.");
    }

    // Remove the custom section below the background top section
    const customSection = document.querySelector('.custom-section');
    if (customSection) {
        customSection.remove();
        console.log("Removed custom section.");
    }

    customElementsInjected = false; // Reset flag
}

// Function to handle page changes and manage custom UI
function handlePageChange(newUrl) {
    console.log(`Tracking URL change from ${currentUrl} to ${newUrl}`);
    
    // Update current URL
    currentUrl = newUrl;

    if (currentUrl.includes('://debridmediamanager.com/movie')) {
        // We're on the /movie page, initialize the observer and inject UI
        initObserver();
    } else {
        // We're not on a /movie page, so remove any custom UI elements
        removeCustomElements();
    }
}

// Enhanced URL change detection for both Firefox and Chrome
function detectUrlChange() {
    // Clean up existing observers
    cleanupObservers();

    // Create new URL change observer
    urlChangeObserver = new MutationObserver(() => {
        const newUrl = location.href;
        if (newUrl !== currentUrl) {
            handlePageChange(newUrl);
        }
    });

    // Observe both title and body for changes
    urlChangeObserver.observe(document.querySelector('head'), { 
        childList: true, 
        subtree: true 
    });
    urlChangeObserver.observe(document.querySelector('body'), { 
        childList: true, 
        subtree: true 
    });

    // Add popstate event listener for browser navigation
    window.addEventListener('popstate', () => {
        const newUrl = location.href;
        if (newUrl !== currentUrl) {
            handlePageChange(newUrl);
        }
    });

    // Add pushState and replaceState event listeners
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function() {
        originalPushState.apply(this, arguments);
        handlePageChange(location.href);
    };

    history.replaceState = function() {
        originalReplaceState.apply(this, arguments);
        handlePageChange(location.href);
    };
}

// Function to inject the custom section BELOW the background top section
function injectCustomSectionBelowBackground() {
    // Locate the "background top section" - based on provided class
    const backgroundSection = document.querySelector('.grid.auto-cols-auto'); // Adjust to match your top background section's class
    
    if (!backgroundSection) {
        console.warn("Background section not found.");
        return;
    }

    // Create a new custom section below the background top section
    const customSection = document.createElement('div');
    customSection.classList.add('custom-section');  // Optionally style it
    
    customSection.innerHTML = `
        <div style="padding: 5px; margin-top: 5px;">
            <div class="mb-2 flex items-center gap-2 overflow-x-auto p-2">
                <span class="bg-gray-800 cursor-pointer whitespace-nowrap rounded px-2 py-1 text-xs text-white" id="singleFilter">Single</span>
                <span class="bg-blue-900 cursor-pointer whitespace-nowrap rounded px-2 py-1 text-xs text-white" id="multiFilter">With extras</span>
            </div>

            <div class="mb-1 flex items-center py-2 border-b-2 border-gray-600">
                <input class="mr-3 w-full appearance-none border-none bg-transparent px-2 py-1 text-sm leading-tight text-gray-100 focus:outline-none" 
                       id="customSearch" placeholder="filter results | supports regex">
                <span class="cursor-pointer rounded bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" id="resetBtn">
                    Reset
                </span>
            </div>
        </div>
    `;

    // Insert the custom section right below the background section
    backgroundSection.parentNode.insertBefore(customSection, backgroundSection.nextSibling);

    console.log("Custom section injected below the background top section.");

    // Bind event listeners to the new custom section elements
    bindCustomUIEvents();
}

// Function to remove existing search/filter elements and inject custom ones
function removeAndInjectCustomSearchUI() {
    // Select and remove existing elements
    const existingSearchBox = document.querySelector('.mr-3');
    const existingFilterButtons = document.querySelector('.mb-2');
    const existingResetButton = document.querySelector('.me-2');

    if (existingSearchBox) {
        console.log("Removing existing search box...");
        existingSearchBox.remove();
    }

    if (existingFilterButtons) {
        console.log("Removing existing filter buttons...");
        existingFilterButtons.remove();
    }

    if (existingResetButton) {
        console.log("Removing existing reset button...");
        existingResetButton.remove();
    }
}

// Function to bind event listeners to custom search and filter elements
function bindCustomUIEvents() {
    const searchInput = document.getElementById("customSearch");
    const resetButton = document.getElementById("resetBtn");
    const singleFilterButton = document.getElementById("singleFilter");
    const multiFilterButton = document.getElementById("multiFilter");

    if (searchInput) {
        searchInput.addEventListener('input', applyRegexFilter);
    }

    if (resetButton) {
        resetButton.addEventListener('click', resetFilters);
    }

    if (singleFilterButton) {
        singleFilterButton.addEventListener('click', function() {
            filterByType('Single');
        });
    }

    if (multiFilterButton) {
        multiFilterButton.addEventListener('click', function() {
            filterByType('With extras');
        });
    }
}

// Function to apply the regex search over file titles
function applyRegexFilter() {
    const searchInputValue = document.getElementById('customSearch').value;
    const fileContainers = document.querySelectorAll('.space-y-2');

    try {
        const regex = new RegExp(searchInputValue, 'i');  // case-insensitive regex
        fileContainers.forEach(container => {
            const titleElement = container.querySelector('h2');
            if (titleElement && regex.test(titleElement.textContent)) {
                container.style.display = 'block';
            } else {
                container.style.display = 'none';
            }
        });
    } catch (e) {
        console.error(`Invalid regex: ${e.message}`);
    }
}

// Function to reset all filters and show all content
function resetFilters() {
    document.getElementById('customSearch').value = '';  // Reset search input
    const fileContainers = document.querySelectorAll('.space-y-2');
    fileContainers.forEach(container => {
        container.style.display = 'block';  // Show all items
    });
}

// Function to filter content by file type: either 'Single' or 'With extras'.
function filterByType(type) {
    const fileContainers = document.querySelectorAll('.space-y-2');
    
    fileContainers.forEach(container => {
        const fileTypeSpan = container.querySelector('span.haptic-sm'); // Adjust this selector as needed.
        if (fileTypeSpan && fileTypeSpan.textContent.includes(type)) {
            container.style.display = 'block';  // Show containers matching the type
        } else {
            container.style.display = 'none';  // Hide others
        }
    });
}

// Categorization logic
function categorizeByResolutionAndVersion() {
    console.log("Running categorizeByResolutionAndVersion...");

    const parentContainer = document.querySelector('.mx-1');

    if (!parentContainer) {
        console.error(".mx-1 container not found!");
        return;
    }

    const containers = parentContainer.querySelectorAll('div');
    console.log(`Found ${containers.length} div elements inside .mx-1 container...`);

    const resolutionData = {
        "2160p": {},
        "1080p": {},
        "720p": {},
        "Other": {}
    };

    const versionPatterns = [
        { version: "blueray remux", regex: /\b(?:blu-ray remux|blueray remux)\b/i },
        { version: "bdrip", regex: /\bbdrip\b/i },
        { version: "brrip", regex: /\bbrrip\b/i },
        { version: "blueray", regex: /\bblu-ray|blueray\b/i },
        { version: "web-dl", regex: /\bweb-dl\b/i },
        { version: "webrip", regex: /\bwebrip\b/i },
        { version: "hdtv", regex: /\bhdtv\b/i },
        { version: "dvdrip", regex: /\bdvdrip\b/i },
        { version: "dvd5", regex: /\bdvd5\b/i },
        { version: "dvd9", regex: /\bdvd9\b/i },
        { version: "hdrip", regex: /\bhdrip\b/i },
        { version: "cam", regex: /\bcam\b/i },
        { version: "ts", regex: /\b(?:ts|tele_sync)\b/i },
        { version: "pdvd", regex: /\bpdvd\b/i },
        { version: "dvdscr", regex: /\bdvdscr\b/i },
        { version: "vhsrip", regex: /\bvhsrip\b/i },
        { version: "tvrip", regex: /\btvrip\b/i },
        { version: "hdcam", regex: /\bhdcam\b/i },
        { version: "r5", regex: /\bR5\b/i },
        { version: "vcdrip", regex: /\bvcdrip\b/i },
        { version: "4k ultra hd", regex: /\b(?:4k|ultra hd)\b/i },
        { version: "h.264", regex: /\bh\.264\b/i },
        { version: "x264", regex: /\bx264\b/i },
        { version: "x265", regex: /\bx265\b/i },
        { version: "hevc", regex: /\bhevc\b/i },
        { version: "proper", regex: /\bproper\b/i },
        { version: "repack", regex: /\brepack\b/i },
        { version: "dual audio", regex: /\bdual audio\b/i },
        { version: "DTS-HD", regex: /\bDTS-HD\b/i },
        { version: "HDTS", regex: /\bHDTS\b/i },
        // Add more version regex patterns as needed
    ];

    containers.forEach(box => {
        const titleElement = box.querySelector('h2');
        if (!titleElement) {
            console.warn("No 'h2' element found in a box.", box);
            return;
        }

        const title = titleElement.innerText.toLowerCase();
        console.log(`Processing title: ${title}`);

        // Define resolution detection using regex
        let resolution = "Other";
        if (/2160p/i.test(title)) {
            resolution = '2160p';
        } else if (/1080p/i.test(title)) {
            resolution = '1080p';
        } else if (/720p/i.test(title)) {
            resolution = '720p';
        }

        // Detect which version matches using regex
        let foundVersion = "Other";
        for (const { version, regex } of versionPatterns) {
            if (regex.test(title)) {
                foundVersion = version;
                break;
            }
        }

        if (!resolutionData[resolution][foundVersion]) {
            resolutionData[resolution][foundVersion] = [];
        }
        resolutionData[resolution][foundVersion].push(box);
    });

    const resolutionColors = {
        "2160p": "#4a90e2",  // Blue for 2160p
        "1080p": "#50e3c2",  // Green for 1080p
        "720p": "#f5a623",   // Orange for 720p
        "Other": "#bd10e0"   // Purple for Other
    };

    const versionColors = {
        "blueray remux": "#1abc9c",  // Teal for BluRay Remux
        "bdrip": "#3498db",          // Blue for BDRip
        "brrip": "#9b59b6",          // Purple for BRRip
        "blueray": "#e74c3c",        // Red for BluRay
        "web-dl": "#f39c12",         // Orange for WEB-DL
        "webrip": "#d35400",         // Dark Orange for WebRip
        "hdtv": "#2ecc71",           // Green for HDTV
        "dvdrip": "#e67e22",         // Orange for DVDRip
        "dvd5": "#e74c3c",           // Red for DVD5
        "dvd9": "#8e44ad",           // Purple for DVD9
        "hdrip": "#2980b9",          // Blue for HDRip
        "cam": "#c0392b",            // Dark Red for CAM
        "ts": "#16a085",             // Teal for TS
        "pdvd": "#f1c40f",           // Yellow for PDVD
        "dvdscr": "#d35400",         // Dark Orange for DVDSCR
        "vhsrip": "#27ae60",         // Green for VHSRip
        "tvrip": "#34495e",          // Dark Blue for TVRip
        "hdcam": "#2c3e50",          // Dark Gray for HDCAM
        "r5": "#7f8c8d",             // Gray for R5
        "vcdrip": "#16a085",         // Teal for VCDRip
        "4k ultra hd": "#2ecc71",    // Green for 4K Ultra HD
        "h.264": "#3498db",          // Blue for H.264
        "x264": "#9b59b6",           // Purple for x264
        "x265": "#e67e22",           // Orange for x265
        "hevc": "#e74c3c",           // Red for HEVC
        "proper": "#27ae60",         // Green for Proper
        "repack": "#f39c12",         // Orange for Repack
        "dual audio": "#d35400"      // Dark Orange for Dual Audio
    };

	function createSection(title, children, bgColor) {
		const section = document.createElement('div');

		// Create a unique class name using the section title
		const sanitizedTitle = title.replace(/\s+/g, '-').toLowerCase().replace(/[^\w-]/g, ''); // Sanitize title for use in class
		section.classList.add('section-wrapper', `section-${sanitizedTitle}`); // Add a unique section class
		
		// Create the header dynamically and assign the .header and .box classes
		const header = document.createElement('h2');
		header.classList.add('header', 'box');
		header.style.background = bgColor; // Set dynamic background color
		header.textContent = title;

		// Create the body for the section
		const sectionBody = document.createElement('div');
		sectionBody.className = 'container-section'; // Leverage grid layout from CSS

		// Append each child into the section body
		children.forEach((child) => {
			sectionBody.appendChild(child);
		});

		// Append the header and section body to the section container
		section.appendChild(header);
		section.appendChild(sectionBody);

		return section;
	}

    parentContainer.innerHTML = '';

    console.log("Organizing content by resolution and version...");
    Object.keys(resolutionData).forEach(resolution => {
        const resolutionColor = resolutionColors[resolution] || "#bd10e0";
        console.log(`${resolution} resolution:`);
        
        const resolutionVersions = resolutionData[resolution];
        Object.keys(resolutionVersions).forEach(version => {
            const versionColor = versionColors[version.toLowerCase()] || resolutionColor;
            console.log(`  - ${version}: ${resolutionVersions[version].length} items`);
            
            if (resolutionVersions[version].length > 0) {
                const section = createSection(`${resolution} - ${version.toUpperCase()} Results`, resolutionVersions[version], versionColor);
                parentContainer.appendChild(section);
            }
        });
    });

    console.log("Categorization by resolution and version with colors done.");
}

// Initialize when the DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        handlePageChange(location.href);
        detectUrlChange();
    });
} else {
    handlePageChange(location.href);
    detectUrlChange();
}

// Cleanup when the window is unloaded
window.addEventListener('unload', cleanupObservers);