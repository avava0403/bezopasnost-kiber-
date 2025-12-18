/* Вот этот сайтик очень помогал разбираться: https://learn.javascript.ru/bitwise-operators 
А формулы из тетради*/
class GostCipher {
    constructor() {
        // Нагло украденная табличка из википедии id-Gost28147-89-CryptoPro-A-ParamSet (самая первая)
        this.Sblock = [
            [9, 6, 3, 2, 8, 11, 1, 7, 10, 4, 14, 15, 12, 0, 13, 5],
            [3, 7, 14, 9, 8, 10, 15, 0, 5, 2, 6, 12, 11, 4, 13, 1],
            [14, 4, 6, 2, 11, 3, 13, 8, 12, 15, 5, 10, 0, 7, 1, 9],
            [14, 7, 10, 12, 13, 1, 3, 9, 0, 2, 11, 4, 15, 8, 5],
            [11, 5, 1, 9, 8, 13, 15, 0, 4, 2, 3, 12, 7, 10, 6],
            [3, 10, 13, 12, 1, 2, 0, 11, 7, 5, 9, 4, 8, 15, 6],
            [1, 13, 2, 9, 7, 10, 6, 0, 8, 4, 5, 15, 3, 11, 14],
            [11, 10, 15, 5, 0, 12, 14, 8, 6, 3, 9, 1, 7, 13, 4]
        ];
    }

    gost(inputL, inputR, keys, mode) {
        let l = inputL;
        let r = inputR;

        for (let i = 0; i < 32; i++) {
            if (mode === 'encrypt') {
                const temp = r;
                let keyIndex;
                if (i < 24) {
                    keyIndex = i % 8; // (0..7, 0..7, 0..7)
                } else {
                    keyIndex = 7 - (i % 8); // (7..0)
                }
                const roundKey = keys[keyIndex];
                let step1 = (r + roundKey) >>> 0; // R = (R + Qj) mod 2^32
                let step2 = this.zamena(step1);  // R = F'(R)
                let step3 = ((step2 << 11)) >>> 0; // R = R <<< 11
                r = (l ^ step3) >>> 0; // R = R (+) L
                l = temp; // L = V
            }
            else {
                const temp = l; // V = L
                let keyIndex;
                if (i < 8) {
                    keyIndex = i; // (0..7)
                } else {
                    keyIndex = (31 - i) % 8; // (7..0, 7..0, 7..0)
                }
                const roundKey = keys[keyIndex];
                let step1 = (l + roundKey) >>> 0; // L = (L + Qj) mod 2^32
                let step2 = this.zamena(step1); // L = F'(L)
                let step3 = ((step2 << 11)) >>> 0;// L = L <<< 11
                l = (r ^ step3) >>> 0; // L = L (+) R
                r = temp; // R = V
            }
        }

        return [l, r];
    }

    zamena(val32bit) {
        let result = 0;
        for (let i = 0; i < 8; i++) {
            result |= (this.Sblock[i][(val32bit >>> (i * 4)) & 0x0F] << (i * 4));
        }
        return result;
    }

    bytesToBlock(bytes) {
        const L = bytes[0] | (bytes[1] << 8) | (bytes[2] << 16) | (bytes[3] << 24); // | это побитовое или, а << сдвигает двоичное представление битов влево, добавляя справа нули
        const R = bytes[4] | (bytes[5] << 8) | (bytes[6] << 16) | (bytes[7] << 24); // то есть мы берем блок из входных символов, переводим в биты, делим по 8 бит ан кусочки
        return [L >>> 0, R >>> 0]; 
        /* >>> превращает число в 32-битное целое и беззнаковое 
        (ну то есть если у нас было int -1, мы применяем >>>, и казалось он якобы не сдвигает биты, 
        но по факту меняет 1 на 0 в памяти числа (оно хранится как знак(0 это +, 1 это -), экспонента(насколько нам двигать запятую в числе) 
        и мантисса(постоянное количество битов, которое показывает точность числа))
        и двигает все единички в мантиссу, и на выходе получается 4294967295)
        мы это в прошлом году проходили, было интересно, но щас все равно пришлось все это вспоминать*/
    }

    blockToBytes(L, R) {
        const bytes = [];
        bytes.push(L & 0xFF);
        bytes.push((L >>> 8) & 0xFF); // двигаем на 8 битов вправо, отбрасывая сдвигаемые биты и добавляя нули слева, а потом берем только последние 8 бит (побитовое и в помощь)
        bytes.push((L >>> 16) & 0xFF);
        bytes.push((L >>> 24) & 0xFF);

        bytes.push(R & 0xFF);
        bytes.push((R >>> 8) & 0xFF);
        bytes.push((R >>> 16) & 0xFF);
        bytes.push((R >>> 24) & 0xFF);
        return bytes;
    }

    encrypt(text, keyString) {
        if (keyString.length !== 32) return "Ключ должен быть ровно 32 символа";
        const keys = this.prepareKey(keyString);
        let bytes = Array.from(new TextEncoder().encode(text));
        while (bytes.length % 8 !== 0) {
            bytes.push(0); //добавляем нолики, чтобы длина делилась на 8
        }

        let resultHex = "";

        for (let i = 0; i < bytes.length; i += 8) {
            const kusok = bytes.slice(i, i + 8);
            const [L, R] = this.bytesToBlock(kusok);

            const [outL, outR] = this.gost(L, R, keys, 'encrypt');
            const encryptedBytes = this.blockToBytes(outL, outR);
            for (let b of encryptedBytes) {
                resultHex += b.toString(16).padStart(2, '0'); //5 превращаем в 05, например, чтобы длина была равна 2
            }
        }

        return resultHex.toUpperCase();
    }

    decrypt(hexText, keyString) {
        if (keyString.length !== 32) return "Ключ должен быть ровно 32 символа";
        const keys = this.prepareKey(keyString);
        hexText = hexText.replaceAll(" ", "").toLowerCase();
        if (hexText.length % 16 !== 0) return "Неверная длина шифртекста! Он должен быть кратен 16";

        let decryptedBytes = [];

        for (let i = 0; i < hexText.length; i += 16) {
            const hexChunk = hexText.substr(i, 16);
            const chunkBytes = [];
            for (let j = 0; j < 16; j += 2) {
                chunkBytes.push(parseInt(hexChunk.substr(j, 2), 16));
            }

            const [L, R] = this.bytesToBlock(chunkBytes);
            const [outL, outR] = this.gost(L, R, keys, 'decrypt');
            decryptedBytes.push(...this.blockToBytes(outL, outR));
        }

        while (decryptedBytes.length > 0 && decryptedBytes[decryptedBytes.length - 1] === 0) {
            decryptedBytes.pop();
        }
        return new TextDecoder().decode(new Uint8Array(decryptedBytes));
    }

    prepareKey(keyString) {
        const keys = [];
        for (let i = 0; i < 32; i += 4) {
            keys.push(keyString.charCodeAt(i) | (keyString.charCodeAt(i + 1) << 8) | (keyString.charCodeAt(i + 2) << 16) |(keyString.charCodeAt(i + 3) << 24));
        }
        return keys;
    }
}

export default GostCipher;