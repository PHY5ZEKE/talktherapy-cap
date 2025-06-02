import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { upload, getFileUrl, handleUploadError } from "./uploader";

const uploadRouter = Router();

uploadRouter.post(
  "/referral",
  (req: Request, res: Response, next: NextFunction) => {
    upload(req, res, (err) => {
      if (err) {
        return handleUploadError(err, req, res, next);
      }
      if (!req.file) {
        return res.status(400).json({
          error: "No file uploaded",
          message: "Please select a file to upload",
        });
      }
      const fileUrl = getFileUrl(req.file.filename);
      res.status(200).json({
        message: "File uploaded successfully",
        fileUrl,
      });
    });
  }
);

export default uploadRouter;
