import React, { useState, useEffect } from "react";
import { CiEdit } from "react-icons/ci";
import { ShowMessage } from "../../Components/Common/ShowMessage";
import config from "../../config";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Layout from "../../layouts/Layout";

type Project = {
  projectId: string;
  projectName: string;
  description: string;
  isActive: boolean;
};
const Projects = () => {
  const navigate = useNavigate();
  const [tblData, setTblData] = useState<Project[]>([]);

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
        setTblData(response.data.data);
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

  const handleAddNewProject=()=>{
    navigate("/admin/addNewProject");
  }

  const handleEdit=(projectId:string)=>{
     navigate(`/admin/editProject/${projectId}`);
  }

  const handleInputChange = (projectId: string) => {
    const updatedData = tblData.map((item) =>
      item.projectId === projectId
        ? { ...item, isActive: !item.isActive }
        : item
    );
    setTblData(updatedData);
    const updatedObj = updatedData.find((x) => x.projectId === projectId);
    handleSubmit(updatedObj);
  };

  const handleSubmit = async (updatedObj: any) => {
    try {
      console.log(updatedObj);
      const url = `${config.baseUrl}Projects/UpdateProject`;
      const response = await axios.patch(url, updatedObj);
      if (
        response.data.result.succeeded === false &&
        response.data.result.errors.length > 0
      ) {
        ShowMessage(2, response.data.result.errors[0]);
      } else if (response.data.result.succeeded === true) {
        ShowMessage(1, "Status Updated Successfully");
      } else {
        ShowMessage(2, "Something went wrong while saving");
      }
    } catch (err: any) {
      ShowMessage(2, err.message || "Something went wrong while saving");
    }
  };
const handlePrintProject = async () => {
  try {
    const response = await axios.get(`${config.baseUrl}Reports/ProjectsReport`, {
      responseType: "blob", 
    });
    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    window.open(url, "_blank");

    setTimeout(() => window.URL.revokeObjectURL(url), 10000);
  } catch (error) {
    ShowMessage(2,"Failed to generate report.");
  }
};


  return (
    <Layout>
      <h1>Projects</h1>
       <div className="d-grid gap-2 d-md-flex justify-content-md-end mb-2">
          <button className="btn btn-primary me-md-2" type="button" onClick={handlePrintProject}>
            Print
          </button>
          <button className="btn btn-success me-md-2" type="button" onClick={handleAddNewProject}>
            Add New
          </button>
        </div>
      <div className="card mt-3">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {tblData.map((item, index) => (
                  <tr key={item.projectId || index}>
                    <td>{item.projectName}</td>
                    <td>{item.description}</td>
                    <td>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input cursor-pointer"
                          type="checkbox"
                          role="switch"
                          id={`flexSwitchCheckChecked-${index}`}
                          checked={item.isActive}
                          style={{ width: "3rem", height: "1.5rem" }}
                          onChange={() => handleInputChange(item.projectId)}
                        />
                      </div>
                    </td>
                    <td>
                      <CiEdit
                        fontSize={25}
                        className="cursor-pointer"
                        onClick={() => handleEdit(item.projectId)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Projects;
