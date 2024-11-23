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
import ConfirmationDialog from "../../components/Modals/ConfirmationDialog";

export default function AdminContent() {
  const [adminData, setAdminData] = useState(null);
  const [contentData, setContentData] = useState([]);

  const [filteredContent, setFilteredContent] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState(null);

  const appURL = import.meta.env.VITE_APP_URL;

  const { authState } = useContext(AuthContext);
  const accessToken = authState.accessToken;
  const navigate = useNavigate();


  // Function to open the confirmation dialog
  const handleDeleteClick = (content) => {
    setContentToDelete(content);
    setIsConfirmDeleteOpen(true);
  };

  // Function to handle deletion confirmation
  const handleConfirmDelete = async () => {
    if (contentToDelete) {
      await handleDelete(contentToDelete._id);
    }
    setIsConfirmDeleteOpen(false);
    setContentToDelete(null);
  };

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
      setFilteredContent(data);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

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
      } else {
        toast.success("Content added successfully!");
      }

      fetchContentData();
      setIsAddModalOpen(false);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEditContent = async (id, formData) => {
    try {
      const response = await fetch(`${appURL}/api/contents/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        toast.error("Failed to edit content");
      } else {
        toast.success("Content updated successfully!");
      }

      fetchContentData();
      setIsEditModalOpen(false);
    } catch (error) {
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
        toast.error("Failed to delete");
      } else {
        toast.success("Content deleted successfully!");
      }

      setContentData((prevData) =>
        prevData.filter((content) => content._id !== id)
      );
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <>
      {/* ADD CONTENT MODAL */}
      {isAddModalOpen && (
        <AddContent closeModal={handleAdd} onSubmit={handleAddContent} />
      )}

      {/* EDIT CONTENT MODAL */}
      {isEditModalOpen && (
        <EditContent
          closeModal={() => setIsEditModalOpen(false)}
          onSubmit={handleEditContent}
          content={editingContent}
        />
      )}

      {/* CONFIRMATION DIALOG */}
      {isConfirmDeleteOpen && (
        <ConfirmationDialog
          header="Confirm Deletion"
          body={`Are you sure you want to delete "${contentToDelete ? contentToDelete.name : ""}"?`}
          handleModal={() => setIsConfirmDeleteOpen(false)}
          confirm={handleConfirmDelete}
        />
      )}

      <div className="container-fluid p-0 vh-100 vw-100">
        <div className="d-flex flex-md-row flex-nowrap vh-100">
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

            <div className="row">
              {/* FIRST COL */}
              <div className="col-sm bg-white">
                <div className="row p-3">
                  <div className="col bg-white border rounded-4 p-3">
                    <div className="d-flex flex-wrap align-items-center gap-3">
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
                </div>

                <div className="row bg-white p-3">
                  <div
                    className="col bg-white border rounded-4 overflow-auto"
                    style={{ maxHeight: "85vh", minHeight: "85vh" }}
                  >
                    <div className="row row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 row-cols-1 mx-auto my-3">
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

                              <div className="d-flex gap-2">
                                <button
                                  className="fw-bold text-button border"
                                  style={{ cursor: "pointer" }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(content);
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  className="fw-bold text-button border"
                                  style={{ cursor: "pointer" }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick(content);
                                  }}
                                >
                                  Delete
                                </button>
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
      </div>
    </>
  );
}
