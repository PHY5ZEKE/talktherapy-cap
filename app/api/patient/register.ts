import { Router } from "express";
import type { Request, Response } from "express";

import Patient from "models/patient";
import bcrypt from "bcryptjs";

export const registerPatient = async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      email,
      password,
      mobile,
      birthday,
      diagnosis,
      consent,
    } = req.body;

    // check user exists
    const user = await Patient.findOne({ email });
    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }

    // salt and hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create user
    const patient = new Patient({
      firstName,
      middleName,
      lastName,
      email,
      password: hashedPassword,
      mobile,
      birthday,
      diagnosis,
      consent,
    });

    // uncomment to save to db
    await patient.save();

    // return response
    res.status(201).json({ message: "Patient registered successfully" });

    // TODO: Send welcome email
  } catch (error) {
    console.error("Error registering patient:", error);
    res.status(500).json({ error: "Failed to register patient" });
  }
};
