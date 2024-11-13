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
  status: { type: String},
  lastActivity: { type: Date },
  profilePicture: {
    type: String,
    default:
      "https://talktherapy-cap.s3.ap-southeast-2.amazonaws.com/profile-pictures/default-profile-picture.png",
  },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  bookmarkedContent: {
    type: [mongoose.Schema.Types.ObjectId], 
    ref: 'Content', 
    default: [] 
  },
});

module.exports = mongoose.model("PatientSlp", patientSlpSchema);
