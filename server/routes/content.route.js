const express = require("express");
const Content = require("../models/content.model.js");
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
router.post("/", createContent);
router.put("/:id", updateContent);
router.delete("/:id", deleteContent);

module.exports = router;