// ==UserScript==
// @name         ExtTube
// @namespace    http://tampermonkey.net/
// @version      1.2.1
// @description  Adds Invidious buttons to YouTube videos while keeping the default player and adds a "Use Invidious Player" option.
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
        let existingButtons = document.querySelectorAll('#exttube-invidious-button, #exttube-invidious-player-button');
        if (existingButtons.length > 0) return; // Buttons already exist

        let container = document.querySelector('#top-level-buttons-computed');
        if (!container) return;

        // "Watch on Invidious" button
        let watchButton = document.createElement('button');
        watchButton.id = 'exttube-invidious-button';
        watchButton.innerText = 'Watch on Invidious';
        watchButton.style.marginRight = '2px'; // Reduced padding between buttons
        watchButton.style.padding = '3px 6px'; // Smaller button size
        watchButton.style.backgroundColor = '#f1f1f1'; // Default for light mode
        watchButton.style.color = '#0f0f0f'; // Default for light mode
        watchButton.style.border = 'none';
        watchButton.style.cursor = 'pointer';
        watchButton.style.fontSize = '11px'; // Smaller font size
        watchButton.style.borderRadius = '20px 0 0 20px'; // Rounded corners on the left
        watchButton.style.display = 'inline-flex';
        watchButton.style.alignItems = 'center';
        watchButton.style.justifyContent = 'center';

        // "Use Invidious Player" button
        let playerButton = document.createElement('button');
        playerButton.id = 'exttube-invidious-player-button';
        playerButton.innerText = 'Use Invidious Player';
        playerButton.style.padding = '3px 6px'; // Smaller button size
        playerButton.style.backgroundColor = '#f1f1f1'; // Default for light mode
        playerButton.style.color = '#0f0f0f'; // Default for light mode
        playerButton.style.border = 'none';
        playerButton.style.cursor = 'pointer';
        playerButton.style.fontSize = '11px'; // Smaller font size
        playerButton.style.borderRadius = '0 20px 20px 0'; // Rounded corners on the right
        playerButton.style.display = 'inline-flex';
        playerButton.style.alignItems = 'center';
        playerButton.style.justifyContent = 'center';

        // Change the button style for dark mode
        if (isDarkMode()) {
            watchButton.style.backgroundColor = '#3c3c3c';
            watchButton.style.color = '#ffffff';
            playerButton.style.backgroundColor = '#3c3c3c';
            playerButton.style.color = '#ffffff';
        }

        // Add event listeners for the buttons
        watchButton.addEventListener('click', function() {
            let videoId = new URL(window.location.href).searchParams.get('v');
            if (videoId) {
                window.open('https://invidious.nerdvpn.de/watch?v=' + videoId, '_blank');
            }
        });

        playerButton.addEventListener('click', function() {
            let videoId = new URL(window.location.href).searchParams.get('v');
            if (videoId) {
                let currentUrl = window.location.href;
                if (currentUrl.includes('youtube.com/watch?v=')) {
                    let newUrl = currentUrl.replace('youtube.com/watch?v=', 'invidious.nerdvpn.de/watch?v=');
                    window.location.href = newUrl; // Reload with Invidious player
                }
            }
        });

        // Append the buttons to the container between like and subscribe buttons
        let likeButton = document.querySelector('ytd-toggle-button-renderer.style-scope.ytd-video-primary-info-renderer');
        let subscribeButton = document.querySelector('ytd-subscribe-button-renderer.style-scope.ytd-video-primary-info-renderer');

        if (likeButton && subscribeButton) {
            container.insertBefore(watchButton, subscribeButton); // Insert the watch button between like and subscribe
            container.insertBefore(playerButton, subscribeButton); // Insert the player button next to it
        }
    }

    // Add the buttons after a short timeout to ensure the UI is loaded
    setInterval(addInvidiousButtons, 2000);
})();
