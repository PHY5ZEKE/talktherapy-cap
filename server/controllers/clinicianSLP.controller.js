const Clinician = require("../models/clinicianSLP.model");
const Patient = require("../models/patientSlp.model");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const {
  validatePassword,
  hashPassword,
  verifyPassword,
} = require("../utilities/password");
const verifyToken = require("../middleware/verifyToken");

const multer = require("multer");
const path = require("path");
const upload = require("../middleware/uploadProfilePicture");

const algorithm = "aes-256-cbc";
const secretKey = "12345678901234567890123456789012"; // Ensure this is 32 bytes
const iv = crypto.randomBytes(16);

const decrypt = (text) => {
  const textParts = text.split(":");
  const iv = Buffer.from(textParts.shift(), "hex");
  const encryptedText = Buffer.from(textParts.join(":"), "hex");
  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(secretKey),
    iv
  );
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

// Set up storage engine

exports.addClinician = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: true, message: "Email is required." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res
      .status(400)
      .json({ error: true, message: "Invalid email format" });
  }

  const existingClinician = await Clinician.findOne({ email });

  if (existingClinician) {
    if (existingClinician.active === true) {
      return res.status(400).json({
        error: true,
        message: "Clinician is already active.",
      });
    } else if (existingClinician.active === false) {
      return res.status(400).json({
        error: true,
        message:
          "Unable to add a deactivated account. Please reactivate the account.",
      });
    } else {
      return res.status(400).json({
        error: true,
        message: "Email already exists.",
      });
    }
  }

  const newClinician = new Clinician({
    email,
    addedOn: new Date(),
  });

  await newClinician.save();

  return res.status(201).json({
    error: false,
    message: "Clinician email added successfully.",
  });
};

exports.removeClinician = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: true, message: "Email is required." });
  }

  const clinician = await Clinician.findOne({ email });

  if (!clinician) {
    return res
      .status(400)
      .json({ error: true, message: "Clinician not found." });
  }

  if (clinician.active === false) {
    return res.status(400).json({
      error: true,
      message: "Clinician account is already deactivated.",
    });
  }

  clinician.active = false;
  await clinician.save();

  return res
    .status(200)
    .json({ error: false, message: "Clinician deactivated successfully." });
};

exports.activateClinician = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: true, message: "Email is required." });
  }

  const clinician = await Clinician.findOne({ email });

  if (!clinician) {
    return res
      .status(400)
      .json({ error: true, message: "Clinician not found." });
  }

  if (clinician.active === true) {
    return res
      .status(400)
      .json({ error: true, message: "Clinician is already active." });
  }

  clinician.active = true;
  await clinician.save();

  return res
    .status(200)
    .json({ error: false, message: "Clinician activated successfully." });
};

exports.clinicianSignup = async (req, res) => {
  const {
    firstName,
    middleName,
    lastName,
    mobile,
    birthday,
    gender,
    address,
    specialization,
    email,
    password,
  } = req.body;

  const requiredFields = {
    firstName: "First name is required.",
    middleName: "Middle name is required.",
    lastName: "Last name is required.",
    mobile: "Mobile number is required.",
    birthday: "Date of birth is required.",
    gender: "Gender is required.",
    address: "Clinic address is required.",
    specialization: "Specialization is required.",
    email: "Email is required",
    password: "Password is required",
  };

  for (const [field, message] of Object.entries(requiredFields)) {
    if (!req.body[field]) {
      return res.status(400).json({ error: true, message });
    }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res
      .status(400)
      .json({ error: true, message: "Invalid email format" });
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    return res.status(400).json({ error: true, message: passwordError });
  }

  const existingClinician = await Clinician.findOne({ email });

  if (!existingClinician) {
    return res
      .status(400)
      .json({ error: true, message: "Clinician not recognized." });
  }

  if (existingClinician.password) {
    return res
      .status(400)
      .json({ error: true, message: "User already exists." });
  }

  const hashedPassword = await hashPassword(password);

  existingClinician.firstName = firstName;
  existingClinician.middleName = middleName;
  existingClinician.lastName = lastName;
  existingClinician.mobile = mobile;
  existingClinician.birthday = birthday;
  existingClinician.gender = gender;
  existingClinician.address = address;
  existingClinician.address = address;
  existingClinician.specialization = specialization;
  existingClinician.profilePicture =
    "/public/images/default_profile_picture.png";
  existingClinician.password = hashedPassword;
  existingClinician.createdOn = new Date().getTime();
  existingClinician.userRole = "clinician";
  existingClinician.active = true;

  await existingClinician.save();

  const accessToken = jwt.sign(
    { clinician: existingClinician },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "15m",
    }
  );

  return res.json({
    error: false,
    clinician: existingClinician,
    accessToken,
    message: "Registration Successful",
  });
};

exports.clinicianLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  const clinicianInfo = await Clinician.findOne({ email: email });

  if (!clinicianInfo) {
    return res.status(400).json({ message: "User not found" });
  }

  if (clinicianInfo.active === false) {
    return res.status(400).json({ message: "User account is deactivated" });
  }

  if (clinicianInfo.email == email && clinicianInfo.password == password) {
    const clinician = { clinician: clinicianInfo };
    const accessToken = jwt.sign(clinician, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "36000m",
    });

    return res.json({
      error: false,
      message: "Login Successful",
      email,
      accessToken,
    });
  } else {
    return res.status(400).json({
      error: true,
      message: "Invalid email or password",
    });
  }
};

exports.getClinician = async (req, res) => {
  try {
    const clinicianId = req.user.id;

    const clinician = await Clinician.findById(clinicianId).select(
      "-password -resetPasswordToken -resetPasswordExpires"
    );

    if (!clinician) {
      return res
        .status(404)
        .json({ error: true, message: "Clinician not found." });
    }

    return res.status(200).json({ error: false, clinician });
  } catch (error) {
    console.error("Error fetching Clinician:", error);
    return res
      .status(500)
      .json({ error: true, message: "Internal server error." });
  }
};

exports.getAllPatients = [
  verifyToken,
  async (req, res) => {
    const { id } = req.user;

    const isClinician = await Clinician.findOne({ _id: id });

    if (!isClinician) {
      return res.sendStatus(401);
    }

    try {
      const patients = await Patient.find({});
      return res.status(200).json({
        error: false,
        message: "Patient retrieved successfully.",
        patients: patients.map((patient) => ({
          _id: patient._id,
          firstName: decrypt(patient.firstName),
          lastName: decrypt(patient.lastName),
          email: patient.email,
          mobile: decrypt(patient.mobile),
          active: patient.active,
          createdOn: patient.createdOn,
          addedOn: patient.addedOn,
        })),
      });
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "An error occurred while retrieving patients.",
      });
    }
  },
];

exports.getPatientById = [
  verifyToken,
  async (req, res) => {
    const { id } = req.user;
    const { patientId } = req.params;

    const isClinician = await Clinician.findOne({ _id: id });

    if (!isClinician) {
      return res.sendStatus(401);
    }

    try {
      const patient = await Patient.findById(patientId);

      if (!patient) {
        return res.status(404).json({
          error: true,
          message: "Clinician not found.",
        });
      }

      return res.status(200).json({
        error: false,
        message: "Patient retrieved successfully.",
        patient: {
          _id: patient._id,
          firstName: decrypt(patient.firstName),
          lastName: decrypt(patient.lastName),
          email: patient.email,
          mobile: decrypt(patient.mobile),
          diagnosis: decrypt(patient.diagnosis),
          active: patient.active,
          createdOn: patient.createdOn,
          addedOn: patient.addedOn,
        },
      });
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "An error occurred while retrieving the patient.",
      });
    }
  },
];

exports.editClinician = [
  verifyToken,
  async (req, res) => {
    const { firstName, middleName, lastName, address, mobile } = req.body;
    const { id } = req.user;

    // Validate input
    if (!firstName) {
      return res
        .status(400)
        .json({ error: true, message: "First name is required." });
    }
    if (!middleName) {
      return res
        .status(400)
        .json({ error: true, message: "Middle name is required." });
    }
    if (!lastName) {
      return res
        .status(400)
        .json({ error: true, message: "Last name is required." });
    }
    if (!address) {
      return res
        .status(400)
        .json({ error: true, message: "Clinic address is required." });
    }
    if (!mobile) {
      return res
        .status(400)
        .json({ error: true, message: "Contact number is required." });
    }

    try {
      // Find the clinician by ID
      const clinician = await Clinician.findOne({ _id: id });

      if (!clinician) {
        return res
          .status(404)
          .json({ error: true, message: "Clinician not found." });
      }

      // Update the clinician's information
      clinician.firstName = firstName;
      clinician.middleName = middleName;
      clinician.lastName = lastName;
      clinician.address = address;
      clinician.mobile = mobile;

      // Save the updated clinician information
      await clinician.save();

      return res.json({
        error: false,
        clinician,
        message: "Clinician information updated successfully.",
      });
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "An error occurred while updating clinician information.",
      });
    }
  },
];

exports.changePassword = [
  verifyToken,
  async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const { id } = req.user;

    // Validate input
    if (!currentPassword) {
      return res
        .status(400)
        .json({ error: true, message: "Current password is required." });
    }
    if (!newPassword) {
      return res
        .status(400)
        .json({ error: true, message: "New password is required." });
    }

    // Validate new password
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return res.status(400).json({ error: true, message: passwordError });
    }

    try {
      // Find the clinician by ID
      const clinician = await Clinician.findOne({ _id: id });

      if (!clinician) {
        return res
          .status(404)
          .json({ error: true, message: "Clinician not found." });
      }

      // Verify current password
      const isPasswordValid = await verifyPassword(
        clinician.password,
        currentPassword
      );
      if (!isPasswordValid) {
        return res
          .status(400)
          .json({ error: true, message: "Current password is incorrect." });
      }

      // Hash the new password
      const hashedPassword = await hashPassword(newPassword);

      // Update the clinician's password
      clinician.password = hashedPassword;
      await clinician.save();

      return res.json({
        error: false,
        message: "Password changed successfully.",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      return res.status(500).json({
        error: true,
        message: "An error occurred while changing the password.",
      });
    }
  },
];

exports.updateProfilePicture = [
  verifyToken,
  (req, res, next) => {
    upload.single("profilePicture")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        if (err.code === "LIMIT_FILE_SIZE") {
          return res
            .status(400)
            .json({
              error: true,
              message: "File too large. Maximum size is 1MB.",
            });
        }
        return res.status(400).json({ error: true, message: err.message });
      } else if (err) {
        // An unknown error occurred when uploading.
        return res.status(400).json({ error: true, message: err.message });
      }
      // Everything went fine.
      next();
    });
  },
  async (req, res) => {
    const { id } = req.user;

    if (!req.file) {
      return res
        .status(400)
        .json({ error: true, message: "No file uploaded." });
    }

    try {
      const clinician = await Clinician.findOne({ _id: id });

      if (!clinician) {
        return res
          .status(404)
          .json({ error: true, message: "Clinician not found." });
      }

      // Update the profile picture URL
      clinician.profilePicture = `/images/profile_pictures/${req.file.filename}`;
      await clinician.save();

      return res.json({
        error: false,
        message: "Profile picture updated successfully.",
        profilePicture: clinician.profilePicture,
      });
    } catch (error) {
      console.error("Error updating profile picture:", error);
      return res.status(500).json({
        error: true,
        message: "An error occurred while updating the profile picture.",
      });
    }
  },
];