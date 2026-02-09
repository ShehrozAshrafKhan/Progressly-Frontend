import React, { useState, useEffect, useRef } from "react";
import { ShowMessage } from "../../Components/Common/ShowMessage";
import axios from "axios";
import config from "../../config";
import { useNavigate } from "react-router-dom";
import { IoMdArrowRoundBack } from "react-icons/io";
import Layout from "../../layouts/Layout";
import { useUser } from "../../contexts/UserContext";

type Module = {
  projectId: string;
  moduleId: string;
  description: string;
  isActive: boolean;
  moduleName: string;
  projectName: string;
};

type User = {
  email: string;
  userId: string;
  userName: string;
};

const AddNewTask = () => {
  const {user}=useUser();
  const role=user?.roles[0];
  const navigate = useNavigate();
   const handleBack = () => {
   role!=="USER"?navigate("/tasks"):navigate("/tasks/userTasksDetail/ALL")
  };

  const [users, setUsers] = useState<User[]>([]);
  const [tblData, setTblData] = useState<Module[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const status = ["PENDING", "IN_PROGRESS", "COMPLETED"];
  const priority = ["LOW", "MEDIUM", "HIGH"];

  const [formData, setFormData] = useState({
    title: "",
    taskNo: "",
    description: "",
    status: "PENDING",
    priority: "LOW",
    estimatedHours: 0,
    moduleId: "",
    dueDate: "" as string | null,
  });

  const [formTaskAssignee, setFormTaskAssignee] = useState({
    taskId: "",
    assignedby: "",
  });

  useEffect(() => {
    handleGetModules();
  }, []);

  const handleGetModules = async () => {
    try {
      const url = `${config.baseUrl}Modules/GetModules`;
      const response = await axios.get(url);
      if (response?.data?.result?.succeeded) {
        setTblData(response.data.data);
      } else {
        ShowMessage(2, response?.data?.result?.errors?.[0] || "No module data found.");
      }
    } catch (e: any) {
      ShowMessage(2, e.message || "Error fetching modules.");
    }
  };

  const handleGetAllActiveUsers = async (moduleId:string) => {
    try {
      const url = `${config.baseUrl}Users/GetUsersByModuleId?moduleId=${moduleId}`;
      const response = await axios.get(url);
      if (response?.data?.result?.succeeded) {
        setUsers(response.data.data);
      } else {
        ShowMessage(2, response?.data?.result?.errors?.[0] || "No user data found.");
      }
    } catch (e: any) {
      ShowMessage(2, e.message || "Error fetching users.");
    }
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name==="moduleId"&&value!="") {
        const moduleId=value;
    handleGetAllActiveUsers(moduleId);      
    }
  };

  const handleUserInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormTaskAssignee((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setFile(e.target.files[0]);
    }
  };

  const handleClear = () => {
    setFormData({
      title: "",
      taskNo: "",
      description: "",
      status: "PENDING",
      priority: "LOW",
      estimatedHours: 0,
      moduleId: "",
      dueDate: "",
    });
    setFormTaskAssignee({ taskId: "", assignedby: "" });
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const preparedData = {
        ...formData,
        dueDate: formData.dueDate === "" ? null : formData.dueDate,
        taskNo: formData.taskNo === "" ? null : formData.taskNo,
      };

      const url = `${config.baseUrl}Tasks/SaveTask`;
      const response = await axios.post(url, preparedData);

      if (response.data.result.succeeded) {
        const taskId = response.data.data;
        ShowMessage(1, "Task added successfully");

        // Upload file if exists
        if (file && taskId) {
          const formDataFile = new FormData();
          formDataFile.append("File", file);
          formDataFile.append("taskId", taskId);

          const fileUploadUrl = `${config.baseUrl}TaskAttachments/SaveTaskAttachments`;
          const uploadResponse = await axios.post(fileUploadUrl, formDataFile, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          if (uploadResponse.data.result.succeeded) {
            ShowMessage(1, "File uploaded successfully");
          } else {
            ShowMessage(2, "Task saved, but file upload failed");
          }
        }

        if (formTaskAssignee.assignedby && taskId) {
          const assignUrl = `${config.baseUrl}TaskAssignee/SaveTaskAssignee`;
          const assignBody = {
            taskId,
            assignedby: formTaskAssignee.assignedby,
          };
          await axios.post(assignUrl, assignBody);
        }

        handleClear();
      } else {
        ShowMessage(2, response.data.result.errors[0] || "Error saving task");
      }
    } catch (err: any) {
      ShowMessage(2, err.message || "Error saving task");
    }
  };

  return (
    <Layout>
      <div className="card shadow-sm p-5">
        <div className="d-flex gap-3 align-items-center mb-3">
          <IoMdArrowRoundBack
            fontSize={30}
            onClick={handleBack}
            className="cursor-pointer"
          />
          <h2 className="">Add Task</h2>
        </div>
        <form className="form" onSubmit={handleSubmit}>
          <div className="p-5 border rounded-3 card shadow-sm">
            <div className="row g-3 mb-3">
              <div className="col-md-2">
                <label className="form-label fw-bold">Task No</label>
                <input
                  type="text"
                  className="form-control"
                  name="taskNo"
                  value={formData.taskNo}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-md-5">
                <label className="form-label fw-bold">Title</label>
                <input
                  type="text"
                  className="form-control"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-md-5">
                <label className="form-label fw-bold">Description</label>
                <input
                  type="text"
                  className="form-control"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-3">
                <label className="form-label fw-bold">Estimated Hours</label>
                <input
                  type="number"
                  className="form-control"
                  name="estimatedHours"
                  value={formData.estimatedHours}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-bold">Status</label>
                <select
                  name="status"
                  className="form-select"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="" disabled>Select Status</option>
                  {status.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label fw-bold">Priority</label>
                <select
                  name="priority"
                  className="form-select"
                  value={formData.priority}
                  onChange={handleInputChange}
                >
                  <option value="" disabled>Select Priority</option>
                  {priority.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label fw-bold">Due Date</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  name="dueDate"
                  value={formData.dueDate || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label fw-bold">Module</label>
                <select
                  name="moduleId"
                  className="form-select"
                  value={formData.moduleId}
                  onChange={handleInputChange}
                >
                  <option value="">Select Module</option>
                  {tblData.map((mod) => (
                    <option key={mod.moduleId} value={mod.moduleId}>
                      {mod.moduleName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label fw-bold">Attachment</label>
                <input
                  type="file"
                  className="form-control"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label fw-bold">Assign To</label>
                <select
                  name="assignedby"
                  className="form-select"
                  value={formTaskAssignee.assignedby}
                  onChange={handleUserInputChange}
                >
                  <option value="">Select User</option>
                  {users.map((user) => (
                    <option key={user.userId} value={user.userId}>
                      {user.userName}
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

export default AddNewTask;
