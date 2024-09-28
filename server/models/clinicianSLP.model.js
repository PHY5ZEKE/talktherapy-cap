const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const clinicianSLPSchema = new Schema({
  firstName: { type: String },
  middleName: { type: String },
  lastName: { type: String },
  mobile: { type: String },
  birthday: { type: Date },
  gender: { type: String },
  address: { type: String },
  specialization: { type: String },
  email: { type: String },
  profilePicture: {
    type: String,
    default: "/src/images/profile-picture/default-profile-picture.png",
  },
  password: { type: String },
  createdOn: { type: Date },
  addedOn: { type: Date },
  active: { type: Boolean },
  userRole: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
});

module.exports = mongoose.model("ClinicianSLP", clinicianSLPSchema);
