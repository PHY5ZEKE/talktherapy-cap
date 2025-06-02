import type { Request, Response, NextFunction } from "express";

import multer from "multer";
import multerS3 from "multer-s3";

import { S3Client } from "@aws-sdk/client-s3";

// S3 Client
const client = new S3Client({
  region: process.env.VITE_AWS_REGION,
  credentials: {
    accessKeyId: process.env.VITE_AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.VITE_AWS_SECRET_ACCESS_KEY || "",
  },
});

// Multer configuration for file uploads
const multerConfig = multer({
  storage: multerS3({
    s3: client,
    bucket: process.env.VITE_AWS_S3_BUCKET || "",
    key: (req: Request, file: Express.Multer.File, cb) => {
      const folderName = process.env.VITE_AWS_S3_FOLDER || "referrals";
      const fileName = `${Date.now().toString()}-${file.originalname}`;
      const filePath = `${folderName}/${fileName}`;
      cb(null, filePath);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) => {
    const allowedFileTypes = ["image/jpeg", "image/png", "application/pdf"];

    if (allowedFileTypes.includes(file.mimetype)) {
      return cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only JPEG, PNG, and PDF files are allowed."
        )
      );
    }
  },
}).single("file");

// Handle file uploads
export const upload = multerConfig;

// File URL
export const getFileUrl = (filename: string): string => {
  const bucketName = process.env.VITE_AWS_S3_BUCKET || "";
  const folderName = process.env.VITE_AWS_S3_FOLDER || "referrals";
  return `https://${bucketName}.s3.${process.env.VITE_AWS_REGION}.amazonaws.com/${folderName}/${filename}`;
};

// Handle file upload errors
export const handleUploadError = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "File too large",
        message: "The uploaded file exceeds the 5MB size limit.",
      });
    }
    return res.status(400).json({
      error: "Upload error",
      message: err.message,
    });
  } else if (err) {
    // Generic error
    return res.status(400).json({
      error: "Upload failed",
      message: err.message,
    });
  }
  next();
};
