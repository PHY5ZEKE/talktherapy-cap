const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const adminSLPSchema = new Schema({
  firstName: { type: String },
  middleName: { type: String },
  lastName: { type: String },
  address: { type: String },
  mobile: { type: String },
  email: { type: String },
  password: { type: String },
  createdOn: { type: Date },
  addedOn: { type: Date },
  active: { type: Boolean },
  status: { type: String},
  lastActivity: { type: Date },
  userRole: { type: String },
  profilePicture: {
    type: String,
    default:
      "https://talktherapy-cap.s3.ap-southeast-2.amazonaws.com/profile-pictures/default-profile-picture.png",
  },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
});

module.exports = mongoose.model("AdminSLP", adminSLPSchema);
