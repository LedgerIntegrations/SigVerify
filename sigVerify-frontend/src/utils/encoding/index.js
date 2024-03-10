export const arrayBufferToHex = (buffer) => {
    return Array.from(new Uint8Array(buffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
};

export const hexToArrayBuffer = (hex) => {
    if (hex.length % 2 !== 0) {
        throw new Error('Hex string must have an even length');
    }
    const byteArray = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        byteArray[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return byteArray.buffer;
};
