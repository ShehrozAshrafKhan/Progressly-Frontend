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
      <div className="card shadow-sm p-5">
        <div className="d-flex gap-3 align-items-center mb-3">
        <IoMdArrowRoundBack fontSize={30} onClick={handleBack} className="cursor-pointer"/>
        <h2 className="">Edit Tag</h2>
        </div>
        <form className="from" onSubmit={handleSubmit}>
          <div className="p-5 border rounded-3 card shadow-sm">
            <div className="row g-3 align-items-center">
              <div className="col-md-4">
                <label htmlFor="tagName" className="form-label">
                  Tag Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="tagName"
                  id="tagName"
                  value={formData.tagName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="col-md-4 d-flex align-items-center">
                <div className="form-check form-switch mt-4">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    id="isActiveSwitch"
                    style={{ width: "3rem", height: "1.5rem" }}
                  />

                  <label
                    className="form-check-label ms-2"
                    htmlFor="isActiveSwitch"
                  >
                    Active
                  </label>
                </div>
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

export default EditTag;

