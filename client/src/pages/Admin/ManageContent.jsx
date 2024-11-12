import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../utils/AuthContext";
import { route } from "../../utils/route";

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
      setContentData(data); // Set content data
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  // Handle Add Content Modal toggle
  const handleAdd = () => {
    setIsAddModalOpen(!isAddModalOpen);
  };

  // Handle Edit Content Modal toggle
  const handleEdit = (content) => {
    setEditingContent(content);  // Set the content that is being edited
    setIsEditModalOpen(true);    // Open the edit modal
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

  // Fetch content data when component loads
  useEffect(() => {
    fetchContentData();
  }, [accessToken, appURL]);

  // Handle Add Content submission
  const handleAddContent = async (newContent) => {
    try {
      const response = await fetch(`${appURL}/api/contents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(newContent), // Send the new content details
      });

      if (!response.ok) {
        throw new Error("Failed to add content");
      }

      // Refetch the content data to show the new content
      fetchContentData();
      setIsAddModalOpen(false);
    } catch (error) {
      setError(error.message);
    }
  };

  // Handle Edit Content submission
  const handleEditContent = async (id, updatedContent) => {
    try {
      const response = await fetch(`${appURL}/api/contents/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(updatedContent), // Send the updated content details
      });

      if (!response.ok) {
        throw new Error("Failed to update content");
      }

      // Refetch the content data to show the updated content
      fetchContentData();
      setIsEditModalOpen(false);
    } catch (error) {
      setError(error.message);
    }
  };

  // Handle Delete Content
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

      // Remove the deleted content from the UI
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
                        className="card exercise-container"
                        style={{ width: "18rem" }}
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
                              onClick={() => handleEdit(content)} // Pass content to handleEdit
                            >
                              Edit
                            </div>
                            <div
                              className="fw-bold text-button border"
                              style={{ cursor: "pointer" }}
                              onClick={() => handleDelete(content._id)}
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
