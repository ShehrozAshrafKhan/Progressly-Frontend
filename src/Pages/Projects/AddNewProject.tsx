import React, { useState } from "react";
import { ShowMessage } from "../../Components/Common/ShowMessage";
import axios from "axios";
import config from "../../config";
import { useNavigate } from "react-router-dom";
import { IoMdArrowRoundBack } from "react-icons/io";
import Layout from "../../layouts/Layout";

const AddNewProject = () => {
  const navigate = useNavigate();
  const handleBack = () => {
    navigate("/admin/projects");
  };
  const [formData, setFormData] = useState({
    projectName: "",
    description: "",
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
      projectName: "",
      description: "",
    });
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    try {
      const url = `${config.baseUrl}Projects/SaveProject`;
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
        ShowMessage(2, "Something went wrong while Add project.");
      }
    } catch (err: any) {
      ShowMessage(2, err.message || "Something went wrong while Add project.");
    }
  };
  return (
    <Layout>
      <div className="card shadow-sm p-5">
        <div className="d-flex gap-3 align-items-center mb-3">
          <IoMdArrowRoundBack fontSize={30} onClick={handleBack} className="cursor-pointer"/>
          <h2 className="">Add Project</h2>
        </div>
        <form className="form" onSubmit={handleSubmit}>
          <div className="p-5 border rounded-3 card shadow-sm">
            <div className="row g-3 align-items-center">
              <div className="col-md-4">
                <label htmlFor="projectName">Project Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="projectName"
                  id="projectName"
                  value={formData.projectName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="col-md-4">
                <label htmlFor="description">Description</label>
                <input
                  type="text"
                  className="form-control"
                  name="description"
                  id="description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="d-flex mt-4 justify-content-end">
              <button className="btn btn-primary px-5" type="submit">
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AddNewProject;
