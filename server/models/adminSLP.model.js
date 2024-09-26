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
  userRole: { type: String },
  profilePicture: {
    type: String,
    default: "/public/images/default_profile_picture.png",
  },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
});

module.exports = mongoose.model("AdminSLP", adminSLPSchema);