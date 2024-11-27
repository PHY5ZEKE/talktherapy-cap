const mongoose = require("mongoose");
const SpeechAssessment = require("../models/patientAssessment.model.js");


const saveAssessment = async (req, res) => {
  try {
    const { top3Results, score } = req.body;
    const patientId = req.user.id;  

    if (!Array.isArray(top3Results) || top3Results.length !== 3) {
      return res.status(400).json({ message: "Top 3 results should be an array of 3 items." });
    }

      const assessment = await SpeechAssessment.findOneAndUpdate(
        { patient: patientId },  
        { 
          top3Results,  
          score,        
          date: Date.now() 
        },
        {
          new: true,     
          upsert: true,  
        }
      );
  
      res.status(200).json({ message: 'Speech assessment saved successfully', assessment });
    } catch (error) {
      console.error("Error saving speech assessment:", error);
      res.status(500).json({ message: 'Error saving speech assessment', error });
    }
  };


// Load patient speech assessment
getAssessment = async (req, res) => {
  try {
    const patientId = req.params.patientId; 
    const assessment = await SpeechAssessment.findOne({ patient: patientId });

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
    saveAssessment,
    getAssessment,
  };