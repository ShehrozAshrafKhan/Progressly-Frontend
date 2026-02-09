import React, { useState, useEffect } from "react";
import { CiEdit } from "react-icons/ci";
import { ShowMessage } from "../../Components/Common/ShowMessage";
import config from "../../config";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Layout from "../../layouts/Layout";
import { useUser } from "../../contexts/UserContext";

type TaskAttachment = {
  taskAttachmentId: string;
  fileName: string;
  filePath?: string;
  taskId: string;
};
type Assignee = {
  assignedUserName?: string;
  taskAssigneeId: string;
  assignedBy?: string;
  assignedAt: string;
  taskId: string;
};

type Task = {
  taskId: string;
  title: string;
  taskNo: string;
  description: string;
  isActive: boolean;
  status: string;
  priority: string;
  estimatedHours: string;
  moduleId: string;
  moduleName: string;
  attachments?: TaskAttachment[];
  assignees?: Assignee[];
};

const PendingTasks = () => {
    const {user}=useUser();
  const userRole=user?.roles[0];
  const navigate = useNavigate();
  const [tblData, setTblData] = useState<Task[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedAttachment, setSelectedAttachment] =
    useState<TaskAttachment | null>(null);
  const [fileError, setFileError] = useState(false);

  useEffect(() => {
    handlePendingTasks();
  }, []);

  const handlePendingTasks = async () => {
    try {
      const url = `${config.baseUrl}Tasks/GetPendingTasks`;
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
        ShowMessage(2, "No data found.");
      }
    } catch (e: any) {
      ShowMessage(2, e.message || "Something went wrong while fetching Tasks.");
    }
  };

//   const handleAddNewTask = () => {
//     navigate("/tasks/addNewTask");
//   };

  const handleEdit = (taskId: string) => {
    navigate(`/tasks/editTask/${taskId}`);
  };

  const handleInputChange = (taskId: string) => {
    const updatedData = tblData.map((item) =>
      item.taskId === taskId ? { ...item, isActive: !item.isActive } : item
    );
    setTblData(updatedData);
    const updatedObj = updatedData.find((x) => x.taskId === taskId);
    handleSubmit(updatedObj);
  };

  const handleSubmit = async (updatedObj: any) => {
    try {
      console.log(updatedObj);
      const url = `${config.baseUrl}Tasks/UpdateTask`;
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

  const getMimeType = (fileType: string): string => {
    switch (fileType) {
      case "image":
        return "image/jpeg"; // or handle dynamically per extension
      case "pdf":
        return "application/pdf";
      case "text":
        return "text/plain";
      case "document":
        return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      case "excel":
        return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      case "presentation":
        return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
      case "archive":
        return "application/zip";
      default:
        return "application/octet-stream";
    }
  };

  const handleAttachmentClick = async (
    e: React.MouseEvent<HTMLAnchorElement>,
    attachment: TaskAttachment
  ) => {
    e.preventDefault();

    try {
      const url = `${config.baseUrl}TaskAttachments/GetTaskAttachmentFile?taskAttachmentId=${attachment.taskAttachmentId}`;
      const response = await axios.get(url, {
        responseType: "arraybuffer",
      });

      const fileType = getFileType(attachment.fileName);

      const mimeType = getMimeType(fileType);
      const blob = new Blob([response.data], { type: mimeType });
      const fileURL = URL.createObjectURL(blob);

      setSelectedAttachment({
        ...attachment,
        filePath: fileURL,
      });

      setFileError(false);
      setShowModal(true);
    } catch (err) {
      setFileError(true);
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAttachment(null);
    setFileError(false);
    if (selectedAttachment?.filePath?.startsWith("blob:")) {
      URL.revokeObjectURL(selectedAttachment.filePath);
    }
  };

  const handleFileError = () => {
    setFileError(true);
  };

  const getFileType = (fileName: string): string => {
    const extension = fileName.split(".").pop()?.toLowerCase() || "";

    if (
      ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"].includes(extension)
    ) {
      return "image";
    } else if (["pdf"].includes(extension)) {
      return "pdf";
    } else if (["doc", "docx"].includes(extension)) {
      return "document";
    } else if (["txt"].includes(extension)) {
      return "text";
    } else if (["xls", "xlsx"].includes(extension)) {
      return "excel";
    } else if (["ppt", "pptx"].includes(extension)) {
      return "presentation";
    } else if (["zip", "rar", "7z"].includes(extension)) {
      return "archive";
    }

    return "other";
  };

  const renderFileContent = () => {
    if (!selectedAttachment) return null;

    // If no filePath, show dummy image immediately
    if (!selectedAttachment.filePath || fileError) {
      return (
        <div className="text-center p-4">
          <img
            src="https://via.placeholder.com/300x200?text=File+Not+Found"
            alt="File not found"
            className="img-fluid mb-3"
            style={{ maxHeight: "200px" }}
          />
          <p className="text-muted">
            File path not available or file could not be loaded
          </p>
          <p className="small">{selectedAttachment.fileName}</p>
        </div>
      );
    }

    const fileType = getFileType(selectedAttachment.fileName);

    switch (fileType) {
      case "image":
        return (
          <img
            src={selectedAttachment.filePath}
            alt={selectedAttachment.fileName}
            className="img-fluid"
            style={{ maxWidth: "100%", maxHeight: "70vh" }}
            onError={handleFileError}
          />
        );
      case "pdf":
        return (
          <iframe
            src={selectedAttachment.filePath}
            width="100%"
            height="500px"
            title={selectedAttachment.fileName}
            onError={handleFileError}
          />
        );
      case "text":
        return (
          <iframe
            src={selectedAttachment.filePath}
            width="100%"
            height="400px"
            title={selectedAttachment.fileName}
            onError={handleFileError}
          />
        );
      default:
        return (
          <div className="text-center p-4">
            <div className="mb-3">
              <i className="fas fa-file fa-5x text-muted"></i>
            </div>
            <p>
              <strong>{selectedAttachment.fileName}</strong>
            </p>
            <p className="text-muted">
              Preview not available for this file type
            </p>
            {selectedAttachment.filePath && (
              <a
                href={selectedAttachment.filePath}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Download File
              </a>
            )}
          </div>
        );
    }
  };

  return (
    <Layout>
      <div>
        <h1>Tasks</h1>
        {/* <div className="d-grid gap-2 d-md-flex justify-content-md-end mb-2">
          <button
            className="btn btn-primary me-md-2"
            type="button"
            onClick={handleAddNewTask}
          >
            Add New
          </button>
        </div> */}
        <div className="card mt-3">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Task No</th>
                    <th>Task Name</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Module Name</th>
                    <th>Attachment</th>
                    <th>Assigned By</th>
                    {userRole!=="USER"?<th>Active</th>:null}
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tblData.map((item, index) => (
                    <tr key={item.taskId || index}>
                      <td className="align-middle">{item.taskNo}</td>
                      <td className="align-middle">{item.title}</td>
                      <td className="align-middle">{item.description}</td>
                      <td className="align-middle">{item.status}</td>
                      <td className="align-middle">{item.priority}</td>
                      <td className="align-middle">{item.moduleName}</td>
                      <td className="align-middle">
                        {item.attachments && item.attachments.length > 0 ? (
                          <ul className="list-unstyled mb-0 cursor-pointer">
                            {item.attachments.map((att) => (
                              <li key={att.taskAttachmentId}>
                                <a
                                  href="#"
                                  className="text-decoration-none"
                                  onClick={(e) => handleAttachmentClick(e, att)}
                                >
                                  📎 {att.fileName}
                                </a>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-muted">No Attachment</span>
                        )}
                      </td>
                      <td className="align-middle">
                        {item.assignees && item.assignees.length > 0 ? (
                          <ul className="list-unstyled mb-0 cursor-pointer">
                            {item.assignees.map((att) => (
                              <li key={att.taskAssigneeId}>
                                {att.assignedUserName}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-muted">Not Assign</span>
                        )}
                      </td>
                      {userRole!=="USER"?    <td className="align-middle">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id={`flexSwitchCheckChecked-${index}`}
                            checked={item.isActive}
                            style={{ width: "3rem", height: "1.5rem" ,cursor:"pointer"}}
                            onChange={() => handleInputChange(item.taskId)}
                          />
                        </div>
                      </td>:null}
                  
                      <td className="align-middle">
                        <CiEdit
                          fontSize={25}
                         style={{cursor:"pointer"}}
                          onClick={() => handleEdit(item.taskId)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {showModal && (
          <div
            className="modal fade show"
            style={{ display: "block" }}
            tabIndex={-1}
          >
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {selectedAttachment?.fileName || "File Viewer"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeModal}
                  ></button>
                </div>
                <div className="modal-body text-center">
                  {renderFileContent()}
                </div>
                <div className="modal-footer">
                  {selectedAttachment &&
                    selectedAttachment.filePath &&
                    !fileError && (
                      <a
                        href={selectedAttachment.filePath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-success"
                        download={selectedAttachment.fileName}
                      >
                        Download
                      </a>
                    )}
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeModal}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Backdrop */}
        {showModal && (
          <div className="modal-backdrop fade show" onClick={closeModal}></div>
        )}
      </div>
    </Layout>
  );
};

export default PendingTasks;
