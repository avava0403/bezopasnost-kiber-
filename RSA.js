class RSACipher {
    constructor() {
        this.privateKey = {}
        this.publicKey = {}
    }

    init(p, q, e) {
        const errors = [];

        if (!isPrime(p)) {
            errors.push('p не простое');
        }
        if (!Number.isInteger(p)) {
            errors.push('p не целое');
        }
        if (!isPrime(q)) {
            errors.push('q не простое');
        }
        if (!Number.isInteger(q)) {
            errors.push('q не целое');
        }

        const n = p * q
        const phi = (p - 1) * (q - 1)

        if (gcd(e, phi) !== 1) {
            errors.push('e не взаимно простое с φ(n)') // если их нод не 1, то d мы никогда не найдем :(
        }

        const d = modInverse(e, phi)

        this.publicKey = { e, n }
        this.privateKey = { d, n }

        if (errors.length) {
            throw new Error(errors.join('\n'));
        }
    }

    encrypt(text) {
        const errors = [];

        const { e, n } = this.publicKey;

        const bytes = this.stringToBytes(text);
        const blockSize = this.getBlockSize(n);

        if (blockSize < 1) {
            errors.push('Модуль n слишком маленький');
        }

        const blocks = []

        for (let i = 0; i < bytes.length; i += blockSize) {
            const kusok = bytes.slice(i, i + blockSize);
            const m = this.bytesToNumber(kusok);
            blocks.push(this.modPow(m, e, n));
        }

        if (errors.length) {
            throw new Error(errors.join('\n'));
        }

        return blocks.join(':');
    }

    decrypt(text) {
        const { d, n } = this.privateKey
        const blockSize = this.getBlockSize(n);
        const blocks = text.split(':').map(Number);

        const bytes = [];

        for (const block of blocks) {
            const m = this.modPow(block, d, n);
            const kusok = this.numberToBytes(m, blockSize);
            bytes.push(...kusok);
        }

        return this.bytesToString(new Uint8Array(bytes)).replace(/\0+$/, ''); // очень крутая регулярка, которая поможет нам убрать нолики именно в конце
    }

    getBlockSize(n) {
        // сколько байт можно положить в число < n
        return Math.floor(Math.log2(n) / 8)
    }

    stringToBytes(str) {
        return new TextEncoder().encode(str)
    }

    bytesToString(bytes) {
        return new TextDecoder().decode(bytes)
    }

    bytesToNumber(bytes) {
        let num = 0
        for (const b of bytes) {
            num = (num << 8) | b
        }
        return num
    }

    numberToBytes(num, blockSize) {
        const bytes = new Uint8Array(blockSize)
        for (let i = blockSize - 1; i >= 0; i--) {
            bytes[i] = num & 0xff
            num >>= 8
        }
        return bytes
    }

    modPow(base, exp, mod) {
        let result = 1
        base %= mod

        while (exp > 0) {
            if (exp % 2 === 1) {
            result = (result * base) % mod
            }
            exp = Math.floor(exp / 2)
            base = (base * base) % mod
        }

        return result
    }
}

function isPrime(n) {
    if (!Number.isInteger(n) || n < 2) return false
    if (n === 2) return true
    if (n % 2 === 0) return false

    const limit = Math.floor(Math.sqrt(n))
    for (let i = 3; i <= limit; i += 2) {
        if (n % i === 0) return false
    }

    return true
}

function gcd(a, b) {
    a = Math.abs(a)
    b = Math.abs(b)

    while (b !== 0) {
        const temp = b
        b = a % b
        a = temp
    }

    return a
}

function modInverse(a, m) {
  const {gcd, x} = extendedGcd(a, m)
  return ((x % m) + m) % m
}

function extendedGcd(a, b) {
  if (b === 0) {
    return {gcd: a, x: 1, y: 0}
  }

  const {gcd, x: x1, y: y1} = extendedGcd(b, a % b)

  return {
    gcd,
    x: y1,
    y: x1 - Math.floor(a / b) * y1
  }
}

export default RSACipher;