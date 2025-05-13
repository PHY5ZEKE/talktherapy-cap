import { Router } from "express";
import type { Request, Response } from "express";

import Clinician from "models/clinician";
import bcrypt from "bcryptjs";

export const registerClinician = async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      email,
      password,
      mobile,
      specialization,
    } = req.body;

    // check user exists
    const user = await Clinician.findOne({ email });
    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }

    // salt and hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create user
    const clinician = new Clinician({
      firstName,
      middleName,
      lastName,
      email,
      password: hashedPassword,
      mobile,
      specialization,
    });

    // uncomment to save to db
    await clinician.save();

    // return response
    res.status(201).json({ message: "Clinician registered successfully" });

    // TODO: Send welcome email
  } catch (error) {
    console.error("Error registering clinician:", error);
    res.status(500).json({ error: "Failed to register clinician" });
  }
};
