import type { Request, Response } from "express";

import Admin from "models/admin";
import bcrypt from "bcryptjs";

export const addAdmin = async (req: Request, res: Response) => {
  try {
    const { firstName, middleName, lastName, email, password, mobile } =
      req.body;

    // check user exists
    const user = await Admin.findOne({ email });

    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }

    // salt and hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create user
    const admin = new Admin({
      firstName,
      middleName,
      lastName,
      email,
      password: hashedPassword,
      mobile,
    });

    await admin.save();

    // return response
    res.status(201).json({ message: "Admin registered successfully" });

    // TODO: Send welcome email
  } catch (error) {
    console.error("Error registering admin:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
