const crypto = require('crypto');

// Decode standard base32 strings to byte buffer
function base32Decode(base32) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  const bytes = [];

  for (let i = 0; i < base32.length; i++) {
    const val = alphabet.indexOf(base32[i].toUpperCase());
    if (val === -1) continue;
    value = (value << 5) | val;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

// Verifies a 6-digit TOTP token against a base32 secret
function verifyTOTP(token, secret, window = 1) {
  if (!token || !secret) return false;
  const key = base32Decode(secret);
  const epoch = Math.floor(Date.now() / 1000);
  const timeStep = 30;
  const counter = Math.floor(epoch / timeStep);

  // Validate within clock drift window (current step plus/minus i steps)
  for (let i = -window; i <= window; i++) {
    const checkCounter = counter + i;
    const buffer = Buffer.alloc(8);
    buffer.writeUInt32BE(0, 0);
    buffer.writeUInt32BE(checkCounter, 4);

    const hmac = crypto.createHmac('sha1', key);
    hmac.update(buffer);
    const hmacResult = hmac.digest();

    const offset = hmacResult[hmacResult.length - 1] & 0xf;
    const code =
      ((hmacResult[offset] & 0x7f) << 24) |
      ((hmacResult[offset + 1] & 0xff) << 16) |
      ((hmacResult[offset + 2] & 0xff) << 8) |
      (hmacResult[offset + 3] & 0xff);

    const calculatedTotp = (code % 1000000).toString().padStart(6, '0');
    if (calculatedTotp === token.trim()) {
      return true;
    }
  }
  return false;
}

module.exports = { verifyTOTP };
