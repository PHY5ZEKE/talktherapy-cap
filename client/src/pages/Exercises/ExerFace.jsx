import React, { useState, useEffect, useContext, Suspense } from "react";
import { AuthContext } from "../../utils/AuthContext";
import { useNavigate, useParams } from "react-router-dom"; 
import { route } from "../../utils/route";
import { toast } from "react-toastify";

import DOMPurify from 'dompurify';
import 'react-quill/dist/quill.snow.css';

// Components
const SidebarPatient = React.lazy(() => import("../../components/Sidebar/SidebarPatient"));
const SidebarAdmin = React.lazy(() => import("../../components/Sidebar/SidebarAdmin"));
const SidebarClinician = React.lazy(() => import("../../components/Sidebar/SidebarClinician"));

const MenuDropdownPatient = React.lazy(() => import("../../components/Layout/PatientMenu"));
const MenuDropdownAdmin = React.lazy(() => import("../../components/Layout/AdminMenu"));
const MenuDropdownClinician = React.lazy(() => import("../../components/Layout/ClinicianMenu"));

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookmark } from "@fortawesome/free-solid-svg-icons";

export default function ExerFace() {
  const { authState, clearOnLogOut } = useContext(AuthContext);
  const accessToken = authState.accessToken;
  const { id } = useParams(); 

  const [Sidebar, setSidebar] = useState(null);
  const [MenuDropdown, setMenuDropdown] = useState(null);

  const [clinicianData, setClinicianData] = useState(null);
  const [adminData, setAdminData] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [contentData, setContentData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const appURL = import.meta.env.VITE_APP_URL;
  const navigate = useNavigate();

    // Update Sidebar when role changes
    useEffect(() => {
      if (authState?.userRole === "admin") {
        setSidebar(SidebarAdmin);
        setMenuDropdown(MenuDropdownAdmin);
      } else if (authState?.userRole === "clinician") {
        setSidebar(SidebarClinician); 
        setMenuDropdown(MenuDropdownClinician); 
      } else if (authState?.userRole === "patientslp") {
        setSidebar(SidebarPatient);
        setMenuDropdown(MenuDropdownPatient); 
      }
    }, [authState?.userRole]);

  const isYouTubeUrl = (url) => {
    return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//.test(url);
  };
  
  // Extract YouTube video ID
  const extractYouTubeID = (url) => {
    const regExp = /^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|watch\?.+&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[1].length === 11 ? match[1] : null;
  };

  // Fetch patient data
  useEffect(() => {
    if (authState?.userRole === "patientslp") {
      const fetchPatientData = async () => {
        try {
          const response = await fetch(`${appURL}/${route.patient.fetch}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (!response.ok) {
            console.error("Failed to fetch patient data");
          }

          const data = await response.json();
          setPatientData(data.patient);
          setLoading(false);
        } catch (error) {
          setError(error.message);
          setLoading(false);
        }
      };

      fetchPatientData();
    }
  }, [accessToken, appURL, authState?.userRole]); 

  // Fetch admin data
  useEffect(() => {
    if (authState?.userRole === "admin") {
      const fetchAdminData = async () => {
        try {
          const response = await fetch(`${appURL}/${route.admin.fetch}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (!response.ok) {
            console.error("Failed to fetch admin data");
          }

          const data = await response.json();
          setAdminData(data.admin);
          setLoading(false);
        } catch (error) {
          setError(error.message);
          setLoading(false);
        }
      };

      fetchAdminData();
    }
  }, [accessToken, appURL, authState?.userRole]); 

  // Fetch clinician data
  useEffect(() => {
    if (authState?.userRole === "clinician") {
      const fetchClinicianData = async () => {
        try {
          const response = await fetch(`${appURL}/${route.clinician.fetch}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (!response.ok) {
            console.error("Failed to fetch clinician data");
          }

          const data = await response.json();
          setClinicianData(data.clinician);
          setLoading(false);
        } catch (error) {
          setError(error.message);
          setLoading(false);
        }
      };

      fetchClinicianData();
    }
  }, [accessToken, appURL, authState?.userRole]); 


  // Fetch content data based on the ID
  useEffect(() => {
    const fetchContentData = async () => {
      try {
        const response = await fetch(`${appURL}/api/contents/${id}`, { 
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch content data");
        }

        const data = await response.json();
        setContentData(data); 
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    if (id) {
      fetchContentData(); 
    }
  }, [accessToken, appURL, id]); 

   // Define the YouTube video URL
   const videoUrl = "https://www.youtube.com/watch?v=wBuA589kfMg&t"; 

   // Extract the YouTube video ID and construct the embed URL
   const videoID = extractYouTubeID(videoUrl);
   const embedUrl = videoID ? `https://www.youtube.com/embed/${videoID}` : null;

   const sanitizedHtml = DOMPurify.sanitize(`
     <div style="font-family: Arial, sans-serif; border: 2px solid #ccc; border-radius: 15px; padding: 20px; background-color: #fff; color: #333; line-height: 1.6; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
      <p style="text-align: justify;">
        <strong style="color: #4CAF50;">This Assistive Diagnostic Tool</strong> utilizes advanced <em>Machine Learning</em> models, powered by TensorFlow, to analyze facial structures and assign a confidence score based on its predictions. It serves as a groundbreaking method for supporting assessments by recognizing and categorizing facial patterns with precision.
      </p>
      <p style="text-align: justify;">
        However, <span style="color: #e74c3c; font-weight: bold;">this tool is not intended as a definitive diagnostic resource</span>. While it leverages state-of-the-art algorithms, it remains susceptible to inaccuracies due to factors such as variability in input quality and the limitations of current machine learning models. Users are encouraged to consult licensed professionals for a formal diagnosis.
      </p>
    </div>
  `);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="container-fluid p-0 vw-100 vh-100">
        <div className="d-flex flex-md-row flex-column flex-nowrap vh-100">
          {/* SIDEBAR */}
          {Sidebar ? <Sidebar /> : null}


          {/* MAIN CONTENT */}
          <div className="container-fluid bg-white w-100 h-auto border overflow-auto">
            <div className="row bg-white border-bottom">
              <div className="col">
                {loading ? (
                  <p>Loading...</p> 
                ) : error ? (
                  <p>{error}</p> 
                ) : patientData ? (
                  <>
                    <p className="mb-0 mt-3">Hello,</p>
                    <p className="fw-bold">
                      {patientData?.firstName} {patientData?.lastName}
                    </p>
                  </>
                ) : adminData ? (
                  <>
                    <p className="mb-0 mt-3">Hello,</p>
                    <p className="fw-bold">
                      {adminData?.firstName} {adminData?.lastName}
                    </p>
                  </>
                ) : clinicianData ? (
                  <>
                    <p className="mb-0 mt-3">Hello,</p>
                    <p className="fw-bold">
                      {clinicianData?.firstName} {clinicianData?.lastName}
                    </p>
                  </>
                ) : (
                  <p>No data available</p> // Fallback message
                )}
              </div>
              {MenuDropdown ? <MenuDropdown /> : null}
            </div>

                <div className="row h-100">
                {/* FIRST COL */}
                <div className="col-sm bg-white">
                  <div className="row p-3">
                    <div className="col bg-white border rounded-4 p-3">
                      {/* TITLE */}
                      <p className="mb-0 fw-bold">Speech Exercise</p>
                      <p className="mb-0">Speech Therapy</p>
                    </div>
                  </div>

                  <div className="row p-3">
                    <div
                      className="col bg-white border rounded-4 p-3 overflow-auto content-column"
                      style={{
                        maxHeight: "75vh", 
                      }}
                    >
                      {/* Image */}
                      <div
                        className="w-100 exercise-vid rounded-2"
                        style={{
                          display: "inline",
                        }}
                      >
                        <img
                          src="https://www.researchgate.net/profile/Paula-Costa-2/publication/260982653/figure/fig3/AS:667595799814160@1536178650829/ocalic-context-dependent-visemes-The-i-2-viseme-is-not-part-of-the-simple-visemes.png" // Static image URL
                          alt="Exercise Image"
                          className="border rounded-3"
                          style={{
                            padding: "15px",
                            width: "100%",
                            height: "auto",
                            objectFit: "cover",
                            aspectRatio: "16 / 10", 
                          }}
                        />
                      </div>
                      <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
                    </div>
                  </div>
                  <div
                    className="mb-3 fw-bold text-button border mx-auto"
                    onClick={() => navigate("/content/warn/face")}
                    style={{ cursor: "pointer" }}
                  >
                    Perform
                  </div>
                </div>

                {/* SECOND COL - Display only if videoUrl exists */}
                <div className="col-sm bg-white">
                  <div className="row p-3">
                    <div className="col bg-white border rounded-4 p-3">
                      <p className="mb-0 fw-bold">Watch this Video</p>
                      <p className="mb-0">Practice and follow along.</p>
                    </div>
                  </div>

                  <div className="row p-3">
                    <div
                      className="col bg-white border rounded-4 p-3 overflow-auto"
                      style={{ maxHeight: "75vh" }} 
                    >
                      <div className="mb-3">
                          {embedUrl ? (
                          <iframe
                            width="100%"
                            height="315"
                            src={embedUrl}
                            title="YouTube Video"
                            frameBorder="0"
                            allowFullScreen
                            style={{
                              aspectRatio: "16 / 9", 
                              objectFit: "cover", 
                            }}
                          ></iframe>
                        ) : (
                          <p>Invalid YouTube URL</p> 
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Suspense>
    );
}
