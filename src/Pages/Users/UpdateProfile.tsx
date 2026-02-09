import React, { useRef, useState, useEffect } from "react";
import { MdEdit } from "react-icons/md";
import { ShowMessage } from "../../Components/Common/ShowMessage";
import config from "../../config";
import axios from "axios";
import { useUser } from "../../contexts/UserContext";
import Layout from "../../layouts/Layout";

const dummyAvatar =
  "https://ui-avatars.com/api/?name=User&background=random&size=128";

const UpdateProfile = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { user, setUser } = useUser();
  console.log(user);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    profileImage: null as File | null,
    imagePreview: "",
  });

  useEffect(() => {
    handleGetUserInfo();
  }, []);

  const handleGetUserInfo = async () => {
    try {
      const url = `${config.baseUrl}Users/GetUserInfo`;
      const response = await axios.get(url);
      if (response.data?.result?.succeeded) {
           const userInfo = response.data.data;
      setFormData((prev) => ({
        ...prev,
        ...userInfo,
        imagePreview: "", // reset preview
        profileImage: null, // reset file input
      }));
      }
    } catch (err: any) {
      ShowMessage(2, err.message || "Error while fetching user details");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password != formData.confirmPassword) {
      ShowMessage(2, "Passwprd not match!");
      return;
    }
    const form = new FormData();
    form.append("fullName", formData.fullName);
    form.append("email", formData.email);
    form.append("password", formData.password);
    form.append("phoneNumber", formData.phoneNumber);

    if (formData.profileImage) {
      form.append("profileImage", formData.profileImage);
    }

    const url = `${config.baseUrl}Auth/UpdateProfile`;
    const response = await axios.patch(url, form);
    if (response.data.result?.succeeded) {
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
      setUser((prevUser) => ({
        ...prevUser!,
        profileImage: profileImageWithMime,
      }));

      ShowMessage(1, "Updated Successfully");
    } else {
      ShowMessage(2, response.data.result.errors[0]);
    }
    console.log("Submitting", formData);
  };
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          profileImage: file,
          imagePreview: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Layout>
      <div className="container py-5 d-flex justify-content-center align-items-center">
        <div
          className="card p-4 shadow"
          style={{ width: "100%", maxWidth: "500px" }}
        >
          <div className="text-center position-relative mb-4">
            <img
              src={
                formData.imagePreview === ""
                  ? user?.profileImage || dummyAvatar
                  : formData.imagePreview
              }
              alt="Profile"
              className="rounded-circle"
              width="120"
              height="120"
              style={{
                objectFit: "cover",
                border: "4px solid #dee2e6",
                cursor: "pointer",
              }}
              onClick={handleImageClick}
            />

            <div
              className="position-absolute"
              style={{
                bottom: 0,
                right: "calc(50% - 60px)", // centers the icon relative to image
                backgroundColor: "#007bff",
                borderRadius: "50%",
                padding: "6px",
                width: "40px",
                cursor: "pointer",
                border: "2px solid white",
              }}
              onClick={handleImageClick}
            >
              <MdEdit color="white" />
            </div>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="d-none"
            />
          </div>

          <h4 className="text-center mb-4">Update Profile</h4>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="fullName"
                className="form-control"
                placeholder="Enter full name"
                value={formData.fullName}
                onChange={handleInputChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="Enter email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Phone No</label>
              <input
                type="text"
                name="phoneNumber"
                className="form-control"
                placeholder="Enter Phone Number"
                value={formData.phoneNumber}
                onChange={handleInputChange}
              />
            </div>

            <div className="d-flex row">
              <div className="mb-4 col-md-6">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-control"
                  placeholder="Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-4 col-md-6">
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  placeholder="Confirm Password"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="d-grid">
              <button type="submit" className="btn btn-primary">
                Update Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default UpdateProfile;
