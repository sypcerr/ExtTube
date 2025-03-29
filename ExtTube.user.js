// ==UserScript==
// @name         ExtTube
// @namespace    http://tampermonkey.net/
// @version      1.2.5
// @description  Replaces YouTube player with Invidious player and adds a "Watch on Invidious" button.
// @author       sypcerr
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
        if (!container) {
            // Retry in case the container is not available immediately
            setTimeout(addInvidiousButtons, 1000);
            return;
        }

        // "Watch on Invidious" button
        let watchButton = document.createElement('button');
        watchButton.id = 'exttube-invidious-button';
        watchButton.innerText = 'Watch on Invidious';
        watchButton.style.marginRight = '8px'; // Space between buttons
        watchButton.style.padding = '6px 16px'; // Adjusted padding for size
        watchButton.style.backgroundColor = '#f8f8f8'; // Light background
        watchButton.style.color = '#0f0f0f'; // Dark text
        watchButton.style.border = '1px solid #ccc'; // Light border
        watchButton.style.cursor = 'pointer';
        watchButton.style.fontSize = '14px'; // Font size
        watchButton.style.borderRadius = '4px'; // Slightly rounded corners
        watchButton.style.display = 'inline-flex';
        watchButton.style.alignItems = 'center';
        watchButton.style.justifyContent = 'center';
        watchButton.style.transition = 'background-color 0.3s, border-color 0.3s'; // Smooth transitions

        // Dark mode adjustments
        if (isDarkMode()) {
            watchButton.style.backgroundColor = '#3c3c3c';
            watchButton.style.color = '#ffffff';
            watchButton.style.border = '1px solid #555';
        }

        // Hover effect
        watchButton.addEventListener('mouseover', function() {
            watchButton.style.backgroundColor = isDarkMode() ? '#484848' : '#e1e1e1';
            watchButton.style.borderColor = isDarkMode() ? '#666' : '#bbb';
        });
        watchButton.addEventListener('mouseout', function() {
            watchButton.style.backgroundColor = isDarkMode() ? '#3c3c3c' : '#f8f8f8';
            watchButton.style.borderColor = isDarkMode() ? '#555' : '#ccc';
        });

        // Add event listener for the button
        watchButton.addEventListener('click', function() {
            let videoId = new URL(window.location.href).searchParams.get('v');
            if (videoId) {
                // Change the current page to Invidious without opening a new tab
                window.location.href = 'https://invidious.nerdvpn.de/watch?v=' + videoId;
            }
        });

        // Append the button to the container
        container.appendChild(watchButton);
    }

    // Function to get the video ID from the current URL
    function getVideoId() {
        try {
            const url = new URL(window.location.href);
            return url.searchParams.get('v');
        } catch (error) {
            console.error('❌ Error extracting video ID:', error);
            return null;
        }
    }

    // Function to create an iframe for the Invidious player
    function createInvidiousIframe(videoId) {
        const iframe = document.createElement('iframe');
        iframe.src = `https://invidious.nerdvpn.de/embed/${videoId}`; // Invidious embed URL
        iframe.title = 'Invidious video player';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        iframe.referrerpolicy = 'strict-origin-when-cross-origin';
        iframe.allowFullscreen = true;
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.borderRadius = '15px'; // Rounded corners
        iframe.style.border = 'none';

        return iframe;
    }

    // Function to replace the YouTube player with the Invidious player
    function replacePlayer() {
        const videoId = getVideoId();
        if (!videoId) return;

        const playerContainer = document.querySelector('#player-container');
        if (playerContainer) {
            // Clear the existing player
            while (playerContainer.firstChild) {
                playerContainer.firstChild.remove();
            }

            // Create and append the Invidious iframe
            const iframe = createInvidiousIframe(videoId);
            playerContainer.appendChild(iframe);

            console.log('✅ Replaced YouTube player with Invidious player');
        }
    }

    // Disable the default YouTube player to prevent issues
    function disableYouTubePlayer() {
        const videoElements = document.querySelectorAll('video');
        videoElements.forEach((video) => {
            video.pause();
            video.currentTime = 0;
            video.remove(); // Remove video element from the page
        });

        // Stop the Web Audio API if it's being used by YouTube
        if (window.AudioContext || window.webkitAudioContext) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const originalAudioContext = AudioContext.prototype;

            AudioContext.prototype.createBufferSource = function() {
                const source = originalAudioContext.createBufferSource.call(this);
                source.stop = function() {
                    console.log('🔇 Stopped Web Audio API source');
                    originalAudioContext.stop.call(this);
                };
                return source;
            };

            const contexts = [];
            const originalCreateContext = AudioContext.prototype.constructor;
            AudioContext.prototype.constructor = function() {
                const context = new originalCreateContext();
                contexts.push(context);
                return context;
            };

            contexts.forEach((context) => {
                context.close().then(() => {
                    console.log('🔇 Closed Web Audio API context');
                });
            });
        }

        console.log('🔇 Disabled default YouTube player');
    }

    // Initialize the script
    function init() {
        console.log('🚀 ExtTube script initialized');
        disableYouTubePlayer();
        addInvidiousButtons();
        replacePlayer(); // Ensure the player is replaced on page load
        window.addEventListener('yt-navigate-finish', () => replacePlayer());
    }

    // Run the initialization
    init();
})();
