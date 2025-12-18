class CaesarCipher {
    constructor() {
        this.alphabet = "абвгдеёжзийклмнопрстуфхцчшщъыьэюя";
        this.len = this.alphabet.length;
    }

    encrypt(text, shift) {
        return this.transformation(text, shift);
    }

    decrypt(text, shift) {
        return this.transformation(text, -shift);
    }

    bruteForce(text) {
        const results = [];
        for (let s = 1; s < this.len; s++) {
            results.push({shift: s, result: this.decrypt(text, s)});
        }
        return results;}

    transformation(text, shift) {
        if (!text || typeof text !== 'string' || /[a-z]/i.test(text)) {
            return "Введите слово на русском"; // не бейте тапками, я затупила и сделала только русский алфавит в обеих лабах, только потом поняла, что есть еще и другие языки блин
        }
        const ostatok = ((shift % this.len) + this.len) % this.len; //умная формула, которая всегда находит индекс массива (для отрицтельного ключа или слишком большого)
        return text.split('').map(char => {
                const lowerChar = char.toLowerCase();
                const index = this.alphabet.indexOf(lowerChar);

                if (index === -1) {
                    return char; //если встретим не букву, а пробел, например
                }

                const newChar = this.alphabet[(index + ostatok) % this.len];
                if (char === char.toUpperCase() && char !== lowerChar) {
                    return newChar.toUpperCase();
                }
                return newChar;
            }).join('');
    }
}

export default CaesarCipher;