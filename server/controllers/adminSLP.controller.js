const Admin = require("../models/adminSLP.model");
const Clinician = require("../models/clinicianSLP.model");
const Patient = require("../models/patientSlp.model");
const jwt = require("jsonwebtoken");
const {
  validatePassword,
  hashPassword,
  verifyPassword,
} = require("../utilities/password");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const verifyToken = require("../middleware/verifyToken");

const multer = require("multer");
const path = require("path");
const upload = require("../middleware/uploadProfilePicture");

const algorithm = "aes-256-cbc";
const secretKey = "12345678901234567890123456789012";
const iv = crypto.randomBytes(16);

const encrypt = (text) => {
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
};

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

exports.addAdmin = async (req, res) => {
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

  const existingAdmin = await Admin.findOne({ email });

  if (existingAdmin) {
    if (existingAdmin.active === true) {
      return res.status(400).json({
        error: true,
        message: "Admin is already active.",
      });
    } else if (existingAdmin.active === false) {
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

  const newAdmin = new Admin({
    email,
    addedOn: new Date(),
  });

  await newAdmin.save();

  return res.status(201).json({
    error: false,
    message: "Admin email added successfully.",
  });
};

exports.removeAdmin = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: true, message: "Email is required." });
  }

  const admin = await Admin.findOne({ email });

  if (!admin) {
    return res.status(400).json({ error: true, message: "Admin not found." });
  }

  if (admin.active === false) {
    return res
      .status(400)
      .json({ error: true, message: "Admin account is already deactivated." });
  }

  admin.active = false;
  await admin.save();

  return res
    .status(200)
    .json({ error: false, message: "Admin deactivated successfully." });
};

exports.activateAdmin = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: true, message: "Email is required." });
  }

  const admin = await Admin.findOne({ email });

  if (!admin) {
    return res.status(400).json({ error: true, message: "Admin not found." });
  }

  if (admin.active === true) {
    return res
      .status(400)
      .json({ error: true, message: "Admin is already active." });
  }

  admin.active = true;
  await admin.save();

  return res
    .status(200)
    .json({ error: false, message: "Admin activated successfully." });
};

exports.adminSignup = async (req, res) => {
  const { firstName, middleName, lastName, address, mobile, email, password } =
    req.body;

  const requiredFields = {
    firstName: "First name is required.",
    middleName: "Middle name is required.",
    lastName: "Last name is required.",
    address: "Clinic address is required.",
    mobile: "Contact number is required.",
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

  const existingAdmin = await Admin.findOne({ email });

  if (!existingAdmin) {
    return res.status(400).json({
      error: true,
      message: "Admin not recognized.",
    });
  }

  if (existingAdmin.password) {
    return res.status(400).json({
      error: true,
      message: "User already exists.",
    });
  }

  // Hash the password
  const hashedPassword = await hashPassword(password);

  existingAdmin.firstName = firstName;
  existingAdmin.middleName = middleName;
  existingAdmin.lastName = lastName;
  existingAdmin.address = address;
  existingAdmin.mobile = mobile;
  existingAdmin.password = hashedPassword;
  existingAdmin.createdOn = new Date().getTime();
  existingAdmin.active = true;
  existingAdmin.userRole = "admin";
  existingAdmin.profilePicture = "/images/default-profile-picture.png";

  await existingAdmin.save();

  const accessToken = jwt.sign(
    { admin: existingAdmin },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "30m", // Set to 30 minutes for example
    }
  );

  return res.json({
    error: false,
    admin: existingAdmin,
    accessToken,
    message: "Registration Successful",
  });
};

exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  const adminInfo = await Admin.findOne({ email: email });

  if (!adminInfo) {
    return res.status(400).json({ message: "User not found" });
  }

  if (adminInfo.active == false) {
    return res.status(400).json({ message: "User account is deactivated" });
  }

  if (adminInfo.email == email && adminInfo.password == password) {
    const admin = { admin: adminInfo };
    const accessToken = jwt.sign(admin, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "30m", // Set to 30 minutes for example
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

exports.getAdmin = async (req, res) => {
  try {
    const adminId = req.user.id;
    const admin = await Admin.findById(adminId).select(
      "-password -resetPasswordToken -resetPasswordExpires"
    );

    if (!admin) {
      return res.status(404).json({ error: true, message: "Admin not found." });
    }

    return res.status(200).json({ error: false, admin });
  } catch (error) {
    console.error("Error fetching admin:", error);
    return res
      .status(500)
      .json({ error: true, message: "Internal server error." });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: true, message: "Email is required." });
  }

  const admin = await Admin.findOne({ email });

  if (!admin) {
    return res.status(400).json({ error: true, message: "User not found." });
  }

  if (!admin.password) {
    return res.status(400).json({
      error: true,
      message: "Please sign up first.",
    });
  }

  const otp = crypto.randomInt(100000, 999999).toString();

  admin.resetPasswordToken = otp;
  admin.resetPasswordExpires = Date.now() + 300000; // 5 minutes

  await admin.save();

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    to: admin.email,
    from: process.env.EMAIL,
    subject: "Password Reset",
    text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\nYour OTP for password reset is: ${otp}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`,
  };

  transporter.sendMail(mailOptions, (err) => {
    if (err) {
      return res
        .status(500)
        .json({ error: true, message: "Email could not be sent." });
    }
    res.status(200).json({ error: false, message: "Password reset OTP sent." });
  });
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!otp) {
    return res.status(400).json({ error: true, message: "OTP is required." });
  }

  const admin = await Admin.findOne({ email });

  if (!admin || !admin.resetPasswordToken || admin.resetPasswordToken !== otp) {
    return res.status(400).json({ error: true, message: "Invalid OTP" });
  }

  if (Date.now() > admin.resetPasswordExpires) {
    return res.status(400).json({ error: true, message: "OTP has expired" });
  }

  res.status(200).json({ error: false, message: "OTP is valid." });
};

exports.resetPassword = async (req, res) => {
  const { email, otp, password, confirmPassword } = req.body;

  if (!email) {
    return res.status(400).json({ error: true, message: "Email is required." });
  }

  if (!otp) {
    return res.status(400).json({ error: true, message: "OTP is required." });
  }

  if (!password) {
    return res
      .status(400)
      .json({ error: true, message: "Password is required." });
  }

  if (!confirmPassword) {
    return res
      .status(400)
      .json({ error: true, message: "Confirm password is required." });
  }

  if (password !== confirmPassword) {
    return res
      .status(400)
      .json({ error: true, message: "Passwords do not match." });
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    return res.status(400).json({ error: true, message: passwordError });
  }

  const admin = await Admin.findOne({ email });

  if (!admin || !admin.resetPasswordToken || admin.resetPasswordToken !== otp) {
    return res.status(400).json({ error: true, message: "Invalid OTP" });
  }

  if (Date.now() > admin.resetPasswordExpires) {
    return res.status(400).json({ error: true, message: "OTP has expired" });
  }

  admin.password = await hashPassword(password);
  admin.resetPasswordToken = undefined;
  admin.resetPasswordExpires = undefined;

  await admin.save();

  res.status(200).json({ error: false, message: "Password has been reset." });
};

exports.getAllClinicians = [
  verifyToken,
  async (req, res) => {
    const { id } = req.user;

    // Check if the requester is a SuperAdmin
    const isAdmin = await Admin.findOne({ _id: id });

    if (!isAdmin) {
      return res.sendStatus(401);
    }

    try {
      const clinicians = await Clinician.find({});
      return res.status(200).json({
        error: false,
        message: "Clinicians retrieved successfully.",
        clinicians: clinicians.map((clinician) => ({
          _id: clinician._id,
          firstName: clinician.firstName,
          middleName: clinician.middleName,
          lastName: clinician.lastName,
          email: clinician.email,
          address: clinician.address,
          mobile: clinician.mobile,
          active: clinician.active,
          createdOn: clinician.createdOn,
          addedOn: clinician.addedOn,
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

exports.getClinicianById = [
  verifyToken,
  async (req, res) => {
    const { id } = req.user;
    const { clinicianId } = req.params; // Extract admin ID from request parameters

    // Check if the requester is a SuperAdmin
    const isAdmin = await Admin.findOne({ _id: id });

    if (!isAdmin) {
      return res.sendStatus(401);
    }

    try {
      const clinician = await Clinician.findById(clinicianId); // Query the database for the admin with the given ID

      if (!clinician) {
        return res.status(404).json({
          error: true,
          message: "Clinician not found.",
        });
      }

      return res.status(200).json({
        error: false,
        message: "Clinician retrieved successfully.",
        clinician: {
          _id: clinician._id,
          firstName: clinician.firstName,
          middleName: clinician.middleName,
          lastName: clinician.lastName,
          email: clinician.email,
          address: clinician.address,
          mobile: clinician.mobile,
          active: clinician.active,
          createdOn: clinician.createdOn,
          addedOn: clinician.addedOn,
        },
      });
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "An error occurred while retrieving the clinicians.",
      });
    }
  },
];

exports.getAllPatients = [
  verifyToken,
  async (req, res) => {
    const { id } = req.user;

    // Check if the requester is a SuperAdmin
    const isAdmin = await Admin.findOne({ _id: id });

    if (!isAdmin) {
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
          middleName: decrypt(patient.middleName),
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
    const { patientId } = req.params; // Extract admin ID from request parameters

    // Check if the requester is a SuperAdmin
    const isAdmin = await Admin.findOne({ _id: id });

    if (!isAdmin) {
      return res.sendStatus(401);
    }

    try {
      const patient = await Patient.findById(patientId); // Query the database for the admin with the given ID

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
          middleName: decrypt(patient.middleName),
          lastName: decrypt(patient.lastName),
          email: patient.email,
          mobile: decrypt(patient.mobile),
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

exports.editAdmin = [
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
      const admin = await Admin.findOne({ _id: id });

      if (!admin) {
        return res
          .status(404)
          .json({ error: true, message: " Admin not found." });
      }

      // Update the clinician's information
      admin.firstName = firstName;
      admin.middleName = middleName;
      admin.lastName = lastName;
      admin.address = address;
      admin.mobile = mobile;

      // Save the updated clinician information
      await admin.save();

      return res.json({
        error: false,
        Admin,
        message: " Admin information updated successfully.",
      });
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "An error occurred while updating Admin information.",
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
      // Find the superAdmin by ID
      const admin = await Admin.findOne({ _id: id });

      if (!admin) {
        return res
          .status(404)
          .json({ error: true, message: "admin not found." });
      }

      // Verify current password
      const isPasswordValid = await verifyPassword(
        admin.password,
        currentPassword
      );
      if (!isPasswordValid) {
        return res
          .status(400)
          .json({ error: true, message: "Current password is incorrect." });
      }

      // Hash the new password
      const hashedPassword = await hashPassword(newPassword);

      // Update the admin's password
      admin.password = hashedPassword;
      await admin.save();

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
          return res.status(400).json({
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
      const admin = await Admin.findOne({ _id: id });

      if (!admin) {
        return res
          .status(404)
          .json({ error: true, message: "superAdmin not found." });
      }

      // Update the profile picture URL
      admin.profilePicture = `/images/profile_pictures/${req.file.filename}`;
      await admin.save();

      return res.json({
        error: false,
        message: "Profile picture updated successfully.",
        profilePicture: admin.profilePicture,
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

exports.editPatient = [
  verifyToken,
  async (req, res) => {
    const { firstName, middleName, lastName, mobile, id } = req.body;

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
    if (!mobile) {
      return res
        .status(400)
        .json({ error: true, message: "Clinic address is required." });
    }

    try {
      const patient = await Patient.findOne({ _id: id });

      if (!patient) {
        return res
          .status(404)
          .json({ error: true, message: " Admin not found." });
      }

      // Update the clinician's information
      patient.firstName = encrypt(firstName);
      patient.middleName = encrypt(middleName);
      patient.lastName = encrypt(lastName);
      patient.mobile = encrypt(mobile);

      // Save the updated clinician information
      await patient.save();

      return res.json({
        error: false,
        Patient,
        message: " Admin information updated successfully.",
      });
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "An error occurred while updating Admin information.",
      });
    }
  },
];

exports.editClinician = [
  verifyToken,
  async (req, res) => {
    const { firstName, middleName, lastName, address, id } = req.body;

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

    try {
      const clinician = await Clinician.findOne({ _id: id });

      if (!clinician) {
        return res
          .status(404)
          .json({ error: true, message: " Admin not found." });
      }

      // Update the clinician's information
      clinician.firstName = firstName;
      clinician.middleName = middleName;
      clinician.lastName = lastName;
      clinician.address = address;

      // Save the updated clinician information
      await clinician.save();

      return res.json({
        error: false,
        Clinician,
        message: " Admin information updated successfully.",
      });
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "An error occurred while updating Admin information.",
      });
    }
  },
];