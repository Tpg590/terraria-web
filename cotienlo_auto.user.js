// ==UserScript==
// @name         Cổ Tiên Lộ - Auto Cày Lưu Phái (Mobile & PC)
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  Auto khiêu chiến Sân tập học đường Cổ Tiên Lộ: PC & Mobile (iOS / Android). Tự động F -> Đếm ngược -> Spam skill -> Thắng -> X điều tức -> Lặp lại.
// @author       Antigravity
// @match        https://cotienlo.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    if (window.__COTIENLO_AUTO__) {
        console.log('Auto đã được bật trước đó.');
        return;
    }
    window.__COTIENLO_AUTO__ = true;

    var CONFIG = {
        skills: ['1', '2', '3'],
        spamIntervalMs: 150,
        countdownSec: 3.5,
        outOfCombatSec: 2.5,
        checkIntervalMs: 400
    };

    var isRunning = false;
    var state = 'IDLE';
    var winCount = 0;
    var spamTimer = null;

    function sendKey(keyStr) {
        keyStr = String(keyStr).toLowerCase();
        var upper = keyStr.toUpperCase();
        var keyCode = upper.charCodeAt(0);
        var codeMap = {
            '1': 'Digit1', '2': 'Digit2', '3': 'Digit3', '4': 'Digit4',
            'f': 'KeyF', 'x': 'KeyX', 'q': 'KeyQ', 'e': 'KeyE', 'r': 'KeyR'
        };
        var code = codeMap[keyStr] || ('Key' + upper);

        var evtDown = new KeyboardEvent('keydown', { key: keyStr, code: code, keyCode: keyCode, which: keyCode, bubbles: true, cancelable: true });
        var evtUp = new KeyboardEvent('keyup', { key: keyStr, code: code, keyCode: keyCode, which: keyCode, bubbles: true, cancelable: true });

        window.dispatchEvent(evtDown);
        document.dispatchEvent(evtDown);
        if (document.body) document.body.dispatchEvent(evtDown);

        setTimeout(function() {
            window.dispatchEvent(evtUp);
            document.dispatchEvent(evtUp);
            if (document.body) document.body.dispatchEvent(evtUp);
        }, 40);

        clickDom(keyStr);
    }

    function clickDom(keyStr) {
        try {
            var el = null;
            if (keyStr === 'f') {
                var allEls = document.querySelectorAll('button, div, span, a');
                for (var i = 0; i < allEls.length; i++) {
                    var t = (allEls[i].innerText || '').trim();
                    if (t.indexOf('Đấu thêm') !== -1 || t.indexOf('Đấu với') !== -1) {
                        el = allEls[i];
                        break;
                    }
                }
            } else if (keyStr === 'x') {
                el = document.querySelector('[data-nut="thien"]') || document.querySelector('button[title*="Thiền"]') || document.querySelector('button[title*="điều tức"]');
            } else if (['1', '2', '3', '4'].indexOf(keyStr) !== -1) {
                el = document.querySelector('[data-o="' + keyStr + '"]');
            }

            if (el) {
                var rect = el.getBoundingClientRect();
                var cx = rect.left + rect.width / 2;
                var cy = rect.top + rect.height / 2;
                var pDown = new MouseEvent('pointerdown', { bubbles: true, cancelable: true, clientX: cx, clientY: cy });
                var pUp = new MouseEvent('pointerup', { bubbles: true, cancelable: true, clientX: cx, clientY: cy });
                var clk = new MouseEvent('click', { bubbles: true, cancelable: true, clientX: cx, clientY: cy });
                el.dispatchEvent(pDown);
                setTimeout(function() {
                    el.dispatchEvent(pUp);
                    el.dispatchEvent(clk);
                }, 20);
            }
        } catch (err) {}
    }

    function checkVictory() {
        var chat = document.querySelector('[data-hud="chat"]');
        if (chat) {
            var txt = chat.innerText || '';
            if (txt.indexOf('lùi ra khỏi vòng') !== -1 || txt.indexOf('nhận thua') !== -1) return true;
        }
        var bodyTxt = (document.body ? document.body.innerText : '') || '';
        return bodyTxt.indexOf('lùi ra khỏi vòng') !== -1 || bodyTxt.indexOf('nhận thua') !== -1;
    }

    var skillIdx = 0;
    function startSpam() {
        if (spamTimer) clearInterval(spamTimer);
        skillIdx = 0;
        spamTimer = setInterval(function() {
            if (!isRunning || state !== 'SPAMMING') {
                clearInterval(spamTimer);
                return;
            }
            if (CONFIG.skills.length > 0) {
                var sk = CONFIG.skills[skillIdx % CONFIG.skills.length];
                sendKey(sk);
                skillIdx++;
            }
        }, CONFIG.spamIntervalMs);
    }

    function stopSpam() {
        if (spamTimer) {
            clearInterval(spamTimer);
            spamTimer = null;
        }
    }

    function buildUI() {
        if (document.getElementById('ctl-mobile-root')) return;

        var root = document.createElement('div');
        root.id = 'ctl-mobile-root';
        root.style.cssText = 'position:fixed;top:60px;right:10px;z-index:2147483647;font-family:Arial,sans-serif;user-select:none;-webkit-user-select:none;touch-action:none;';

        var bubble = document.createElement('div');
        bubble.id = 'ctl-bubble';
        bubble.style.cssText = 'display:none;background:rgba(28,20,12,0.95);border:2px solid #d9b45a;color:#ffdb7d;border-radius:20px;padding:6px 12px;font-size:12px;font-weight:bold;box-shadow:0 4px 12px rgba(0,0,0,0.6);cursor:pointer;';
        bubble.innerHTML = '⚔️ <span id="ctl-bubble-txt">AUTO</span>';

        var panel = document.createElement('div');
        panel.id = 'ctl-panel';
        panel.style.cssText = 'width:210px;background:rgba(25,18,12,0.95);border:2px solid #d9b45a;border-radius:10px;color:#f2ead3;padding:10px;font-size:12px;box-shadow:0 6px 20px rgba(0,0,0,0.7);box-sizing:border-box;';
        panel.innerHTML = ''
            + '<div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(217,180,90,0.4);padding-bottom:5px;margin-bottom:6px;">'
            + '  <span style="font-weight:bold;color:#ffdb7d;font-size:13px;">⚔️ AUTO LƯU PHÁI</span>'
            + '  <span id="ctl-btn-min" style="cursor:pointer;color:#aaa;font-size:14px;padding:0 4px;">➖</span>'
            + '</div>'
            + '<div id="ctl-st" style="font-size:11px;color:#aaa;margin-bottom:4px;">Trạng thái: Chưa bật</div>'
            + '<div id="ctl-ct" style="font-size:12px;color:#5fd47a;font-weight:bold;margin-bottom:8px;">Thắng: 0 trận</div>'
            + '<div style="display:flex;gap:6px;margin-bottom:8px;font-size:11px;">'
            + '  <label><input type="checkbox" id="ctl-k1" checked> 1</label>'
            + '  <label><input type="checkbox" id="ctl-k2" checked> 2</label>'
            + '  <label><input type="checkbox" id="ctl-k3" checked> 3</label>'
            + '  <label><input type="checkbox" id="ctl-k4"> 4</label>'
            + '</div>'
            + '<button id="ctl-btn-run" style="width:100%;background:#28a745;color:white;border:none;padding:8px;border-radius:6px;font-weight:bold;font-size:13px;cursor:pointer;box-shadow:0 2px 4px rgba(0,0,0,0.4);">'
            + '  BẮT ĐẦU'
            + '</button>'
            + '<div style="font-size:9px;color:#888;text-align:center;margin-top:5px;">Chạm giữ để kéo • Bấm ➖ thu nhỏ</div>';

        root.appendChild(bubble);
        root.appendChild(panel);
        document.body.appendChild(root);

        makeDraggable(root);

        panel.querySelector('#ctl-btn-min').onclick = function(e) {
            e.stopPropagation();
            panel.style.display = 'none';
            bubble.style.display = 'block';
        };
        bubble.onclick = function() {
            panel.style.display = 'block';
            bubble.style.display = 'none';
        };

        panel.querySelector('#ctl-btn-run').onclick = toggleRun;

        window.addEventListener('keydown', function(e) {
            if (e.key === 'F9') {
                toggleRun();
            }
        });
    }

    function makeDraggable(el) {
        var dragging = false, sx = 0, sy = 0, ox = 0, oy = 0;
        function start(e) {
            var tag = (e.target && e.target.tagName) ? e.target.tagName.toUpperCase() : '';
            if (tag === 'BUTTON' || tag === 'INPUT' || tag === 'LABEL') return;
            dragging = true;
            var pt = e.touches ? e.touches[0] : e;
            sx = pt.clientX; sy = pt.clientY;
            ox = el.offsetLeft; oy = el.offsetTop;
        }
        function move(e) {
            if (!dragging) return;
            var pt = e.touches ? e.touches[0] : e;
            var dx = pt.clientX - sx, dy = pt.clientY - sy;
            el.style.left = Math.max(0, Math.min(window.innerWidth - el.offsetWidth, ox + dx)) + 'px';
            el.style.top = Math.max(0, Math.min(window.innerHeight - el.offsetHeight, oy + dy)) + 'px';
            el.style.right = 'auto';
        }
        function end() { dragging = false; }

        el.addEventListener('mousedown', start);
        window.addEventListener('mousemove', move);
        window.addEventListener('mouseup', end);

        el.addEventListener('touchstart', start, { passive: true });
        window.addEventListener('touchmove', move, { passive: true });
        window.addEventListener('touchend', end);
    }

    function updateStatus(txt, clr) {
        var st = document.getElementById('ctl-st');
        if (st) {
            st.innerText = 'Trạng thái: ' + txt;
            if (clr) st.style.color = clr;
        }
        var btxt = document.getElementById('ctl-bubble-txt');
        if (btxt) {
            btxt.innerText = isRunning ? ('BẬT (' + winCount + ')') : 'AUTO';
        }
    }

    function updateCount() {
        var ct = document.getElementById('ctl-ct');
        if (ct) ct.innerText = 'Thắng: ' + winCount + ' trận';
        var btxt = document.getElementById('ctl-bubble-txt');
        if (btxt && isRunning) btxt.innerText = 'BẬT (' + winCount + ')';
    }

    function toggleRun() {
        isRunning = !isRunning;
        var btn = document.getElementById('ctl-btn-run');
        if (isRunning) {
            CONFIG.skills = [];
            if (document.getElementById('ctl-k1').checked) CONFIG.skills.push('1');
            if (document.getElementById('ctl-k2').checked) CONFIG.skills.push('2');
            if (document.getElementById('ctl-k3').checked) CONFIG.skills.push('3');
            if (document.getElementById('ctl-k4').checked) CONFIG.skills.push('4');
            if (CONFIG.skills.length === 0) CONFIG.skills = ['1', '2', '3'];

            btn.innerText = 'DỪNG LẠI';
            btn.style.background = '#dc3545';
            updateStatus('Đang chạy...', '#5fd47a');
            loop();
        } else {
            btn.innerText = 'BẮT ĐẦU';
            btn.style.background = '#28a745';
            updateStatus('Đã dừng', '#aaa');
            stopSpam();
        }
    }

    function sleep(ms) {
        return new Promise(function(resolve) { setTimeout(resolve, ms); });
    }

    async function loop() {
        while (isRunning) {
            state = 'WAIT_F';
            updateStatus('Bấm [ F ] khiêu chiến...', '#7cb7ff');
            sendKey('f');
            await sleep(600);
            sendKey('f');
            await sleep(600);
            if (!isRunning) break;

            state = 'COUNTDOWN';
            updateStatus('Chờ đếm ngược...', '#ffc266');
            await sleep(CONFIG.countdownSec * 1000);
            if (!isRunning) break;

            state = 'SPAMMING';
            updateStatus('Spam chiêu ' + CONFIG.skills.join(','), '#5fd47a');
            startSpam();

            var fightStart = Date.now();
            var victory = false;
            while (isRunning && !victory) {
                await sleep(CONFIG.checkIntervalMs);
                if (checkVictory()) {
                    victory = true;
                    winCount++;
                    updateCount();
                    break;
                }
                if (Date.now() - fightStart > 90000) break;
            }

            stopSpam();
            if (!isRunning) break;

            state = 'COMBAT_COOLDOWN';
            updateStatus('Đợi hết combat...', '#d688ff');
            await sleep(CONFIG.outOfCombatSec * 1000);
            if (!isRunning) break;

            state = 'MEDITATING';
            updateStatus('Bấm [ X ] điều tức...', '#00e5ff');
            sendKey('x');
            await sleep(1200);
            sendKey('x');
            await sleep(1000);
        }
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(buildUI, 1200);
    } else {
        window.addEventListener('DOMContentLoaded', function() { setTimeout(buildUI, 1200); });
    }
})();

