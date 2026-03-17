import { Link } from 'react-router-dom'

const Unauthorized = () => {
  return (
    <div className="bg-light-soft min-vh-100 d-flex justify-content-center align-items-center">
      <div className="card border-0 shadow-sm text-center p-5" style={{ maxWidth: '500px' }}>
        <div className="mb-4">
          <i className="bi bi-shield-lock text-danger" style={{ fontSize: '4rem' }}></i>
        </div>
        <h2 className="fw-bold text-dark mb-3">Access Denied</h2>
        <p className="text-muted mb-4">
          You do not have permission to view the requested page. Please contact your administrator if you believe this is an error.
        </p>
        <Link to="/" className="btn btn-primary px-4 py-2 rounded-pill fw-medium shadow-sm transition-base">
          Return to Dashboard
        </Link>
      </div>
    </div>
  )
}

export default Unauthorized