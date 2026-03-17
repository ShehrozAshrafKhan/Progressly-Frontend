import { useState, useEffect } from "react";
import config from "../../config";
import axios from "axios";
import { ShowMessage } from "../../Components/Common/ShowMessage";
import { useParams,useNavigate  } from "react-router-dom";
import { IoMdArrowRoundBack } from "react-icons/io";
import Layout from "../../layouts/Layout";

const EditProject = () => {
  const navigate = useNavigate();
const handleBack = () => {
  navigate("/admin/projects");
};
  let params = useParams();
  params.projectId;
  const [formData, setFormData] = useState({
    projectName: "",
    description: "",
    isActive: false,
  });

  useEffect(() => {
    handleGetProject();
  }, []);

  const handleGetProject = async () => {
    try {
      const url = `${config.baseUrl}Projects/GetProjectById?projectId=${params.projectId}`;
      const response = await axios.get(url);
      if (
        response?.data?.result?.succeeded === false &&
        response.data.result.errors?.length > 0
      ) {
        ShowMessage(2, response.data.result.errors[0]);
      } else if (response?.data?.result?.succeeded === true) {
        setFormData(response.data.data);
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
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? !formData.isActive : value,
    }));
  };

  const handleClear = () => {
    setFormData({
      projectName: "",
      description: "",
      isActive: false,
    });
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    try {
      const url = `${config.baseUrl}Projects/UpdateProject`;
      const response = await axios.patch(url, formData);
      if (
        response.data.result.succeeded === false &&
        response.data.result.errors.length > 0
      ) {
        ShowMessage(2, response.data.result.errors[0]);
      } else if (response.data.result.succeeded === true) {
        ShowMessage(1, "Updated Successfully");
        handleClear();
      } else {
        ShowMessage(2, "Something went wrong while Add project.");
      }
    } catch (err: any) {
      ShowMessage(2, err.message || "Something went wrong while Add project.");
    }
  };
  return (
    <Layout>
      <div className="d-flex align-items-center mb-4 gap-3">
        <button 
          onClick={handleBack} 
          className="btn btn-light border rounded-circle d-flex align-items-center justify-content-center shadow-sm transition-base hover-bg-light"
          style={{ width: '40px', height: '40px', padding: 0 }}
          title="Back to Projects"
        >
          <IoMdArrowRoundBack fontSize={20} className="text-secondary" />
        </button>
        <div>
          <h2 className="mb-0 fw-bold text-dark">Edit Project</h2>
          <p className="text-muted mb-0 small">Update existing project details.</p>
        </div>
      </div>

      <div className="row">
        <div className="col-12 col-xl-10">
          <div className="card border-0 shadow-sm rounded-lg overflow-hidden">
            <div className="card-header bg-white border-bottom py-3 px-4">
              <h5 className="mb-0 fw-semibold text-dark">Project Information</h5>
            </div>
            <form className="form" onSubmit={handleSubmit}>
              <div className="card-body p-4">
                <div className="row g-4 mb-4">
                  <div className="col-md-6">
                    <label htmlFor="projectName" className="form-label fw-medium text-dark small mb-1">
                      Project Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control bg-light-soft border-0 px-3 py-2"
                      name="projectName"
                      id="projectName"
                      placeholder="Enter project name"
                      value={formData.projectName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="description" className="form-label fw-medium text-dark small mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      className="form-control bg-light-soft border-0 px-3 py-2"
                      name="description"
                      id="description"
                      placeholder="Brief description of the project"
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-12">
                    <div className="p-3 bg-light-soft rounded border d-flex justify-content-between align-items-center">
                      <div>
                        <p className="mb-0 fw-medium text-dark">Project Status</p>
                        <p className="mb-0 small text-muted">Toggle to set the project as active or inactive.</p>
                      </div>
                      <div className="form-check form-switch m-0 d-flex align-items-center">
                        <input
                          className="form-check-input cursor-pointer"
                          type="checkbox"
                          role="switch"
                          name="isActive"
                          checked={formData.isActive}
                          onChange={handleInputChange}
                          id="isActiveSwitch"
                          style={{ 
                            width: "2.5rem", 
                            height: "1.25rem",
                            backgroundColor: formData.isActive ? 'var(--bs-primary)' : '',
                            borderColor: formData.isActive ? 'var(--bs-primary)' : ''
                          }}
                        />
                        <label className="form-check-label ms-2 small fw-medium" htmlFor="isActiveSwitch">
                          <span className={formData.isActive ? 'text-primary' : 'text-muted'}>
                            {formData.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card-footer bg-light-soft border-top py-3 px-4 d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-light border px-4 shadow-sm" onClick={handleClear}>
                  Reset
                </button>
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

export default EditProject;
