const mongoose = require("mongoose");
const PatientProgress = require("../models/patientProgress.model.js");


// Save or update patient progress
saveProgress = async (req, res) => {
  try {
    const { textId, textName, currentPhrase, correctCount, totalPhrases, completed, completedPhrases } = req.body;
    const patientId = req.user.id; 
  
    // Check if progress already exists for the patient and text
    let progress = await PatientProgress.findOne({ patient: patientId, textId });

    if (progress) {
      // Update existing progress
      progress.currentPhrase = currentPhrase;
      progress.correctCount = correctCount;
      progress.totalPhrases = totalPhrases;
      progress.completed = completed;
      progress.textName = textName;
      progress.completedPhrases = completedPhrases;
      await progress.save();
    } else {
      // Create new progress record
      progress = new PatientProgress({
        patient: patientId,
        textId,
        textName,
        currentPhrase,
        correctCount,
        totalPhrases,
        completed,
        completedPhrases,
      });
      await progress.save();
    }

    res.status(200).json({ message: 'Progress saved successfully', progress });
  } catch (error) {
    console.error("Error saving progress:", error);
    res.status(500).json({ message: 'Error saving progress', error });
  }
};

// Load patient progress
loadProgress = async (req, res) => {
  try {
    const patientId = req.user.id; 
    const { textId } = req.query;

    if (!textId) {
      return res.status(400).json({ message: 'Text ID is required' });
    }


    const progress = await PatientProgress.findOne({ patient: patientId, textId });

    if (progress) {
      res.status(200).json(progress);
    } else {
      res.status(404).json({ message: 'Progress not found' });
    }
  } catch (error) {
    console.error("Error loading progress:", error);
    res.status(500).json({ message: 'Error loading progress', error });
  }
};

module.exports = {
  loadProgress,
  saveProgress,
};
