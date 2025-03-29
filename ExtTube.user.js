// ==UserScript==
// @name         ExtTube
// @namespace    http://tampermonkey.net/
// @version      1.2.2.2
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
        watchButton.style.padding = '6px 12px'; // Slightly smaller button size
        watchButton.style.backgroundColor = '#f1f1f1'; // Default for light mode
        watchButton.style.color = '#0f0f0f'; // Default for light mode
        watchButton.style.border = 'none';
        watchButton.style.cursor = 'pointer';
        watchButton.style.fontSize = '13px'; // Adjust font size for a smaller button
        watchButton.style.borderRadius = '3px'; // Rounded corners
        watchButton.style.display = 'inline-flex';
        watchButton.style.alignItems = 'center';
        watchButton.style.justifyContent = 'center';
        watchButton.style.transition = 'background-color 0.3s'; // Smooth transition for hover effect

        // "Use Invidious Player" button
        let playerButton = document.createElement('button');
        playerButton.id = 'exttube-invidious-player-button';
        playerButton.innerText = 'Use Invidious Player';
        playerButton.style.padding = '6px 12px'; // Slightly smaller button size
        playerButton.style.backgroundColor = '#f1f1f1'; // Default for light mode
        playerButton.style.color = '#0f0f0f'; // Default for light mode
        playerButton.style.border = 'none';
        playerButton.style.cursor = 'pointer';
        playerButton.style.fontSize = '13px'; // Adjust font size for a smaller button
        playerButton.style.borderRadius = '3px'; // Rounded corners
        playerButton.style.display = 'inline-flex';
        playerButton.style.alignItems = 'center';
        playerButton.style.justifyContent = 'center';
        playerButton.style.transition = 'background-color 0.3s'; // Smooth transition for hover effect

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
                // Replacing YouTube player with Invidious player using iframe
                let videoPlayer = document.querySelector('.html5-video-player');
                if (videoPlayer) {
                    videoPlayer.innerHTML = `
                        <iframe 
                            src="https://invidious.nerdvpn.de/embed/${videoId}?autoplay=1" 
                            frameborder="0" 
                            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen 
                            style="width: 100%; height: 100%;"
                        ></iframe>`;
                }
            }
        });

        // Add hover effect for buttons to match YouTube style
        watchButton.addEventListener('mouseover', function() {
            watchButton.style.backgroundColor = isDarkMode() ? '#484848' : '#e1e1e1';
        });
        watchButton.addEventListener('mouseout', function() {
            watchButton.style.backgroundColor = isDarkMode() ? '#3c3c3c' : '#f1f1f1';
        });

        playerButton.addEventListener('mouseover', function() {
            playerButton.style.backgroundColor = isDarkMode() ? '#484848' : '#e1e1e1';
        });
        playerButton.addEventListener('mouseout', function() {
            playerButton.style.backgroundColor = isDarkMode() ? '#3c3c3c' : '#f1f1f1';
        });

        // Append the buttons to the container
        container.appendChild(watchButton);
        container.appendChild(playerButton);
    }

    // Add the buttons after a short timeout to ensure the UI is loaded
    setInterval(addInvidiousButtons, 2000);
})();
