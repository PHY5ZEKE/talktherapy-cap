const express = require("express");
const router = express.Router();
const soapSLPController = require("../controllers/soapSLP.controller");
const verifyToken = require("../middleware/verifyToken");

// Add route for creating SOAP diagnosis
router.post("/add-soap", verifyToken, soapSLPController.createSOAPDiagnosis);
router.get(
  "/get-soap/:patientId",
  verifyToken,
  soapSLPController.getSOAPDiagnosesByPatient
);
module.exports = router;
