import { useState, useEffect } from "react";
import { ShowMessage } from "../../Components/Common/ShowMessage";
import config from "../../config";
import axios from "axios";
import Layout from "../../layouts/Layout";

type User = {
  id: string;
  userName: string;
  email: string;
  isActive: boolean;
};
const Admins = () => {
  const [tblData, setTblData] = useState<User[]>([]);

  useEffect(() => {
    handleGetAdminUsers();
  }, []);

  const handleGetAdminUsers = async () => {
    try {
      const url = `${config.baseUrl}Auth/GetAdminUsers`;
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
        ShowMessage(2, "No Admin User data found.");
      }
    } catch (e: any) {
      ShowMessage(
        2,
        e.message || "Something went wrong while fetching Admin Users."
      );
    }
  };

//   const handleAddNewProject=()=>{
//     navigate("/admin/addNewProject");
//   }

//   const handleEdit=(projectId:string)=>{
//      navigate(`/admin/editProject/${projectId}`);
//   }

const handleInputChange = (id: string) => {
  const updatedData = tblData.map((item) =>
    item.id === id
      ? { ...item, isActive: !item.isActive }
      : item
  );
  setTblData(updatedData);
   const updatedObj = updatedData.find((x) => x.id === id);
   handleSubmit(updatedObj);
};


const handleSubmit = async (updatedObj: any) => {
  try {
    const url = `${config.baseUrl}Auth/UpdateProfile`;

    const formData = new FormData();

    for (const key in updatedObj) {
      if (updatedObj.hasOwnProperty(key)) {
        let value = updatedObj[key];

        // Force email to null if it has any value
        if (key === "email" && value !== null && value !== "") {
          value = ""; // Sending empty string to represent null
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1 fw-bold text-dark">Admins</h2>
          <p className="text-muted mb-0">Manage system administrators and their statuses.</p>
        </div>
        {/* <div className="d-flex gap-2">
          <button className="btn btn-primary d-flex align-items-center gap-2 transition-base px-3 shadow-sm" type="button" onClick={handleAddNewTag}>
            <i className="bi bi-plus-lg"></i> 
            <span className="fw-medium">Add New</span>
          </button>
        </div> */}
      </div>

      <div className="card border-0 shadow-sm rounded-lg overflow-hidden mt-3">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-muted">
                <tr>
                  <th className="px-4 py-3 text-uppercase fw-semibold" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>User Name</th>
                  <th className="px-4 py-3 text-uppercase fw-semibold" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>Email</th>
                  <th className="px-4 py-3 text-uppercase fw-semibold" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>Status</th>
                </tr>
              </thead>
              <tbody className="border-top-0">
                {tblData.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-5 text-muted">
                      <div className="d-flex flex-column align-items-center">
                        <i className="bi bi-people fs-1 mb-2 text-light"></i>
                        <p className="mb-0">No admins found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  tblData.map((item, index) => (
                    <tr key={item.id || index} className="transition-base">
                      <td className="px-4 py-3 fw-medium text-dark d-flex align-items-center gap-3">
                         <div className="bg-light-soft text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: '40px', height: '40px', fontSize: '1.2rem' }}>
                            {item.userName.charAt(0).toUpperCase()}
                         </div>
                         {item.userName}
                      </td>
                      <td className="px-4 py-3 text-muted">{item.email}</td>
                      <td className="px-4 py-3">
                        <div className="form-check form-switch m-0 d-flex align-items-center">
                          <input
                            className="form-check-input cursor-pointer"
                            type="checkbox"
                            role="switch"
                            id={`flexSwitchCheckChecked-${index}`}
                            checked={item.isActive}
                            onChange={() => handleInputChange(item.id)}
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

export default Admins;
