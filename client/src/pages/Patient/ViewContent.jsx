import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../utils/AuthContext";

import { route } from "../../utils/route";
import { useNavigate } from "react-router-dom";
import { toast, Slide } from "react-toastify";

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
      const updatedBookmarks = patientData.bookmarkedContent.map((bookmarkId) => {
        return bookmarkId;  
      });
  
      if (updatedBookmarks.includes(content._id)) {
        updatedBookmarks.splice(updatedBookmarks.indexOf(content._id), 1);
      } else {
        updatedBookmarks.push(content._id);
      }
  
  
      // Update the patient bookmarks in the backend
      const response = await fetch(`${appURL}/${route.patient.updateBookmarks}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ bookmarks: updatedBookmarks }),  
      });
  
      if (!response.ok) {
        toast.error("Failed to update bookmarks");
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
                        placeholder="Search"
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


                    {/* Static Exercise Card: Run*/}
                  <div
                    className="card exercise-container border"
                    style={{ width: "18rem" }}
                    onClick={() => handleCardClick("speech")} // Replace with actual ID logic if needed
                  >
                    <img
                      src="https://media.istockphoto.com/id/1456205703/vector/woman-lips-animation-cartoon-female-lip-sync-animated-phonemes-cute-girl-open-mouth.jpg?s=170667a&w=0&k=20&c=f1uxqui3B00hnYhIj7crW3s5YtSRprjOKNn3JXdAYt0=" // Static image URL
                      className="card-img-top"
                      alt="Speech Exercise 1"
                      style={{ height: "16rem", objectFit: "cover" }}
                    />
                    <div className="card-body">
                      <h5 className="card-title fw-bold mb-0 text-truncate">
                        Word Exercises!
                      </h5>
                      <p>Speech Therapy</p>
                      {/* <FontAwesomeIcon
                        icon={faBookmark}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookmarkClick({ _id: "1", name: "Speech Exercise 1" }); // Static bookmark logic
                        }}
                        style={{
                          cursor: "pointer",
                          color: patientData?.bookmarkedContent.includes("1") // Replace with actual logic
                            ? "blue"
                            : "black",
                        }}
                      /> */}
                    </div>
                  </div>

                  {/* Static Exercise Card: Speech*/}
                  <div
                    className="card exercise-container border"
                    style={{ width: "18rem" }}
                    onClick={() => handleCardClick("assistspeech")} // Replace with actual ID logic if needed
                  >
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/13731/13731426.png" // Static image URL
                      className="card-img-top"
                      alt="Speech Exercise 2"
                      style={{ height: "16rem", objectFit: "cover" }}
                    />
                    <div className="card-body">
                      <h5 className="card-title fw-bold mb-0 text-truncate">
                        Machine Learning: Assistive Speech
                      </h5>
                      <p>Machine Learning</p>
                      {/* <FontAwesomeIcon
                        icon={faBookmark}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookmarkClick({ _id: "1", name: "Speech Exercise 1" }); // Static bookmark logic
                        }}
                        style={{
                          cursor: "pointer",
                          color: patientData?.bookmarkedContent.includes("1") // Replace with actual logic
                            ? "blue"
                            : "black",
                        }}
                      /> */}
                    </div>
                  </div>

                  {/* Static Exercise Card: Face*/}
                  {/* <div
                    className="card exercise-container border"
                    style={{ width: "18rem" }}
                    onClick={() => handleCardClick("facespeech")} // Replace with actual ID logic if needed
                  >
                    <img
                      src="https://www.example.com/image1.jpg" // Static image URL
                      className="card-img-top"
                      alt="Speech Exercise 3"
                      style={{ height: "16rem", objectFit: "cover" }}
                    />
                    <div className="card-body">
                      <h5 className="card-title fw-bold mb-0 text-truncate">
                        Machine Learning: Assistive Face Therapy
                      </h5>
                      <p>Machine Learning</p>
                      <FontAwesomeIcon
                        icon={faBookmark}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookmarkClick({ _id: "1", name: "Speech Exercise 1" }); // Static bookmark logic
                        }}
                        style={{
                          cursor: "pointer",
                          color: patientData?.bookmarkedContent.includes("1") // Replace with actual logic
                            ? "blue"
                            : "black",
                        }}
                      />
                    </div>
                  </div> */}

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
