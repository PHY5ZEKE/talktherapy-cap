import "./modal.css";
export default function ChooseSchedule({ closeModal }) {
  const handleClose = (e) => {
    e.preventDefault();
    closeModal();
  };
  return (
    <>
      <div className="modal-background">
        <div className="modal-container d-flex flex-column justify-content-center align-content-center">
          <div className="d-flex flex-column text-center">
            <h3 className="fw-bold">Choose a schedule</h3>
            <p className="mb-0">
              The following are available schedules.
            </p>
            <p>
              This will notify the corresponding user and will be tagged as pending.
            </p>
          </div>

          <div className="container text-center scrollable-table">
            {/* SCHEDULE LIST RENDER */}
            <div className="row text-center">
              <table className="table ">
                <thead>
                  <tr>
                    <th scope="col">Date</th>
                    <th scope="col">Time</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">July 4, 2024</th>
                    <td>2:30 PM - 3:00 PM</td>
                    <td>
                      <button className="button-group bg-white">
                        <p className="fw-bold my-0 status">ACCEPT</p>
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">July 4, 2024</th>
                    <td>2:30 PM - 3:00 PM</td>
                    <td>
                      <button className="button-group bg-white">
                        <p className="fw-bold my-0 status">ACCEPT</p>
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">July 4, 2024</th>
                    <td>2:30 PM - 3:00 PM</td>
                    <td>
                      <button className="button-group bg-white">
                        <p className="fw-bold my-0 status">ACCEPT</p>
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">July 4, 2024</th>
                    <td>2:30 PM - 3:00 PM</td>
                    <td>
                      <button className="button-group bg-white">
                        <p className="fw-bold my-0 status">ACCEPT</p>
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">July 4, 2024</th>
                    <td>2:30 PM - 3:00 PM</td>
                    <td>
                      <button className="button-group bg-white">
                        <p className="fw-bold my-0 status">ACCEPT</p>
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">July 4, 2024</th>
                    <td>2:30 PM - 3:00 PM</td>
                    <td>
                      <button className="button-group bg-white">
                        <p className="fw-bold my-0 status">ACCEPT</p>
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">July 4, 2024</th>
                    <td>2:30 PM - 3:00 PM</td>
                    <td>
                      <button className="button-group bg-white">
                        <p className="fw-bold my-0 status">ACCEPT</p>
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">July 4, 2024</th>
                    <td>2:30 PM - 3:00 PM</td>
                    <td>
                      <button className="button-group bg-white">
                        <p className="fw-bold my-0 status">ACCEPT</p>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="d-flex justify-content-center mt-3 gap-3">
            <button onClick={handleClose} className="button-group bg-white">
              <p className="fw-bold my-0 status">CANCEL</p>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
