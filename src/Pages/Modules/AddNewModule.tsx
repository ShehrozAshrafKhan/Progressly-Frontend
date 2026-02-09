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
      <div className="card shadow-sm p-5">
        <div className="d-flex gap-3 align-items-center mb-3">
          <IoMdArrowRoundBack fontSize={30} onClick={handleBack} className="cursor-pointer" />
          <h2 className="">Add Module</h2>
        </div>
        <form className="form" onSubmit={handleSubmit}>
          <div className="p-5 border rounded-3 card shadow-sm">
            <div className="row g-3 align-items-center">
              <div className="col-md-4">
                <label htmlFor="moduleName">Module Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="moduleName"
                  id="moduleName"
                  value={formData.moduleName}
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

              <div className="col-md-4">
                <label htmlFor="projectId">Projects</label>
                <select
                  name="projectId"
                  id="projectId"
                  className="form-select"
                  value={formData.projectId}
                  onChange={handleInputChange}
                >
                  <option value=""> Select Project </option>
                  {projectsData.map((item) => (
                    <option key={item.projectId} value={item.projectId}>
                      {item.projectName}
                    </option>
                  ))}
                </select>
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

export default AddNewModule;
