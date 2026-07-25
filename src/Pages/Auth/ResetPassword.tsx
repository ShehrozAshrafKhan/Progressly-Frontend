import axios from "axios";
import React, { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import config from "../../config";
import { ShowMessage } from "../../Components/Common/ShowMessage";
import logo100 from "../../assets/logo100.png";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!email || !token) {
      ShowMessage(2, "Reset parameters are missing or invalid.");
      return;
    }

    if (formData.newPassword.length < 6) {
      ShowMessage(2, "Password must be at least 6 characters long.");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      ShowMessage(2, "Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const url = `${config.baseUrl}Auth/reset-password`;
      const response = await axios.post(url, {
        email: email,
        token: token,
        newPassword: formData.newPassword,
      });

      const result = response.data.result;
      if (!result.succeeded && result.errors.length > 0) {
        ShowMessage(2, result.errors[0]);
      } else {
        ShowMessage(1, "Password reset successfully. You can now login.");
        navigate("/login");
      }
    } catch (e: any) {
      ShowMessage(2, e.message || "Failed to reset password.");
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
            <p className="text-muted small">Choose a secure new password for your account.</p>
          </div>

          {!email || !token ? (
            <div className="alert alert-danger small py-2 text-center" role="alert">
              Invalid or expired password reset link. Please request a new link.
              <div className="mt-3">
                <Link to="/forgot-password" className="btn btn-sm btn-outline-danger">
                  Forgot Password Page
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label text-dark fw-medium small mb-1">
                  Email Account
                </label>
                <input
                  type="text"
                  className="form-control bg-light border-0 px-3 py-2 text-muted"
                  value={email}
                  readOnly
                  disabled
                />
              </div>

              <div className="mb-3">
                <label htmlFor="newPassword" className="form-label text-dark fw-medium small mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  className="form-control bg-light-soft border-0 px-3 py-2"
                  id="newPassword"
                  name="newPassword"
                  placeholder="At least 6 characters"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="mb-4">
                <label htmlFor="confirmPassword" className="form-label text-dark fw-medium small mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  className="form-control bg-light-soft border-0 px-3 py-2"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Repeat new password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
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
                    <span className="spinner-border spinner-border-sm role-status me-2" aria-hidden="true"></span>
                    Saving Password...
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
