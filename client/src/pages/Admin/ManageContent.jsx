import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../utils/AuthContext";
import { route } from "../../utils/route";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

// Components
import Sidebar from "../../components/Sidebar/SidebarAdmin";
import MenuDropdown from "../../components/Layout/AdminMenu";
import AddContent from "../../components/Modals/AddContent";
import EditContent from "../../components/Modals/EditContent";

export default function AdminContent() {
  const [adminData, setAdminData] = useState(null);
  const [contentData, setContentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const appURL = import.meta.env.VITE_APP_URL;

  const { authState } = useContext(AuthContext);
  const accessToken = authState.accessToken;
  const navigate = useNavigate();

  // Fetch content data function
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
      setLoading(false);
    } catch (error) {
      setError(error.message);
      //console.error("Error fetching content:", error);
      setLoading(false);
    }
  };

  // Handle Add Content Modal toggle
  const handleAdd = () => {
    setIsAddModalOpen(!isAddModalOpen);
  };

  // Handle Edit Content Modal toggle
  const handleEdit = (content) => {
    setEditingContent(content);  
    setIsEditModalOpen(true);    
  };

  const handleCardClick = (id) => {
    navigate(`/content/exercises/${id}`); 
  };

  // Fetch admin data
  useEffect(() => {
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
          throw new Error("Failed to fetch admin data");
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
  }, [accessToken, appURL]);

  useEffect(() => {
    fetchContentData();
  }, [accessToken, appURL]);



const handleAddContent = async (formData) => {
  try {
    const response = await fetch(`${appURL}/api/contents`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData, 
    });

    if (!response.ok) {
      toast.error("Failed to add content");
    }

    fetchContentData();
    setIsAddModalOpen(false);
  } catch (error) {
    setError(error.message);
  }
};


const handleEditContent = async (id, formData) => {
  console.log("Updating content with ID:", id);

  for (let [key, value] of formData.entries()) {
    console.log(`${key}:`, value);
  }

  try {
    const response = await fetch(`${appURL}/api/contents/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData, 
    });

    if (!response.ok) {
      throw new Error("Failed to update content");
    }

    const updatedContent = await response.json();
    console.log("Updated content:", updatedContent);

    fetchContentData(); 
    setIsEditModalOpen(false);
  } catch (error) {
    console.error("Error updating content:", error);
    setError(error.message);
  }
};


  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${appURL}/api/contents/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete content");
      }

      setContentData((prevData) => prevData.filter((content) => content._id !== id));
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <>
      {/* ADD CONTENT MODAL */}
      {isAddModalOpen && <AddContent closeModal={handleAdd} onSubmit={handleAddContent} />}
      
      {/* EDIT CONTENT MODAL */}
      {isEditModalOpen && <EditContent closeModal={() => setIsEditModalOpen(false)} onSubmit={handleEditContent} content={editingContent} />}

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
                ) : adminData ? (
                  <>
                    <p className="mb-0 mt-3">Hello,</p>
                    <p className="fw-bold">
                      {adminData?.firstName} {adminData?.lastName}
                    </p>
                  </>
                ) : (
                  <p>Fetching data.</p>
                )}
              </div>

              <MenuDropdown />
            </div>

            <div className="row h-100">
              {/* FIRST COL */}
              <div className="col-sm bg-white">
                <div className="row p-3">
                  <div className="col bg-white border rounded-4 p-3">
                    <div className="d-flex gap-3">
                      <div>
                        <p className="mb-0 fw-bold">Exercises</p>
                        <p className="mb-0">View exercises and follow along.</p>
                      </div>

                      <button
                        className="text-button border"
                        onClick={handleAdd}
                      >
                        Add Content
                      </button>
                    </div>
                  </div>
                </div>

                <div className="row p-3">
                  <div
                    className="d-flex flex-wrap gap-3 bg-white border rounded-4 p-3 overflow-auto"
                    style={{ minHeight: "85vh" }}
                  >
                    {contentData.map((content) => (
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

                          <div className="d-flex gap-2">
                            <div
                              className="fw-bold text-button border"
                              style={{ cursor: "pointer" }}
                              onClick={(e) => {
                                e.stopPropagation(); 
                                handleEdit(content); 
                              }} 
                            >
                              Edit
                            </div>
                            <div
                              className="fw-bold text-button border"
                              style={{ cursor: "pointer" }}
                              onClick={(e) => {
                                e.stopPropagation(); 
                                handleDelete(content._id); 
                              }}
                            >
                              Delete
                            </div>
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
    </>
  );
}
