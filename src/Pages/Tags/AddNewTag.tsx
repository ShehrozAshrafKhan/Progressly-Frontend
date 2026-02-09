import React, { useState } from "react";
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
      <div className="card shadow-sm p-5">
        <div className="d-flex gap-3 align-items-center mb-3">
          <IoMdArrowRoundBack fontSize={30} onClick={handleBack} className="cursor-pointer"/>
          <h2 className="">Add Tag</h2>
        </div>
        <form className="form" onSubmit={handleSubmit}>
          <div className="p-5 border rounded-3 card shadow-sm">
            <div className="row g-3 align-items-center">
              <div className="col-md-4">
                <label htmlFor="tagName">Tag Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="tagName"
                  id="tagName"
                  value={formData.tagName}
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

export default AddNewTag;
