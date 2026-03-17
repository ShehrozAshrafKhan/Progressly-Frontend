import  { useState, useEffect } from "react";
import { CiEdit } from "react-icons/ci";
import { ShowMessage } from "../../Components/Common/ShowMessage";
import config from "../../config";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Layout from "../../layouts/Layout";

type Module = {
  projectId: string;
  moduleId: string;
  description: string;
  isActive: boolean;
  moduleName: string;
  projectName: string;
};
const Modules = () => {
  const navigate = useNavigate();
  const [tblData, setTblData] = useState<Module[]>([]);

  useEffect(() => {
    handleGetModules();
  }, []);

  const handleGetModules = async () => {
    try {
      const url = `${config.baseUrl}Modules/GetModules`;
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
        ShowMessage(2, "No Module data found.");
      }
    } catch (e: any) {
      ShowMessage(
        2,
        e.message || "Something went wrong while fetching Modules."
      );
    }
  };

  const handleAddNewModule = () => {
    navigate("/admin/addNewModule");
  };

  const handleEdit = (moduleId: string) => {
    navigate(`/admin/editModule/${moduleId}`);
  };

  const handleInputChange = (moduleId: string) => {
    const updatedData = tblData.map((item) =>
      item.moduleId === moduleId ? { ...item, isActive: !item.isActive } : item
    );
    setTblData(updatedData);
    const updatedObj = updatedData.find((x) => x.moduleId === moduleId);
    handleSubmit(updatedObj);
  };

  const handleSubmit = async (updatedObj: any) => {
    try {
      console.log(updatedObj);
      const url = `${config.baseUrl}Modules/UpdateModule`;
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

  const handlePrintModule = async () => {
  try {
    const response = await axios.get(`${config.baseUrl}Reports/ModulesReport`, {
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1 fw-bold text-dark">Modules</h2>
          <p className="text-muted mb-0">Manage and monitor all system modules.</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-light border d-flex align-items-center gap-2 transition-base px-3 hover-bg-light shadow-sm" type="button" onClick={handlePrintModule}>
            <i className="bi bi-printer text-muted"></i> 
            <span className="fw-medium">Print</span>
          </button>
          <button className="btn btn-primary d-flex align-items-center gap-2 transition-base px-3 shadow-sm" type="button" onClick={handleAddNewModule}>
            <i className="bi bi-plus-lg"></i> 
            <span className="fw-medium">Add New</span>
          </button>
        </div>
      </div>
      
      <div className="card border-0 shadow-sm rounded-lg overflow-hidden mt-3">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-muted">
                <tr>
                  <th className="px-4 py-3 text-uppercase fw-semibold" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>Module Name</th>
                  <th className="px-4 py-3 text-uppercase fw-semibold" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>Description</th>
                  <th className="px-4 py-3 text-uppercase fw-semibold" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>Project Name</th>
                  <th className="px-4 py-3 text-uppercase fw-semibold" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>Status</th>
                  <th className="px-4 py-3 text-end text-uppercase fw-semibold" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>Action</th>
                </tr>
              </thead>
              <tbody className="border-top-0">
               {tblData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-5 text-muted">
                      <div className="d-flex flex-column align-items-center">
                         <i className="bi bi-inbox fs-1 mb-2 text-light"></i>
                         <p className="mb-0">No modules found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                 tblData.map((item, index) => (
                  <tr key={item.moduleId || index} className="transition-base">
                    <td className="px-4 py-3 fw-medium text-dark">{item.moduleName}</td>
                    <td className="px-4 py-3 text-muted">{item.description}</td>
                    <td className="px-4 py-3">
                        <span className="badge bg-light text-dark border px-2 py-1 fw-medium">{item.projectName}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="form-check form-switch m-0 d-flex align-items-center">
                        <input
                          className="form-check-input cursor-pointer"
                          type="checkbox"
                          role="switch"
                          id={`flexSwitchCheckChecked-${index}`}
                          checked={item.isActive}
                          onChange={() => handleInputChange(item.moduleId)}
                          style={{ 
                            width: "2.5rem", 
                            height: "1.25rem",
                            backgroundColor: item.isActive ? 'var(--bs-primary)' : '',
                            borderColor: item.isActive ? 'var(--bs-primary)' : ''
                          }}
                        />
                        <label className="form-check-label ms-2 small fw-medium" htmlFor={`flexSwitchCheckChecked-${index}`}>
                          <span className={item.isActive ? 'text-primary' : 'text-muted'}>
                            {item.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </label>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-end">
                       <button
                          className="btn btn-sm btn-light text-primary border rounded-circle transition-base"
                          onClick={() => handleEdit(item.moduleId)}
                          title="Edit Module"
                          style={{ width: '36px', height: '36px', padding: 0 }}
                        >
                          <CiEdit fontSize={20} />
                        </button>
                    </td>
                  </tr>
                ))
               )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Modules;
