const express = require("express");
const Content = require("../models/content.model.js");
const verifyToken = require("../middleware/verifyToken");
const router = express.Router();
const {
  getContents,
  getContentById,
  createContent,
  updateContent,
  deleteContent,
} = require("../controllers/content.controller.js");
const { get } = require("mongoose");

router.get("/", getContents);
router.get("/:id", getContentById);
router.post("/", verifyToken, createContent);
router.put("/:id", verifyToken, updateContent);
router.delete("/:id", verifyToken, deleteContent);

module.exports = router;
