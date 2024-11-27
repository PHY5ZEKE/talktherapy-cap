import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../utils/AuthContext";

import { route } from "../../utils/route";
import { useNavigate } from "react-router-dom";

// Components
import Sidebar from "../../components/Sidebar/SidebarClinician";
import MenuDropdown from "../../components/Layout/ClinicianMenu";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function ViewContent() {
  const { authState, clearOnLogOut } = useContext(AuthContext);
  const accessToken = authState.accessToken;

  const [clinicianData, setClinicianData] = useState(null);
  const [contentData, setContentData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredContent, setFilteredContent] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const appURL = import.meta.env.VITE_APP_URL;
  const navigate = useNavigate();

  // Fetch clinician data
  useEffect(() => {
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
          throw new Error("Failed to fetch clinician data");
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

  const handleCardClick = (id) => {
    navigate(`/content/exercises/${id}`);
  };

  return (
    <>
      <div className="container-fluid p-0 vh-100 vw-100">
        <div className="d-flex flex-md-row flex-column flex-nowrap vh-100">
          {/* SIDEBAR */}
          <Sidebar />

          {/* MAIN CONTENT */}
          <div className="container-fluid bg-white w-100 h-auto border overflow-auto">
            <div className="row bg-white border-bottom">
              <div className="col">
                {error ? (
                  <p>{error}</p>
                ) : clinicianData ? (
                  <>
                    <p className="mb-0 mt-3">Hello,</p>
                    <p className="fw-bold">
                      {clinicianData?.firstName} {clinicianData?.lastName}
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
                  <div className="col d-flex gap-3 align-items-center bg-white border rounded-4 p-3">
                    <div>
                      <p className="mb-0 fw-bold">Exercises</p>
                      <p className="mb-0">View exercises and follow along.</p>
                    </div>

                    <div>
                      <input
                        type="text"
                        className="form-control mt-3"
                        placeholder="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="row bg-white p-3">
                  <div
                    className="col bg-white border rounded-4 overflow-auto"
                    style={{ maxHeight: "85vh", minHeight: "85vh" }}
                  >
                    <div className="row row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 row-cols-1 mx-auto my-3">
                      {/* Static Exercise Card: Run*/}
                      <div
                        className="col"
                        onClick={() => handleCardClick("speech")} // Replace with actual ID logic if needed
                      >
                        <div className="mx-1 my-3 card exercise-container exercise-child border">
                          <img
                            src="https://cdn-icons-png.flaticon.com/512/13731/13731426.png" // Static image URL
                            className="card-img-top border-bottom"
                            alt="Speech Exercise 1"
                            style={{ height: "200px", objectFit: "cover" }}
                          />
                          <div className="card-body p-3">
                            <h5 className="card-title fw-bold mb-0 text-truncate">
                              Word Exercises!
                            </h5>
                            <p>Speech Therapy</p>
                          </div>
                        </div>
                      </div>

                      {/* Static Exercise Card: Speech*/}
                      <div
                        className="col"
                        onClick={() => handleCardClick("assistspeech")} // Replace with actual ID logic if needed
                      >
                        <div className="mx-1 my-3 card exercise-container exercise-child border">
                          <img
                            src="https://media.istockphoto.com/id/1456205703/vector/woman-lips-animation-cartoon-female-lip-sync-animated-phonemes-cute-girl-open-mouth.jpg?s=170667a&w=0&k=20&c=f1uxqui3B00hnYhIj7crW3s5YtSRprjOKNn3JXdAYt0=" // Static image URL
                            className="card-img-top border-bottom"
                            alt="Speech Exercise 2"
                            style={{ height: "200px", objectFit: "cover" }}
                          />
                          <div className="card-body p-3">
                            <h5 className="card-title fw-bold mb-0 text-truncate">
                              Machine Learning: Assistive Speech
                            </h5>
                            <p>Machine Learning</p>
                          </div>
                        </div>
                      </div>

                      {/* Static Exercise Card: Face*/}
                      <div
                        className="col"
                        onClick={() => handleCardClick("facespeech")} 
                      >
                        <div className="mx-1 my-3 card exercise-container exercise-child border">
                          <img
                            src="https://deeplobe.ai/wp-content/uploads/2022/02/Main-1.jpg" 
                            className="card-img-top border-bottom"
                            alt="Speech Exercise 3"
                            style={{ height: "200px", objectFit: "cover" }}
                          />
                          <div className="card-body p-3">
                            <h5 className="card-title fw-bold mb-0 text-truncate">
                              Machine Learning: Assistive Face Diagnostic Tool
                            </h5>
                            <p>Machine Learning</p>
                          </div>
                        </div>
                      </div>

                      {filteredContent.map((content) => (
                        <div
                          key={content._id}
                          className="col"
                          onClick={() => handleCardClick(content._id)}
                        >
                          <div className="mx-1 my-3 card exercise-container exercise-child border">
                            <img
                              src={content.image}
                              className="card-img-top border-bottom"
                              alt={content.name}
                              style={{ height: "200px", objectFit: "cover" }}
                            />
                            <div className="card-body p-3">
                              <h5 className="card-title fw-bold mb-0 text-truncate">
                                {content.name}
                              </h5>
                              <p>{content.category}</p>
                            </div>
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
      </div>
    </>
  );
}
