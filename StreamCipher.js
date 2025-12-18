import GostCipher from "./GostCipher.js";

class StreamCipher {
    constructor() {
        this.gost = new GostCipher();
        this.blockSize = 8; // Размер блока в ГОСТе 8 байт
        this.nonceSize = 4; // а тут 4 байта под nonce, другие 4 байта пойдут под счетчик, чтобы в сумме получить 8 байт блока
        // block mode CTR у нас
    }

    encrypt(text, keyString, nonceStr) {
        const nonce = nonceStr
            ? this.hexToNonce(nonceStr)
            : this.generateNonce();

        const plaintext = Array.from(new TextEncoder().encode(text));
        const result = [];
        let counter = 0;

        for (let i = 0; i < plaintext.length; i += this.blockSize) {
            const gamma = this.cryptBlock(counter++, nonce, keyString); // Мы шифруем не сам текст, а комбинацию nonce + счетчик

            for (let j = 0; j < this.blockSize && i + j < plaintext.length; j++) {
                result.push(plaintext[i + j] ^ gamma[j]);
            }
        }

        return {
            cipherHex: result
                .map(b => b.toString(16).padStart(2, "0"))
                .join("")
                .toUpperCase(),
            nonce: this.nonceToHex(nonce)
        };
    }

    decrypt(hexText, keyString, nonceStr) {
        const nonce = this.hexToNonce(nonceStr);

        hexText = hexText.replaceAll(" ", "").toLowerCase();
        const data = [];

        for (let i = 0; i < hexText.length; i += 2) {
            data.push(parseInt(hexText.substr(i, 2), 16));
        }

        const result = [];
        let counter = 0;

        for (let i = 0; i < data.length; i += this.blockSize) {
            const gamma = this.cryptBlock(counter++, nonce, keyString);
            for (let j = 0; j < this.blockSize && i + j < data.length; j++) {
                result.push(data[i + j] ^ gamma[j]);
            }
        }

        return new TextDecoder().decode(new Uint8Array(result));
    }

    cryptBlock(counter, nonce, keyString) {
        const keys = this.gost.prepareKey(keyString);
        const bytes = [
            nonce[0], nonce[1], nonce[2], nonce[3],

            counter & 0xFF,
            (counter >>> 8) & 0xFF,
            (counter >>> 16) & 0xFF,
            (counter >>> 24) & 0xFF
        ];

        const [L, R] = this.gost.bytesToBlock(bytes);
        const [outL, outR] = this.gost.gost(L, R, keys, "encrypt");

        return this.gost.blockToBytes(outL, outR);
    }

    generateNonce() {
        return crypto.getRandomValues(new Uint8Array(this.nonceSize));
    }

    hexToNonce(hex) {
        hex = hex.replaceAll(" ", "").toLowerCase();
        const nonce = new Uint8Array(this.nonceSize);
        for (let i = 0; i < this.nonceSize; i++) {
            nonce[i] = parseInt(hex.substr(i * 2, 2), 16);
        }
        return nonce;
    }

    nonceToHex(nonce) {
        return Array.from(nonce)
            .map(b => b.toString(16).padStart(2, "0"))
            .join("")
            .toUpperCase();
    }
}

export default StreamCipher;