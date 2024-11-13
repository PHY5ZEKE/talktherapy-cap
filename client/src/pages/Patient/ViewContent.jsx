import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../utils/AuthContext";

import { route } from "../../utils/route";
import { useNavigate } from "react-router-dom";

// Components
import Sidebar from "../../components/Sidebar/SidebarPatient";
import MenuDropdown from "../../components/Layout/PatientMenu";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookmark } from "@fortawesome/free-solid-svg-icons";

export default function ViewContent() {
  const { authState, clearOnLogOut } = useContext(AuthContext);
  const accessToken = authState.accessToken;

  const [patientData, setPatientData] = useState(null);
  const [contentData, setContentData] = useState([]);

  const [filteredContent, setFilteredContent] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const appURL = import.meta.env.VITE_APP_URL;
  const navigate = useNavigate();

  // Fetch patient data
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

  // Fetch content data
  useEffect(() => {
    const fetchContentData = async () => {
      try {
        const response = await fetch(`${appURL}/api/contents`, {
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
        setFilteredContent(data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchContentData();
  }, [accessToken, appURL]);

  //Search/Filter
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredContent(contentData);
    } else {
      setFilteredContent(
        contentData.filter(
          (content) =>
            content.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            content.category.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, contentData]);

  const handleBookmarkClick = async (content) => {
    try {
      // Create a new array containing only the content IDs (ObjectIds)
      const updatedBookmarks = patientData.bookmarkedContent.map((bookmarkId) => {
        // Ensure we only return the ObjectId (not the full content object)
        return bookmarkId;  // This is already the ObjectId
      });
  
      // If the content is already bookmarked, remove it
      if (updatedBookmarks.includes(content._id)) {
        updatedBookmarks.splice(updatedBookmarks.indexOf(content._id), 1);
      } else {
        // Otherwise, add the new content's ObjectId to the list of bookmarks
        updatedBookmarks.push(content._id);
      }
  
      console.log('Updated Bookmarks to be sent:', updatedBookmarks);
  
      // Update the patient bookmarks in the backend
      const response = await fetch(`${appURL}/${route.patient.updateBookmarks}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ bookmarks: updatedBookmarks }),  // Send only the ObjectIds
      });
  
      if (!response.ok) {
        console.error("Failed to update bookmarks:", response);
        throw new Error("Failed to update bookmarks");
      }
  
      // Update local state
      setPatientData({ ...patientData, bookmarkedContent: updatedBookmarks });
    } catch (error) {
      setError(error.message);
    }
  };

  const handleCardClick = (id) => {
    navigate(`/content/exercises/${id}`);
  };

  return (
    <>
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
                ) : patientData ? (
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
              <div className="col-sm bg-white">
                <div className="row p-3">
                  <div className="d-flex gap-3 align-items-center col bg-white border rounded-4 p-3">
                    <div>
                      <p className="mb-0 fw-bold">Exercises</p>
                      <p className="mb-0">View exercises and follow along.</p>
                    </div>

                    <div>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search by name or category"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="row p-3">
                  <div
                    className="d-flex flex-wrap gap-3 bg-white border rounded-4 p-3 overflow-auto"
                    style={{ minHeight: "85vh" }}
                  >
                    {filteredContent.map((content) => (
                      <div
                        key={content._id}
                        className="card exercise-container border"
                        style={{ width: "18rem" }}
                        onClick={() => handleCardClick(content._id)}
                      >
                        <img
                          src={content.image}
                          className="card-img-top"
                          alt={content.name}
                          style={{ height: "16rem", objectFit: "cover" }}
                        />
                        <div className="card-body">
                          <h5 className="card-title fw-bold mb-0 text-truncate">
                            {content.name}
                          </h5>
                          <p>{content.category}</p> 
                          <FontAwesomeIcon
                          icon={faBookmark}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookmarkClick(content);
                          }}
                          style={{
                            cursor: "pointer",
                            color: patientData?.bookmarkedContent.includes(content._id)
                              ? "blue"
                              : "black",
                          }}
                        />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
