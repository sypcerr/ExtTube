// ==UserScript==
// @name         ExtTube
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Adds an Invidious button to YouTube videos while keeping the default player.
// @author       ExtTube
// @match        https://*.youtube.com/*
// @icon         https://cdn-icons-png.flaticon.com/256/1384/1384060.png
// @run-at       document-idle
// @updateURL    https://github.com/
// @downloadURL  -
// @noframes
// ==/UserScript==

(function() {
    'use strict';

    function addInvidiousButton() {
        let existingButton = document.querySelector('#exttube-invidious-button');
        if (existingButton) return; // Button existiert bereits

        let container = document.querySelector('#top-level-buttons-computed');
        if (!container) return;

        let button = document.createElement('button');
        button.id = 'exttube-invidious-button';
        button.innerText = 'Watch on Invidious';
        button.style.marginLeft = '10px';
        button.style.padding = '6px 12px';
        button.style.backgroundColor = '#f1f1f1';
        button.style.color = '#0f0f0f';
        button.style.border = 'none';
        button.style.cursor = 'pointer';
        button.style.fontSize = '14px';
        button.style.borderRadius = '20px';
        button.style.display = 'flex';
        button.style.alignItems = 'center';
        button.style.justifyContent = 'center';

        button.addEventListener('click', function() {
            let videoId = new URL(window.location.href).searchParams.get('v');
            if (videoId) {
                window.open('https://invidious.nerdvpn.de/watch?v=' + videoId, '_blank');
            }
        });

        container.appendChild(button);
    }

    // Füge den Button nach einem kurzen Timeout ein, um sicherzustellen, dass die UI geladen ist
    setInterval(addInvidiousButton, 2000);
})();
