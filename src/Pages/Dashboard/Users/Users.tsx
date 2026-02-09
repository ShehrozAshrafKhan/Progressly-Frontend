import React, { useState, useEffect } from "react";
import { CiEdit } from "react-icons/ci";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import config from "../../../config";
import { ShowMessage } from "../../../Components/Common/ShowMessage";
import Layout from "../../../layouts/Layout";

type User = {
  userId: string;
  userName: string;
  email: string;
  isActive: boolean;
  role:string;
};
const Users = () => {
  const navigate = useNavigate();
  const [tblData, setTblData] = useState<User[]>([]);

  useEffect(() => {
    handleGetAllActiveUsers();
  }, []);

  const handleGetAllActiveUsers = async () => {
    try {
      const url = `${config.baseUrl}Auth/GetAllActiveUsers`;
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
        ShowMessage(2, "No User data found.");
      }
    } catch (e: any) {
      ShowMessage(
        2,
        e.message || "Something went wrong while fetching Users."
      );
    }
  };

   const handleInputChange = (userId: string) => {
    const updatedData = tblData.map((item) =>
      item.userId === userId
        ? { ...item, isActive: !item.isActive }
        : item
    );
    setTblData(updatedData);
    const updatedObj = updatedData.find((x) => x.userId === userId);
    handleSubmit(updatedObj);
  };

const handleSubmit = async (updatedObj: any) => {
  try {
    const url = `${config.baseUrl}Auth/UpdateProfile`;
    const formData = new FormData();
    for (const key in updatedObj) {
      if (updatedObj.hasOwnProperty(key)) {
        let value = updatedObj[key];
        if (key === "email" && value !== null && value !== "") {
          value = ""; 
        }
        formData.append(key, value ?? "");
      }
    }
    const response = await axios.patch(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.data.result.succeeded === false && response.data.result.errors.length > 0) {
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

  return (
    <Layout>
      <h1>Active Users</h1>
       {/* <div className="d-grid gap-2 d-md-flex justify-content-md-end mb-2">
          <button className="btn btn-primary me-md-2" type="button" onClick={handleAddNewProject}>
            Add New
          </button>
        </div> */}
      <div className="card mt-3">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>User Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {tblData.map((item, index) => (
                  <tr key={item.userId || index}>
                    <td>{item.userName}</td>
                    <td>{item.email}</td>
                    <td>{item.role}</td>
                    <td>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input cursor-pointer"
                          type="checkbox"
                          role="switch"
                          id={`flexSwitchCheckChecked-${index}`}
                          checked={item.isActive}
                          style={{ width: "3rem", height: "1.5rem" }}
                          onChange={() => handleInputChange(item.userId)}
                        />
                      </div>
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

export default Users;
