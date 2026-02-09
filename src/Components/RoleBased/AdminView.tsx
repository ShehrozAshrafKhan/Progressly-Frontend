import { useState, useEffect } from "react";
import Layout from "../../layouts/Layout";
import axios from "axios";
import config from "../../config";
import { ShowMessage } from "../Common/ShowMessage";
import { useNavigate } from "react-router-dom";

const AdminView = () => {
  const navigate=useNavigate();
  const [formData, setFormData] = useState({
    totalTasks: 0,
    activeUsers: 0,
    pendingApprovals: 0,
  });
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [tasksRes, usersRes, approvalsRes] = await Promise.all([
        axios.get(`${config.baseUrl}Tasks/GetTasksCount`),
        axios.get(`${config.baseUrl}Users/GetAllActiveUsersCount`),
        axios.get(`${config.baseUrl}Tasks/GetIsCompletedTasksCount`),
      ]);

      setFormData({
        totalTasks: tasksRes.data.data,
        activeUsers: usersRes.data.data,
        pendingApprovals: approvalsRes.data.data,
      });
    } catch (error) {
      ShowMessage(2, "Error fetching dashboard data " + error);
    }
  };

  const handleClick = (type: string) => {
    if (type == "TOTAL_TASKS") {
      navigate('/tasks')
    } else if (type == "ACTIVE_USERS") {
      navigate('/users/getAllActiveUsers')
    } else {
        navigate('/admin/tasks/pendingApprovals')
    }
  };

  return (
    <Layout>
      <h2 className="mb-4">Admin Dashboard</h2>
      <div className="row">
        <div
          className="col-md-4 mb-3"
          style={{ cursor: "pointer" }}
          onClick={() => handleClick("TOTAL_TASKS")}
        >
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Total Tasks</h5>
              <p className="card-text">{formData.totalTasks}</p>
            </div>
          </div>
        </div>
        <div
          className="col-md-4 mb-3"
          style={{ cursor: "pointer" }}
          onClick={() => handleClick("ACTIVE_USERS")}
        >
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Active Users</h5>
              <p className="card-text">{formData.activeUsers}</p>
            </div>
          </div>
        </div>
        <div
          className="col-md-4 mb-3"
          style={{ cursor: "pointer" }}
          onClick={() => handleClick("PENDING_APPROVALS")}
        >
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Pending Approvals</h5>
              <p className="card-text">{formData.pendingApprovals}</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminView;
