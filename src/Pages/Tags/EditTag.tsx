import { useState, useEffect } from "react";
import config from "../../config";
import axios from "axios";
import { ShowMessage } from "../../Components/Common/ShowMessage";
import { useParams,useNavigate  } from "react-router-dom";
import { IoMdArrowRoundBack } from "react-icons/io";
import Layout from "../../layouts/Layout";

const EditTag = () => {

 const navigate = useNavigate();
 const handleBack = () => {
   navigate("/admin/tags");
 };
  let params = useParams();
  params.tagId;
  const [formData, setFormData] = useState({
    tagName: "",
    isActive: false,
  });

  useEffect(() => {
    handleGetTag();
  }, []);

  const handleGetTag = async () => {
    try {
      const url = `${config.baseUrl}Tags/GetTagById?tagId=${params.tagId}`;
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
        ShowMessage(2, "No Tag data found.");
      }
    } catch (e: any) {
      ShowMessage(
        2,
        e.message || "Something went wrong while fetching Tag."
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
      tagName: "",
      isActive: false,
    });
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    try {
      const url = `${config.baseUrl}Tags/UpdateTag`;
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
          <h2 className="mb-0 fw-bold text-dark">Edit Tag</h2>
          <p className="text-muted mb-0 small">Update existing tag details.</p>
        </div>
      </div>

      <div className="row">
        <div className="col-12 col-xl-8">
          <div className="card border-0 shadow-sm rounded-lg overflow-hidden">
            <div className="card-header bg-white border-bottom py-3 px-4">
              <h5 className="mb-0 fw-semibold text-dark">Tag Information</h5>
            </div>
            <form className="form" onSubmit={handleSubmit}>
              <div className="card-body p-4">
                <div className="row g-4 mb-4">
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

                <div className="row">
                  <div className="col-12">
                     <div className="p-3 bg-light-soft rounded border d-flex justify-content-between align-items-center">
                        <div>
                           <p className="mb-0 fw-medium text-dark">Tag Status</p>
                           <p className="mb-0 small text-muted">Toggle to set the tag as active or inactive.</p>
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

export default EditTag;

