const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true],
    },
    description: {
      type: String,
      required: [true],
    },

    image: {
      type: String,
      required: [false],
    },

    category: { 
      type: String,
      required: [true],
    },
    
  },
  {
    timestamps: true,
  }
);

const Content = mongoose.model("Content", contentSchema);

module.exports = Content;