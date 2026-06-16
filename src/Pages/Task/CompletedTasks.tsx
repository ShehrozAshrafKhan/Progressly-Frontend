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

const CompletedTasks = () => {
  const{user}=useUser();
  const userRole=user?.roles[0];
  const navigate = useNavigate();
  const [tblData, setTblData] = useState<Task[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedAttachment, setSelectedAttachment] =
    useState<TaskAttachment | null>(null);
  const [fileError, setFileError] = useState(false);
const [searchTerm, setSearchTerm] = useState("");
const [currentPage, setCurrentPage] = useState(1);

const rowsPerPage = 10;
  useEffect(() => {
    handleGetCompletedTasks();
  }, []);

  const handleGetCompletedTasks = async () => {
    try {
      const url = `${config.baseUrl}Tasks/GetCompletedTasks`;
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
    .includes(searchTerm.toLowerCase())
);

const totalPages = Math.ceil(filteredTasks.length / rowsPerPage);

const paginatedTasks = filteredTasks.slice(
  (currentPage - 1) * rowsPerPage,
  currentPage * rowsPerPage
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
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
        <div>
          <h2 className="mb-1 fw-bold text-dark">Completed Tasks</h2>
          <p className="text-muted mb-0">Review tasks that have been marked as completed.</p>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-lg overflow-hidden mt-3">
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
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-muted">
                <tr>
                  <th className="px-4 py-3 text-uppercase fw-semibold" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>Task No</th>
                  <th className="px-4 py-3 text-uppercase fw-semibold" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>Task Name</th>
                  <th className="px-4 py-3 text-uppercase fw-semibold" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>Status</th>
                  <th className="px-4 py-3 text-uppercase fw-semibold" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>Priority</th>
                  <th className="px-4 py-3 text-uppercase fw-semibold" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>Module Name</th>
                  <th className="px-4 py-3 text-uppercase fw-semibold" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>Attachment</th>
                  <th className="px-4 py-3 text-uppercase fw-semibold" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>Assigned By</th>
                  {userRole !== "USER" && <th className="px-4 py-3 text-uppercase fw-semibold" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>Active</th>}
                  <th className="px-4 py-3 text-uppercase fw-semibold text-end" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>Action</th>
                </tr>
              </thead>
              <tbody className="border-top-0">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={userRole !== "USER" ? 9 : 8} className="text-center py-5 text-muted">
                      <div className="d-flex flex-column align-items-center">
                        <i className="bi bi-check2-all fs-1 mb-2 text-light"></i>
                        <p className="mb-0">No completed tasks found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedTasks.map((item, index) => (
                    <tr key={item.taskId || index} className="transition-base">
                      <td className="px-4 py-3 fw-medium text-dark">{item.taskNo}</td>
                      <td className="px-4 py-3">
                         <div className="fw-medium text-dark">{item.title}</div>
                         <div className="small text-muted text-truncate" style={{ maxWidth: "200px" }}>{item.description}</div>
                      </td>
                      <td className="px-4 py-3">
                         <span className="badge bg-success bg-opacity-10 text-success px-2 py-1 rounded-pill fw-medium small">
                            {item.status || "Completed"}
                         </span>
                      </td>
                      <td className="px-4 py-3">
                         <span className={`badge bg-${item.priority === 'High' ? 'danger' : item.priority === 'Medium' ? 'warning' : 'info'} bg-opacity-10 text-${item.priority === 'High' ? 'danger' : item.priority === 'Medium' ? 'warning text-dark' : 'info'} px-2 py-1 rounded-pill fw-medium small`}>
                           {item.priority}
                         </span>
                      </td>
                      <td className="px-4 py-3 text-muted">{item.moduleName}</td>
                      <td className="px-4 py-3">
                        {item.attachments && item.attachments.length > 0 ? (
                           <div className="d-flex flex-column gap-1">
                            {item.attachments.map((att) => (
                                <span
  key={att.taskAttachmentId}
  className="badge bg-light text-dark border d-inline-flex align-items-center gap-1 p-1 px-2 hover-scale transition-base"
  onClick={(e) => handleAttachmentClick(e as any, att)}
  title={att.fileName}
  style={{
    maxWidth: "120px",
    cursor: "pointer",
  }}
>
                                  <i className="bi bi-paperclip text-muted"></i>
                                  <span className="text-truncate">{att.fileName}</span>
                                </span>
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
                                <span key={att.taskAssigneeId} className="badge bg-light-soft text-dark border px-2 py-1 fw-normal">
                                  {att.assignedUserName}
                                </span>
                              ))}
                            </div>
                        ) : (
                          <span className="text-muted small">Unassigned</span>
                        )}
                      </td>
                      {userRole !== "USER" && (
                         <td className="px-4 py-3">
                           <div className="form-check form-switch m-0">
                             <input
                               className="form-check-input cursor-pointer"
                               type="checkbox"
                               role="switch"
                               id={`flexSwitchCheckChecked-${index}`}
                               checked={item.isActive}
                               onChange={() => handleInputChange(item.taskId)}
                               style={{ 
                                 width: "2.5rem", 
                                 height: "1.25rem",
                                 backgroundColor: item.isActive ? 'var(--bs-primary)' : '',
                                 borderColor: item.isActive ? 'var(--bs-primary)' : ''
                               }}
                             />
                           </div>
                         </td>
                      )}
                      <td className="px-4 py-3 text-end">
                         <button 
                           className="btn btn-sm btn-light btn-icon text-primary hover-scale transition-base shadow-sm border"
                           onClick={() => handleEdit(item.taskId)}
                           title="View/Edit Task"
                         >
                           <CiEdit size={18} />
                         </button>
                      </td>
                    </tr>
                  ))
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
      <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
        <button
          className="page-link"
          onClick={() => handlePageChange(currentPage - 1)}
        >
          Previous
        </button>
      </li>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
      ))}

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
          <div className="modal-backdrop fade show" style={{ opacity: 0.5 }} onClick={closeModal}></div>
        )}
      </div>
    </Layout>
  );
};

export default CompletedTasks;
