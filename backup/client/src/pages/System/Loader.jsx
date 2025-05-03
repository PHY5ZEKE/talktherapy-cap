import "../../components/Modals/modal.css";

import Logo from "../../assets/android-chrome-512x512.png";
export default function Loader() {
  return (
    <div className="modal-background">
      <div className="modal-loader d-flex flex-column justify-content-center align-content-center">
        <img
          src={Logo}
          alt="Logo"
          className="scale-up-down mb-3 mx-auto"
          style={{ width: "3rem" }}
        />
        <div className="d-flex flex-column text-center">
          <h5 className="fw-bold mb-0 text-white w-auto mx-auto p-2">
            <span className="typewriter">Loading...</span>
          </h5>
        </div>
      </div>
    </div>
  );
}
