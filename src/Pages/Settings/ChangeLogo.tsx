import { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useUser } from "../../contexts/UserContext";
import config from "../../config";
import { ShowMessage } from "../../Components/Common/ShowMessage";
import Layout from "../../layouts/Layout";

const ChangeLogo = () => {
  const { user } = useUser();
  const userRole = user?.roles[0];
  const navigate = useNavigate();
  const handleBack = () => {
    navigate("/dashboard");
  };
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setFile(e.target.files[0]);
    }
  };
    const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const [formData, setFormData] = useState({
    applicationName: "",
    redirectLink:""
  });

  const handleClear = () => {
    setFormData({
      applicationName: "",
      redirectLink:""
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (userRole!=="USER") {
  if (!formData.applicationName) {
    ShowMessage(2,"Application Name is required");
    return;
  }
  if (!formData.redirectLink) {
    ShowMessage(2,"Application Link is required");
    return;
  }
  if (!file) {
    ShowMessage(2,"Logo file is required");
    return;
  }
  const submitData = new FormData();
  submitData.append("applicationName", formData.applicationName);
  submitData.append("redirectLink", formData.redirectLink);
  submitData.append("file", file);

  try {
    const res = await axios.post(
      `${config.baseUrl}GeneralSettings/SaveApplicationNameLogo`,
      submitData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (res.data?.result.succeeded) {
      ShowMessage(1,"Settings saved successfully");
      handleClear();
      if (fileInputRef.current) fileInputRef.current.value = "";
      setFile(null);
    } else {
      ShowMessage(2,res.data?.message || "Something went wrong");
    }
  } catch (error) {
    console.error(error);
    ShowMessage(2,"Failed to submit data");
  }}
  else{
    ShowMessage(2,"Only Admin Can Change Settings");
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
          <h2 className="">Change Logo</h2>
        </div>
        <form className="form" onSubmit={handleSubmit}>
          <div className="p-5 border rounded-3 card shadow-sm">
            <div className="row g-3 align-items-center">
                <div className="col-md-4">
                <label className="form-label fw-bold">Application Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="applicationName"
                  value={formData.applicationName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold">Application Link</label>
                <input
                  type="text"
                  className="form-control"
                  name="redirectLink"
                  value={formData.redirectLink}
                  onChange={handleInputChange}
                />
              </div>
               <div className="col-md-4">
                <label className="form-label fw-bold">Logo</label>
                <input
                  type="file"
                  className="form-control"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
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

export default ChangeLogo;
