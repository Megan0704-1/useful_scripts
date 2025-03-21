// ==UserScript==
// @name         PianoSheetParser
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  For IOS and UserScripts and piano passionates
// @author       Megan Kuo
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @include      *://www.gangqinpu.com/*
// @run-at       document-idle
// @license      GPLv3
// ==/UserScript==

(function() {
    'use strict';

    // debug message
    function showAlert(message, duration = 3000) {
        const alertDiv = document.createElement('div');
        alertDiv.style = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 15px 25px;
            background: #007AFF;
            color: white;
            z-index: 99999;
            border-radius: 8px;
            font-family: -apple-system, sans-serif;
            font-size: 16px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            white-space: nowrap;
        `;
        alertDiv.textContent = message;
        document.body.appendChild(alertDiv);
        setTimeout(() => alertDiv.remove(), duration);
    }

    // main parsing button
    function createMainButton() {
        const btn = document.createElement('button');
        btn.textContent = 'GO Parse';
        btn.style = `
            position: fixed;
            bottom: 30px;
            left: 20px;
            z-index: 9999;
            padding: 14px 24px;
            background: #FF3B30;
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 18px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            transition: all 0.3s;
        `;

        btn.addEventListener('touchstart', () => {
            btn.style.transform = 'scale(0.95)';
            btn.style.opacity = '0.9';
        });
        btn.addEventListener('touchend', () => {
            btn.style.transform = 'scale(1)';
            btn.style.opacity = '1';
        });

        return btn;
    }

    // main functionality
    async function parsePianoSheet() {
        try {
            showAlert('Start parsing');

            // inspect webpage type
            if (window.location.pathname.includes('/cchtml/')) {
                showAlert('Find sheets');
                // Loop through all links to find one that contains "简谱"
                let hasJianpu = false;
                const links = document.querySelectorAll('a');
                for (const link of links) {
                    if (link.textContent.includes("简谱")) {
                        hasJianpu = true;
                        break;
                    }
                }
                if (!hasJianpu) {
                    showAlert('Sheet not found', 2000);
                    return;
                }
                window.open(window.location.href.replace('cchtml', 'jianpu'));
                showAlert('Navigating...');

            } else if (window.location.pathname.includes('/jianpu/')) {
                showAlert('Loading...');
                const scoreIframe = await waitForElement('#ai-score', 5000);
                if (!scoreIframe) {
                    showAlert('No content found', 2000);
                    return;
                }

                const pdfUrl = scoreIframe.src.replace('jianpuMode=1', 'jianpuMode=0');
                createDownloadButton(pdfUrl);
                showAlert('Finish parsing, play it good!', 2000);
            }

        } catch (error) {
            showAlert(`[BUG]: ${error.message}`, 4000);
            console.error(error);
        }
    }

    // Wait loading
    function waitForElement(selector, timeout = 5000) {
        return new Promise((resolve) => {
            const start = Date.now();
            const check = () => {
                const element = document.querySelector(selector);
                if (element) return resolve(element);
                if (Date.now() - start > timeout) return resolve(null);
                setTimeout(check, 200);
            };
            check();
        });
    }

    // Button creator
    function createDownloadButton(pdfUrl) {
        const btnGroup = document.createElement('div');
        btnGroup.style = `
            position: fixed;
            bottom: 100px;
            left: 20px;
            display: flex;
            gap: 12px;
            flex-direction: column;
        `;

        const createBtn = (text, url) => {
            const btn = document.createElement('button');
            btn.textContent = text;
            btn.style = `
                padding: 12px 20px;
                background: #34C759;
                color: white;
                border: none;
                border-radius: 10px;
                font-size: 16px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            `;
            btn.onclick = () => window.open(url);
            return btn;
        };

        btnGroup.appendChild(createBtn('Download full version', pdfUrl));
        btnGroup.appendChild(createBtn('Download simplify version', pdfUrl.replace('jianpuMode=0', 'jianpuMode=1')));
        document.body.appendChild(btnGroup);
    }

    // Initialize Sheet
    function init() {
        showAlert("Loading Script...");

        const mainBtn = createMainButton();
        mainBtn.addEventListener('click', parsePianoSheet);
        document.body.appendChild(mainBtn);
    }

    if (document.readyState === 'complete') {
        init();
    } else {
        showAlert("document not ready")
        window.addEventListener('load', init);
    }
})();
