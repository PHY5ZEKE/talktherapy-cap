const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const superAdminSLPSchema = new Schema({
  email: { type: String },
  password: { type: String },
  firstName: { type: String },
  middleName: { type: String },
  lastName: { type: String },
  address: { type: String },
  mobile: { type: String },
  userRole: { type: String },
  profilePicture: {
    type: String,
    default: "/public/images/default_profile_picture.png",
  },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
});

module.exports = mongoose.model("SuperAdminSLP", superAdminSLPSchema);