const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const patientSlpSchema = new Schema({
  firstName: { type: String },
  middleName: { type: String },
  lastName: { type: String },
  mobile: { type: String },
  birthday: { type: Date },
  diagnosis: { type: String },
  consent: { type: Boolean, default: false },
  email: { type: String },
  password: { type: String },
  createdOn: { type: Date },
  active: { type: Boolean },
  userRole: { type: String },
  profilePicture: {
    type: String,
    default: "/images/default-profile-picture.png",
  },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
});

module.exports = mongoose.model("PatientSlp", patientSlpSchema);