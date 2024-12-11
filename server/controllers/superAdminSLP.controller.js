const fs = require("fs");

const SuperAdmin = require("../models/superAdminSLP.model");
const Admin = require("../models/adminSLP.model");
const Clinician = require("../models/clinicianSLP.model");
const Patient = require("../models/patientSlp.model");
const AuditLog = require("../models/auditLogSLP.model");
const Appointment = require("../models/appointment.model.js");
const Assignment = require("../models/assignmentSLP.model.js");
const Schedule = require("../models/schedule.model.js");

const { createAuditLog } = require("../middleware/auditLog.js");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const {
  validatePassword,
  hashPassword,
  verifyPassword,
} = require("../utilities/password");

const verifyToken = require("../middleware/verifyToken");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../config/aws");
const path = require("path");

const multer = require("multer");
const upload = require("../middleware/uploadProfilePicture");
const { encrypt, decrypt } = require("../middleware/aesUtilities.js");

// Helper Function
const findUserById = async (id) => {
  let userInfo = await SuperAdmin.findOne({ _id: id });
  if (userInfo) return { userInfo, userRole: "superAdmin" };

  userInfo = await Admin.findOne({ _id: id });
  if (userInfo) return { userInfo, userRole: "admin" };

  userInfo = await Clinician.findOne({ _id: id });
  if (userInfo) return { userInfo, userRole: "clinician" };

  userInfo = await Patient.findOne({ _id: id });
  if (userInfo) return { userInfo, userRole: "patientslp" };

  return { userInfo: null, userRole: null };
};

const safeDecrypt = (text) => {
  try {
    return text && text.includes(":") ? decrypt(text) : text;
  } catch (error) {
    console.error("Error decrypting text:", error);
    return text;
  }
};

exports.signup = async (req, res) => {
  const { email, password, firstName, middleName, lastName, address, mobile } =
    req.body;

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

  if (!email || !password) {
    return res
      .status(401)
      .json({ message: "Cannot login invalid credentials." });
  }

  const roles = [
    { model: SuperAdmin, role: "superAdmin" },
    { model: Admin, role: "admin" },
    { model: Clinician, role: "clinician" },
    { model: Patient, role: "patientslp" },
  ];

  let userInfo = null;
  let userRole = null;

  // Traverse through each collection to find the user
  for (const { model, role } of roles) {
    userInfo = await model.findOne({ email: email });
    if (userInfo) {
      userRole = role;
      break;
    }
  }

  if (!userInfo) {
    return res
      .status(404)
      .json({ message: "Authentication failed. Enter valid credentials." });
  }

  // Check if the user is active
  if (userInfo.active === false) {
    return res.status(401).json({ message: "User account is inactive" });
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

    // Add last activity date
    userInfo.lastActivity = new Date();

    await createAuditLog("login", email, `${email} has logged in`);
    await userInfo.save();

    return res.json({
      error: false,
      message: "Login Successful",
      email,
      accessToken,
      userRole,
    });
  } else {
    return res.status(401).json({
      error: true,
      message: "Authentication failed. Invalid credentials.",
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

// Email Notification
exports.sendNotification = async (req, res) => {
  const { email, header, type, whoEdited, details } = req.body;

  // Send to email and body WOW!
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "talktherapycapstone@gmail.com",
      pass: "bvxj gwqk oirf lcgy",
    },
  });

  let htmlContent = "";

  let statusEmail = [];

  // Process Email Type
  if (type === "account-archive") {
    const htmlTemplate = fs.readFileSync(
      path.join(__dirname, "../email-template/account-archive.html"),
      "utf8"
    );
    htmlContent = htmlTemplate.replace("${email}", email);
  } else if (type === "account-restore") {
    const htmlTemplate = fs.readFileSync(
      path.join(__dirname, "../email-template/account-restore.html"),
      "utf8"
    );
    htmlContent = htmlTemplate.replace("${email}", email);
  } else if (type === "account-edit") {
    const htmlTemplate = fs.readFileSync(
      path.join(__dirname, "../email-template/account-edit.html"),
      "utf8"
    );
    htmlContent = htmlTemplate.replace("${adminName}", whoEdited);
  } else if (type === "account-register") {
    const htmlTemplate = fs.readFileSync(
      path.join(__dirname, "../email-template/account-register.html"),
      "utf8"
    );
    htmlContent = htmlTemplate.replace("${email}", email);
  } else if (type === "account-success") {
    const htmlTemplate = fs.readFileSync(
      path.join(__dirname, "../email-template/account-success.html"),
      "utf8"
    );
    htmlContent = htmlTemplate.replace("${email}", email);
  } else if (type === "request-records-access") {
    const [
      clinicianFirstName,
      clinicianLastName,
      patientFirstName,
      patientLastName,
      reason,
    ] = details;
    const htmlTemplate = fs.readFileSync(
      path.join(__dirname, "../email-template/request-access.html"),
      "utf8"
    );
    htmlContent = htmlTemplate
      .replace("${clinicianName}", `${clinicianFirstName} ${clinicianLastName}`)
      .replace("${patientName}", `${patientFirstName} ${patientLastName}`)
      .replace("${reason}", reason);
  } else if (type === "request-content") {
    const [clinicianFirstName, clinicianLastName, request] = details;
    const htmlTemplate = fs.readFileSync(
      path.join(__dirname, "../email-template/request-content.html"),
      "utf8"
    );
    htmlContent = htmlTemplate
      .replace("${clinicianName}", `${clinicianFirstName} ${clinicianLastName}`)
      .replace("${reason}", request);
  } else if (type === "soap") {
    const [clinicianFirstName, clinicianLastName, soapData] = details;
    const htmlTemplate = fs.readFileSync(
      path.join(__dirname, "../email-template/account-soap.html"),
      "utf8"
    );
    htmlContent = htmlTemplate
      .replace("${clinicianName}", `${clinicianFirstName} ${clinicianLastName}`)
      .replace("${soap}", soapData);
  } else if (type === "appointment-delete") {
    const [clinicianFirstName, clinicianMiddleName, clinicianLastName] =
      details;
    const htmlTemplate = fs.readFileSync(
      path.join(__dirname, "../email-template/appointment-affected.html"),
      "utf8"
    );
    htmlContent = htmlTemplate.replace(
      "${clinicianName}",
      `${clinicianFirstName} ${clinicianMiddleName} ${clinicianLastName}`
    );
  } else if (type === "appointment-status") {
    const [
      patientFirstName,
      patientLastName,
      clinicianName,
      day,
      startTime,
      endTime,
      content,
    ] = details;
    const htmlTemplate = fs.readFileSync(
      path.join(__dirname, "../email-template/appointment-status.html"),
      "utf8"
    );
    htmlContent = htmlTemplate
      .replace("${patientName}", `${patientFirstName} ${patientLastName}`)
      .replace("${clinicianName}", clinicianName)
      .replace("${date}", `${day} ${startTime} - ${endTime}`)
      .replace("${status}", content);

    // Get Email Address of Clinician using ID
    const clinician = await Clinician.findById(email[0]);
    const patient = await Patient.findById(email[1]);

    if (clinician && patient) {
      statusEmail = [clinician.email, patient.email];
    }
  } else if (type === "appointment-book") {
    const [clinicianName, day, startTime, endTime, content] = details;

    // Get Patient First and Last Name by Id
    const patientName = await Patient.findById(email[1]).select(
      "firstName lastName"
    );

    const decryptedFirstName = safeDecrypt(patientName.firstName);
    const decryptedLastName = safeDecrypt(patientName.lastName);

    const htmlTemplate = fs.readFileSync(
      path.join(__dirname, "../email-template/appointment-book.html"),
      "utf8"
    );
    htmlContent = htmlTemplate
      .replace("${patientName}", `${decryptedFirstName} ${decryptedLastName}`)
      .replace("${clinicianName}", clinicianName)
      .replace("${date}", `${day} ${startTime} - ${endTime}`)
      .replace("${status}", content);

    // Get Email Address of Clinician using ID
    const clinician = await Clinician.findById(email[0]);
    const patient = await Patient.findById(email[1]);

    if (clinician && patient) {
      statusEmail = [clinician.email, patient.email];
    }
  }

  const mailOptions = {
    to: statusEmail.length > 0 ? statusEmail : email,
    from: process.env.EMAIL,
    subject: header,
    html: htmlContent,
  };

  transporter.sendMail(mailOptions, async (err) => {
    if (err) {
      return res.status(500).json({
        error: true,
        message: err,
      });
    }
    res.status(200).json({ error: false, message: "Email notification sent." });
  });
};

// Forgot Password Function
exports.forgotPassword = async (req, res) => {
  const { email, header } = req.body;

  if (!email) {
    return res.status(400).json({ error: true, message: "Email is required." });
  }

  let user = await SuperAdmin.findOne({ email });
  if (!user) {
    user = await Admin.findOne({ email });
  }
  if (!user) {
    user = await Clinician.findOne({ email });
  }
  if (!user) {
    user = await Patient.findOne({ email });
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

  const htmlTemplate = fs.readFileSync(
    path.join(__dirname, "../email-template/otp.html"),
    "utf8"
  );
  const htmlContent = htmlTemplate.replace("${otp}", otp);

  const mailOptions = {
    to: user.email,
    from: process.env.EMAIL,
    subject: "OTP Forgot Password | TalkTherapy",
    html: htmlContent,
  };

  transporter.sendMail(mailOptions, async (err) => {
    if (err) {
      return res
        .status(500)
        .json({ error: true, message: "Email could not be sent." });
    }
    await createAuditLog(
      "forgotPassword",
      email,
      `${email} requested a password reset`
    );
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

  await createAuditLog("verifyOtp", email, `${email} verified OTP`);

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
    user = await Clinician.findOne({ email });
  }
  if (!user) {
    user = await Patient.findOne({ email });
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

  await createAuditLog(
    "resetPassword",
    email,
    `${email} has reset their password`
  );

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
          status: admin.status,
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
          profilePicture: admin.profilePicture,
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
    const { firstName, middleName, lastName, address, mobile } = req.body;
    const { id } = req.user;

    // Validate input
    if (!firstName) {
      return res
        .status(400)
        .json({ error: true, message: "First name is required." });
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
        .json({ error: true, message: "Mobile is required." });
    }

    try {
      // Find the superAdmin by ID
      const superAdmin = await SuperAdmin.findOne({ _id: id });

      if (!superAdmin) {
        return res
          .status(404)
          .json({ error: true, message: "Super Admin not found." });
      }

      // Update the superAdmin's information
      superAdmin.firstName = firstName;
      superAdmin.middleName = middleName;
      superAdmin.lastName = lastName;
      superAdmin.address = address;
      superAdmin.mobile = mobile;

      // Save the updated superAdmin information
      await superAdmin.save();

      await createAuditLog(
        "editSuperAdmin",
        superAdmin.email,
        `${superAdmin.email} has updated their profile`
      );

      return res.json({
        error: false,
        superAdmin,
        message: "Super Admin information updated successfully.",
      });
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "An error occurred while updating Super Admin information.",
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
      await createAuditLog(
        "changePassword",
        superAdmin.email,
        `${superAdmin.email} has changed their password`
      );

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

      // Upload the file to S3
      const fileName = `${req.user.id}_${Date.now()}${path.extname(
        req.file.originalname
      )}`;
      const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `profile-pictures/${fileName}`,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      };

      await s3.send(new PutObjectCommand(uploadParams));

      // Update the profile picture URL
      const profilePictureUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/profile-pictures/${fileName}`;
      superAdmin.profilePicture = profilePictureUrl;
      await superAdmin.save();
      await createAuditLog(
        "updateProfilePicture",
        superAdmin.email,
        `${superAdmin.email} has updated their profile picture`
      );

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
          .json({ error: true, message: "Admin not found." });
      }

      // Update the admin's information
      admin.firstName = firstName;
      admin.middleName = middleName;
      admin.lastName = lastName;
      admin.address = address;

      // Save the updated admin information
      await admin.save();
      await createAuditLog(
        "editAdmin",
        admin.email,
        `User ${admin.email} profile was updated by Super Admin`
      );

      return res.json({
        error: false,
        admin,
        message: "Admin information updated successfully.",
      });
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "An error occurred while updating Admin information.",
      });
    }
  },
];

exports.getAuditLogs = async (req, res) => {
  try {
    const auditLogs = await AuditLog.find().sort({ timestamp: -1 }); // Fetch logs and sort by timestamp
    res.json({ auditLogs });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({ error: "Error fetching audit logs" });
  }
};

exports.getAllAdminsEmail = [
  verifyToken,
  async (req, res) => {
    try {
      const admins = await Admin.find({});
      return res.status(200).json({
        error: false,
        message: "Admins retrieved successfully.",
        admins: admins.map((admin) => ({
          _id: admin._id,
          email: admin.email,
          active: admin.active,
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

// For Account Archival/Soft Deletion
exports.archiveUser = [
  verifyToken,
  async (req, res) => {
    const { id } = req.body;

    try {
      const { userInfo, userRole } = await findUserById(id);

      if (!userInfo) {
        return res
          .status(404)
          .json({ error: true, message: "User not found." });
      }

      if (userRole === "clinician") {
        // If clinician, delete all schedule, appointments, and assignments
        await Schedule.deleteMany({ clinicianId: id });
        await Appointment.deleteMany({ selectedClinician: id });
        await Assignment.deleteMany({ clinicianId: id });
      }

      userInfo.active = false;
      userInfo.status = "archival";

      await userInfo.save();
      await createAuditLog(
        "editAdmin",
        userInfo.email,
        `User ${userInfo.email} account is tagged as archived and disabled.`
      );

      return res.json({
        error: false,
        userInfo,
        message: "Account status and activity updated successfully.",
      });
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: `${error}`,
      });
    }
  },
];

exports.unarchiveUser = [
  verifyToken,
  async (req, res) => {
    const { id } = req.body;

    try {
      const { userInfo } = await findUserById(id);

      if (!userInfo) {
        return res
          .status(404)
          .json({ error: true, message: "User not found." });
      }

      userInfo.active = true;
      userInfo.status = "";

      await userInfo.save();
      await createAuditLog(
        "editAdmin",
        userInfo.email,
        `User ${userInfo.email} account is unarchived and enabled.`
      );

      return res.json({
        error: false,
        userInfo,
        message: "Account status and activity updated successfully.",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        error: true,
        message:
          "An error occurred while changing account status and activity.",
      });
    }
  },
];

exports.getAllArchivedUsers = [
  verifyToken,
  async (req, res) => {
    try {
      const admins = await Admin.find({ status: "archival", active: false });
      const clinicians = await Clinician.find({
        status: "archival",
        active: false,
      });
      const patients = await Patient.find({
        status: "archival",
        active: false,
      });

      const archivedUsers = [
        ...admins.map((admin) => ({
          _id: admin._id,
          firstName: admin.firstName,
          lastName: admin.lastName,
          email: admin.email,
          active: admin.active,
          status: admin.status,
          lastActivity: admin.lastActivity,
          userRole: admin.userRole,
        })),
        ...clinicians.map((clinician) => ({
          _id: clinician._id,
          firstName: safeDecrypt(clinician.firstName),
          lastName: safeDecrypt(clinician.lastName),
          email: clinician.email,
          active: clinician.active,
          status: clinician.status,
          lastActivity: clinician.lastActivity,
          userRole: clinician.userRole,
        })),
        ...patients.map((patient) => ({
          _id: patient._id,
          firstName: safeDecrypt(patient.firstName),
          lastName: safeDecrypt(patient.lastName),
          email: patient.email,
          active: patient.active,
          status: patient.status,
          lastActivity: patient.lastActivity,
          userRole: patient.userRole,
        })),
      ];

      return res.status(200).json({
        error: false,
        message: "Archived users retrieved successfully.",
        users: archivedUsers,
      });
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "An error occurred while retrieving admins.",
      });
    }
  },
];

const archiveInactiveUsers = async () => {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  try {
    // Archive SuperAdmins
    const superAdmins = await SuperAdmin.find({
      lastActivity: { $lt: threeMonthsAgo },
      active: true,
    });
    for (const superAdmin of superAdmins) {
      superAdmin.status = "archival";
      superAdmin.active = false;
      await superAdmin.save();
      await createAuditLog(
        "archiveUser",
        superAdmin.email,
        `${superAdmin.email} has been archived due to inactivity`
      );
    }

    // Archive Admins
    const admins = await Admin.find({
      lastActivity: { $lt: threeMonthsAgo },
      active: true,
    });
    for (const admin of admins) {
      admin.status = "archival";
      admin.active = false;
      await admin.save();
      await createAuditLog(
        "archiveUser",
        admin.email,
        `${admin.email} has been archived due to inactivity`
      );
    }

    // Archive Clinicians
    const clinicians = await Clinician.find({
      lastActivity: { $lt: threeMonthsAgo },
      active: true,
    });
    for (const clinician of clinicians) {
      clinician.status = "archival";
      clinician.active = false;
      await clinician.save();
      await createAuditLog(
        "archiveUser",
        clinician.email,
        `${clinician.email} has been archived due to inactivity`
      );
    }

    // Archive Patients
    const patients = await Patient.find({
      lastActivity: { $lt: threeMonthsAgo },
      active: true,
    });
    for (const patient of patients) {
      patient.status = "archival";
      patient.active = false;
      await patient.save();
      await createAuditLog(
        "archiveUser",
        patient.email,
        `${patient.email} has been archived due to inactivity`
      );
    }

    console.log("Inactive users archived successfully.");
  } catch (error) {
    console.error("Error archiving inactive users:", error);
  }
};

exports.archiveInactiveUsers = archiveInactiveUsers;
