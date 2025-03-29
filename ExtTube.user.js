// ==UserScript==
// @name         ExtTube
// @namespace    http://tampermonkey.net/
// @version      1.3.1
// @description  Adds Invidious buttons to YouTube videos and replaces the YouTube player with the Invidious player.
// @author       ExtTube
// @match        https://*.youtube.com/*
// @icon         https://cdn-icons-png.flaticon.com/256/1384/1384060.png
// @run-at       document-idle
// @updateURL    https://github.com/sypcerr/ExtTube/raw/main/ExtTube.user.js
// @downloadURL  https://github.com/sypcerr/ExtTube/raw/main/ExtTube.user.js
// @license      MIT
// @noframes
// ==/UserScript==

(function() {
    'use strict';

    // Function to check if dark mode is enabled
    function isDarkMode() {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    // Function to add Invidious buttons
    function addInvidiousButtons() {
        const existingButton = document.getElementById('exttube-invidious-button');
        const existingPlayerButton = document.getElementById('exttube-invidious-player-button');
        
        // Ensure buttons are not duplicated
        if (existingButton && existingPlayerButton) {
            return;
        }

        const videoContainer = document.querySelector('.html5-video-player');
        if (!videoContainer) {
            setTimeout(addInvidiousButtons, 1000); // Retry if video player isn't ready yet
            return;
        }

        // Create container for the buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.alignItems = 'center';
        buttonContainer.style.marginBottom = '10px';

        // "Watch on Invidious" button
        const watchButton = document.createElement('button');
        watchButton.id = 'exttube-invidious-button';
        watchButton.innerText = 'Watch on Invidious';
        styleButton(watchButton);
        watchButton.addEventListener('click', function() {
            const videoId = new URL(window.location.href).searchParams.get('v');
            if (videoId) {
                window.location.href = `https://invidious.nerdvpn.de/watch?v=${videoId}`;
            }
        });

        // "Use Invidious Player" button
        const playerButton = document.createElement('button');
        playerButton.id = 'exttube-invidious-player-button';
        playerButton.innerText = 'Use Invidious Player';
        styleButton(playerButton);
        playerButton.addEventListener('click', function() {
            const videoId = new URL(window.location.href).searchParams.get('v');
            if (videoId) {
                replacePlayerWithInvidious(videoId);
            }
        });

        // Append buttons to the container
        buttonContainer.appendChild(watchButton);
        buttonContainer.appendChild(playerButton);

        // Insert button container before the video player
        videoContainer.parentNode.insertBefore(buttonContainer, videoContainer);
    }

    // Function to style the buttons
    function styleButton(button) {
        button.style.marginRight = '10px';
        button.style.padding = '8px 16px';
        button.style.backgroundColor = '#f1f1f1';
        button.style.color = '#0f0f0f';
        button.style.border = '1px solid #ccc';
        button.style.cursor = 'pointer';
        button.style.fontSize = '14px';
        button.style.borderRadius = '4px';
        button.style.transition = 'background-color 0.3s, transform 0.2s';
        button.style.display = 'inline-flex';
        button.style.alignItems = 'center';
        button.style.justifyContent = 'center';

        // Apply dark mode styling
        if (isDarkMode()) {
            button.style.backgroundColor = '#3c3c3c';
            button.style.color = '#ffffff';
            button.style.border = '1px solid #555';
        }

        // Hover effect
        button.addEventListener('mouseover', function() {
            button.style.backgroundColor = isDarkMode() ? '#484848' : '#e1e1e1';
            button.style.transform = 'scale(1.05)';
        });
        button.addEventListener('mouseout', function() {
            button.style.backgroundColor = isDarkMode() ? '#3c3c3c' : '#f1f1f1';
            button.style.transform = 'scale(1)';
        });
    }

    // Function to replace the YouTube player with the Invidious player
    function replacePlayerWithInvidious(videoId) {
        const videoContainer = document.querySelector('.html5-video-player');
        if (videoContainer) {
            videoContainer.innerHTML = `
                <iframe src="https://invidious.nerdvpn.de/embed/${videoId}" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>
            `;
        }
    }

    // Wait for the page to load and add buttons
    window.addEventListener('load', function() {
        setTimeout(addInvidiousButtons, 2000); // Add buttons after a slight delay
    });
})();
