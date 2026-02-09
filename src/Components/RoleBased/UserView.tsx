import { useState, useEffect } from "react";
import axios from "axios";
import config from "../../config";
import { useNavigate } from "react-router-dom";
import Layout from "../../layouts/Layout";

const UserView = () => {
  const navigate=useNavigate();
  const [taskStats, setTaskStats] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url=`${config.baseUrl}Tasks/GetUserTasksCount`;
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
    { key: "MyTasks", title: "My Tasks", icon: "bi-person-check", color: "success", route: "MYTASK" },
    { key: "ActiveTasks", title: "Active Tasks", icon: "bi-lightning", color: "warning", route: "ACTIVE" },
    { key: "CompletedTasks", title: "Completed Tasks", icon: "bi-check-circle", color: "info", route: "COMPLETED" },
    { key: "OverdueTasks", title: "Overdue Tasks", icon: "bi-exclamation-triangle", color: "danger", route: "OVERDUE" },
    { key: "UpcomingDeadlines", title: "Upcoming Deadlines", icon: "bi-calendar-event", color: "secondary", route: "UPCOMING" },
  ];

  return (
    <Layout>
      <div className="mb-4">
        <h2 className="mb-1">Welcome Back!</h2>
        <p className="text-muted">Here’s a summary of your current tasks.</p>
      </div>

      <div className="row">
        {cards.map((card, idx) => (
          <div className="col-md-4 mb-4" style={{cursor:"pointer"}}  onClick={() => navigate(`/tasks/userTasksDetail/${card.route}`)}  key={idx}>
            <div className={`card shadow-sm border-start border-${card.color} border-1`}>
              <div className="card-body d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted text-uppercase">{card.title}</h6>
                  <h3 className="fw-bold">{taskStats[card.key] ?? 0}</h3>
                </div>
                <div
                  className={`bg-${card.color} text-white rounded-circle d-flex align-items-center justify-content-center`}
                  style={{ width: 50, height: 50 }}
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
