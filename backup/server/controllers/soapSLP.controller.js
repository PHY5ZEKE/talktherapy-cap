const SOAP = require("../models/soapSLP.model");
const Clinician = require("../models/clinicianSLP.model");
const Patient = require("../models/patientSlp.model");
const Admin = require("../models/adminSLP.model");
const { createAuditLog } = require("../middleware/auditLog");

exports.createSOAPDiagnosis = async (req, res) => {
  try {
    const {
      patientId,
      clinicianId,
      date,
      activityPlan,
      sessionType,
      subjective,
      objective,
      assessment,
      recommendation,
    } = req.body;

    // Validate input
    if (
      !patientId ||
      !clinicianId ||
      !date ||
      !activityPlan ||
      !sessionType ||
      !subjective ||
      !objective ||
      !assessment ||
      !recommendation
    ) {
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
      activityPlan,
      sessionType,
      subjective,
      objective,
      assessment,
      recommendation,
    });

    // Save to database
    await newSOAP.save();

    // Retrieve the clinician's and patient's emails
    const clinician = await Clinician.findById(clinicianId);
    const patient = await Patient.findById(patientId);

    if (!clinician || !patient) {
      return res.status(404).json({
        error: true,
        message: "Clinician or Patient not found.",
      });
    }

    const clinicianEmail = clinician.email;
    const patientEmail = patient.email;

    // Create an audit log entry
    await createAuditLog(
      "createSOAPDiagnosis",
      clinicianEmail,
      `Clinician ${clinicianEmail} added a SOAP to patient ${patientEmail}.`
    );

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
          "firstName lastName middleName address email mobile specialization"
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

exports.deleteSOAPDiagnosis = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate input
    if (!id) {
      console.log("SOAP ID is required");
      return res.status(400).json({ message: "SOAP ID is required" });
    }

    // Delete SOAP diagnosis
    const deletedSOAP = await SOAP.findByIdAndDelete(id);

    if (!deletedSOAP) {
      console.log("SOAP diagnosis not found");
      return res.status(404).json({ message: "SOAP diagnosis not found" });
    }

    // Retrieve the clinician's and patient's emails
    const clinician = await Clinician.findById(deletedSOAP.clinicianId);
    const patient = await Patient.findById(deletedSOAP.patientId);

    if (!clinician || !patient) {
      return res.status(404).json({
        error: true,
        message: "Clinician or Patient not found.",
      });
    }

    const clinicianEmail = clinician.email;
    const patientEmail = patient.email;

    // Create an audit log entry
    await createAuditLog(
      "deleteSOAPDiagnosis",
      clinicianEmail,
      `Clinician ${clinicianEmail} deleted a SOAP for patient ${patientEmail}.`
    );

    console.log("SOAP diagnosis deleted successfully");
    res.status(200).json({ message: "SOAP diagnosis deleted successfully" });
  } catch (error) {
    console.error("Error deleting SOAP diagnosis:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateSoap = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      date,
      activityPlan,
      sessionType,
      subjective,
      objective,
      assessment,
      recommendation,
    } = req.body;

    // Validate input
    if (
      !date ||
      !activityPlan ||
      !sessionType ||
      !subjective ||
      !objective ||
      !assessment ||
      !recommendation
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const updatedSoap = await SOAP.findByIdAndUpdate(
      id,
      {
        date,
        activityPlan,
        sessionType,
        subjective,
        objective,
        assessment,
        recommendation,
      },
      { new: true }
    );

    if (!updatedSoap) {
      return res.status(404).json({ message: "SOAP record not found" });
    }

    // Retrieve the clinician's and patient's emails
    const clinician = await Clinician.findById(updatedSoap.clinicianId);
    const patient = await Patient.findById(updatedSoap.patientId);

    if (!clinician || !patient) {
      return res.status(404).json({
        error: true,
        message: "Clinician or Patient not found.",
      });
    }

    const clinicianEmail = clinician.email;
    const patientEmail = patient.email;

    // Create an audit log entry
    await createAuditLog(
      "updateSOAPDiagnosis",
      clinicianEmail,
      `Clinician ${clinicianEmail} updated a SOAP for patient ${patientEmail}.`
    );

    res.status(200).json(updatedSoap);
  } catch (error) {
    console.error("Error updating SOAP record:", error);
    res.status(400).json({ message: error.message });
  }
};

exports.addCommentToSoap = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const adminId = req.user.id; // Extract admin ID from authenticated user

    // Validate input
    if (!comment) {
      return res.status(400).json({ message: "Comment is required" });
    }

    const soap = await SOAP.findById(id);

    if (!soap) {
      return res.status(404).json({ message: "SOAP record not found" });
    }

    // Retrieve the admin's email using the admin ID
    const admin = await Admin.findOne({ _id: adminId });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    const adminEmail = admin.email;

    // Retrieve the clinician's and patient's emails
    const clinician = await Clinician.findById(soap.clinicianId);
    const patient = await Patient.findById(soap.patientId);

    if (!clinician || !patient) {
      return res.status(404).json({
        error: true,
        message: "Clinician or Patient not found.",
      });
    }

    const clinicianEmail = clinician.email;
    const patientEmail = patient.email;

    // Update the comment field of the SOAP record
    soap.comment = comment;

    await soap.save();

    // Create an audit log entry
    await createAuditLog(
      "addCommentToSOAP",
      adminEmail,
      `Admin ${adminEmail} commented on the SOAP of patient ${patientEmail} added by clinician ${clinicianEmail}.`
    );

    res.status(200).json({ message: "Comment added successfully", soap });
  } catch (error) {
    console.error("Error adding comment to SOAP record:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
