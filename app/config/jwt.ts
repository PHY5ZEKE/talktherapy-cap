export default {
  secret: process.env.VITE_JWT_SECRET,
  expiresIn: "3h",
  algorithm: "HS256",
};
