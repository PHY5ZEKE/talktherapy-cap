const Content = require("../models/content.model");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const upload = require("../middleware/uploadProfilePicture");
const s3 = require("../config/aws");
const { createAuditLog } = require("../middleware/auditLog");
const Admin = require("../models/adminSLP.model");

const getContents = async (req, res) => {
  try {
    const contents = await Content.find();
    res.status(200).send(contents);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const getContentById = async (req, res) => {
  try {
    const { id } = req.params;
    const content = await Content.findById(id);
    res.status(200).send(content);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const createContent = [
  upload.single("image"),
  async (req, res) => {
    try {
      const adminId = req.user.id; // Extract admin ID from authenticated user

      // Find the admin's email using the admin ID
      const admin = await Admin.findOne({ _id: adminId });
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }
      const adminEmail = admin.email;

      let imageUrl = null;

      if (req.file) {
        const validImageTypes = ["image/jpeg", "image/jpg", "image/png"];
        if (!validImageTypes.includes(req.file.mimetype)) {
          return res
            .status(400)
            .json({
              message:
                "Invalid image format. Only JPG, JPEG, and PNG are allowed.",
            });
        }
        if (req.file.size > 5 * 1024 * 1024) {
          return res
            .status(400)
            .json({ message: "Image size should not exceed 5MB" });
        }
        const fileName = `${Date.now()}_${req.file.originalname}`;
        const uploadParams = {
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: `content-images/${fileName}`,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        };

        await s3.send(new PutObjectCommand(uploadParams));
        imageUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/content-images/${fileName}`;
      }

      const { name, description, category } = req.body;

      if (!name) {
        return res.status(400).json({ message: "Name is required" });
      }
      if (!description) {
        return res.status(400).json({ message: "Description is required" });
      }
      if (!category) {
        return res.status(400).json({ message: "Category is required" });
      }
      if (!imageUrl) {
        return res.status(400).json({ message: "Image is required" });
      }

      const content = await Content.create({
        ...req.body,
        image: imageUrl,
      });

      // Create an audit log entry
      await createAuditLog(
        "createContent",
        adminEmail,
        `Admin ${adminEmail} created new content "${content.name}" with ID ${content._id}.`
      );

      res.status(201).send(content);
    } catch (error) {
      console.error("Error in createContent:", error);
      res.status(500).send({ message: error.message });
    }
  },
];

const updateContent = async (req, res) => {
  upload.single("image")(req, res, async (err) => {
    if (err) {
      console.error("Error during file upload:", err);
      return res.status(500).json({ message: "Error during file upload" });
    }

    try {
      const adminId = req.user.id; // Extract admin ID from authenticated user

      // Find the admin's email using the admin ID
      const admin = await Admin.findOne({ _id: adminId });
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }
      const adminEmail = admin.email;

      const contentId = req.params.id;
      const { name, description, category, image, videoUrl } = req.body;
      let imageUrl = image || "";

      if (req.file) {
        const fileName = `${Date.now()}_${req.file.originalname}`;
        const uploadParams = {
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: `content-images/${fileName}`,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        };

        // Upload to S3 and generate the URL
        await s3.send(new PutObjectCommand(uploadParams));
        imageUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/content-images/${fileName}`;
      } else if (!imageUrl) {
        const content = await Content.findById(contentId);
        imageUrl = content?.image || "";
      }

      const updates = {
        name,
        description,
        category,
        videoUrl,
        image: imageUrl,
      };

      const updatedContent = await Content.findByIdAndUpdate(
        contentId,
        updates,
        { new: true }
      );

      if (!updatedContent) {
        return res.status(404).json({ message: "Content not found" });
      }

      // Create an audit log entry
      await createAuditLog(
        "updateContent",
        adminEmail,
        `Admin ${adminEmail} updated content "${updatedContent.name}" with ID ${updatedContent._id}.`
      );

      res.status(200).json(updatedContent);
    } catch (error) {
      console.error("Error updating content:", error);
      res.status(500).json({ message: "Failed to update content" });
    }
  });
};

const deleteContent = async (req, res) => {
  try {
    const adminId = req.user.id; // Extract admin ID from authenticated user

    // Find the admin's email using the admin ID
    const admin = await Admin.findOne({ _id: adminId });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    const adminEmail = admin.email;

    const { id } = req.params;
    const content = await Content.findByIdAndDelete(id);
    if (!content) {
      return res.status(404).send({ message: "Content not found" });
    }

    // Create an audit log entry
    await createAuditLog(
      "deleteContent",
      adminEmail,
      `Admin ${adminEmail} deleted content "${content.name}" with ID ${id}.`
    );

    res.status(200).send({ message: "Content deleted successfully" });
  } catch (error) {
    console.error("Error deleting content:", error);
    res.status(500).send({ message: error.message });
  }
};

module.exports = {
  getContents,
  getContentById,
  createContent,
  updateContent,
  deleteContent,
};
