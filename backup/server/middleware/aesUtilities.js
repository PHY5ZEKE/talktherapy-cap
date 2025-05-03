const crypto = require("crypto");

const algorithm = "aes-256-cbc";
const secretKey = process.env.SECRET_KEY;
const iv = crypto.randomBytes(16);

const encrypt = (text) => {
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
};

const decrypt = (text) => {
  try {
    const textParts = text.split(":");
    if (textParts.length !== 2) {
      console.error(`Invalid encrypted text format: ${text}`);
      throw new Error("Invalid encrypted text format");
    }

    const iv = Buffer.from(textParts.shift(), "hex");
    const encryptedText = Buffer.from(textParts.join(":"), "hex");

    if (iv.length !== 16) {
      console.error(`Invalid IV length for text: ${text}`);
      throw new Error("Invalid IV length");
    }

    const decipher = crypto.createDecipheriv(
      algorithm,
      Buffer.from(secretKey),
      iv
    );
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error("Error decrypting text:", error);
    throw error;
  }
};

module.exports = { encrypt, decrypt };
