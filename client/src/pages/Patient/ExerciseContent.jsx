import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../utils/AuthContext";
import { useNavigate, useParams } from "react-router-dom"; 
import { route } from "../../utils/route";
import DOMPurify from 'dompurify';
import 'react-quill/dist/quill.snow.css';

// Components
import Sidebar from "../../components/Sidebar/SidebarPatient";
import MenuDropdown from "../../components/Layout/PatientMenu";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookmark } from "@fortawesome/free-solid-svg-icons";

export default function ExerciseContent() {
  const { authState, clearOnLogOut } = useContext(AuthContext);
  const accessToken = authState.accessToken;
  const { id } = useParams(); // Get the 'id' from the URL params

  const [patientData, setPatientData] = useState(null);
  const [contentData, setContentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const appURL = import.meta.env.VITE_APP_URL;
  const navigate = useNavigate();

  const isYouTubeUrl = (url) => {
    return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//.test(url);
  };
  
  // Extract YouTube video ID
  const extractYouTubeID = (url) => {
    const regExp = /^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|watch\?.+&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[1].length === 11 ? match[1] : null;
  };

  // Fetch patient data (same as before)
  useEffect(() => {
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
          throw new Error("Failed to fetch patient data");
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
  }, [accessToken, appURL]);

  // Fetch content data based on the ID
  useEffect(() => {
    const fetchContentData = async () => {
      try {
        const response = await fetch(`${appURL}/api/contents/${id}`, { // Fetch content by ID
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
        setContentData(data); // Set the content data for the specific ID
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    if (id) {
      fetchContentData(); // Only fetch when the ID is available
    }
  }, [accessToken, appURL, id]); // Add 'id' to dependencies

  return (
      <div className="container-fluid p-0 vh-100">
        <div className="d-flex flex-md-row flex-column flex-nowrap vh-100">
          {/* SIDEBAR */}
          <Sidebar />

          {/* MAIN CONTENT */}
          <div className="container-fluid bg-white w-100 h-auto border overflow-auto">
            <div className="row bg-white border-bottom">
              <div className="col">
                {error ? (
                  <p>{error}</p>
                ) : contentData ? (
                  <>
                    <p className="mb-0 mt-3">Hello,</p>
                    <p className="fw-bold">
                      {patientData?.firstName} {patientData?.lastName}
                    </p>
                  </>
                ) : (
                  <p>Fetching data...</p>
                )}
              </div>

              <MenuDropdown />
            </div>

            <div className="row h-100">
              {/* FIRST COL */}
              <div className={`col-sm bg-white ${!contentData?.videoUrl ? "col-12" : ""}`}>
                <div className="row p-3">
                  <div className="col bg-white border rounded-4 p-3">
                    {/* TITLE */}
                    <p className="mb-0 fw-bold">{contentData?.name || "Video Title"}</p>
                    <p className="mb-0">{contentData?.category || "Category"}</p>
                  </div>
                </div>

                <div className="row p-3">
                  <div
                    className="col bg-white border rounded-4 p-3 overflow-auto content-column"
                    style={{
                      maxHeight: "500px", // Set max height for the scrollable area
                      overflowY: "auto", // Enable vertical scrolling within this div
                    }}
                  >
                    {/* Video Image */}
                    <div
                      className="w-100 bg-warning exercise-vid rounded-2"
                      style={{
                        backgroundImage: contentData?.image ? `url(${contentData.image})` : "none",
                        backgroundSize: contentData?.image ? "contain" : "none",
                        backgroundPosition: "center",
                        aspectRatio: "16 / 9", // Maintain 16:9 aspect ratio
                        width: "100%",
                        height: "auto",
                        display: contentData?.image ? "block" : "none", // Hide if no image
                      }}
                    ></div>

                    <div
                      className="ql-editor mb-0"
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(contentData?.description || "Description here"),
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* SECOND COL - Display only if videoUrl exists */}
              {contentData?.videoUrl && (
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
                    style={{ maxHeight: "85vh" }} // Larger height for video column
                  >
                    <div className="mb-3">
                      {/* VIDEO CAM */}
                      {isYouTubeUrl(contentData.videoUrl) ? (
                        // Embed YouTube video using iframe
                        <iframe
                          className="w-100"
                          style={{
                            aspectRatio: "16 / 9", // Maintain 16:9 aspect ratio
                            height: "100%",
                          }}
                          src={`https://www.youtube.com/embed/${extractYouTubeID(contentData.videoUrl)}`}
                          title="Video player"
                          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      ) : (
                        // Embed direct video URL using video tag
                        <video
                          className="w-100"
                          controls
                          style={{
                            aspectRatio: "16 / 9", // Maintain 16:9 aspect ratio
                            width: "100%",
                            objectFit: "cover", // Ensures the video covers the container without distortion
                          }}
                        >
                          <source src={contentData?.videoUrl} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
  );
}
