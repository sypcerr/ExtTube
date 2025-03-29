// ==UserScript==
// @name         ExtTube
// @namespace    http://tampermonkey.net/
// @version      1.2.5
// @description  Replaces YouTube player with Invidious player and adds a "Watch on Invidious" button.
// @author       sypcerr
// @match        https://*.youtube.com/watch/*
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
        },
        BUTTON_STYLES: {
            display: 'inline-block',
            padding: '10px 16px',
            margin: '10px 0 0 10px',
            fontSize: '14px',
            fontWeight: 'bold',
            borderRadius: '4px',
            cursor: 'pointer',
            backgroundColor: '#ff0000',  // YouTube red
            color: '#fff',
            textAlign: 'center',
            textDecoration: 'none',
            boxSizing: 'border-box',
            transition: 'background-color 0.2s ease',
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

    function createEnhancedIframe(videoId) {
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
        iframe.title = 'YouTube video player';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        iframe.referrerpolicy = 'strict-origin-when-cross-origin';
        iframe.allowFullscreen = true;

        Object.assign(iframe.style, CONFIG.IFRAME_STYLES);

        return iframe;
    }

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

            const iframe = createEnhancedIframe(videoId);
            playerContainer.appendChild(iframe);
            
            console.log('✅ Player replaced successfully');
        } catch (error) {
            console.error('❌ Error replacing player:', error);
        }
    }

    function createInvidiousButton(videoId) {
        const button = document.createElement('button');
        button.textContent = 'Watch on Invidious';
        button.style = Object.assign({}, CONFIG.BUTTON_STYLES);
        
        // On button click, redirect to the Invidious playback page
        button.addEventListener('click', () => {
            const invidiousUrl = `https://invidious.example.com/watch?v=${videoId}`;  // Replace 'example.com' with the Invidious instance URL
            window.location.href = invidiousUrl;
        });

        return button;
    }

    function addInvidiousButton() {
        const videoId = getVideoId();
        if (!videoId) return;

        const header = document.querySelector('.ytp-right-controls');
        if (header) {
            const invidiousButton = createInvidiousButton(videoId);
            header.appendChild(invidiousButton);
        } else {
            console.error('❌ Header not found for Invidious button');
        }
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
        addInvidiousButton();
        window.addEventListener('yt-navigate-finish', () => replacePlayer());
    }

    init();
})();
