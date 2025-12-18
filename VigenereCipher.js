// как цезарь, но покруче
class VigenereCipher {
    constructor() {
        this.alphabet = "абвгдеёжзийклмнопрстуфхцчшщъыьэюя";
        this.len = this.alphabet.length;
    }

    encrypt(text, key) {
        return this.transformation(text, key, 1);
    }

    decrypt(text, key) {
        return this.transformation(text, key, -1);
    }

    transformation(text, key, multiplier) {
        if (!text || !key || typeof text !== 'string' || typeof key !== 'string' || /[a-z]/i.test(text) || /[a-z]/i.test(key)) {
            return "Введите слово и ключ на русском"; // извините
        }
        const smallKey = key.toLowerCase().split('')
            .filter(char => this.alphabet.includes(char)) // мало ли ввели символы
            .join('');

        if (smallKey.length === 0) {
            return "Введите слово и ключ на русском";
        }

        let keyIdx = 0;
        return text.split('').map(char => {
            const lowerChar = char.toLowerCase();
            const charIdxText = this.alphabet.indexOf(lowerChar);

            if (charIdxText === -1) {
                return char;   }

            const keyChar = smallKey[keyIdx % smallKey.length];
            const charIdxKey = this.alphabet.indexOf(keyChar);

            const newIdx = (charIdxText + (charIdxKey *multiplier) + this.len) % this.len; // снова умная формула, но уже для виженера

            const newChar = this.alphabet[newIdx];
            keyIdx++;

            if (char !== lowerChar) {
                return newChar.toUpperCase();
            }
            return newChar;
        }).join('');
    }
}

export default VigenereCipher;