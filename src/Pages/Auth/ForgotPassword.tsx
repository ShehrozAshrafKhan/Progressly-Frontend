import axios from "axios";
import React, { useState } from "react";
import config from "../../config";
import { ShowMessage } from "../../Components/Common/ShowMessage";
import { Link } from "react-router-dom";
import logo100 from "../../assets/logo100.png";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email) {
      ShowMessage(2, "Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      const url = `${config.baseUrl}Auth/forgot-password`;
      const response = await axios.post(url, { email });

      const result = response.data.result;
      if (!result.succeeded && result.errors.length > 0) {
        ShowMessage(2, result.errors[0]);
      } else {
        ShowMessage(1, "Reset link has been sent to your email.");
        setEmail("");
      }
    } catch (e: any) {
      ShowMessage(2, e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-light-soft min-vh-100 d-flex justify-content-center align-items-center px-3">
      <div
        className="card border-0 shadow-sm rounded-lg overflow-hidden"
        style={{ width: "100%", maxWidth: "420px" }}
      >
        <div className="card-body p-4 p-md-5">
          <div className="text-center mb-4">
            <div className="d-flex justify-content-center align-items-center mb-3">
              <img src={logo100} alt="Progressly Logo" width="48" height="48" className="me-2" />
              <h2 className="mb-0 fw-bold text-dark" style={{ letterSpacing: "-0.5px" }}>Progressly</h2>
            </div>
            <p className="text-muted small">Enter your email to receive a password reset link.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="form-label text-dark fw-medium small mb-1">
                Email Address
              </label>
              <input
                type="email"
                className="form-control bg-light-soft border-0 px-3 py-2"
                id="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-100 py-2 fw-medium shadow-sm transition-base d-flex justify-content-center align-items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Sending Link...
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-muted small mb-0">
              Remember your password?{" "}
              <Link to="/login" className="text-primary fw-medium text-decoration-none">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
