export default function NotFound() {
  // TODO: Check user role and redirect back to their homepage
  const handleClose = () => {
    window.history.back();
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
        <button onClick={handleClose} className="button-group bg-white">
          <p className="fw-bold my-0 text-button">BACK</p>
        </button>
      </div>
    </div>
  );
}
