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
      <div className="d-flex align-items-center gap-3 mb-4">
        <button 
          onClick={handleBack}
          className="btn btn-light btn-icon shadow-sm border transition-base hover-scale"
          title="Back to Tasks"
          type="button"
        >
          <IoMdArrowRoundBack size={20} />
        </button>
        <div>
          <h2 className="mb-1 fw-bold text-dark">Add New Task</h2>
          <p className="text-muted mb-0">Create and assign a new task to a project module.</p>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-lg overflow-hidden">
        <div className="card-header bg-white border-bottom px-4 py-3">
          <h5 className="mb-0 fw-semibold text-dark">Task Details</h5>
        </div>
        <div className="card-body p-4 p-md-5">
          <form onSubmit={handleSubmit}>
            <div className="row g-4 mb-4">
               <div className="col-md-3">
                 <label className="form-label fw-medium text-dark small mb-1">Task No <span className="text-muted fw-normal">(Optional)</span></label>
                 <input
                   type="text"
                   className="form-control bg-light-soft border-0 px-3 py-2"
                   name="taskNo"
                   placeholder="Enter task no"
                   value={formData.taskNo}
                   onChange={handleInputChange}
                 />
               </div>
               <div className="col-md-9">
                 <label className="form-label fw-medium text-dark small mb-1">Title</label>
                 <input
                   type="text"
                   className="form-control bg-light-soft border-0 px-3 py-2"
                   name="title"
                   placeholder="Task brief title"
                   value={formData.title}
                   onChange={handleInputChange}
                   required
                 />
               </div>
             </div>

             <div className="row g-4 mb-4">
               <div className="col-md-12">
                 <label className="form-label fw-medium text-dark small mb-1">Description</label>
                 <textarea
                   className="form-control bg-light-soft border-0 px-3 py-2"
                   name="description"
                   placeholder="Detailed description of the task"
                   value={formData.description}
                   onChange={handleInputChange}
                   rows={3}
                 />
               </div>
             </div>

             <div className="row g-4 mb-4">
               <div className="col-md-3">
                 <label className="form-label fw-medium text-dark small mb-1">Estimated Hours</label>
                 <input
                   type="number"
                   className="form-control bg-light-soft border-0 px-3 py-2"
                   name="estimatedHours"
                   placeholder="0"
                   value={formData.estimatedHours}
                   onChange={handleInputChange}
                   min="0"
                   step="0.5"
                 />
               </div>
               <div className="col-md-3">
                 <label className="form-label fw-medium text-dark small mb-1">Status</label>
                 <select
                   name="status"
                   className="form-select bg-light-soft border-0 px-3 py-2 cursor-pointer"
                   value={formData.status}
                   onChange={handleInputChange}
                 >
                   <option value="" disabled>Select Status</option>
                   {status.map((s) => (
                     <option key={s} value={s}>
                       {s.replace("_", " ")}
                     </option>
                   ))}
                 </select>
               </div>
               <div className="col-md-3">
                 <label className="form-label fw-medium text-dark small mb-1">Priority</label>
                 <select
                   name="priority"
                   className="form-select bg-light-soft border-0 px-3 py-2 cursor-pointer"
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
                 <label className="form-label fw-medium text-dark small mb-1">Due Date <span className="text-muted fw-normal">(Optional)</span></label>
                 <input
                   type="datetime-local"
                   className="form-control bg-light-soft border-0 px-3 py-2 cursor-pointer"
                   name="dueDate"
                   value={formData.dueDate || ""}
                   onChange={handleInputChange}
                 />
               </div>
             </div>

             <div className="row g-4 mb-5">
               <div className="col-md-4">
                 <label className="form-label fw-medium text-dark small mb-1">Module</label>
                 <select
                   name="moduleId"
                   className="form-select bg-light-soft border-0 px-3 py-2 cursor-pointer"
                   value={formData.moduleId}
                   onChange={handleInputChange}
                   required
                 >
                   <option value="">Select Project Module</option>
                   {tblData.map((mod) => (
                     <option key={mod.moduleId} value={mod.moduleId}>
                       {mod.projectName} - {mod.moduleName}
                     </option>
                   ))}
                 </select>
               </div>

               <div className="col-md-4">
                 <label className="form-label fw-medium text-dark small mb-1">Assign To <span className="text-muted fw-normal">(Optional)</span></label>
                 <select
                   name="assignedby"
                   className="form-select bg-light-soft border-0 px-3 py-2 cursor-pointer"
                   value={formTaskAssignee.assignedby}
                   onChange={handleUserInputChange}
                   disabled={!formData.moduleId}
                 >
                   <option value="">{formData.moduleId ? "Select User" : "Select Module First"}</option>
                   {users.map((user) => (
                     <option key={user.userId} value={user.userId}>
                       {user.userName}
                     </option>
                   ))}
                 </select>
               </div>

               <div className="col-md-4">
                 <label className="form-label fw-medium text-dark small mb-1">Attachment <span className="text-muted fw-normal">(Optional)</span></label>
                 <input
                   type="file"
                   className="form-control bg-light-soft border-0 px-3 py-2 cursor-pointer"
                   ref={fileInputRef}
                   onChange={handleFileChange}
                 />
               </div>
             </div>

             <div className="d-flex justify-content-end gap-3 pt-3 border-top">
               <button 
                 type="button" 
                 className="btn btn-light px-4 fw-medium shadow-sm border transition-base"
                 onClick={handleClear}
               >
                 Clear
               </button>
               <button 
                 type="submit" 
                 className="btn btn-primary px-4 fw-medium shadow-sm transition-base d-flex align-items-center gap-2"
               >
                 <i className="bi bi-check2"></i>
                 Save Task
               </button>
             </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default AddNewTask;
