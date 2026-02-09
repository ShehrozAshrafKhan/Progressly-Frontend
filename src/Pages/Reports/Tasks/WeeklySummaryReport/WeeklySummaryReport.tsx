import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { IoMdArrowRoundBack } from "react-icons/io";
import config from "../../../../config";
import { ShowMessage } from "../../../../Components/Common/ShowMessage";
import Layout from "../../../../layouts/Layout";
import { openReport } from "../../../../utils/openReport";
import { useUser } from "../../../../contexts/UserContext";

type User = {
  userId: string;
  userName: string;
  email: string;
  isActive: boolean;
};

const WeeklySummaryReport = () => {
  const {user}=useUser();
  const userRole=user?.roles[0];
  const [UsersData, setUsersData] = useState<User[]>([]);
  const navigate = useNavigate();
  const handleBack = () => {
    navigate("/admin/modules");
  };
  const [formData, setFormData] = useState({
    userId: "",
    fromDate: "",
    toDate: "",
  });

  useEffect(() => {
    handleGetAllActiveUsers();
    const today = new Date();
    const priorDate = new Date();
    priorDate.setDate(today.getDate() - 7);

    const formatDate = (date: Date) => {
      return date.toISOString().split("T")[0];
    };

    setFormData((prev) => ({
      ...prev,
      fromDate: formatDate(priorDate),
      toDate: formatDate(today),
    }));
  }, []);

  const handleGetAllActiveUsers = async () => {
    if (userRole!=="USER") {
    try {
      const url = `${config.baseUrl}Auth/GetAllActiveUsers`;
      const response = await axios.get(url);

      if (
        response?.data?.result?.succeeded === false &&
        response.data.result.errors?.length > 0
      ) {
        ShowMessage(2, response.data.result.errors[0]);
      } else if (response?.data?.result?.succeeded === true) {
        setUsersData(response.data.data);
        console.log(response.data.data);
      } else {
        console.log(response.data.data);
        ShowMessage(2, "No User data found.");
      }
    } catch (e: any) {
      ShowMessage(2, e.message || "Something went wrong while fetching Users.");
    }
  }else{
        setUsersData([{
       userId:user?.userId??"",
      userName:user?.name??"",
      email:"",
      isActive:true
    }])
  }
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClear = () => {
    const today = new Date();
    const priorDate = new Date();
    priorDate.setDate(today.getDate() - 7);

    const formatDate = (date: Date) => {
      return date.toISOString().split("T")[0];
    };

    setFormData((prev) => ({
      ...prev,
      userId: "",
      fromDate: formatDate(priorDate),
      toDate: formatDate(today),
      reportType: "",
    }));
  };

  const handleWeeklyReport = async (e: any) => {
    e.preventDefault();

    const userId = formData.userId;
    const fromDate = formData.fromDate;
    const toDate = formData.toDate;
    const url = `${config.baseUrl}Reports/WeeklySummaryReport?userId=${userId}&fromDate=${fromDate}&toDate=${toDate}`;
    openReport(
      url,
      () => {
        handleClear();
      },
      () => {
        ShowMessage(2, "Failed to generate report.");
      }
    );
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
          <h2 className="">Weekly Summary Report</h2>
        </div>
        <form className="form" onSubmit={handleWeeklyReport}>
          <div className="p-5 border rounded-3 card shadow-sm">
            <div className="row g-3 align-items-center">
              <div className="col-md-4">
                <label className="form-label fw-bold" htmlFor="userId">Users</label>
                <select
                  name="userId"
                  id="userId"
                  className="form-select"
                  value={formData.userId}
                  onChange={handleInputChange}
                >
                  <option value=""> Select User </option>
                  {UsersData.map((item) => (
                    <option key={item.userId} value={item.userId}>
                      {item.userName}
                    </option>
                  ))}
                </select>
              </div>
           
              <div className="col-md-4">
                <label className="form-label fw-bold">From Date</label>
                <input
                  type="date"
                  className="form-control"
                  name="fromDate"
                  value={formData.fromDate || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold">To Date</label>
                <input
                  type="date"
                  className="form-control"
                  name="toDate"
                  value={formData.toDate || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="d-flex mt-4 justify-content-end">
              <button className="btn btn-primary px-5" type="submit">
                Print
              </button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default WeeklySummaryReport;
