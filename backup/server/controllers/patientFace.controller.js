const mongoose = require("mongoose");
const FaceAssessment = require("../models/patientFace.model.js");


// Save Face Assessment data
const saveFaceAssessment = async (req, res) => {
  try {
    const { topPredictions, recordedData } = req.body; 
    const patientId = req.user.id;  

    if (!Array.isArray(topPredictions) || topPredictions.length !== 2) {
      return res.status(400).json({ message: "Top predictions should be an array of 2 items." });
    }

    if (
      !Array.isArray(recordedData) || recordedData.some((timeStep) => !Array.isArray(timeStep) || timeStep.some((entry) => !entry.label || typeof entry.probability !== "number"))
    ) {
      return res.status(400).json({ message: "Recorded data should be an array of arrays containing label and probability objects." });
    }

    const assessment = await FaceAssessment.findOneAndUpdate(
      { patient: patientId },  
      { 
        topPredictions,         
        recordedData,           
        date: Date.now(),       
      },
      { 
        new: true,              
        upsert: true,           
      }
    );

    res.status(200).json({ message: 'Face assessment saved successfully', assessment });
  } catch (error) {
    console.error("Error saving face assessment:", error);
    res.status(500).json({ message: 'Error saving face assessment', error });
  }
};

// Load patient speech assessment
getFaceAssessment = async (req, res) => {
  try {
    const patientId = req.params.patientId; 
    const assessment = await FaceAssessment.findOne({ patient: patientId });

    if (assessment) {
      res.status(200).json(assessment); 
    } else {
      res.status(404).json({ message: 'No speech assessment found for this patient' });
    }
  } catch (error) {
    console.error("Error loading speech assessment:", error);
    res.status(500).json({ message: 'Error loading speech assessment', error });
  }
};

  
  module.exports = { 
    saveFaceAssessment,
    getFaceAssessment,
  };