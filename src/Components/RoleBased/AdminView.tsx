import { useState, useEffect } from "react";
import Layout from "../../layouts/Layout";
import axios from "axios";
import config from "../../config";
import { ShowMessage } from "../Common/ShowMessage";
import { useNavigate } from "react-router-dom";

const AdminView = () => {
  const navigate = useNavigate();
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
        totalTasks: tasksRes.data?.data || 0,
        activeUsers: usersRes.data?.data || 0,
        pendingApprovals: approvalsRes.data?.data || 0,
      });
    } catch (error) {
      ShowMessage(2, "Error fetching dashboard data " + error);
    }
  };

  const handleClick = (type: string) => {
    if (type === "TOTAL_TASKS") {
      navigate('/tasks')
    } else if (type === "ACTIVE_USERS") {
      navigate('/users/getAllActiveUsers')
    } else {
      navigate('/admin/tasks/pendingApprovals')
    }
  };

  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1 fw-bold text-dark">Admin Dashboard</h2>
          <p className="text-muted mb-0">Overview of your system activity.</p>
        </div>
      </div>
      
      <div className="row g-4 mb-4">
        {/* Total Tasks Card */}
        <div className="col-md-4">
          <div 
            className="card border-0 shadow-sm rounded-lg h-100 card-hover" 
            style={{ cursor: "pointer", borderLeft: "4px solid var(--bs-primary) !important" }}
            onClick={() => handleClick("TOTAL_TASKS")}
          >
            <div className="card-body p-4 d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted text-uppercase fw-semibold mb-1" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>Total Tasks</p>
                <h3 className="fw-bold mb-0 text-dark">{formData.totalTasks}</h3>
              </div>
              <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                <i className="bi bi-card-checklist fs-4"></i>
              </div>
            </div>
          </div>
        </div>
        
        {/* Active Users Card */}
        <div className="col-md-4">
          <div 
            className="card border-0 shadow-sm rounded-lg h-100 card-hover" 
            style={{ cursor: "pointer", borderLeft: "4px solid var(--bs-success) !important" }}
            onClick={() => handleClick("ACTIVE_USERS")}
          >
            <div className="card-body p-4 d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted text-uppercase fw-semibold mb-1" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>Active Users</p>
                <h3 className="fw-bold mb-0 text-dark">{formData.activeUsers}</h3>
              </div>
              <div className="bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                <i className="bi bi-people fs-4"></i>
              </div>
            </div>
          </div>
        </div>
        
        {/* Pending Approvals Card */}
        <div className="col-md-4">
          <div 
            className="card border-0 shadow-sm rounded-lg h-100 card-hover" 
            style={{ cursor: "pointer", borderLeft: "4px solid var(--bs-warning) !important" }}
            onClick={() => handleClick("PENDING_APPROVALS")}
          >
            <div className="card-body p-4 d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted text-uppercase fw-semibold mb-1" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>Pending Approvals</p>
                <h3 className="fw-bold mb-0 text-dark">{formData.pendingApprovals}</h3>
              </div>
              <div className="bg-warning bg-opacity-10 text-warning rounded-circle d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                <i className="bi bi-clock-history fs-4"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminView;
