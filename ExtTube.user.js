// ==UserScript==
// @name         ExtTube
// @namespace    http://tampermonkey.net/
// @version      1.2.5
// @description  Replaces YouTube player with custom iframe player and adds a "Watch on Invidious" button.
// @author       sypcerr
// @match        https://*.youtube.com/*
// @icon         https://cdn-icons-png.flaticon.com/256/1384/1384060.png
// @run-at       document-idle
// @updateURL    https://github.com/sypcerr/ExtTube/raw/refs/heads/main/ExtTube.user.js
// @downloadURL  https://github.com/sypcerr/ExtTube/raw/refs/heads/main/ExtTube.user.js
// @license      MIT
// @noframes
// ==/UserScript==

const configs = ytcfg.d();
configs['WEB_PLAYER_CONTEXT_CONFIGS'] = {};
ytcfg.set(configs);

(function() {
    'use strict';

    const CONFIG = {
        PLAYER_SELECTOR: '#player-container[role="complementary"]',
        RETRY_ATTEMPTS: 3,
        RETRY_DELAY: 1000,
        DEFAULT_QUALITY: 'hd1080',
        IFRAME_STYLES: {
            width: '100%',
            height: '100%',
            borderRadius: '15px',
            border: 'none'
        }
    };

    function getVideoId() {
        try {
            const url = new URL(window.location.href);
            return url.searchParams.get('v');
        } catch (error) {
            console.error('❌ Error extracting video ID:', error);
            return null;
        }
    }

    // Function to replace the YouTube player with custom iframe
    function replaceWithCustomIframe(videoId) {
        const iframe = document.createElement('iframe');
        const params = new URLSearchParams({
            autoplay: 1,
            rel: 0,
            modestbranding: 1,
            enablejsapi: 1,
            origin: window.location.origin,
            widget_referrer: window.location.href,
            hl: document.documentElement.lang || 'en',
            controls: 1,
            fs: 1,
            quality: CONFIG.DEFAULT_QUALITY
        });

        iframe.src = `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
        iframe.title = 'Custom video player';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        iframe.referrerpolicy = 'strict-origin-when-cross-origin';
        iframe.allowFullscreen = true;

        Object.assign(iframe.style, CONFIG.IFRAME_STYLES);

        return iframe;
    }

    // Function to replace the player with custom iframe in the background
    async function replacePlayer(attempts = CONFIG.RETRY_ATTEMPTS) {
        const videoId = getVideoId();
        if (!videoId) return;

        const findPlayerContainer = () => document.querySelector(CONFIG.PLAYER_SELECTOR);
        let playerContainer = findPlayerContainer();

        if (!playerContainer && attempts > 0) {
            console.log(`⏳ Retrying player replacement... (${attempts} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
            return replacePlayer(attempts - 1);
        }

        if (!playerContainer) {
            console.error('❌ Player container not found after all attempts');
            return;
        }

        try {
            while (playerContainer.firstChild) {
                playerContainer.firstChild.remove();
            }

            const iframe = replaceWithCustomIframe(videoId);
            playerContainer.appendChild(iframe);
            
            console.log('✅ Player replaced successfully with custom iframe');
        } catch (error) {
            console.error('❌ Error replacing player with custom iframe:', error);
        }
    }

    // Function to add the "Watch on Invidious" button
    function addInvidiousButton() {
        let existingButtons = document.querySelectorAll('#exttube-invidious-button');
        if (existingButtons.length > 0) return; // Buttons already exist

        let container = document.querySelector('#top-level-buttons-computed');
        if (!container) return;

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

    function isDarkMode() {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    function stopMediaElements() {
        const mediaElements = document.querySelectorAll('video, audio');
        mediaElements.forEach((media) => {
            media.pause();
            media.currentTime = 0;
            media.remove();
        });
    
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
    
        if (window.MediaSource) {
            const originalMediaSource = window.MediaSource;
            window.MediaSource = function() {
                const mediaSource = new originalMediaSource();
                mediaSource.endOfStream = function() {
                    console.log('🔇 Stopped MediaSource stream');
                    originalMediaSource.prototype.endOfStream.call(this);
                };
                return mediaSource;
            };
        }
    
        console.log('🔇 Stopped all audio and video elements, Web Audio API, and MediaSource');
    }

    function init() {
        console.log('🚀 YouTube player bypass script initialized');
        stopMediaElements();
        addInvidiousButton(); // Add the Invidious button
        replacePlayer(); // Replace player with iframe by default
        window.addEventListener('yt-navigate-finish', () => replacePlayer());
    }

    init();
})();
