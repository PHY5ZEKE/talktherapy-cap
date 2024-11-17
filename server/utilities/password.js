const crypto = require("crypto");

function validatePassword(password) {
  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }

  if (!/[a-z]/.test(password)) {
    return "Password must include at least one lowercase letter.";
  }

  if (!/[A-Z]/.test(password)) {
    return "Password must include at least one uppercase letter.";
  }

  if (!/\d/.test(password)) {
    return "Password must include at least one number.";
  }

  // Updated regex to allow any symbol
  if (!/[^a-zA-Z0-9]/.test(password)) {
    return "Password must include at least one special character.";
  }

  return null;
}

function hashPassword(password) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString("hex");
    crypto.pbkdf2(password, salt, 1000, 64, "sha512", (err, derivedKey) => {
      if (err) reject(err);
      resolve(salt + ":" + derivedKey.toString("hex"));
    });
  });
}

function verifyPassword(storedPassword, inputPassword) {
  return new Promise((resolve, reject) => {
    const [salt, key] = storedPassword.split(":");
    crypto.pbkdf2(
      inputPassword,
      salt,
      1000,
      64,
      "sha512",
      (err, derivedKey) => {
        if (err) reject(err);
        resolve(key === derivedKey.toString("hex"));
      }
    );
  });
}

module.exports = {
  validatePassword,
  hashPassword,
  verifyPassword,
};
