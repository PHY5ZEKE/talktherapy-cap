import { useState } from "react";
import { toast } from "react-toastify";
import "./modal.css";

export default function AddContent({ closeModal, onSubmit }) {
  // Callback Function to close modal
  const handleClose = (e) => {
    e.preventDefault();
    closeModal();
  };

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null); // New state for image file

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare form data
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("category", category);
    if (image) formData.append("image", image); // Add image file if available

    try {
      await onSubmit(formData); // Pass the formData to the parent component
      setName("");
      setDescription("");
      setCategory("");
      setImage(null); // Reset image input
      closeModal();
      toast.success("Content added successfully!");
    } catch (error) {
      toast.error("Failed to add content");
    }
  };

  // Handle file selection
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  return (
    <div className="modal-background">
      <div className="modal-container d-flex flex-column justify-content-center align-items-center">
        <h3 className="fw-bold">Add Content</h3>
        <p>Please fill up the form accordingly.</p>

        <div className="container row text-center">
          <div className="col">
            <div className="form-group">
              <label className="mb-0">Name</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter content name"
              />
            </div>

            <div className="form-group">
              <label className="mb-0">Description</label>
              <input
                type="text"
                className="form-control"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter content description"
              />
            </div>

            <div className="form-group">
              <label className="mb-0">Category</label>
              <input
                type="text"
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Enter content category"
              />
            </div>

            <div className="form-group">
              <label className="mb-0">Upload Image</label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-center mt-3 gap-3">
          <button onClick={handleSubmit} className="btn btn-primary">
            <p className="fw-bold my-0">SUBMIT</p>
          </button>
          <button onClick={handleClose} className="btn btn-secondary">
            <p className="fw-bold my-0">CANCEL</p>
          </button>
        </div>
      </div>
    </div>
  );
}
