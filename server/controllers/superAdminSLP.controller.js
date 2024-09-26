const SuperAdmin = require("../models/superAdminSLP.model");
const Admin = require("../models/adminSLP.model"); // Assuming you have an Admin model
const Clinician = require("../models/clinicianSLP.model"); // Assuming you have a Clinician model
const Patient = require("../models/patientSlp.model"); // Assuming you have a Patient model
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const {
  validatePassword,
  hashPassword,
  verifyPassword,
} = require("../utilities/password");
const verifyToken = require("../middleware/verifyToken");

const multer = require("multer");
const path = require("path");
const upload = require("../middleware/uploadProfilePicture");

exports.signup = async (req, res) => {
  const {
    email,
    password,
    firstName,
    middleName,
    lastName,
    address,
    mobile,
  } = req.body;

  const requiredFields = {
    email: "Email is required",
    password: "Password is required",
    firstName: "First name is required",
    middleName: "Middle name is required",
    lastName: "Last name is required",
    address: "Address is required",
    mobile: "Contact number is required",
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

  const isSuperAdmin = await SuperAdmin.findOne({ email: email });

  if (isSuperAdmin) {
    return res.json({
      error: true,
      message: "User already exists.",
    });
  }

  const hashedPassword = await hashPassword(password);

  const superAdmin = new SuperAdmin({
    email,
    password: hashedPassword,
    firstName,
    middleName,
    lastName,
    address,
    mobile,
    userRole: "superAdmin",
    profilePicture: "/images/default-profile-picture.png",
  });

  await superAdmin.save();

  const payload = {
    id: superAdmin._id,
    role: superAdmin.userRole,
  };

  // Generate JWT token for immediate authentication after signup
  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "3m",
  });

  console.log("Generated Access Token (Signup):", accessToken);

  return res.json({
    error: false,
    superAdmin,
    accessToken,
    message: "Registration Successful",
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  let userInfo;
  let userRole;

  // Check each collection for the user
  userInfo = await SuperAdmin.findOne({ email: email });
  if (userInfo) {
    userRole = "superAdmin";
  } else {
    userInfo = await Admin.findOne({ email: email });
    if (userInfo) {
      userRole = "admin";
    } else {
      userInfo = await Clinician.findOne({ email: email });
      if (userInfo) {
        userRole = "clinician";
      } else {
        userInfo = await Patient.findOne({ email: email });
        if (userInfo) {
          userRole = "patientslp";
        }
      }
    }
  }

  if (!userInfo) {
    return res.status(400).json({ message: "User not found" });
  }

  // Check if the user is active
  if (userInfo.active === false) {
    return res.status(403).json({ message: "User account is inactive" });
  }

  const isPasswordValid = await verifyPassword(userInfo.password, password);

  if (isPasswordValid) {
    const payload = {
      id: userInfo._id,
      role: userRole,
    };

    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1h",
    });

    return res.json({
      error: false,
      message: "Login Successful",
      email,
      accessToken,
      userRole,
    });
  } else {
    return res.status(400).json({
      error: true,
      message: "Invalid email or password",
    });
  }
};

exports.getSuperAdmin = [
  verifyToken,
  async (req, res) => {
    const { id } = req.user;

    const isSuperAdmin = await SuperAdmin.findOne({ _id: id });

    if (!isSuperAdmin) {
      return res.sendStatus(401);
    }

    return res.json({
      superAdmin: {
        _id: isSuperAdmin._id,
        email: isSuperAdmin.email,
        firstName: isSuperAdmin.firstName,
        middleName: isSuperAdmin.middleName,
        lastName: isSuperAdmin.lastName,
        address: isSuperAdmin.address,
        mobile: isSuperAdmin.mobile,
        userRole: isSuperAdmin.userRole,
        profilePicture: isSuperAdmin.profilePicture,
      },
    });
  },
];

// Forgot Password Function
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: true, message: "Email is required." });
  }

  let user = await SuperAdmin.findOne({ email });
  let userRole = "superAdmin";
  if (!user) {
    user = await Admin.findOne({ email });
    userRole = "admin";
  }
  if (!user) {
    user = await Clinician.findOne({ email });
    userRole = "clinician";
  }
  if (!user) {
    user = await Patient.findOne({ email });
    userRole = "patientslp";
  }

  if (!user) {
    return res.status(400).json({ error: true, message: "User not found." });
  }

  const otp = crypto.randomInt(100000, 999999).toString();

  user.resetPasswordToken = otp;
  user.resetPasswordExpires = Date.now() + 300000; // 5 minutes

  await user.save();

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "talktherapycapstone@gmail.com",
      pass: "bvxj gwqk oirf lcgy",
    },
  });

  const mailOptions = {
    to: user.email,
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

// Verify OTP Function
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!otp) {
    return res.status(400).json({ error: true, message: "OTP is required." });
  }

  let user = await SuperAdmin.findOne({ email });
  if (!user) {
    user = await Admin.findOne({ email });
  }
  if (!user) {
    user = await Clinician.findOne({ email }); // Added Clinician check
  }
  if (!user) {
    user = await Patient.findOne({ email }); // Added Clinician check
  }

  if (!user || !user.resetPasswordToken || user.resetPasswordToken !== otp) {
    return res.status(400).json({ error: true, message: "Invalid OTP" });
  }

  if (Date.now() > user.resetPasswordExpires) {
    return res.status(400).json({ error: true, message: "OTP has expired" });
  }

  res.status(200).json({ error: false, message: "OTP is valid." });
};

// Reset Password Function
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

  let user = await SuperAdmin.findOne({ email });
  if (!user) {
    user = await Admin.findOne({ email });
  }
  if (!user) {
    user = await Clinician.findOne({ email }); // Added Clinician check
  }
  if (!user) {
    user = await Patient.findOne({ email }); // Added Clinician check
  }

  if (!user || !user.resetPasswordToken || user.resetPasswordToken !== otp) {
    return res.status(400).json({ error: true, message: "Invalid OTP" });
  }

  if (Date.now() > user.resetPasswordExpires) {
    return res.status(400).json({ error: true, message: "OTP has expired" });
  }

  const hashedPassword = await hashPassword(password);

  user.password = hashedPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  res.status(200).json({ error: false, message: "Password has been reset." });
};

exports.checkAuth = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await SuperAdmin.findById(decoded.superAdmin._id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};
exports.getAllAdmins = [
  verifyToken,
  async (req, res) => {
    const { id } = req.user;

    // Check if the requester is a SuperAdmin
    const isSuperAdmin = await SuperAdmin.findOne({ _id: id });

    if (!isSuperAdmin) {
      return res.sendStatus(401);
    }

    try {
      const admins = await Admin.find({});
      return res.status(200).json({
        error: false,
        message: "Admins retrieved successfully.",
        admins: admins.map((admin) => ({
          _id: admin._id,
          firstName: admin.firstName,
          middleName: admin.middleName,
          lastName: admin.lastName,
          email: admin.email,
          address: admin.address,
          mobile: admin.mobile,
          active: admin.active,
          createdOn: admin.createdOn,
          addedOn: admin.addedOn,
        })),
      });
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "An error occurred while retrieving admins.",
      });
    }
  },
];

exports.getAdminById = [
  verifyToken,
  async (req, res) => {
    const { id } = req.user;
    const { adminId } = req.params; // Extract admin ID from request parameters

    // Check if the requester is a SuperAdmin
    const isSuperAdmin = await SuperAdmin.findOne({ _id: id });

    if (!isSuperAdmin) {
      return res.sendStatus(401);
    }

    try {
      const admin = await Admin.findById(adminId); // Query the database for the admin with the given ID

      if (!admin) {
        return res.status(404).json({
          error: true,
          message: "Admin not found.",
        });
      }

      return res.status(200).json({
        error: false,
        message: "Admin retrieved successfully.",
        admin: {
          _id: admin._id,
          firstName: admin.firstName,
          middleName: admin.middleName,
          lastName: admin.lastName,
          email: admin.email,
          address: admin.address,
          mobile: admin.mobile,
          active: admin.active,
          createdOn: admin.createdOn,
          addedOn: admin.addedOn,
        },
      });
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "An error occurred while retrieving the admin.",
      });
    }
  },
];

exports.editSuperAdmin = [
  verifyToken,
  async (req, res) => {
    const { firstName, middleName, lastName, address } = req.body;
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

    try {
      // Find the clinician by ID
      const superAdmin = await SuperAdmin.findOne({ _id: id });

      if (!superAdmin) {
        return res
          .status(404)
          .json({ error: true, message: "Super Admin not found." });
      }

      // Update the clinician's information
      superAdmin.firstName = firstName;
      superAdmin.middleName = middleName;
      superAdmin.lastName = lastName;
      superAdmin.address = address;

      // Save the updated clinician information
      await superAdmin.save();

      return res.json({
        error: false,
        superAdmin,
        message: "Super Admin information updated successfully.",
      });
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "An error occurred while updating  Super Admin information.",
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
      const superAdmin = await SuperAdmin.findOne({ _id: id });

      if (!superAdmin) {
        return res
          .status(404)
          .json({ error: true, message: "superAdmin not found." });
      }

      // Verify current password
      const isPasswordValid = await verifyPassword(
        superAdmin.password,
        currentPassword
      );
      if (!isPasswordValid) {
        return res
          .status(400)
          .json({ error: true, message: "Current password is incorrect." });
      }

      // Hash the new password
      const hashedPassword = await hashPassword(newPassword);

      // Update the superAdmin's password
      superAdmin.password = hashedPassword;
      await superAdmin.save();

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
      const superAdmin = await SuperAdmin.findOne({ _id: id });

      if (!superAdmin) {
        return res
          .status(404)
          .json({ error: true, message: "superAdmin not found." });
      }

      // Update the profile picture URL
      superAdmin.profilePicture = `/images/profile_pictures/${req.file.filename}`;
      await superAdmin.save();

      return res.json({
        error: false,
        message: "Profile picture updated successfully.",
        profilePicture: superAdmin.profilePicture,
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

// EDIT ADMIN USER ACCOUNT
exports.editAdmin = [
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