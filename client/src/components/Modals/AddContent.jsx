import "./modal.css";
import { useState } from "react";
export default function AddContent({ closeModal }) {
  // Callback Function
  const handleClose = (e) => {
    e.preventDefault();
    closeModal();
  };

  const [inputs, setInputs] = useState([{ value: "" }]);

  const handleChange = (index, event) => {
    const values = [...inputs];
    values[index].value = event.target.value;
    setInputs(values);
  };

  const addInput = () => {
    setInputs([...inputs, { value: "" }]);
  };

  const removeInput = (index) => {
    const values = [...inputs];
    values.splice(index, 1);
    setInputs(values);
  };

  return (
    <>
      <div className="modal-background">
        <div className="modal-container d-flex flex-column justify-content-center align-content-center">
          <div className="d-flex flex-column text-center">
            <h3 className="fw-bold">Add Content</h3>
            <p className="mb-0">Please fill up the form accordingly.</p>
          </div>

          <div className="container row text-center scrollable-table">
            <div className="col">
              <p className="mb-0">Title</p>
              <input type="text" />
              <p className="mb-0">Description</p>
              <input type="text" />
              <p className="mb-0">Category</p>
              <input type="text" />
            </div>

            <div className="col">
              {inputs.map((input, index) => (
                <div className="col" key={index}>
                  <input
                    type="text"
                    value={input.value}
                    onChange={(event) => handleChange(index, event)}
                  />
                  {index > 0 && (
                    <button onClick={() => removeInput(index)}>X</button>
                  )}
                </div>
              ))}
              <button onClick={addInput}>Add</button>
            </div>
          </div>

          <div className="d-flex justify-content-center mt-3 gap-3">
            <button className="text-button border">
              <p className="fw-bold my-0 status">SUBMIT</p>
            </button>
            <button onClick={handleClose} className="text-button border">
              <p className="fw-bold my-0 status">CANCEL</p>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
