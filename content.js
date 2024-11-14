// Global variable to track the current URL
let currentUrl = location.href;
let activeObserver = null;  // Store the active MutationObserver

function initObserver() {
    console.log("Initializing MutationObserver with delay...");

    // Ensure we're on a /movie/* page
    if (!currentUrl.includes('.com/movie')) {
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

        // MutationObserver to detect the presence of the '.mx-1' element
        activeObserver = new MutationObserver((mutations, observer) => {
            console.log("MutationObserver triggered.");

            const parentContainer = document.querySelector('.mx-1');
            if (parentContainer) {
                console.log(".mx-1 element found.");
                observer.disconnect();  // Stop observing once we find the element
                categorizeByResolutionAndVersion();  // Now run the restructuring code
            } else {
                console.warn(".mx-1 container not yet found.");
            }
        });

        // Observe changes in the document body
        activeObserver.observe(document.body, { childList: true, subtree: true });
    }, 3000); // Adjust the timeout delay (3 seconds here) as per your needs
}

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
        section.innerHTML = `<h2 style="background:${bgColor};color:white;padding:10px;border-radius:5px;">${title}</h2>`;
        const sectionBody = document.createElement('div');
        sectionBody.style.display = 'grid';
        sectionBody.style.gridTemplateColumns = "repeat(auto-fill, minmax(300px, 1fr))";
        sectionBody.style.gap = '10px';

        children.forEach(child => {
            sectionBody.appendChild(child);
        });

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

// Function to detect URL changes and check for /movie/* pattern
function detectUrlChange() {
    const observer = new MutationObserver(() => {
        const newUrl = location.href;
        if (newUrl !== currentUrl && newUrl.includes('.com/movie')) {
            console.log(`Navigated to a new /movie page: ${newUrl}`);
            currentUrl = newUrl;
            initObserver();  // Reinitialize observer on URL change
        }
    });

    observer.observe(document.querySelector('head'), { childList: true, subtree: true });
}

// Initialize MutationObserver and URL change detection on page load
window.addEventListener("load", () => {
    if (currentUrl.includes('.com/movie')) {
        initObserver();  // Run the observer for the first load if on a /movie page
    }
    detectUrlChange();  // Detect URL changes for subsequent navigations
});
