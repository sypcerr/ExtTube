// ==UserScript==
// @name         ExtTube
// @namespace    http://tampermonkey.net/
// @version      1.2.5
// @description  Replaces YouTube player with Invidious player and adds a "Watch on Invidious" button.
// @author       ExtTube
// @match        https://*.youtube.com/*
// @icon         https://cdn-icons-png.flaticon.com/256/1384/1384060.png
// @run-at       document-idle
// @updateURL    https://github.com/sypcerr/ExtTube/raw/refs/heads/main/ExtTube.user.js
// @downloadURL  https://github.com/sypcerr/ExtTube/raw/refs/heads/main/ExtTube.user.js
// @license      MIT
// @noframes
// ==/UserScript==

(function() {
    'use strict';

    // Function to detect if the user prefers dark mode using matchMedia
    function isDarkMode() {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    // Function to add the Invidious buttons
    function addInvidiousButtons() {
        let existingButtons = document.querySelectorAll('#exttube-invidious-button');
        if (existingButtons.length > 0) return; // Buttons already exist

        let container = document.querySelector('#top-level-buttons-computed');
        if (!container) return;

        // "Watch on Invidious" button
        let watchButton = document.createElement('button');
        watchButton.id = 'exttube-invidious-button';
        watchButton.innerText = 'Watch on Invidious';
        watchButton.style.marginRight = '2px'; // Reduced padding between buttons
        watchButton.style.padding = '4px 12px'; // Smaller button size
        watchButton.style.backgroundColor = '#f1f1f1'; // Default for light mode
        watchButton.style.color = '#0f0f0f'; // Default for light mode
        watchButton.style.border = 'none';
        watchButton.style.cursor = 'pointer';
        watchButton.style.fontSize = '13px'; // Adjust font size for a smaller button
        watchButton.style.borderRadius = '20px'; // Rounded corners on the outside
        watchButton.style.display = 'inline-flex';
        watchButton.style.alignItems = 'center';
        watchButton.style.justifyContent = 'center';
        watchButton.style.transition = 'background-color 0.3s'; // Smooth transition for hover effect

        // Change the button style for dark mode
        if (isDarkMode()) {
            watchButton.style.backgroundColor = '#3c3c3c';
            watchButton.style.color = '#ffffff';
        }

        // Add event listeners for the "Watch on Invidious" button
        watchButton.addEventListener('click', function() {
            let videoId = new URL(window.location.href).searchParams.get('v');
            if (videoId) {
                // Change the current page to Invidious without opening a new tab
                window.location.href = 'https://invidious.nerdvpn.de/watch?v=' + videoId;
            }
        });

        // Add hover effect for the button to match YouTube style
        watchButton.addEventListener('mouseover', function() {
            watchButton.style.backgroundColor = isDarkMode() ? '#484848' : '#e1e1e1';
        });
        watchButton.addEventListener('mouseout', function() {
            watchButton.style.backgroundColor = isDarkMode() ? '#3c3c3c' : '#f1f1f1';
        });

        // Append the button to the container
        container.appendChild(watchButton);
    }

    // Function to replace the YouTube player with Invidious player
    function replaceWithInvidiousPlayer() {
        let videoId = new URL(window.location.href).searchParams.get('v');
        if (!videoId) return;

        // Replace the YouTube player with the Invidious player
        const iframe = document.createElement('iframe');
        iframe.src = `https://invidious.nerdvpn.de/embed/${videoId}`; // Embed Invidious player
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.borderRadius = '15px'; // Rounded corners on the iframe
        iframe.style.border = 'none';

        // Replace the YouTube player with the Invidious iframe
        let playerContainer = document.querySelector('#player-container');
        if (playerContainer) {
            playerContainer.innerHTML = ''; // Clear the current YouTube player
            playerContainer.appendChild(iframe); // Embed the Invidious player
        }
    }

    // Run the function to replace YouTube player when the page loads
    window.addEventListener('load', replaceWithInvidiousPlayer);

    // Add the Invidious buttons after a short timeout to ensure the UI is loaded
    setInterval(addInvidiousButtons, 2000);
})();
