import type { Request, Response } from "express";

import Clinician from "models/clinician";
import Admin from "models/admin";
import SuperAdmin from "models/super-admin";
import Patient from "models/patient";

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const [clinician, admin, superAdmin, patient] = await Promise.all([
      Clinician.findOne({ email }),
      Admin.findOne({ email }),
      SuperAdmin.findOne({ email }),
      Patient.findOne({ email }),
    ]);

    const user = clinician || admin || superAdmin || patient;

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // check password
    const isCorrect = await bcrypt.compare(password, user.password);
    if (!isCorrect) {
      return res.status(400).json({ error: "Invalid password" });
    }

    // generate jwt token
    const token = jwt.sign(
      { id: user._id,
        name: user.firstName + " " + user.lastName,
        role: user.role,
       },
      process.env.VITE_JWT_SECRET as string,
      {
        expiresIn: "3h",
      }
    );

    // set token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 3 * 60 * 60 * 1000, // 3h
    });

    // TODO: add login activity to audit log
    // return user
    return res.status(200).json({
      message: "Login successful!",
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
