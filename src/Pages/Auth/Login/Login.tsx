import axios from "axios";
import React, { useEffect, useState } from "react";
import config from "../../../config";
import Cookies from "js-cookie";
import { ShowMessage } from "../../../Components/Common/ShowMessage";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../contexts/UserContext";
import { jwtDecode } from "jwt-decode";
import logo100 from "../../../assets/logo100.png";

const Login = () => {
  const navigate = useNavigate();
  const { user,setUser } = useUser();
  const [formData, setFormData] = useState({
    userId: "",
    password: "",
  });
  useEffect(() => {
  if (user) {
    navigate("/dashboard");
  }
}, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

 const handleSubmit = async (event: any) => {
    event.preventDefault();
    try {
      const url = `${config.baseUrl}Auth/login`;
      const response = await axios.post(url, formData);

      const result = response.data.result;
      if (!result.succeeded && result.errors.length > 0) {
        ShowMessage(2, result.errors[0]);
      } else {
        const token = response.data.data.token;
        if (token) {
          Cookies.set("token", token, { expires: 1 });
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          const data = response.data.data;

          const profileUrl = `${config.baseUrl}Auth/GetProfileImage`;
          const ProfileResponse = await axios.get(profileUrl, {
            responseType: "arraybuffer",
          });

          const base64 = btoa(
            new Uint8Array(ProfileResponse.data).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              ""
            )
          );
          const profileImageWithMime = `data:image/jpeg;base64,${base64}`;
          console.log(profileImageWithMime);

          localStorage.setItem("token", token);

          const decoded: any = jwtDecode(token);

          const roles =
            decoded[
              "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
            ];

          const userRoles = Array.isArray(roles) ? roles : [roles];
          console.log(userRoles);
          setUser({
            userId: data.userId ?? "",
            name: data.userName,
            profileImage: profileImageWithMime,
            token: data.token,
            roles: userRoles,
          });

          ShowMessage(1, "Login Success");
          navigate("/dashboard");
        } else {
          console.log("Token missing in response");
          ShowMessage(2, "Token not found");
        }
      }
    } catch (e: any) {
      ShowMessage(2, e.message || "Login failed");
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
            <p className="text-muted small">Welcome back! Please enter your details.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="userId" className="form-label text-dark fw-medium small mb-1">
                Email or Number
              </label>
              <input
                type="text"
                className="form-control bg-light-soft border-0 px-3 py-2"
                id="userId"
                placeholder="Enter your email or number"
                value={formData.userId}
                onChange={handleInputChange}
                name="userId"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="form-label text-dark fw-medium small mb-1 d-flex justify-content-between">
                <span>Password</span>
                <a href="#" className="text-primary text-decoration-none" style={{ fontSize: '0.8rem' }}>Forgot password?</a>
              </label>
              <input
                type="password"
                className="form-control bg-light-soft border-0 px-3 py-2"
                id="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                name="password"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-100 py-2 fw-medium shadow-sm transition-base">
              Sign in
            </button>
          </form>
          
          <div className="mt-4 text-center">
            <p className="text-muted small mb-0">
              Don't have an account? <a href="#" className="text-primary fw-medium text-decoration-none">Sign up</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
