import  { useState, useEffect } from "react";
import { ShowMessage } from "../../Components/Common/ShowMessage";
import axios from "axios";
import config from "../../config";
import { useNavigate } from "react-router-dom";
import { IoMdArrowRoundBack } from "react-icons/io";
import Layout from "../../layouts/Layout";

type Project = {
  projectId: string;
  projectName: string;
  description: string;
  isActive: boolean;
};

const AddNewModule = () => {
  const [projectsData, setProjectsData] = useState<Project[]>([]);
  const navigate = useNavigate();
  const handleBack = () => {
    navigate("/admin/modules");
  };
  const [formData, setFormData] = useState({
    moduleName: "",
    description: "",
    projectId: "",
  });

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
  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClear = () => {
    setFormData({
      moduleName: "",
      description: "",
      projectId: "",
    });
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    try {
      const url = `${config.baseUrl}Modules/SaveModule`;
      const response = await axios.post(url, formData);
      if (
        response.data.result.succeeded === false &&
        response.data.result.errors.length > 0
      ) {
        ShowMessage(2, response.data.result.errors[0]);
      } else if (response.data.result.succeeded === true) {
        ShowMessage(1, "Added Successfully");
        handleClear();
      } else {
        ShowMessage(2, "Something went wrong while Add Module.");
      }
    } catch (err: any) {
      ShowMessage(2, err.message || "Something went wrong while Add Module.");
    }
  };
  return (
    <Layout>
      <div className="d-flex align-items-center mb-4 gap-3">
        <button 
          onClick={handleBack} 
          className="btn btn-light border rounded-circle d-flex align-items-center justify-content-center shadow-sm transition-base hover-bg-light"
          style={{ width: '40px', height: '40px', padding: 0 }}
          title="Back to Modules"
        >
          <IoMdArrowRoundBack fontSize={20} className="text-secondary" />
        </button>
        <div>
          <h2 className="mb-0 fw-bold text-dark">Add Module</h2>
          <p className="text-muted mb-0 small">Create a new module and attach it to a project.</p>
        </div>
      </div>

      <div className="row">
        <div className="col-12 col-xl-10">
          <div className="card border-0 shadow-sm rounded-lg overflow-hidden">
            <div className="card-header bg-white border-bottom py-3 px-4">
              <h5 className="mb-0 fw-semibold text-dark">Module Details</h5>
            </div>
            <form className="form" onSubmit={handleSubmit}>
              <div className="card-body p-4">
                <div className="row g-4">
                  <div className="col-md-4">
                    <label htmlFor="moduleName" className="form-label fw-medium text-dark small mb-1">
                      Module Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control bg-light-soft border-0 px-3 py-2"
                      name="moduleName"
                      id="moduleName"
                      placeholder="Enter module name"
                      value={formData.moduleName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="col-md-4">
                    <label htmlFor="description" className="form-label fw-medium text-dark small mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      className="form-control bg-light-soft border-0 px-3 py-2"
                      name="description"
                      id="description"
                      placeholder="Brief description"
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="col-md-4">
                    <label htmlFor="projectId" className="form-label fw-medium text-dark small mb-1">
                      Project <span className="text-danger">*</span>
                    </label>
                    <select
                      name="projectId"
                      id="projectId"
                      className="form-select bg-light-soft border-0 px-3 py-2"
                      value={formData.projectId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="" disabled>Select Project</option>
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
                <button type="button" className="btn btn-light border px-4 shadow-sm" onClick={handleClear}>
                  Clear
                </button>
                <button type="submit" className="btn btn-primary px-4 shadow-sm">
                  Save Module
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AddNewModule;
