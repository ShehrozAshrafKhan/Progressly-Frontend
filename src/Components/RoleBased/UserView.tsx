import { useState, useEffect } from "react";
import axios from "axios";
import config from "../../config";
import { useNavigate } from "react-router-dom";
import Layout from "../../layouts/Layout";

const UserView = () => {
  const navigate = useNavigate();
  const [taskStats, setTaskStats] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = `${config.baseUrl}Tasks/GetUserTasksCount`;
        const res = await axios.get(url); 
        const data = res.data?.data;

        if (Array.isArray(data)) {
          const stats: Record<string, number> = data.reduce(
            (acc, item) => ({ ...acc, ...item }),
            {}
          );
          setTaskStats(stats);
        }
      } catch (err) {
        console.error("Error fetching dashboard task data", err);
      }
    };

    fetchData();
  }, []);

  const cards = [
    { key: "TotalTasks", title: "Total Tasks", icon: "bi-list-task", color: "primary", route: "ALL" },
    { key: "MyTasks", title: "My Tasks", icon: "bi-person-badge", color: "secondary", route: "MYTASK" },
    { key: "ActiveTasks", title: "Active Tasks", icon: "bi-lightning", color: "warning", route: "ACTIVE" },
    { key: "UpcomingDeadlines", title: "Upcoming Deadlines", icon: "bi-calendar-event", color: "info", route: "UPCOMING" },
    { key: "OverdueTasks", title: "Overdue Tasks", icon: "bi-exclamation-octagon", color: "danger", route: "OVERDUE" },
    { key: "CompletedTasks", title: "Tasks Marked as Completed", icon: "bi-check2-all", color: "primary", route: "COMPLETED" },
    { key: "Closed", title: "Completed & Closed Tasks", icon: "bi-check-circle-fill", color: "success", route: "CLOSED" },
  ];

  return (
    <Layout>
      <div className="mb-4">
        <h2 className="mb-1 fw-bold text-dark">Welcome Back!</h2>
        <p className="text-muted">Here's a summary of your current tasks.</p>
      </div>

      <div className="row g-4 mb-4">
        {cards.map((card, idx) => (
          <div className="col-md-3 col-xl-3" key={idx}>
            <div 
              className="card border-0 shadow-sm rounded-lg h-100 card-hover"
              onClick={() => navigate(`/tasks/userTasksDetail/${card.route}`)}
              style={{ cursor: "pointer", borderLeft: `4px solid var(--bs-${card.color}) !important` }}
            >
              <div className="card-body p-4 d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted text-uppercase fw-semibold mb-1" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>
                    {card.title}
                  </p>
                  <h3 className="fw-bold mb-0 text-dark">{taskStats[card.key] ?? 0}</h3>
                </div>
                <div
                  className={`bg-${card.color} bg-opacity-10 text-${card.color} rounded-circle d-flex align-items-center justify-content-center`}
                  style={{ width: '48px', height: '48px' }}
                >
                  <i className={`bi ${card.icon} fs-4`}></i>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default UserView;
