import CryptoJS from "crypto-js";

const secretKey = import.meta.env.VITE_SECRET_KEY;

export const encrypt = (text) => 
  CryptoJS.AES.encrypt(text, secretKey).toString();

export const decrypt = (encryptedData) => {
  if (!encryptedData) return null;

  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
};
