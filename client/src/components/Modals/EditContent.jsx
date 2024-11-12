import { useState, useEffect } from "react";
import { toast } from "react-toastify";

export default function EditContent({ closeModal, onSubmit, content }) {
  // Form state initialization with the current content values
  const [name, setName] = useState(content?.name || "");
  const [description, setDescription] = useState(content?.description || "");
  const [category, setCategory] = useState(content?.category || "");
  const [image, setImage] = useState(content?.image || "");

  // Reset the form when content changes
  useEffect(() => {
    setName(content?.name || "");
    setDescription(content?.description || "");
    setCategory(content?.category || "");
    setImage(content?.image || "");
  }, [content]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedContent = {
      name,
      description,
      category,
      image, // Image can be updated too
    };

    try {
      await onSubmit(content._id, updatedContent); // Pass the content ID and updated data
      closeModal();
    } catch (error) {
      toast.error("Failed to update content");
    }
  };

  return (
    <div className="modal-background">
      <div className="modal-container d-flex flex-column justify-content-center align-content-center">
        <h3 className="fw-bold">Edit Content</h3>
        <p>Edit the content details below:</p>

        <div className="container row text-center">
          <div className="col">
            <p className="mb-0">Name</p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <p className="mb-0">Description</p>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <p className="mb-0">Category</p>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
            <p className="mb-0">Image URL (optional)</p>
            <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />
          </div>
        </div>

        <div className="d-flex justify-content-center mt-3 gap-3">
          <button onClick={handleSubmit} className="text-button border">
            <p className="fw-bold my-0">UPDATE</p>
          </button>
          <button onClick={closeModal} className="text-button border">
            <p className="fw-bold my-0">CANCEL</p>
          </button>
        </div>
      </div>
    </div>
  );
}
