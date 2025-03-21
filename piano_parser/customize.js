// ==UserScript==
// @name         Customize
// @namespace    http://tampermonkey.net/
// @version      1.0.4
// @description  iPad专用优化版
// @author       NA
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @include      *://www.gangqinpu.com/*
// @run-at       document-idle
// @license      GPLv3
// ==/UserScript==

(function() {
    'use strict';

    // 调试提示函数
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

    // 创建主按钮
    function createMainButton() {
        const btn = document.createElement('button');
        btn.textContent = '免VIP扒谱';
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

        // 添加点击效果
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

    // 核心扒谱功能
    async function parsePianoSheet() {
        try {
            showAlert('开始扒谱...');

            // 检测页面类型
            if (window.location.pathname.includes('/cchtml/')) {
                showAlert('检测到五线谱页面');
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
                    showAlert('未找到简谱版本', 2000);
                    return;
                }
                window.open(window.location.href.replace('cchtml', 'jianpu'));
                showAlert('正在跳转简谱...');

            } else if (window.location.pathname.includes('/jianpu/')) {
                showAlert('正在提取谱面...');
                const scoreIframe = await waitForElement('#ai-score', 5000);
                if (!scoreIframe) {
                    showAlert('找不到谱面内容', 2000);
                    return;
                }

                const pdfUrl = scoreIframe.src.replace('jianpuMode=1', 'jianpuMode=0');
                createDownloadButton(pdfUrl);
                showAlert('扒谱完成!', 2000);
            }

        } catch (error) {
            showAlert(`错误: ${error.message}`, 4000);
            console.error(error);
        }
    }

    // 等待元素加载
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

    // 创建下载按钮
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

        btnGroup.appendChild(createBtn('下载五线谱', pdfUrl));
        btnGroup.appendChild(createBtn('下载简谱', pdfUrl.replace('jianpuMode=0', 'jianpuMode=1')));
        document.body.appendChild(btnGroup);
    }

    // 初始化脚本
    function init() {
        showAlert("Loading Script...");

        // 添加主按钮
        const mainBtn = createMainButton();
        mainBtn.addEventListener('click', parsePianoSheet);
        document.body.appendChild(mainBtn);
    }

    // 启动脚本
    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }
})();
