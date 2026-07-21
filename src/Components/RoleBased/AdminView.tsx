import { useState, useEffect } from "react";
import Layout from "../../layouts/Layout";
import axios from "axios";
import config from "../../config";
import { ShowMessage } from "../Common/ShowMessage";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";

// ─── Color Palettes ──────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  PENDING: "#F59E0B",
  IN_PROGRESS: "#6366F1",
  COMPLETED: "#10B981",
  Unknown: "#9CA3AF",
};
const PRIORITY_COLORS: Record<string, string> = {
  HIGH: "#EF4444",
  MEDIUM: "#F59E0B",
  LOW: "#10B981",
  UNKNOWN: "#9CA3AF",
};
const TREND_GRADIENT_ID = "trendGradientAdmin";

// ─── Tooltip Components ───────────────────────────────────────────────────────
const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-recharts-tooltip">
        <p className="label mb-0">{label}</p>
        <p className="mb-0" style={{ color: "#A5B4FC" }}>
          Count: <strong style={{ color: "#fff" }}>{payload[0].value}</strong>
        </p>
      </div>
    );
  }
  return null;
};

const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-recharts-tooltip">
        <p className="label mb-0">{payload[0].name}</p>
        <p className="mb-0" style={{ color: "#A5B4FC" }}>
          Count: <strong style={{ color: "#fff" }}>{payload[0].value}</strong>
        </p>
      </div>
    );
  }
  return null;
};

const CustomAreaTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-recharts-tooltip">
        <p className="label mb-0">{label}</p>
        <p className="mb-0" style={{ color: "#A5B4FC" }}>
          Tasks: <strong style={{ color: "#fff" }}>{payload[0].value}</strong>
        </p>
      </div>
    );
  }
  return null;
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface ChartItem {
  label: string;
  count: number;
}
interface AdminChartData {
  tasksByStatus: ChartItem[];
  tasksByPriority: ChartItem[];
  tasksTrend: ChartItem[];
}

// ─── Component ────────────────────────────────────────────────────────────────
const AdminView = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    totalTasks: 0,
    activeUsers: 0,
    users: 0,
    pendingApprovals: 0,
    upcomingDeadlines: 0,
    overdueTasks: 0,
    completedTasks: 0,
  });
  const [chartData, setChartData] = useState<AdminChartData | null>(null);
  const [chartLoading, setChartLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchChartData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [tasksRes, usersRes, users, approvalsRes, upcomingRes, overdueRes,completedRes] = await Promise.all([
        axios.get(`${config.baseUrl}Tasks/GetTasksCount`),
        axios.get(`${config.baseUrl}Users/GetAllActiveUsersCount`),
        axios.get(`${config.baseUrl}Users/GetAllUsersCount`),
        axios.get(`${config.baseUrl}Tasks/GetIsCompletedTasksCount`),
        axios.get(`${config.baseUrl}Tasks/GetUpcomingDeadlinesTasksCount`),
        axios.get(`${config.baseUrl}Tasks/GetOverdueTasksCount`),
        axios.get(`${config.baseUrl}Tasks/GetCompletedAndClosedTasksCount`),
        
      ]);
      setFormData({
        totalTasks: tasksRes.data?.data || 0,
        activeUsers: usersRes.data?.data || 0,
        users: users.data?.data || 0,
        pendingApprovals: approvalsRes.data?.data || 0,
        upcomingDeadlines: upcomingRes.data?.data || 0,
        overdueTasks: overdueRes.data?.data || 0,
        completedTasks: completedRes.data?.data || 0,
      });
    } catch (error) {
      ShowMessage(2, "Error fetching dashboard data " + error);
    }
  };

  const fetchChartData = async () => {
    try {
      setChartLoading(true);
      const res = await axios.get(`${config.baseUrl}Tasks/GetAdminChartData`);
      if (res.data?.data) {
        setChartData(res.data.data);
        console.log(res.data.data)
      }
    } catch (error) {
      console.error("Error fetching chart data", error);
    } finally {
      setChartLoading(false);
    }
  };

  const handleClick = (type: string) => {
    if (type === "TOTAL_TASKS") navigate("/tasks");
    else if (type === "ACTIVE_USERS") navigate("/users/getAllActiveUsers");
    else if (type === "USERS") navigate("/users/getAllUsers");
    else if (type === "UPCOMING_DEADLINES") navigate("/tasks/upcomingDeadlines");
    else if (type === "OVERDUE_TASKS") navigate("/tasks/overdueTasks");
    else if (type === "COMPLETED_TASKS") navigate("/tasks/completedTasks");
    else navigate("/admin/tasks/pendingApprovals");
  };

  // Map chart API data to recharts format
  const statusChartData = (chartData?.tasksByStatus ?? []).map((d) => ({
    name: d.label,
    value: d.count,
  }));
  const priorityChartData = (chartData?.tasksByPriority ?? []).map((d) => ({
    name: d.label,
    value: d.count,
  }));
  const trendChartData = (chartData?.tasksTrend ?? []).map((d) => ({
    week: d.label,
    tasks: d.count,
  }));

  const statCards = [
    { label: "Total Tasks", value: formData.totalTasks, icon: "bi-card-checklist", color: "primary", type: "TOTAL_TASKS" },
    { label: "Completed Tasks", value: formData.completedTasks, icon: "bi-check-circle-fill", color: "success", type: "COMPLETED_TASKS" },
    { label: "Pending Approvals", value: formData.pendingApprovals, icon: "bi-clock-history", color: "warning", type: "PENDING_APPROVALS" },
    { label: "Upcoming Deadlines", value: formData.upcomingDeadlines, icon: "bi-calendar-event", color: "info", type: "UPCOMING_DEADLINES" },
    { label: "Overdue Tasks", value: formData.overdueTasks, icon: "bi-exclamation-octagon", color: "danger", type: "OVERDUE_TASKS" },
    { label: "Active Users", value: formData.activeUsers, icon: "bi-people", color: "success", type: "ACTIVE_USERS" },
    { label: "Users", value: formData.users, icon: "bi-person-badge", color: "secondary", type: "USERS" },
  ];

  return (
    <Layout>
      {/* ── Page Header ── */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1 fw-bold text-dark">Admin Dashboard</h2>
          <p className="text-muted mb-0">Overview of your system activity.</p>
        </div>
        <button
          className="btn btn-sm"
          style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "#fff", borderRadius: "8px" }}
          onClick={() => { fetchDashboardData(); fetchChartData(); }}
        >
          <i className="bi bi-arrow-clockwise me-1" />
          Refresh
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="row g-3 mb-4">
        {statCards.map((card) => (
          <div className="col-6 col-md-4 col-xl-2" key={card.type}>
            <div
              className="card border-0 shadow-sm rounded-lg h-100 card-hover"
              style={{ cursor: "pointer", borderLeft: `4px solid var(--bs-${card.color}) !important` }}
              onClick={() => handleClick(card.type)}
            >
              <div className="card-body p-3 d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted text-uppercase fw-semibold mb-1" style={{ fontSize: "0.72rem", letterSpacing: "0.5px" }}>
                    {card.label}
                  </p>
                  <h3 className="fw-bold mb-0 text-dark" style={{ fontSize: "1.6rem" }}>{card.value}</h3>
                </div>
                <div
                  className={`bg-${card.color} bg-opacity-10 text-${card.color} rounded-circle d-flex align-items-center justify-content-center`}
                  style={{ width: "42px", height: "42px" }}
                >
                  <i className={`bi ${card.icon} fs-5`} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts Section Header ── */}
      <div className="mb-3">
        <p className="dashboard-section-title">Analytics Overview</p>
        <p className="dashboard-section-sub">Visual breakdown of task distribution and activity trends.</p>
      </div>

      {/* ── Charts Row 1: Bar + Pie ── */}
      <div className="row g-3 mb-3">
        {/* Tasks by Status — Bar Chart */}
        <div className="col-12 col-lg-7">
          <div className="chart-card h-100">
            <div className="chart-card-header">
              <div className="chart-card-icon" style={{ background: "rgba(99,102,241,0.1)" }}>
                <i className="bi bi-bar-chart-fill text-primary" />
              </div>
              <div>
                <p className="chart-card-title">Tasks by Status</p>
                <p className="chart-card-subtitle">Distribution across all task statuses</p>
              </div>
            </div>
            <div className="chart-card-body">
              {chartLoading ? (
                <div className="chart-loading">
                  <div className="spinner-border spinner-border-sm text-primary" role="status" />
                  Loading chart...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={statusChartData} barCategoryGap="30%" margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: "#6B7280", fontFamily: "Inter, sans-serif" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#6B7280", fontFamily: "Inter, sans-serif" }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "rgba(99,102,241,0.05)" }} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={56}>
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || "#6366F1"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            {!chartLoading && (
              <div className="chart-legend">
                {statusChartData.map((d) => (
                  <div className="chart-legend-item" key={d.name}>
                    <div className="chart-legend-dot" style={{ background: STATUS_COLORS[d.name] || "#6366F1" }} />
                    <span>{d.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tasks by Priority — Donut Chart */}
        <div className="col-12 col-lg-5">
          <div className="chart-card h-100">
            <div className="chart-card-header">
              <div className="chart-card-icon" style={{ background: "rgba(239,68,68,0.1)" }}>
                <i className="bi bi-pie-chart-fill text-danger" />
              </div>
              <div>
                <p className="chart-card-title">Tasks by Priority</p>
                <p className="chart-card-subtitle">High / Medium / Low breakdown</p>
              </div>
            </div>
            <div className="chart-card-body">
              {chartLoading ? (
                <div className="chart-loading">
                  <div className="spinner-border spinner-border-sm text-danger" role="status" />
                  Loading chart...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={priorityChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={95}
                      paddingAngle={3}
                      dataKey="value"
                      nameKey="name"
                      animationBegin={0}
                      animationDuration={800}
                    >
                      {priorityChartData.map((entry, index) => (
                        <Cell key={`pcell-${index}`} fill={PRIORITY_COLORS[entry.name] || "#9CA3AF"} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            {!chartLoading && (
              <div className="chart-legend">
                {priorityChartData.map((d) => (
                  <div className="chart-legend-item" key={d.name}>
                    <div className="chart-legend-dot" style={{ background: PRIORITY_COLORS[d.name] || "#9CA3AF" }} />
                    <span>{d.name} ({d.value})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Charts Row 2: Area Trend ── */}
      <div className="row g-3 mb-4">
        <div className="col-12">
          <div className="chart-card">
            <div className="chart-card-header">
              <div className="chart-card-icon" style={{ background: "rgba(16,185,129,0.1)" }}>
                <i className="bi bi-graph-up-arrow" style={{ color: "#10B981" }} />
              </div>
              <div>
                <p className="chart-card-title">Task Creation Trend</p>
                <p className="chart-card-subtitle">Tasks created over the last 8 weeks</p>
              </div>
            </div>
            <div className="chart-card-body">
              {chartLoading ? (
                <div className="chart-loading">
                  <div className="spinner-border spinner-border-sm" style={{ color: "#10B981" }} role="status" />
                  Loading chart...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={trendChartData} margin={{ top: 10, right: 24, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id={TREND_GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                    <XAxis
                      dataKey="week"
                      tick={{ fontSize: 11, fill: "#6B7280", fontFamily: "Inter, sans-serif" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#6B7280", fontFamily: "Inter, sans-serif" }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomAreaTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="tasks"
                      stroke="#10B981"
                      strokeWidth={2.5}
                      fill={`url(#${TREND_GRADIENT_ID})`}
                      dot={{ fill: "#10B981", r: 4, strokeWidth: 2, stroke: "#fff" }}
                      activeDot={{ r: 6, fill: "#10B981", stroke: "#fff", strokeWidth: 2 }}
                      animationDuration={900}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminView;
