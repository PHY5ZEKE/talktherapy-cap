import { useNavigate } from "react-router-dom";

export default function UnauthorizedAccess() {
  const navigate = useNavigate();
  // TODO: Check user role and redirect back to their homepage
    const handleClose = () => {
        navigate('/');
    };
  return (
    <div className="container-fluid vh-100 d-flex flex-column align-items-center justify-content-center">
      <div className="d-flex flex-column gap-2 mx-auto w-50">
        <h1 className="fw-bold">Oops.</h1>
        <h4>Unauthorized Access</h4>
        <p>
          You do not have the necessary permissions to view this page. Please
          ensure you are logged in with the correct credentials or contact the
          system administrator for access. If you believe this is a mistake, try
          refreshing the page or return to the homepage.
        </p>
        <button onClick={handleClose} className="button-group bg-white">
          <p className="fw-bold my-0 text-button">BACK</p>
        </button>
      </div>
    </div>
  );
}
