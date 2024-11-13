import { saveAs } from "file-saver";

export default function exportPatientData(patientData, soapRecords) {
  // format html tags
  const convertHtmlToText = (html) => {
    return html
      .replace(/<\/p>|<\/ul>/g, "\n")
      .replace(/<p>/g, "")
      .replace(/<ul>/g, "")
      .replace(/<li>/g, "- ")
      .replace(/<\/li>/g, "")
      .replace(/<br\s*\/?>/gi, "")
      .replace(/<\/?[^>]+(>|$)/g, "");
  };

  let userData = `
========================
PATIENT INFORMATION
========================
Name:     ${patientData.firstName} ${patientData.middleName} ${patientData.lastName}
Mobile:   ${patientData.mobile}
Email:    ${patientData.email}
  `;

  if (soapRecords.length === 0) {
    userData += `
==============================
NO FOUND/EXISTING SOAP RECORDS
==============================`;
  } else {
    soapRecords.forEach((record, index) => {
      const clinician = record.clinician;

      userData += `
    ========================    
    SOAP Record ${index + 1} (Date: ${new Date(
        record.date
      ).toLocaleDateString()})
    ========================
    - Activity Plan    : ${record.activityPlan}
    - Session Type     : ${record.sessionType}
    - Session Recording: ${record.sessionRecording}
    
    Subjective Notes:
    -----------------
    ${convertHtmlToText(record.subjective)}
    Objective Notes:
    ----------------
    ${convertHtmlToText(record.objective)}
    Assessment Notes:
    -----------------
    ${convertHtmlToText(record.assessment)}
    Recommendations:
    ----------------
    ${convertHtmlToText(record.recommendation)}
    ========================
    Clinician Information
    ========================
    Clinician ID   : ${clinician._id}
    Name           : ${clinician.firstName} ${clinician.middleName} ${
        clinician.lastName
      }
    Email          : ${clinician.email}
    Address        : ${clinician.address}
    Mobile         : ${clinician.mobile}
    Specialization : ${clinician.specialization}
    `;
    });
  }

  const blob = new Blob([userData], { type: "text/plain;charset=utf-8" });
  saveAs(blob, `${patientData.firstName}_${patientData.lastName}_data.txt`);
}

export function exportArchivedUsers(users) {
  let userData = users
    .map((user) => {
      return `
First Name     : ${user.firstName || "N/A"}
Last Name      : ${user.lastName || "N/A"}
Email          : ${user.email}
Active         : ${user.active}
Status         : ${user.status}
User Role      : ${user.userRole || "N/A"}
========================
    `;
    })
    .join("\n");

  const blob = new Blob([userData], { type: "text/plain;charset=utf-8" });
  saveAs(blob, `archived_users_data.txt`);
}
