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
    <div className="bg-light min-vh-100 d-flex justify-content-center align-items-center">
      <div
        className="card p-4 shadow-lg"
        style={{ width: "100%", maxWidth: "400px" }}
      >
        <div className="d-flex justify-content-center align-items-center mb-3">
          <img className="text-center" src={logo100} alt="" />
          <h2 style={{fontWeight:700}}>Progressly</h2>
        </div>

        <div className="mb-3">
          <label htmlFor="userId" className="form-label">
            Email or Number
          </label>
          <input
            type="text"
            className="form-control"
            id="userId"
            placeholder="Enter your Email or Number"
            value={formData.userId}
            onChange={handleInputChange}
            name="userId"
          />
        </div>

        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            className="form-control"
            id="password"
            placeholder="Enter your Password"
            value={formData.password}
            onChange={handleInputChange}
            name="password"
          />
        </div>

        <button onClick={handleSubmit} className="btn btn-primary w-100">
          Login
        </button>

        
      </div>
    </div>
  );
};

export default Login;
