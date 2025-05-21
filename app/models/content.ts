import mongoose, { Schema } from "mongoose";

const contentSchema = new Schema({
  content_name: {
    type: String,
    required: true,
  },
  content_image: {
    type: String,
  },
  content_category: {
    type: String,
    required: true,
  },
  content_description: {
    type: String,
    required: true,
  },
  content_link: {
    type: String,
  },
});
