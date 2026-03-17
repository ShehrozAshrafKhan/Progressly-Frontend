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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1 fw-bold text-dark">Profile Settings</h2>
          <p className="text-muted mb-0">Update your personal information and profile picture.</p>
        </div>
      </div>

      <div className="row justify-content-center">
        <div className="col-12 col-xl-8">
          <div className="card border-0 shadow-sm rounded-lg overflow-hidden">
            <div className="card-header bg-white border-bottom py-3 px-4">
              <h5 className="mb-0 fw-semibold text-dark">Personal Details</h5>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="card-body p-4 p-md-5">
                <div className="d-flex flex-column align-items-center mb-5 pb-3 border-bottom">
                  <div className="position-relative">
                    <img
                      src={
                        formData.imagePreview === ""
                          ? user?.profileImage || dummyAvatar
                          : formData.imagePreview
                      }
                      alt="Profile"
                      className="rounded-circle shadow-sm"
                      width="130"
                      height="130"
                      style={{
                        objectFit: "cover",
                        border: "4px solid #fff",
                        backgroundColor: "#f8f9fa",
                      }}
                    />

                    <div
                      className="position-absolute d-flex align-items-center justify-content-center transition-base hover-scale"
                      style={{
                        bottom: "5px",
                        right: "5px",
                        backgroundColor: "var(--bs-primary)",
                        borderRadius: "50%",
                        width: "36px",
                        height: "36px",
                        cursor: "pointer",
                        border: "3px solid white",
                        boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
                      }}
                      onClick={handleImageClick}
                      title="Update Avatar"
                    >
                      <MdEdit color="white" size={16} />
                    </div>

                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      className="d-none"
                    />
                  </div>
                  <div className="mt-3 text-center">
                    <h5 className="fw-bold text-dark mb-1">{formData.fullName || "Your Name"}</h5>
                    <p className="text-muted small mb-0">{user?.roles?.[0] || "User"}</p>
                  </div>
                </div>

                <div className="row g-4">
                  <div className="col-md-6">
                    <label className="form-label fw-medium text-dark small mb-1">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      className="form-control bg-light-soft border-0 px-3 py-2"
                      placeholder="Enter full name"
                      value={formData.fullName}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-medium text-dark small mb-1">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control bg-light-soft border-0 px-3 py-2"
                      placeholder="Enter email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="col-md-12">
                    <label className="form-label fw-medium text-dark small mb-1">Phone Number</label>
                    <input
                      type="text"
                      name="phoneNumber"
                      className="form-control bg-light-soft border-0 px-3 py-2"
                      placeholder="Enter phone number"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="col-12 mt-4 mb-2">
                     <h6 className="fw-semibold text-dark border-bottom pb-2">Change Password</h6>
                     <p className="small text-muted mb-0">Leave blank if you don't want to change your password.</p>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-medium text-dark small mb-1">New Password</label>
                    <input
                      type="password"
                      name="password"
                      className="form-control bg-light-soft border-0 px-3 py-2"
                      placeholder="New password"
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label fw-medium text-dark small mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      className="form-control bg-light-soft border-0 px-3 py-2"
                      placeholder="Confirm new password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
              <div className="card-footer bg-light-soft border-top py-3 px-4 d-flex justify-content-end gap-2">
                <button type="submit" className="btn btn-primary px-4 shadow-sm">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UpdateProfile;
