const mongoose = require("mongoose");
const FaceAssessment = require("../models/patientFace.model.js");


// Save Face Assessment data
const saveFaceAssessment = async (req, res) => {
  try {
    const { topPredictions, recordedData } = req.body; // Extract data from the request body capturedImage,
    const patientId = req.user.id;  // Get patient ID from the authenticated user (e.g., using JWT)

    // Ensure topPredictions is an array with at least 2 predictions
    if (!Array.isArray(topPredictions) || topPredictions.length !== 2) {
      return res.status(400).json({ message: "Top predictions should be an array of 2 items." });
    }

    // Ensure recordedData is an array
    if (!Array.isArray(recordedData)) {
      return res.status(400).json({ message: "Recorded data should be an array." });
    }

    // Update or create the FaceAssessment for the user
    const assessment = await FaceAssessment.findOneAndUpdate(
      { patient: patientId },  // Match by the patient's ID
      { 
        // capturedImage,          // Store the captured image (base64 string)
        topPredictions,         // Store the top 2 predictions
        recordedData,           // Store the recorded probabilities data
        date: Date.now(),       // Store the current date
      },
      { 
        new: true,              // Return the updated document
        upsert: true,           // Create a new document if it doesn't exist
      }
    );

    // Return success message with the saved assessment
    res.status(200).json({ message: 'Face assessment saved successfully', assessment });
  } catch (error) {
    console.error("Error saving face assessment:", error);
    res.status(500).json({ message: 'Error saving face assessment', error });
  }
};

  
  module.exports = { 
    saveFaceAssessment,
  };