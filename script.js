import CaesarCipher from './CaesarCipher.js';
import VigenereCipher from './VigenereCipher.js';
import GostCipher from './GostCipher.js';
import RSACipher from './RSA.js';
import StreamCipher from './StreamCipher.js';

document.addEventListener('DOMContentLoaded', () => {

    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const tabId = button.dataset.tab;
            tabContents.forEach(content => {
                content.classList.toggle('active', content.id === tabId);
            });
        });
    });

    const caesarCipher = new CaesarCipher();
    const input = document.getElementById('caesar-input');
    const shiftInput = document.getElementById('caesar-shift');
    const output = document.getElementById('caesar-output');

    document.getElementById('caesar-encrypt').addEventListener('click', () => {
        const text = input.value;
        const shift = parseInt(shiftInput.value, 10);
        output.textContent = caesarCipher.encrypt(text, shift);
    });

    document.getElementById('caesar-decrypt').addEventListener('click', () => {
        const text = input.value;
        const shift = parseInt(shiftInput.value, 10);
        output.textContent = caesarCipher.decrypt(text, shift);
    });

    document.getElementById('caesar-hack').addEventListener('click', () => {
        const text = input.value;
        const hackResults = caesarCipher.bruteForce(text);

        output.innerHTML = hackResults
            .map(item => `<div><b>Сдвиг на ${item.shift}:</b> ${item.result}</div>`)
            .join('');
    });

    const vigenere = new VigenereCipher();
    const vigenereInput = document.getElementById('vigenere-input');
    const vigenereKey = document.getElementById('vigenere-key');
    const vigenereOutput = document.getElementById('vigenere-output');

    document.getElementById('vigenere-encrypt').addEventListener('click', () => {
        const text = vigenereInput.value;
        const key = vigenereKey.value;
        vigenereOutput.textContent = vigenere.encrypt(text, key);
    });

    document.getElementById('vigenere-decrypt').addEventListener('click', () => {
        const text = vigenereInput.value;
        const key = vigenereKey.value;
        vigenereOutput.textContent = vigenere.decrypt(text, key);
    });

    const gost = new GostCipher();
    const gostInput = document.getElementById('gost-input');
    const gostKey = document.getElementById('gost-key');
    const gostOutput = document.getElementById('gost-output');

    if (gostInput && gostKey && gostOutput) {
        document.getElementById('gost-encrypt').addEventListener('click', () => {
            const text = gostInput.value;
            const key = gostKey.value;

            if (key.length !== 32) {
                gostOutput.textContent = "Ключ должен быть ровно 32 символа";
                return;
            }
            gostOutput.textContent = gost.encrypt(text, key);
        });

        document.getElementById('gost-decrypt').addEventListener('click', () => {
            const text = gostInput.value;
            const key = gostKey.value;

            if (key.length !== 32) {
                gostOutput.textContent = "Ключ должен быть ровно 32 символа";
                return;
            }
            try {
                gostOutput.textContent = gost.decrypt(text, key);
            } catch (e) {
                gostOutput.textContent = "Ошибка дешифровки. Проверьте текст и ключ.";
            }
        });

    const gostStream = new StreamCipher();
    const gostStreamInput = document.getElementById('gost-stream-input');
    const gostStreamKey = document.getElementById('gost-stream-key');
    const gostStreamOutput = document.getElementById('gost-stream-output');
    const gostStreamNonce = document.getElementById('gost-stream-nonce');

    if (gostStreamInput && gostStreamKey && gostStreamOutput) {
        document.getElementById('gost-stream-encrypt').addEventListener('click', () => {
            const text = gostStreamInput.value;
            const key = gostStreamKey.value;
            const nonce = gostStreamNonce.value;

            if (key.length !== 32) {
                gostStreamOutput.textContent = "Ключ должен быть ровно 32 символа";
                return;
            }

            if (nonce && nonce.length !== 16) {
                gostStreamOutput.textContent = "Nonce должен быть ровно 16 символов";
                return
            }

            const encryptResult = gostStream.encrypt(text, key, nonce);
            gostStreamOutput.textContent = encryptResult.cipherHex + "\nnonce(IV): " + encryptResult.nonce;
        });

        document.getElementById('gost-stream-decrypt').addEventListener('click', () => {
            const text = gostStreamInput.value;
            const key = gostStreamKey.value;
            const nonce = gostStreamNonce.value;

            if (key.length !== 32) {
                gostStreamOutput.textContent = "Ключ должен быть ровно 32 символа";
                return;
            }
            if (!nonce || nonce.length !== 16) {
                gostStreamOutput.textContent = "Введите nonce (16 символов)";
                return;
            }

            try {
                gostStreamOutput.textContent = gostStream.decrypt(text, key, nonce);
            } catch (e) {
                gostStreamOutput.textContent = "Ошибка дешифровки. Проверьте текст, ключ, nonce\n" + e;
            }
        });
    }
    }

    const rsa = new RSACipher();
    const rsaInput = document.getElementById('rsa-input');
    const pInput = document.getElementById('rsa-p');
    const qInput = document.getElementById('rsa-q');
    const eInput = document.getElementById('rsa-e');
    const rsaOutput = document.getElementById('rsa-output');
    if (rsaInput && pInput && qInput && eInput && rsaOutput) {
        document.getElementById('rsa-encrypt').addEventListener('click', () => {
            try {
                rsa.init(pInput.value - 0, qInput.value - 0, eInput.value - 0);
                rsaOutput.textContent = rsa.encrypt(rsaInput.value);
            } catch (e) {
                rsaOutput.textContent = e;
            }
        })

        document.getElementById('rsa-decrypt').addEventListener('click', () => {
            try {
                rsa.init(pInput.value - 0, qInput.value - 0, eInput.value - 0);
                rsaOutput.textContent = rsa.decrypt(rsaInput.value);
            } catch (e) {
                rsaOutput.textContent = e;
            }
        })
    }
    initParticles();
});

function initParticles() {
    particlesJS('particles-js', {
        "particles": {
            "number": { "value": 200, "density": { "enable": true, "value_area": 800 } },
            "color": { "value": "#ffffff" },
            "shape": { "type": "circle" },
            "opacity": { "value": 0.5, "random": true },
            "size": { "value": 3, "random": true },
            "line_linked": { "enable": false },
            "move": {
                "enable": true, "speed": 1, "direction": "bottom", "random": false,
                "straight": false, "out_mode": "out", "bounce": false
            }
        },
        "interactivity": { "detect_on": "canvas", "events": { "onhover": { "enable": false }, "onclick": { "enable": false } } },
        "retina_detect": true
    });
}