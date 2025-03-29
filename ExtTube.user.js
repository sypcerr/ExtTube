// ==UserScript==
// @name         ExtTube
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Adds an Invidious button to YouTube videos while keeping the default player.
// @author       ExtTube
// @match        https://*.youtube.com/*
// @icon         https://cdn-icons-png.flaticon.com/256/1384/1384060.png
// @run-at       document-idle
// @updateURL    https://github.com/sypcerr/ExtTube/raw/refs/heads/main/ExtTube.user.js
// @downloadURL  https://github.com/sypcerr/ExtTube/raw/refs/heads/main/ExtTube.user.js
// @noframes
// ==/UserScript==

(function() {
    'use strict';

    // Function to detect if the user prefers dark mode using matchMedia
    function isDarkMode() {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    // Function to add the Invidious button
    function addInvidiousButton() {
        let existingButton = document.querySelector('#exttube-invidious-button');
        if (existingButton) return; // Button already exists

        let container = document.querySelector('#top-level-buttons-computed');
        if (!container) return;

        let button = document.createElement('button');
        button.id = 'exttube-invidious-button';
        button.innerText = 'Watch on Invidious';
        button.style.marginLeft = '10px';
        button.style.padding = '6px 12px';
        button.style.backgroundColor = '#f1f1f1'; // Default for light mode
        button.style.color = '#0f0f0f'; // Default for light mode
        button.style.border = 'none';
        button.style.cursor = 'pointer';
        button.style.fontSize = '14px';
        button.style.borderRadius = '20px';
        button.style.display = 'flex';
        button.style.alignItems = 'center';
        button.style.justifyContent = 'center';

        // Change the button style for dark mode
        if (isDarkMode()) {
            button.style.backgroundColor = '#3c3c3c'; // Dark mode background
            button.style.color = '#ffffff'; // Dark mode text color
        }

        button.addEventListener('click', function() {
            let videoId = new URL(window.location.href).searchParams.get('v');
            if (videoId) {
                window.open('https://invidious.nerdvpn.de/watch?v=' + videoId, '_blank');
            }
        });

        container.appendChild(button);
    }

    // Add the button after a short timeout to ensure the UI is loaded
    setInterval(addInvidiousButton, 2000);
})();
