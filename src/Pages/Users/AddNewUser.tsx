import React, { useState, useEffect } from "react";
import { ShowMessage } from "../../Components/Common/ShowMessage";
import axios from "axios";
import config from "../../config";
import Layout from "../../layouts/Layout";

type Project = {
  projectId: string;
  projectName: string;
  description: string;
  isActive: boolean;
};

const AddNewUser = () => {
  const [projectsData, setProjectsData] = useState<Project[]>([]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "",
  });
  const [formDataProjectAssignee, setFormDataProjectAssignee] = useState({
    userId: "",
    projectId: "",
  });

  const roles = ["ADMIN", "MANAGER", "USER"];
  useEffect(() => {
    handleGetProjects();
  }, []);

  const handleGetProjects = async () => {
    try {
      const url = `${config.baseUrl}Projects/GetProjects`;
      const response = await axios.get(url);

      if (
        response?.data?.result?.succeeded === false &&
        response.data.result.errors?.length > 0
      ) {
        ShowMessage(2, response.data.result.errors[0]);
      } else if (response?.data?.result?.succeeded === true) {
        setProjectsData(response.data.data);
        console.log(response.data.data);
      } else {
        console.log(response.data.data);
        ShowMessage(2, "No project data found.");
      }
    } catch (e: any) {
      ShowMessage(
        2,
        e.message || "Something went wrong while fetching projects."
      );
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleProjectInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormDataProjectAssignee((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${config.baseUrl}Auth/register`,
        formData
      );
      if (response.data?.result?.succeeded) {
        ShowMessage(1, "User added successfully!");
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          role: "",
        });
        const userId = response.data.data.userId;
        console.log(userId);
        if (userId && formDataProjectAssignee.projectId) {
          setFormDataProjectAssignee((prev) => ({
            ...prev,
            userId: userId,
          }));
        const projectAssigneeData = {
          ...formDataProjectAssignee,
          userId: userId,
        };
          const projectAssigneeUrl = `${config.baseUrl}ProjectAssignee/SaveProjectAssignee`;
          const projectAssigneeResponse = await axios.post(
            projectAssigneeUrl,
            projectAssigneeData
          );
          if (projectAssigneeResponse.data?.result?.succeeded) {
            ShowMessage(1, "Project added successfully!");
          }
        }
        setFormDataProjectAssignee({ userId: "", projectId: "" });
      } else {
        ShowMessage(
          2,
          response.data?.result?.errors?.[0] || "Failed to add user"
        );
      }
    } catch (error: any) {
      ShowMessage(
        2,
        error?.response?.data?.result?.errors?.[0] || "Error occurred"
      );
    }
  };

  return (
    <Layout>
      <div className="d-flex align-items-center mb-4 gap-3">
        <div>
          <h2 className="mb-0 fw-bold text-dark">Add New User</h2>
          <p className="text-muted mb-0 small">Create a new user account and assign roles and projects.</p>
        </div>
      </div>

      <div className="row justify-content-center">
        <div className="col-12 col-xl-8">
          <div className="card border-0 shadow-sm rounded-lg overflow-hidden">
            <div className="card-header bg-white border-bottom py-3 px-4">
              <h5 className="mb-0 fw-semibold text-dark">User Information</h5>
            </div>
            <form className="form" onSubmit={handleSubmit}>
              <div className="card-body p-4">
                <div className="row g-4">
                  <div className="col-md-6">
                    <label className="form-label fw-medium text-dark small mb-1">First Name <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      name="firstName"
                      className="form-control bg-light-soft border-0 px-3 py-2"
                      placeholder="e.g. John"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-medium text-dark small mb-1">Last Name <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      name="lastName"
                      className="form-control bg-light-soft border-0 px-3 py-2"
                      placeholder="e.g. Doe"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-medium text-dark small mb-1">Email <span className="text-danger">*</span></label>
                    <input
                      type="email"
                      name="email"
                      className="form-control bg-light-soft border-0 px-3 py-2"
                      placeholder="john.doe@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-medium text-dark small mb-1">Password <span className="text-danger">*</span></label>
                    <input
                      type="password"
                      name="password"
                      className="form-control bg-light-soft border-0 px-3 py-2"
                      placeholder="Secure password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="col-12 mt-4 mb-2">
                     <h6 className="fw-semibold text-dark border-bottom pb-2">Assignments</h6>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-medium text-dark small mb-1">Role <span className="text-danger">*</span></label>
                    <select
                      name="role"
                      className="form-select bg-light-soft border-0 px-3 py-2"
                      value={formData.role}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="" disabled>Select Role</option>
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-medium text-dark small mb-1" htmlFor="projectId">
                      Assign to Project
                    </label>
                    <select
                      name="projectId"
                      id="projectId"
                      className="form-select bg-light-soft border-0 px-3 py-2"
                      value={formDataProjectAssignee.projectId}
                      onChange={handleProjectInputChange}
                    >
                      <option value="">Select Project</option>
                      {projectsData.map((item) => (
                        <option key={item.projectId} value={item.projectId}>
                          {item.projectName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="card-footer bg-light-soft border-top py-3 px-4 d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-light border px-4 shadow-sm" onClick={() => {
                   setFormData({ firstName: "", lastName: "", email: "", password: "", role: "" });
                   setFormDataProjectAssignee({ userId: "", projectId: "" });
                }}>
                  Clear
                </button>
                <button type="submit" className="btn btn-primary px-4 shadow-sm">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AddNewUser;
