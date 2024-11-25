import * as XLSX from "xlsx";

export default function exportPatientData(patientData, soapRecords) {
  // format html tags
  const convertHtmlToText = (html) => {
    if (typeof html !== "string") {
      return "";
    }
    return html
      .replace(/<\/p>/g, "")
      .replace(/<p>/g, "")
      .replace(/<\/ul>/g, "\n")
      .replace(/<ul>/g, "")
      .replace(/<li>/g, "\n- ")
      .replace(/<\/li>/g, "\n")
      .replace(/<br\s*\/?>/gi, "")
      .replace(/<\/?[^>]+(>|$)/g, "");
  };

  // soap headers
  const headers = [
    "Date",
    "Activity Plan",
    "Session Type",
    "Subjective Notes",
    "Objective Notes",
    "Recommendations",
    "Clinician Name",
    "Clinician Email",
    "Clinician Mobile",
    "Clinician Specialization",
  ];

  // new workbook
  const wb = XLSX.utils.book_new();

  // rows
  let rowData = [
    ["TalkTherapy"],
    ["Patient Information"],
    [
      "Patient Name:",
      `${patientData.firstName} ${patientData.lastName}`,
      "",
      "Email:",
      patientData.email,
      "",
      "Mobile:",
      patientData.mobile || "",
    ],
    ["SOAP Records"],
    headers,
  ];

  // check soap records if empty or not
  if (soapRecords.length === 0) {
    rowData.push([
      "NO FOUND/EXISTING SOAP RECORDS",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ]);
  } else {
    soapRecords.forEach((record) => {
      const clinician = record.clinician;
      rowData.push([
        new Date(record.date).toLocaleDateString(),
        convertHtmlToText(record.activityPlan) || "",
        convertHtmlToText(record.sessionType) || "",
        convertHtmlToText(record.subjective) || "",
        convertHtmlToText(record.objective) || "",
        convertHtmlToText(record.recommendation) || "",
        `${clinician.firstName || ""} ${clinician.middleName || ""} ${
          clinician.lastName || ""
        }`,
        clinician.email || "",
        clinician.mobile || "",
        clinician.specialization || "",
      ]);
    });
  }

  // worksheet
  const ws = XLSX.utils.aoa_to_sheet(rowData);

  // merge cells
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: 9 } },
  ];

  // column width set to fit
  const colWidths = headers.map((header, index) => {
    if (index === 0) {
      const maxLength = Math.max(...rowData.map(row => (row[index] || "").length));
      return { wch: maxLength };
    }
    return { wch: header.length + 2 };
  });
  ws["!cols"] = colWidths;

  // data row set to fit
  const rowHeights = rowData.map((row) => {
    const maxLength = Math.max(...row.map(cell => (cell || "").toString().length));
    return { hpt: Math.max(15, maxLength * 1) }; // Example heuristic
  });
  ws["!rows"] = rowHeights;

  // add ws to workbook
  XLSX.utils.book_append_sheet(wb, ws, "Patient SOAP Data");

  // save file
  XLSX.writeFile(
    wb,
    `${patientData.firstName}_${patientData.lastName}_data.xlsx`
  );
}

export function exportArchivedUsers(users) {
  // new workbook
  const wb = XLSX.utils.book_new();

  const headers = [
    "First Name",
    "Last Name",
    "Email",
    "Active",
    "Status",
    "User Role",
  ];

  // rows
  let rowData = [["TalkTherapy | Archived Users"], headers];

  // check user records if empty or not
  if (users.length === 0) {
    rowData.push(["NO USERS FOUND"]);
  } else {
    users.forEach((record) => {
      rowData.push([
        record.firstName || "N/A",
        record.lastName || "N/A",
        record.email || "N/A",
        record.active || "N/A",
        record.status || "N/A",
        record.userRole || "N/A",
      ]);
    });
  }

  // worksheet
  const ws = XLSX.utils.aoa_to_sheet(rowData);

  // merge cells
  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }];

  // column width set to fit
  const colWidths = headers.map((header, index) => {
    if (index === 2) { // Index of the "Email" column
      const maxLength = Math.max(...rowData.map(row => (row[index] || "").length));
      return { wch: maxLength };
    }
    return { wch: header.length };
  });
  ws["!cols"] = colWidths;

  // add ws to workbook
  XLSX.utils.book_append_sheet(wb, ws, "Archived Users Data");

  // save file
  XLSX.writeFile(wb, `archived_users_data.xlsx`);
}
