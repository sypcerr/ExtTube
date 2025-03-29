// ==UserScript==
// @name         ExtTube
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Adds an Invidious button to YouTube videos while keeping the default player and adds a "Use Invidious Player" option.
// @author       ExtTube
// @match        https://*.youtube.com/*
// @icon         https://cdn-icons-png.flaticon.com/256/1384/1384060.png
// @run-at       document-idle
// @updateURL    https://github.com/sypcerr/ExtTube/raw/refs/heads/main/ExtTube.user.js
// @downloadURL  https://github.com/sypcerr/ExtTube/raw/refs/heads/main/ExtTube.user.js
// @noframes
// @license      MIT
// ==/UserScript==

/*
MIT License

Copyright (c) 2025 ExtTube

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

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
        button.innerText = 'Watch on Invidious | Use Invidious Player';
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

        // Add event listener for the button click
        button.addEventListener('click', function() {
            let videoId = new URL(window.location.href).searchParams.get('v');
            if (videoId) {
                // First option: open the video in Invidious in a new tab
                window.open('https://invidious.nerdvpn.de/watch?v=' + videoId, '_blank');
                
                // Second option: reload the page with Invidious player
                let currentUrl = window.location.href;
                if (currentUrl.includes('youtube.com/watch?v=')) {
                    let newUrl = currentUrl.replace('youtube.com/watch?v=', 'invidious.nerdvpn.de/watch?v=');
                    window.location.href = newUrl; // Reload with Invidious player
                }
            }
        });

        container.appendChild(button);
    }

    // Add the button after a short timeout to ensure the UI is loaded
    setInterval(addInvidiousButton, 2000);
})();
