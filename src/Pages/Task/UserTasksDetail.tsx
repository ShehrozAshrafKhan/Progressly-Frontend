import React, { useEffect, useState } from "react";
import Layout from "../../layouts/Layout";
import { useNavigate, useParams } from "react-router-dom";
import config from "../../config";
import axios from "axios";
import { ShowMessage } from "../../Components/Common/ShowMessage";
import { CiEdit } from "react-icons/ci";
import { IoMdArrowRoundBack } from "react-icons/io";
import "./UserTasksDetail.css";

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
const UserTasksDetail = () => {
  const navigate = useNavigate();
  let params = useParams();
  params.type;
  //   alert(type)
  const [tblData, setTblData] = useState<Task[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedAttachment, setSelectedAttachment] =
    useState<TaskAttachment | null>(null);
  const [fileError, setFileError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    handleGetTasks();
  }, []);

  const handleGetTasks = async () => {
    try {
      const url = `${config.baseUrl}Tasks/GetUserTasks?type=${params.type}`;
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

  const handleAddNewTask = () => {
    navigate("/tasks/addNewTask");
  };

  const handleEdit = (taskId: string) => {
    navigate(`/tasks/editTask/${taskId}`);
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
    attachment: TaskAttachment,
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
  const handleBack = () => {
    navigate("/dashboard");
  };

  const filteredTasks = tblData.filter((item) =>
    [
      item.taskNo,
      item.title,
      item.description,
      item.status,
      item.priority,
      item.moduleName,
    ]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredTasks.length / rowsPerPage);

  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <Layout>
      <div className="container-fluid p-0">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <button
              onClick={handleBack}
              className="btn btn-light btn-icon shadow-sm border transition-base hover-scale"
              title="Back"
            >
              <IoMdArrowRoundBack size={20} />
            </button>
            <div>
              <h2 className="mb-1 fw-bold text-dark">Tasks</h2>
              <p className="text-muted mb-0">
                Manage your specific assigned tasks.
              </p>
            </div>
          </div>
          <button
            className="btn btn-primary shadow-sm hover-scale transition-base d-flex align-items-center gap-2"
            onClick={handleAddNewTask}
          >
            <i className="bi bi-plus-lg"></i>
            Add New Task
          </button>
        </div>

        <div className="card shadow-sm border-0 rounded-lg overflow-hidden">
          <div className="card-header bg-white border-bottom p-3">
            <div className="row">
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 text-nowrap">
                <thead className="bg-light-soft text-muted sticky-top z-1">
                  <tr>
                    <th className="px-4 py-3 fw-semibold border-0">Task No</th>
                    <th className="px-4 py-3 fw-semibold border-0">Title</th>
                    <th className="px-4 py-3 fw-semibold border-0">
                      Description
                    </th>
                    <th className="px-4 py-3 fw-semibold border-0">Status</th>
                    <th className="px-4 py-3 fw-semibold border-0">Priority</th>
                    <th className="px-4 py-3 fw-semibold border-0">Module</th>
                    <th className="px-4 py-3 fw-semibold border-0">
                      Attachments
                    </th>
                    <th className="px-4 py-3 fw-semibold border-0">
                      Assignees
                    </th>
                    <th className="px-4 py-3 fw-semibold border-0 text-end">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="border-top-0">
                  {filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-5 text-muted">
                        <div className="d-flex flex-column align-items-center">
                          <i className="bi bi-inbox fs-1 text-light-muted mb-2"></i>
                          <p className="mb-0">No tasks found.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedTasks.map((item, index) => {
                      let bgColor = "";
                      if (item.status === "COMPLETED" && !item.isActive) {
                        bgColor = "rgba(86, 245, 128, 0.2)"; // Softer green
                      } else if (item.status === "COMPLETED" && item.isActive) {
                        bgColor = "rgba(235, 215, 89, 0.2)"; // Softer yellow
                      }

                      return (
                        <tr
                          key={item.taskId || index}
                          style={{ backgroundColor: bgColor }}
                          className="border-bottom"
                        >
                          <td className="px-4 py-3 text-dark fw-medium">
                            {item.taskNo || (
                              <span className="text-muted small">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="fw-medium text-dark">
                              {item.title}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted">
                            <span
                              className="text-truncate d-inline-block"
                              style={{ maxWidth: "180px" }}
                              title={item.description}
                            >
                              {item.description || "-"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`badge px-2 py-1 fw-normal ${
                                item.status === "COMPLETED"
                                  ? "bg-success-soft text-success"
                                  : item.status === "IN_PROGRESS"
                                    ? "bg-primary-soft text-primary"
                                    : "bg-warning-soft text-warning"
                              }`}
                            >
                              {item.status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`badge px-2 py-1 fw-normal bg-light text-dark border`}
                            >
                              {item.priority}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-dark">
                              {item.moduleName || "-"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {item.attachments && item.attachments.length > 0 ? (
                              <div className="d-flex flex-column gap-1">
                                {item.attachments.map((att) => (
                                  <a
                                    key={att.taskAttachmentId}
                                    href="#"
                                    className="d-inline-flex align-items-center gap-1 text-decoration-none text-primary small hover-text-dark transition-base"
                                    onClick={(e) =>
                                      handleAttachmentClick(e, att)
                                    }
                                  >
                                    <i className="bi bi-paperclip"></i>
                                    <span
                                      className="text-truncate"
                                      style={{
                                        maxWidth: "120px",
                                        cursor: "pointer",
                                      }}
                                      title={att.fileName}
                                    >
                                      {att.fileName}
                                    </span>
                                  </a>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted small">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {item.assignees && item.assignees.length > 0 ? (
                              <div className="d-flex flex-wrap gap-1">
                                {item.assignees.map((att) => (
                                  <span
                                    key={att.taskAssigneeId}
                                    className="badge bg-light-soft text-dark border px-2 py-1 fw-normal"
                                  >
                                    {att.assignedUserName}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted small">
                                Unassigned
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-end">
                            <button
                              className="btn btn-sm btn-light btn-icon text-primary hover-scale transition-base shadow-sm border"
                              onClick={() => handleEdit(item.taskId)}
                              title="Edit Task"
                            >
                              <CiEdit size={18} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
              <div className="d-flex justify-content-between align-items-center p-3 border-top">
                <div className="text-muted small">
                  Showing{" "}
                  {filteredTasks.length === 0
                    ? 0
                    : (currentPage - 1) * rowsPerPage + 1}
                  {" - "}
                  {Math.min(currentPage * rowsPerPage, filteredTasks.length)}
                  {" of "}
                  {filteredTasks.length} records
                </div>

                <nav>
                  <ul className="pagination pagination-sm mb-0">
                    <li
                      className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage - 1)}
                      >
                        Previous
                      </button>
                    </li>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <li
                          key={page}
                          className={`page-item ${
                            currentPage === page ? "active" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </button>
                        </li>
                      ),
                    )}

                    <li
                      className={`page-item ${
                        currentPage === totalPages || totalPages === 0
                          ? "disabled"
                          : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage + 1)}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div
            className="modal fade show"
            style={{ display: "block" }}
            tabIndex={-1}
          >
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header border-bottom-0 pb-0">
                  <h5 className="modal-title fw-bold">
                    {selectedAttachment?.fileName || "File Viewer"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeModal}
                  ></button>
                </div>
                <div className="modal-body text-center p-4">
                  {renderFileContent()}
                </div>
                <div className="modal-footer border-top-0 pt-0">
                  {selectedAttachment &&
                    selectedAttachment.filePath &&
                    !fileError && (
                      <a
                        href={selectedAttachment.filePath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary px-4 shadow-sm"
                        download={selectedAttachment.fileName}
                      >
                        Download
                      </a>
                    )}
                  <button
                    type="button"
                    className="btn btn-light border px-4 shadow-sm"
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
          <div
            className="modal-backdrop fade show"
            style={{ opacity: 0.5 }}
            onClick={closeModal}
          ></div>
        )}
      </div>
    </Layout>
  );
};

export default UserTasksDetail;
