import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();
  const handleClose = () => {
    navigate("/");
  };
  return (
    <div className="container-fluid vh-100 d-flex flex-column align-items-center justify-content-center">
      <div className="d-flex flex-column gap-2 mx-auto w-50">
        <h1 className="fw-bold">Oops.</h1>
        <h4>{`That's a 404.`}</h4>
        <p>
          {`
          Sorry, the page you're looking for doesn't exist. Please check the URL
          or return to the homepage. If you believe this is a mistake, try
          refreshing the page or return to the homepage.
          `}
        </p>
        <p onClick={handleClose} className="fw-bold my-0 text-button border">
          BACK
        </p>
      </div>
    </div>
  );
}
