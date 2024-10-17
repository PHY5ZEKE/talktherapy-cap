const SOAP = require("../models/soapSLP.model");
const Clinician = require("../models/clinicianSLP.model");

exports.createSOAPDiagnosis = async (req, res) => {
  try {
    const { patientId, clinicianId, date, diagnosis } = req.body;

    // Validate input
    if (!patientId || !clinicianId || !date || !diagnosis) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check for existing SOAP diagnosis for the same date
    const existingSOAP = await SOAP.findOne({ patientId, clinicianId, date });
    if (existingSOAP) {
      return res
        .status(400)
        .json({ message: "SOAP diagnosis for this date already exists" });
    }

    // Create new SOAP diagnosis
    const newSOAP = new SOAP({
      patientId,
      clinicianId,
      date,
      diagnosis,
    });

    // Save to database
    await newSOAP.save();

    res
      .status(201)
      .json({ message: "SOAP diagnosis created successfully", soap: newSOAP });
  } catch (error) {
    console.error("Error creating SOAP diagnosis:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getSOAPDiagnosesByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Validate input
    if (!patientId) {
      return res.status(400).json({ message: "Patient ID is required" });
    }

    // Fetch SOAP diagnoses for the patient
    const diagnoses = await SOAP.find({ patientId });

    // Fetch clinician details for each diagnosis
    const diagnosesWithClinicianDetails = await Promise.all(
      diagnoses.map(async (diagnosis) => {
        const clinician = await Clinician.findById(
          diagnosis.clinicianId,
          "firstName lastName middleName"
        );
        return {
          ...diagnosis.toObject(),
          clinician,
        };
      })
    );

    res.status(200).json(diagnosesWithClinicianDetails);
  } catch (error) {
    console.error("Error fetching SOAP diagnoses:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
