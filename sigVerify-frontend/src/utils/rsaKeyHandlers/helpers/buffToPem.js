function buffToPem(buffer, type) {
    const b64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    const pem = `-----BEGIN ${type} KEY-----\n${b64.match(/.{1,64}/g).join('\n')}\n-----END ${type} KEY-----\n`;
    return pem;
}

export { buffToPem };
