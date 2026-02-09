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
        
      <div className="container mt-4 py-5 d-flex justify-content-center align-items-center">
        <form className="bg-white card shadow rounded p-4"  style={{ width: "100%", maxWidth: "500px" }} onSubmit={handleSubmit}>
          <h2 className="mb-5 text-center">New User</h2>
          <div className="mb-3">
            <label className="form-label fw-bold">First Name</label>
            <input
              type="text"
              name="firstName"
              className="form-control"
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-bold">Last Name</label>
            <input
              type="text"
              name="lastName"
              className="form-control"
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold">Role</label>
            <select
              name="role"
              className="form-select"
              value={formData.role}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Role</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold" htmlFor="projectId">
              Projects
            </label>
            <select
              name="projectId"
              id="projectId"
              className="form-select"
              value={formDataProjectAssignee.projectId}
              onChange={handleProjectInputChange}
            >
              <option value=""> Select Project </option>
              {projectsData.map((item) => (
                <option key={item.projectId} value={item.projectId}>
                  {item.projectName}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Add User
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default AddNewUser;
