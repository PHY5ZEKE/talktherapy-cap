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
router.delete(
  "/delete-soap/:id",
  verifyToken,
  soapSLPController.deleteSOAPDiagnosis
);

router.put("/edit-soap/:id", verifyToken, soapSLPController.updateSoap);

router.post(
  "/comment-soap/:id",
  verifyToken,
  soapSLPController.addCommentToSoap
);

module.exports = router;
