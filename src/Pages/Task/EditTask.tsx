import React, { useState, useEffect, useRef } from "react";
import { ShowMessage } from "../../Components/Common/ShowMessage";
import axios from "axios";
import config from "../../config";
import { useNavigate, useParams } from "react-router-dom";
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
type TaskAttachment = {
  taskAttachmentId: string;
  taskId: string;
  fileName: string;
};

type Tag = {
  tagId: string;
  tagName: string;
  isActive: boolean;
};

const EditTask = () => {
  const { user } = useUser();
  const userRole = user?.roles[0];
  const [isCompletedRequest, setIsCompletedRequest] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [assignedTags, setAssignedTags] = useState<Tag[]>([]);
  const [assignedUsers, setAssignedUsers] = useState<User[]>([]);
  const [taskAttachments, setTaskAttachments] = useState<TaskAttachment[]>([]);
  let params = useParams();
  const navigate = useNavigate();
  const handleBack = () => {
    userRole !== "USER"
      ? navigate("/tasks")
      : navigate("/tasks/userTasksDetail/ALL");
  };

  const [tblData, setTblData] = useState<Module[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [existingFileName, setExistingFileName] = useState<string>("");
  const [existingFileUrl, setExistingFileUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchExistingFile = async () => {
      if (taskAttachments && taskAttachments.length > 0 && existingFileName) {
        const attachment = taskAttachments[0];
        const isImage =
          attachment.fileName.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null;
        if (isImage) {
          try {
            const url = `${config.baseUrl}TaskAttachments/GetTaskAttachmentFile?taskAttachmentId=${attachment.taskAttachmentId}`;
            const response = await axios.get(url, {
              responseType: "arraybuffer",
            });

            const ext = attachment.fileName.split(".").pop()?.toLowerCase();
            let mime = "image/jpeg";
            if (ext === "png") mime = "image/png";
            else if (ext === "gif") mime = "image/gif";
            else if (ext === "webp") mime = "image/webp";

            const blob = new Blob([response.data], { type: mime });
            setExistingFileUrl(URL.createObjectURL(blob));
          } catch (e) {
            console.error("Failed to load existing image preview");
          }
        }
      } else {
        setExistingFileUrl(null);
      }
    };
    fetchExistingFile();
  }, [taskAttachments, existingFileName]);

  const [requireCodeUpload, setRequireCodeUpload] = useState(false);
  const status = ["PENDING", "IN_PROGRESS", "COMPLETED"];
  const priority = ["LOW", "MEDIUM", "HIGH"];
  const [codeInputs, setCodeInputs] = useState<{
    [tagId: string]: {
      taskCodeChangeId?: string;
      type: "file" | "text" | null;
      oldFile?: File | null;
      newFile?: File | null;
      oldFileName?: string;
      oldFilePath?: string;
      oldExtension?: string;
      oldCode?: string;
      newFileName?: string;
      newExtension?: string;
      newFilePath?: string;
      newCode?: string;
      showOld?: boolean;
      showNew?: boolean;
    }[];
  }>({});

  const [formData, setFormData] = useState({
    title: "",
    taskNo: "",
    isActive: false,
    description: "",
    status: "PENDING",
    priority: "LOW",
    estimatedHours: 0,
    moduleId: "",
    dueDate: "" as string | null,
    taskDate: "" as string | null,
  });

  const [formTaskAssignee, setFormTaskAssignee] = useState({
    taskId: "",
    assignedby: "",
  });

  const [usersByIds, setUsersByIds] = useState({
    moduleId: "",
    userIds: [""],
  });

  useEffect(() => {
    handleGetTask();
    handleGetModules();
    handleGetTags();
    handleGetUploadedFiles();
  }, []);

  const fetchFileContent = async (
    taskCodeChangeId: string,
    fileName: string,
    fileType: string,
  ): Promise<string> => {
    try {
      const response = await axios.get(
        `${config.baseUrl}TaskCodeChanges/GetTaskCodeChangeFile`,
        {
          responseType: "blob",
          params: { taskCodeChangeId, fileName, fileType },
        },
      );
      return await response.data.text();
    } catch {
      return "";
    }
  };

  const handleGetUploadedFiles = async () => {
    try {
      const res = await axios.get(
        `${config.baseUrl}TaskCodeChanges/GetTaskCodeChangesByTaskId`,
        {
          params: { taskId: params.taskId },
        },
      );

      const grouped: Record<string, any[]> = {};
      if (res.data.data != null && res.data.data.length > 0) {
        for (const change of res.data.data) {
          const tagId = change.tagId;
          if (!grouped[tagId]) grouped[tagId] = [];

          const entry: any = {
            taskCodeChangeId: change.taskCodeChangeId,
            type: change.entryType,
            oldFileName: change.oldFileName,
            oldExtension: change.oldExtension,
            newFileName: change.newFileName,
            newExtension: change.newExtension,
            oldFilePath: change.oldFilePath,
            newFilePath: change.newFilePath,
            showOld: true,
            showNew: true,
          };

          // For text entries, load the actual file content into oldCode/newCode
          if (change.entryType === "text") {
            if (change.oldFileName && change.oldExtension) {
              entry.oldCode = await fetchFileContent(
                change.taskCodeChangeId,
                `${change.oldFileName}${change.oldExtension}`,
                "OLD",
              );
            }
            if (change.newFileName && change.newExtension) {
              entry.newCode = await fetchFileContent(
                change.taskCodeChangeId,
                `${change.newFileName}${change.newExtension}`,
                "NEW",
              );
            }
          }

          grouped[tagId].push(entry);
        }
        console.log(grouped);
        setCodeInputs(grouped);
      }
    } catch (err) {
      console.error("Failed to load uploaded files", err);
    }
  };
  const handleGetTags = async () => {
    try {
      const url = `${config.baseUrl}Tags/GetActiveTags`;
      const response = await axios.get(url);
      if (response?.data?.result?.succeeded) {
        setTags(response.data.data);
      } else {
        ShowMessage(
          2,
          response?.data?.result?.errors?.[0] || "No Tags data found.",
        );
      }
    } catch (e: any) {
      ShowMessage(2, e.message || "Error fetching Tags.");
    }
  };

  const handleGetTask = async () => {
    try {
      const url = `${config.baseUrl}Tasks/GetTaskById?taskId=${params.taskId}`;
      const response = await axios.get(url);
      if (response?.data?.result?.succeeded) {
        setFormData(response.data.data);
        const taskData = response.data.data;
        console.log(taskData);
        if (taskData.assignees && taskData.assignees.length > 0) {
          setFormTaskAssignee({
            taskId: taskData.taskId,
            assignedby: taskData.assignees[0].assignedBy,
          });
        }
        setIsCompletedRequest(taskData.isCompletedRequest);
        const currentUserId = user?.userId ?? "";
        const assignedByIds =
          taskData.assignees?.map((assignee: any) => assignee.assignedBy) || [];
        setUsersByIds({
          moduleId: taskData.moduleId,
          userIds: [currentUserId, ...assignedByIds],
        });
        if (taskData.attachments && taskData.attachments.length > 0) {
          setExistingFileName(taskData.attachments[0].fileName);
        }
        setTaskAttachments(taskData.attachments);
        if (user?.roles[0] !== "USER") {
          setAssignedUsers(
            taskData.assignees?.map((a: any) => ({
              userId: a.assignedBy,
              userName: a.assignedUserName,
            })) || [],
          );
        }
        if (taskData.taskTags && taskData.taskTags.length > 0) {
          setAssignedTags(
            taskData.taskTags.map((tag: any) => ({
              tagId: tag.tagId,
              tagName: tag.tagName,
            })),
          );
        }
        setRequireCodeUpload(taskData.requireCodeUpload || false);
      } else {
        ShowMessage(
          2,
          response?.data?.result?.errors?.[0] || "No Task data found.",
        );
      }
    } catch (e: any) {
      ShowMessage(2, e.message || "Error fetching Task.");
    }
  };

  useEffect(() => {
    if (usersByIds.moduleId && usersByIds.userIds.length > 0) {
      if (user?.roles[0] !== "USER") {
        handleGetAllActiveUsers(usersByIds.moduleId);
      } else {
        handleGetAssignedUsers();
      }
    }
  }, [usersByIds, user]);

  const handleGetAssignedUsers = async () => {
    try {
      const payload = {
        moduleId: usersByIds.moduleId,
        userIds: usersByIds.userIds, // lowercase!
      };
      const url = `${config.baseUrl}Users/GetUserByIds`;
      console.log(payload);
      const response = await axios.post(url, payload);
      if (response?.data?.result?.succeeded) {
        setUsers(response.data.data);
      } else {
        ShowMessage(
          2,
          response?.data?.result?.errors?.[0] || "No TaskAssignee data found.",
        );
      }
    } catch (e: any) {
      ShowMessage(2, e.message || "Error fetching TaskAssignee.");
    }
  };

  const handleGetAllActiveUsers = async (moduleId: string) => {
    try {
      const url = `${config.baseUrl}Users/GetUsersByModuleId?moduleId=${moduleId}`;
      const response = await axios.get(url);
      if (response?.data?.result?.succeeded) {
        setUsers(response.data.data);
      } else {
        ShowMessage(
          2,
          response?.data?.result?.errors?.[0] || "No user data found.",
        );
      }
    } catch (e: any) {
      ShowMessage(2, e.message || "Error fetching users.");
    }
  };

  const handleGetModules = async () => {
    try {
      const url = `${config.baseUrl}Modules/GetModules`;
      const response = await axios.get(url);
      if (response?.data?.result?.succeeded) {
        setTblData(response.data.data);
      } else {
        ShowMessage(
          2,
          response?.data?.result?.errors?.[0] || "No module data found.",
        );
      }
    } catch (e: any) {
      ShowMessage(2, e.message || "Error fetching modules.");
    }
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "moduleId" && value != "") {
      const moduleId = value;
      handleGetAllActiveUsers(moduleId);
    }
  };
  const handleUserInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    const key = name as keyof typeof formTaskAssignee;

    setFormTaskAssignee((prev) => ({
      ...prev,
      [key]: value,
    }));

    const selectedUser = users.find((u) => u.userId === value);

    if (!selectedUser) return;

    // Check role
    const isUserRole = user?.roles?.[0]?.toLowerCase() === "user";

    if (isUserRole) {
      // USER: keep existing logic
      const otherUsers = users.filter((u) => u.userId !== selectedUser.userId);
      const newAssignedUsers = [selectedUser, ...otherUsers];
      setAssignedUsers(newAssignedUsers);
    } else {
      // Admin/Other roles: only add if selectedUser exists in current assignedUsers list
      const alreadyAssigned = assignedUsers.find(
        (u) => u.userId === selectedUser.userId,
      );

      if (!alreadyAssigned) {
        setAssignedUsers((prev) => [...prev, selectedUser]);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setFile(e.target.files[0]);
    }
    setExistingFileName("");
  };

  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      setExistingFileName("");
      if (fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(droppedFile);
        fileInputRef.current.files = dataTransfer.files;
      }
    }
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            setFile(blob);
            setExistingFileName("");
            if (fileInputRef.current) {
              const dataTransfer = new DataTransfer();
              dataTransfer.items.add(blob);
              fileInputRef.current.files = dataTransfer.files;
            }
            // @ts-ignore
            ShowMessage(1, "Image pasted successfully");
          }
        }
      }
    };
    document.addEventListener("paste", handlePaste);
    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, []);

  // const handleClear = () => {
  //   setFormData({
  //     title: "",
  //     taskNo: "",
  //     description: "",
  //     isActive: false,
  //     status: "PENDING",
  //     priority: "LOW",
  //     estimatedHours: 0,
  //     moduleId: "",
  //     dueDate: "",
  //     taskDate: "",
  //   });
  //   setFormTaskAssignee({ taskId: "", assignedby: "" });
  //   setFile(null);
  //   setExistingFileName("");
  //   setAssignedUsers([]);
  //   setAssignedTags([]);
  //   if (fileInputRef.current) fileInputRef.current.value = "";
  // };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const preparedData = {
        ...formData,
        requireCodeUpload: requireCodeUpload,
        dueDate: formData.dueDate === "" ? null : formData.dueDate,
        taskDate: formData.taskDate === "" ? null : formData.taskDate,
      };
      console.log(preparedData);
      const url = `${config.baseUrl}Tasks/UpdateTask`;
      const response = await axios.patch(url, preparedData);

      if (response.data.result.succeeded) {
        const taskId = response.data.data;
        ShowMessage(1, "Task added successfully");

        const existingAttachmentId =
          taskAttachments.length > 0 ? taskAttachments[0].taskAttachmentId : "";
        if (file && existingAttachmentId) {
          const formDataFile = new FormData();
          formDataFile.append("File", file);
          formDataFile.append("TaskAttachmentId", existingAttachmentId);
          formDataFile.append("taskId", taskId);
          const fileUploadUrl = `${config.baseUrl}TaskAttachments/UpdateTaskAttachments`;
          const uploadResponse = await axios.patch(
            fileUploadUrl,
            formDataFile,
            {
              headers: { "Content-Type": "multipart/form-data" },
            },
          );
          if (uploadResponse.data.result.succeeded) {
            ShowMessage(1, "File uploaded successfully");
          } else {
            ShowMessage(2, "Task saved, but file upload failed");
          }
        } else if (file && existingAttachmentId == "") {
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
        if (assignedUsers.length > 0 && taskId) {
          const assignUrl = `${config.baseUrl}TaskAssignee/UpdateTaskAssignee`;
          const assignBody = {
            taskId,
            assignedBy: assignedUsers.map((user) => user.userId),
          };
          await axios.patch(assignUrl, assignBody);
        }
        if (taskId) {
          try {
            const completeUrl = `${config.baseUrl}Tasks/UpdateTaskStatus`;
            const completeBody = {
              taskId,
              isCompletedRequest: isCompletedRequest,
            };
            if (
              completeBody.isCompletedRequest != null && completeBody.taskId != null ) {
              const completeResponse = await axios.patch(
                completeUrl,
                completeBody,
              );

              if (completeResponse.data.result.succeeded) {
                ShowMessage(1, "Completed task request sent to admin");
              } else {
                ShowMessage(
                  2,
                  completeResponse.data.result.errors[0] ||
                    "Failed to send completion request",
                );
              }
            }
          } catch (err: any) {
            ShowMessage(2, err.message || "Error sending completion request");
          }
        }
        if (taskId) {
          const saveTagsUrl = `${config.baseUrl}TaskTag/SaveTaskTag`;
          const tagPayload = {
            taskId,
            tagIds: assignedTags.map((tag) => tag.tagId),
          };

          try {
            const tagResponse = await axios.post(saveTagsUrl, tagPayload);
            if (tagResponse.data.result.succeeded) {
              ShowMessage(1, "Tags saved successfully");
            } else {
              ShowMessage(
                2,
                tagResponse.data.result.errors?.[0] || "Failed to save tags",
              );
            }
          } catch (error: any) {
            ShowMessage(2, error.message || "Error saving tags");
          }
        }

        await handleGetTask();
        await handleGetUploadedFiles();
      } else {
        ShowMessage(2, response.data.result.errors[0] || "Error saving task");
      }
    } catch (err: any) {
      ShowMessage(2, err.message || "Error saving task");
    }
  };

  const handleRemoveAssignedUser = (userId: string) => {
    setAssignedUsers((prev) => prev.filter((user) => user.userId !== userId));
  };

  const handleSubmitCodeChanings = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let savedSomething = false;

      // Save tags first
      if (params.taskId) {
        const saveTagsUrl = `${config.baseUrl}TaskTag/SaveTaskTag`;
        const tagPayload = {
          taskId: params.taskId,
          tagIds: assignedTags.map((tag) => tag.tagId),
        };
        const tagResponse = await axios.post(saveTagsUrl, tagPayload);
        if (tagResponse?.data?.result?.succeeded) {
          savedSomething = true;
        }
      }

      // Save task details (including requireCodeUpload)
      if (params.taskId) {
        const preparedData = {
          ...formData,
          requireCodeUpload: requireCodeUpload,
          dueDate: formData.dueDate === "" ? null : formData.dueDate,
          taskDate: formData.taskDate === "" ? null : formData.taskDate,
        };
        const updateTaskUrl = `${config.baseUrl}Tasks/UpdateTask`;
        const updateResponse = await axios.patch(updateTaskUrl, preparedData);
        if (updateResponse?.data?.result?.succeeded) {
          savedSomething = true;
        }
      }

      // Separate entries into new (create) and existing (update)
      const newEntries: { tagId: string; entry: any; idx: number }[] = [];
      const existingEntries: { tagId: string; entry: any; idx: number }[] = [];

      Object.entries(codeInputs).forEach(([tagId, entries]) => {
        const isTagAssigned = assignedTags.some((tag) => tag.tagId === tagId);
        if (!isTagAssigned) return;

        entries.forEach((entry, idx) => {
          if (entry.taskCodeChangeId) {
            existingEntries.push({ tagId, entry, idx });
          } else {
            newEntries.push({ tagId, entry, idx });
          }
        });
      });

      const buildFileFormData = (
        fd: FormData,
        tagId: string,
        entry: any,
        idx: number,
      ) => {
        const prefix = `${tagId}_${idx}`;

        if (entry.type === "file") {
          if (entry.oldFile) fd.append(`${prefix}_oldFile`, entry.oldFile);
          if (entry.newFile) fd.append(`${prefix}_newFile`, entry.newFile);
        }

        if (entry.type === "text") {
          if (entry.oldCode && entry.oldFileName && entry.oldExtension) {
            const oldBlob = new Blob([entry.oldCode], { type: "text/plain" });
            const oldFile = new File(
              [oldBlob],
              `${entry.oldFileName}${entry.oldExtension}`,
              { type: "text/plain" },
            );
            fd.append(`${prefix}_oldFile`, oldFile);
          }
          if (entry.newCode && entry.newFileName && entry.newExtension) {
            const newBlob = new Blob([entry.newCode], { type: "text/plain" });
            const newFile = new File(
              [newBlob],
              `${entry.newFileName}${entry.newExtension}`,
              { type: "text/plain" },
            );
            fd.append(`${prefix}_newFile`, newFile);
          }
        }

        fd.append(`${prefix}_tagId`, tagId);
        fd.append(`${prefix}_type`, entry.type ?? "");
      };

      // === UPDATE existing entries ===
      if (existingEntries.length > 0) {
        const updateFd = new FormData();
        updateFd.append("taskId", `${params.taskId}`);
        existingEntries.forEach(({ tagId, entry, idx }) => {
          const prefix = `${tagId}_${idx}`;
          updateFd.append(`${prefix}_taskCodeChangeId`, entry.taskCodeChangeId);
          buildFileFormData(updateFd, tagId, entry, idx);
        });

        const updateResponse = await axios.patch(
          `${config.baseUrl}TaskCodeChanges/UpdateTaskCodeChanges`,
          updateFd,
          { headers: { "Content-Type": "multipart/form-data" } },
        );

        if (!updateResponse.data.result.succeeded) {
          ShowMessage(
            2,
            updateResponse.data.result.errors?.[0] || "Update failed.",
          );
          return;
        }
        savedSomething = true;
        ShowMessage(1, "Code changes updated successfully.");
      }

      // === CREATE new entries ===
      if (newEntries.length > 0) {
        const createFd = new FormData();
        createFd.append("taskId", `${params.taskId}`);
        newEntries.forEach(({ tagId, entry, idx }) => {
          buildFileFormData(createFd, tagId, entry, idx);
        });

        const createResponse = await axios.post(
          `${config.baseUrl}TaskCodeChanges/UploadTaskCodeChanges`,
          createFd,
          { headers: { "Content-Type": "multipart/form-data" } },
        );

        if (!createResponse.data.result.succeeded) {
          ShowMessage(
            2,
            createResponse.data.result.errors?.[0] || "Upload failed.",
          );
          return;
        }
        savedSomething = true;
        ShowMessage(1, "New code changes saved successfully.");
      }

      if (!savedSomething) {
        ShowMessage(2, "No changes to save.");
        return;
      }

      // Refresh from server to get updated taskCodeChangeIds & file content
      await handleGetUploadedFiles();
    } catch (err: any) {
      ShowMessage(2, err.message || "Error saving code changes.");
    }
  };

  const handleDownloadFile = async (
    taskCodeChangeId?: string,
    fileName?: string,
    fileType?: string,
  ) => {
    try {
      const isDownload = window.confirm(
        `Do you want to download the file "${fileName}"?\nClick "Cancel" to just view it.`,
      );

      const response = await axios.get(
        `${config.baseUrl}TaskCodeChanges/GetTaskCodeChangeFile`,
        {
          responseType: "blob",
          params: {
            taskCodeChangeId,
            fileName,
            fileType,
          },
        },
      );

      const blob = new Blob([response.data], {
        type: response.headers["content-type"],
      });
      const fileUrl = window.URL.createObjectURL(blob);

      if (isDownload) {
        // Download logic
        const link = document.createElement("a");
        link.href = fileUrl;
        link.download = fileName ?? "file";
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        // View in new tab (image/pdf/etc.)
        window.open(fileUrl, "_blank");
      }

      // Clean up memory
      window.URL.revokeObjectURL(fileUrl);
    } catch (error) {
      console.error("File view/download failed:", error);
      ShowMessage(2, "Failed to view or download the file.");
    }
  };

  return (
    <Layout>
      <div className="d-flex align-items-center gap-3 mb-4">
        <button
          onClick={handleBack}
          className="btn btn-light btn-icon shadow-sm border transition-base hover-scale"
          title="Back"
          type="button"
        >
          <IoMdArrowRoundBack size={20} />
        </button>
        <div>
          <h2 className="mb-1 fw-bold text-dark">Edit Task</h2>
          <p className="text-muted mb-0">
            Update task details, assignees, attachments, and code changes.
          </p>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-lg overflow-hidden mb-4">
        <div className="card-header bg-white border-bottom px-4 py-3">
          <h5 className="mb-0 fw-semibold text-dark">Task Details</h5>
        </div>
        <div className="card-body p-4 p-md-5">
          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-3">
              <div className="col-md-2">
                <label className="form-label fw-bold">Task No</label>
                <input
                  type="text"
                  className="form-control"
                  name="taskNo"
                  value={formData.taskNo}
                  onChange={handleInputChange}
                  disabled={userRole == "USER" ? true : false}
                />
              </div>
              <div className="col-md-10">
                <label className="form-label fw-bold">Title</label>
                <input
                  type="text"
                  className="form-control"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>
              {/* <div className="col-md-5" >
                <label className="form-label fw-bold">Description</label>
                <input
                  type="text"
                  className="form-control"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div> */}
            </div>

            <div className="row g-4 mb-4">
              <div className="col-md-9">
                <label className="form-label fw-medium text-dark small mb-1">
                  Description
                </label>
                <textarea
                  className="form-control  px-3 py-2"
                  name="description"
                  placeholder="Detailed description of the task"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-bold">Attachment</label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: isDragging
                      ? "2px dashed #0d6efd"
                      : "2px dashed #ced4da",
                    borderRadius: "8px",
                    padding: file || existingFileName ? "10px" : "20px",
                    textAlign: "center",
                    cursor: "pointer",
                    backgroundColor: isDragging ? "#f8f9fa" : "#ffffff",
                    transition: "all 0.3s ease",
                    position: "relative",
                  }}
                >
                  <input
                    type="file"
                    style={{ display: "none" }}
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                  {file ? (
                    <div className="d-flex flex-column align-items-center">
                      {file.type.startsWith("image/") ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt="preview"
                          style={{
                            maxHeight: "80px",
                            maxWidth: "100%",
                            borderRadius: "8px",
                            objectFit: "contain",
                            marginBottom: "5px",
                          }}
                        />
                      ) : (
                        <div style={{ fontSize: "30px", marginBottom: "5px" }}>
                          <i className="bi bi-file-earmark-text"></i>
                        </div>
                      )}
                      <span className="text-muted small text-truncate w-100 px-2">
                        {file.name}
                      </span>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger mt-2 py-0 px-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                          if (fileInputRef.current)
                            fileInputRef.current.value = "";
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ) : existingFileName ? (
                    <div className="d-flex flex-column align-items-center">
                      {existingFileUrl ? (
                        <img
                          src={existingFileUrl}
                          alt="preview"
                          style={{
                            maxHeight: "80px",
                            maxWidth: "100%",
                            borderRadius: "8px",
                            objectFit: "contain",
                            marginBottom: "5px",
                          }}
                        />
                      ) : (
                        <div style={{ fontSize: "30px", marginBottom: "5px" }}>
                          <i className="bi bi-file-earmark-check"></i>
                        </div>
                      )}
                      <span className="text-muted small text-truncate w-100 px-2">
                        {existingFileName}
                      </span>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary mt-2 py-0 px-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (fileInputRef.current) {
                            fileInputRef.current.click();
                          }
                        }}
                      >
                        Change File
                      </button>
                    </div>
                  ) : (
                    <div className="text-muted">
                      <i
                        className="bi bi-cloud-arrow-up"
                        style={{ fontSize: "24px" }}
                      ></i>
                      <p className="mb-0 mt-1 small">Drag & drop or click</p>
                    </div>
                  )}
                </div>
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
                  disabled={userRole == "USER" ? true : false}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label fw-bold">Priority</label>
                <select
                  name="priority"
                  className="form-select"
                  value={formData.priority}
                  onChange={handleInputChange}
                >
                  <option value="" disabled>
                    Select Priority
                  </option>
                  {priority.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              {/* <div className="col-md-4">
                <div className="row"> */}
              <div className="col-md-3">
                <label className="form-label fw-bold">Task Date</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  name="taskDate"
                  value={formData.taskDate || ""}
                  onChange={handleInputChange}
                  disabled={userRole == "USER" ? true : false}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-bold">Due Date</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  name="dueDate"
                  value={formData.dueDate || ""}
                  onChange={handleInputChange}
                  disabled={userRole == "USER" ? true : false}
                />
              </div>
              {/* </div>
              </div> */}
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
                <label className="form-label fw-bold">Assign To</label>
                <select
                  name="assignedby"
                  className="form-select"
                  value={formTaskAssignee.assignedby}
                  onChange={handleUserInputChange}
                >
                  <option value="" disabled>
                    Select User
                  </option>
                  {users.map((u) => {
                    const isAssigned = assignedUsers.some(
                      (assigned) => assigned.userId === u.userId,
                    );

                    const isUserRole =
                      user?.roles?.[0]?.toLowerCase() === "user";

                    return (
                      <option
                        key={u.userId}
                        value={u.userId}
                        disabled={isUserRole && u.userId !== user?.userId}
                        style={{
                          backgroundColor:
                            !isUserRole && isAssigned ? "#28a745" : undefined,
                          color: !isUserRole && isAssigned ? "#fff" : undefined,
                        }}
                      >
                        {u.userName}
                      </option>
                    );
                  })}
                </select>
              </div>

              {assignedUsers.length > 0 && (
                <div className="col-md-3">
                  <label className="form-label fw-bold">Assignee's</label>
                  <div
                    className="form-control d-flex flex-wrap gap-1"
                    style={{ minHeight: "40px" }}
                  >
                    {assignedUsers.map((assignedUser) => (
                      <span
                        key={assignedUser.userId}
                        className="badge bg-primary d-flex align-items-center"
                        style={{ padding: "5px 10px", fontSize: "0.9rem" }}
                      >
                        {assignedUser.userName}
                        {(user?.roles[0] !== "USER" ||
                          user?.userId === assignedUser.userId) && (
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveAssignedUser(assignedUser.userId)
                            }
                            className="btn-close btn-close-white btn-sm ms-2"
                            aria-label="Remove"
                            style={{ fontSize: "0.6rem" }}
                          ></button>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="row g-3 mt-1">
              <div className="col-md-3">
                <label className="form-label fw-bold">Tags</label>
                <select
                  name="tagId"
                  className="form-select"
                  onChange={(e) => {
                    const selectedTagId = e.target.value;
                    if (!selectedTagId) return;

                    const selectedTag = tags.find(
                      (tag) => tag.tagId === selectedTagId,
                    );
                    if (
                      selectedTag &&
                      !assignedTags.some(
                        (tag) => tag.tagId === selectedTag.tagId,
                      )
                    ) {
                      setAssignedTags([...assignedTags, selectedTag]);
                    }

                    e.target.value = "";
                  }}
                  disabled={
                    formData.status === "COMPLETED" &&
                    formData.isActive === false
                  }
                >
                  <option value="">Select Tag</option>
                  {tags.map((mod) => (
                    <option
                      key={mod.tagId}
                      value={mod.tagId}
                      disabled={assignedTags.some(
                        (tag) => tag.tagId === mod.tagId,
                      )}
                    >
                      {mod.tagName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                {assignedTags.length > 0 && (
                  <div className="col-md-12">
                    <label className="form-label fw-bold">Assigned Tags</label>
                    <div
                      className="form-control d-flex flex-wrap gap-1"
                      style={{ minHeight: "40px" }}
                    >
                      {assignedTags.map((tag) => (
                        <span
                          key={tag.tagId}
                          className="badge bg-primary d-flex align-items-center"
                          style={{ fontSize: "0.85rem", cursor: "pointer" }}
                          onClick={() => {
                            setAssignedTags(
                              assignedTags.filter((t) => t.tagId !== tag.tagId),
                            );
                          }}
                        >
                          {tag.tagName} <span className="ms-1">✖</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="col-md-3">
                {assignedTags.length > 0 && (
                  <div className="row mt-3">
                    <div className="col-md-12 d-flex justify-content-start align-items-center gap-2">
                      <label
                        htmlFor="uploadCodeCheckbox"
                        className="form-label fw-bold mt-2"
                        style={{ cursor: "pointer" }}
                      >
                        Upload Code Changes (required for tagged tasks)
                      </label>
                      <input
                        type="checkbox"
                        name="uploadCodeCheckbox"
                        id="uploadCodeCheckbox"
                        className="form-check-input"
                        style={{
                          width: "24px",
                          height: "24px",
                          cursor: "pointer",
                          border: "2px solid #b9b9b9ff",
                          borderRadius: "4px",
                        }}
                        checked={requireCodeUpload}
                        onChange={(e) => setRequireCodeUpload(e.target.checked)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="row g-4 mt-1">
              <div className="col-md-3">
                <label className="form-label fw-bold">Status</label>
                <select
                  name="status"
                  className="form-select"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="" disabled>
                    Select Status
                  </option>
                  {status.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-3">
                {formData?.status === "COMPLETED" && (
                  <div className="row mt-3">
                    <div className="col-md-12 d-flex justify-content-start align-items-center gap-2">
                      <label
                        htmlFor="completeRequest"
                        className="form-label fw-bold mt-2"
                        style={{ cursor: "pointer" }}
                      >
                        Send Completed Task Request to Admin
                      </label>
                      <input
                        type="checkbox"
                        name="completeRequest"
                        id="completeRequest"
                        className="form-check-input"
                        style={{
                          width: "24px",
                          height: "24px",
                          cursor: "pointer",
                          border: "2px solid #b9b9b9ff",
                          borderRadius: "4px",
                        }}
                        checked={isCompletedRequest}
                        onChange={(e) =>
                          setIsCompletedRequest(e.target.checked)
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="d-flex justify-content-end gap-3 mt-5 pt-4 border-top">
              <button
                type="submit"
                className="btn btn-primary px-4 fw-medium shadow-sm transition-base d-flex align-items-center gap-2"
              >
                <i className="bi bi-check2"></i>
                Update Task
              </button>
            </div>
          </form>
        </div>
      </div>

      {requireCodeUpload && (
        <div className="card border-0 shadow-sm rounded-lg overflow-hidden">
          <div className="card-header bg-white border-bottom px-4 py-3 d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-semibold text-dark">Code Changes</h5>
          </div>
          <div className="card-body p-4 p-md-5">
            <form onSubmit={handleSubmitCodeChanings}>
              {assignedTags.map((tag) => (
                <div key={tag.tagId} className="mb-4">
                  <div
                    className="text-uppercase fw-bold text-white px-3 py-2"
                    style={{
                      backgroundColor: "#0d6efd",
                      marginBottom: "1rem",
                      borderRadius: "4px",
                      fontSize: "1rem",
                      letterSpacing: "1px",
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    {tag.tagName}
                  </div>

                  {(codeInputs[tag.tagId] || []).map((input, idx) => (
                    <div
                      key={idx}
                      className="border p-3 rounded mb-3 bg-light position-relative"
                    >
                      {/* Remove row button */}
                      <button
                        type="button"
                        className="btn-close position-absolute top-0 end-0 m-2"
                        onClick={async () => {
                          if (
                            window.confirm(
                              "Are you sure you want to delete this code change file?",
                            )
                          ) {
                            const updatedInputs = [
                              ...(codeInputs[tag.tagId] || []),
                            ];

                            const deletedRow = updatedInputs[idx];
                            if (deletedRow.taskCodeChangeId) {
                              try {
                                var response = await axios.delete(
                                  `${config.baseUrl}TaskCodeChanges/DeleteTaskCodeChange`,
                                  {
                                    data: {
                                      taskCodeChangeId:
                                        deletedRow.taskCodeChangeId,
                                    },
                                  },
                                );
                                if (response.data.result.succeeded) {
                                  ShowMessage(1, "Row deleted successfully.");
                                }
                              } catch (err) {
                                ShowMessage(2, "Failed to delete row.");
                                return;
                              }
                            }
                            updatedInputs.splice(idx, 1);
                            setCodeInputs((prev) => ({
                              ...prev,
                              [tag.tagId]: updatedInputs,
                            }));
                          }
                        }}
                      />

                      {/* Initial selection */}
                      {input.type === null ? (
                        <div className="d-flex gap-2">
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => {
                              const updatedInputs = [
                                ...(codeInputs[tag.tagId] || []),
                              ];
                              updatedInputs[idx] = {
                                ...updatedInputs[idx],
                                type: "file",
                              };
                              setCodeInputs((prev) => ({
                                ...prev,
                                [tag.tagId]: updatedInputs,
                              }));
                            }}
                          >
                            📁 Upload Code
                          </button>

                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => {
                              const updatedInputs = [
                                ...(codeInputs[tag.tagId] || []),
                              ];
                              updatedInputs[idx] = {
                                ...updatedInputs[idx],
                                type: "text",
                                showOld: true,
                                showNew: true,
                              };
                              setCodeInputs((prev) => ({
                                ...prev,
                                [tag.tagId]: updatedInputs,
                              }));
                            }}
                          >
                            📝 Write Textual Code Explanation
                          </button>
                        </div>
                      ) : input.type === "file" ? (
                        <>
                          <div className="fw-semibold mb-2">
                            📁 Code File Upload Selected
                          </div>
                          <div className="row">
                            <div className="col-md-6">
                              <label className="form-label">Old File</label>

                              <div className="custom-file">
                                <input
                                  type="file"
                                  className="form-control"
                                  disabled={
                                    !!(input.oldFileName && input.oldExtension)
                                  }
                                  onChange={(e) => {
                                    const oldFile = e.target.files?.[0] || null;
                                    const updatedInputs = [
                                      ...(codeInputs[tag.tagId] || []),
                                    ];
                                    updatedInputs[idx] = {
                                      ...updatedInputs[idx],
                                      oldFile,
                                    };
                                    setCodeInputs((prev) => ({
                                      ...prev,
                                      [tag.tagId]: updatedInputs,
                                    }));
                                  }}
                                />

                                {/* Show selected or existing file name visually */}
                                <label className="form-text text-muted mt-1">
                                  {input.oldFile
                                    ? input.oldFile.name
                                    : input.oldFileName && input.oldExtension
                                      ? `${input.oldFileName}${input.oldExtension}`
                                      : "No file selected"}
                                </label>
                              </div>

                              {/* Download button */}
                              {input.taskCodeChangeId &&
                                input.oldFileName &&
                                input.oldExtension && (
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-success mt-2"
                                    onClick={() =>
                                      handleDownloadFile(
                                        input.taskCodeChangeId,
                                        `${input.oldFileName}${input.oldExtension}`,
                                        "OLD",
                                      )
                                    }
                                  >
                                    📥 Download Old File
                                  </button>
                                )}
                            </div>

                            <div className="col-md-6">
                              <label className="form-label">New File</label>
                              <div className="custom-file">
                                <input
                                  type="file"
                                  className="form-control"
                                  disabled={
                                    !!(input.newFileName && input.newExtension)
                                  }
                                  onChange={(e) => {
                                    const newFile = e.target.files?.[0] || null;
                                    const updatedInputs = [
                                      ...(codeInputs[tag.tagId] || []),
                                    ];
                                    updatedInputs[idx] = {
                                      ...updatedInputs[idx],
                                      newFile,
                                    };
                                    setCodeInputs((prev) => ({
                                      ...prev,
                                      [tag.tagId]: updatedInputs,
                                    }));
                                  }}
                                />
                                <label className="form-text text-muted mt-1">
                                  {input.newFile
                                    ? input.newFile.name
                                    : input.newFileName && input.newExtension
                                      ? `${input.newFileName}${input.newExtension}`
                                      : "No file selected"}
                                </label>
                              </div>

                              {input.newFileName &&
                                input.newExtension &&
                                input.taskCodeChangeId && (
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-success mt-2"
                                    onClick={() =>
                                      handleDownloadFile(
                                        input.taskCodeChangeId,
                                        `${input.newFileName}${input.newExtension}`,
                                        "NEW",
                                      )
                                    }
                                  >
                                    📥 Download New File
                                  </button>
                                )}
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="fw-semibold mb-2">
                            📝 Textual Code Explanation Selected
                          </div>

                          <div className="d-flex gap-2 mb-3">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-dark"
                              onClick={() => {
                                const updated = [
                                  ...(codeInputs[tag.tagId] || []),
                                ];
                                updated[idx].showOld = !updated[idx].showOld;
                                setCodeInputs((prev) => ({
                                  ...prev,
                                  [tag.tagId]: updated,
                                }));
                              }}
                            >
                              {input.showOld ? "Hide" : "Show"} Old Code
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-dark"
                              onClick={() => {
                                const updated = [
                                  ...(codeInputs[tag.tagId] || []),
                                ];
                                updated[idx].showNew = !updated[idx].showNew;
                                setCodeInputs((prev) => ({
                                  ...prev,
                                  [tag.tagId]: updated,
                                }));
                              }}
                            >
                              {input.showNew ? "Hide" : "Show"} New Code
                            </button>
                          </div>

                          {input.showOld && (
                            <>
                              <div className="row">
                                <div className="col-md-4">
                                  <label className="form-label">
                                    Old File Name
                                  </label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Old File Name"
                                    value={input.oldFileName || ""}
                                    onChange={(e) => {
                                      const updated = [
                                        ...(codeInputs[tag.tagId] || []),
                                      ];
                                      updated[idx] = {
                                        ...updated[idx],
                                        oldFileName: e.target.value,
                                      };
                                      setCodeInputs((prev) => ({
                                        ...prev,
                                        [tag.tagId]: updated,
                                      }));
                                    }}
                                  />
                                </div>
                                <div className="col-md-4">
                                  <label className="form-label">
                                    Old Extension
                                  </label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    placeholder=".js / .cs"
                                    value={input.oldExtension || ""}
                                    onChange={(e) => {
                                      const updated = [
                                        ...(codeInputs[tag.tagId] || []),
                                      ];
                                      updated[idx] = {
                                        ...updated[idx],
                                        oldExtension: e.target.value,
                                      };
                                      setCodeInputs((prev) => ({
                                        ...prev,
                                        [tag.tagId]: updated,
                                      }));
                                    }}
                                  />
                                </div>
                                <div className="col-md-12 mt-2">
                                  <label className="form-label">Old Code</label>
                                  <textarea
                                    className="form-control"
                                    rows={3}
                                    placeholder="Paste old code here..."
                                    value={input.oldCode || ""}
                                    onChange={(e) => {
                                      const updated = [
                                        ...(codeInputs[tag.tagId] || []),
                                      ];
                                      updated[idx] = {
                                        ...updated[idx],
                                        oldCode: e.target.value,
                                      };
                                      setCodeInputs((prev) => ({
                                        ...prev,
                                        [tag.tagId]: updated,
                                      }));
                                    }}
                                  />
                                </div>
                              </div>

                              {/* Download Old — show when filename+extension set and there's content in textarea */}
                              {input.oldFileName &&
                                input.oldExtension &&
                                input.oldCode && (
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-success mt-2 me-2"
                                    onClick={() => {
                                      const blob = new Blob(
                                        [input.oldCode as string],
                                        { type: "text/plain" },
                                      );
                                      const link = document.createElement("a");
                                      link.href = URL.createObjectURL(blob);
                                      link.download = `${input.oldFileName}${input.oldExtension}`;
                                      link.click();
                                      URL.revokeObjectURL(link.href);
                                    }}
                                  >
                                    📥 Download Old Code
                                  </button>
                                )}
                            </>
                          )}

                          {input.showNew && (
                            <>
                              <div className="row mt-3">
                                <div className="col-md-4">
                                  <label className="form-label">
                                    New File Name
                                  </label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    placeholder="New File Name"
                                    value={input.newFileName || ""}
                                    onChange={(e) => {
                                      const updated = [
                                        ...(codeInputs[tag.tagId] || []),
                                      ];
                                      updated[idx] = {
                                        ...updated[idx],
                                        newFileName: e.target.value,
                                      };
                                      setCodeInputs((prev) => ({
                                        ...prev,
                                        [tag.tagId]: updated,
                                      }));
                                    }}
                                  />
                                </div>
                                <div className="col-md-4">
                                  <label className="form-label">
                                    New Extension
                                  </label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    placeholder=".js / .cs"
                                    value={input.newExtension || ""}
                                    onChange={(e) => {
                                      const updated = [
                                        ...(codeInputs[tag.tagId] || []),
                                      ];
                                      updated[idx] = {
                                        ...updated[idx],
                                        newExtension: e.target.value,
                                      };
                                      setCodeInputs((prev) => ({
                                        ...prev,
                                        [tag.tagId]: updated,
                                      }));
                                    }}
                                  />
                                </div>
                                <div className="col-md-12 mt-2">
                                  <label className="form-label">New Code</label>
                                  <textarea
                                    className="form-control"
                                    rows={3}
                                    placeholder="Paste new code here..."
                                    value={input.newCode || ""}
                                    onChange={(e) => {
                                      const updated = [
                                        ...(codeInputs[tag.tagId] || []),
                                      ];
                                      updated[idx] = {
                                        ...updated[idx],
                                        newCode: e.target.value,
                                      };
                                      setCodeInputs((prev) => ({
                                        ...prev,
                                        [tag.tagId]: updated,
                                      }));
                                    }}
                                  />
                                </div>
                              </div>

                              {/* Download New — show when filename+extension set and there's content in textarea */}
                              {input.newFileName &&
                                input.newExtension &&
                                input.newCode && (
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-success mt-2 me-2"
                                    onClick={() => {
                                      const blob = new Blob(
                                        [input.newCode as string],
                                        { type: "text/plain" },
                                      );
                                      const link = document.createElement("a");
                                      link.href = URL.createObjectURL(blob);
                                      link.download = `${input.newFileName}${input.newExtension}`;
                                      link.click();
                                      URL.revokeObjectURL(link.href);
                                    }}
                                  >
                                    📥 Download New Code
                                  </button>
                                )}
                            </>
                          )}
                        </>
                      )}
                    </div>
                  ))}

                  {/* ➕ Add New Entry */}
                  <div className="d-flex">
                    <button
                      type="button"
                      className="btn btn-sm btn-success"
                      onClick={() => {
                        setCodeInputs((prev) => ({
                          ...prev,
                          [tag.tagId]: [
                            ...(prev[tag.tagId] || []),
                            { type: null },
                          ],
                        }));
                      }}
                    >
                      ➕ Add New Entry
                    </button>
                  </div>
                </div>
              ))}
              <div className="d-flex justify-content-end gap-3 pt-4 border-top">
                <button
                  type="submit"
                  className="btn btn-primary px-4 fw-medium shadow-sm transition-base d-flex align-items-center gap-2"
                >
                  <i className="bi bi-cloud-upload"></i>
                  Save Code Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default EditTask;
