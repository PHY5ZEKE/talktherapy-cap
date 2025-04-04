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
  lastActivity: { type: Date},
  profilePicture: {
    type: String,
    default:
      "https://talktherapy-cap.s3.ap-southeast-2.amazonaws.com/profile-pictures/default-profile-picture.png",
  },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
});

module.exports = mongoose.model("SuperAdminSLP", superAdminSLPSchema);
