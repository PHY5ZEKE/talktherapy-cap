const Content = require("../models/content.model");

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

const createContent = async (req, res) => {
  try {
    const content = await Content.create(req.body);
    res.status(200).send(content);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const updateContent = async (req, res) => {
  try {
    const { id } = req.params;
    const content = await Content.findByIdAndUpdate(id, req.body);
    if (!content) {
      res.status(404).send({ message: "Content not found" });
    }
    const updatedProduct = await Content.findById(id);
    res.status(200).send(updatedProduct);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
const deleteContent = async (req, res) => {
  try {
    const { id } = req.params;
    const content = await Content.findByIdAndDelete(id);
    if (!content) {
      res.status(404).send({ message: "Content not found" });
    }
    res.status(200).send({ message: "Content deleted successfully" });
  } catch (error) {
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