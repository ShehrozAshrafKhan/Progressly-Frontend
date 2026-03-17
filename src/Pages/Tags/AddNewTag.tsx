import { useState } from "react";
import { ShowMessage } from "../../Components/Common/ShowMessage";
import axios from "axios";
import config from "../../config";
import { useNavigate } from "react-router-dom";
import { IoMdArrowRoundBack } from "react-icons/io";
import Layout from "../../layouts/Layout";

const AddNewTag = () => {
  const navigate = useNavigate();
  const handleBack = () => {
    navigate("/admin/tags");
  };
  const [formData, setFormData] = useState({
    tagName: ""
  });

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClear = () => {
    setFormData({
      tagName: ""
    });
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    try {
      const url = `${config.baseUrl}Tags/SaveTag`;
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
        ShowMessage(2, "Something went wrong while Add Tag.");
      }
    } catch (err: any) {
      ShowMessage(2, err.message || "Something went wrong while Add Tag.");
    }
  };
  return (
    <Layout>
      <div className="d-flex align-items-center mb-4 gap-3">
        <button 
          onClick={handleBack} 
          className="btn btn-light border rounded-circle d-flex align-items-center justify-content-center shadow-sm transition-base hover-bg-light"
          style={{ width: '40px', height: '40px', padding: 0 }}
          title="Back to Tags"
        >
          <IoMdArrowRoundBack fontSize={20} className="text-secondary" />
        </button>
        <div>
          <h2 className="mb-0 fw-bold text-dark">Add Tag</h2>
          <p className="text-muted mb-0 small">Create a new tag for system categorization.</p>
        </div>
      </div>

      <div className="row">
        <div className="col-12 col-xl-8">
          <div className="card border-0 shadow-sm rounded-lg overflow-hidden">
            <div className="card-header bg-white border-bottom py-3 px-4">
              <h5 className="mb-0 fw-semibold text-dark">Tag Details</h5>
            </div>
            <form className="form" onSubmit={handleSubmit}>
              <div className="card-body p-4">
                <div className="row g-4">
                  <div className="col-md-12">
                    <label htmlFor="tagName" className="form-label fw-medium text-dark small mb-1">
                      Tag Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control bg-light-soft border-0 px-3 py-2"
                      name="tagName"
                      id="tagName"
                      placeholder="e.g. Urgent, Frontend, Bug"
                      value={formData.tagName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="card-footer bg-light-soft border-top py-3 px-4 d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-light border px-4 shadow-sm" onClick={handleClear}>
                  Clear
                </button>
                <button type="submit" className="btn btn-primary px-4 shadow-sm">
                  Save Tag
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AddNewTag;
