import { useState, useEffect } from "react";
import axios from "axios";
import config from "../../config";
import { useNavigate } from "react-router-dom";
import Layout from "../../layouts/Layout";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from "recharts";

// ─── Color Palettes ──────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  PENDING: "#F59E0B",
  IN_PROGRESS: "#6366F1",
  COMPLETED: "#10B981",
  UNKNOWN: "#9CA3AF",
};
const PRIORITY_COLORS: Record<string, string> = {
  HIGH: "#EF4444",
  MEDIUM: "#F59E0B",
  LOW: "#10B981",
  UNKNOWN: "#9CA3AF",
};
const LINE_COLOR = "#6366F1";
const ACTIVITY_GRADIENT_ID = "activityGradientUser";

// ─── Tooltip Components ───────────────────────────────────────────────────────
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

const CustomLineTooltip = ({ active, payload, label }: any) => {
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

const CustomRadarTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-recharts-tooltip">
        <p className="label mb-0">{payload[0].payload.priority}</p>
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
interface UserChartData {
  tasksByStatus: ChartItem[];
  priorityBreakdown: ChartItem[];
  activityTrend: ChartItem[];
}

// ─── Component ────────────────────────────────────────────────────────────────
const UserView = () => {
  const navigate = useNavigate();
  const [taskStats, setTaskStats] = useState<Record<string, number>>({});
  const [chartData, setChartData] = useState<UserChartData | null>(null);
  const [chartLoading, setChartLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchChartData();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${config.baseUrl}Tasks/GetUserTasksCount`);
      const data = res.data?.data;
      console.log("fetchStats",data)
      if (Array.isArray(data)) {
        const stats: Record<string, number> = data.reduce(
          (acc: Record<string, number>, item: Record<string, number>) => ({ ...acc, ...item }),
          {}
        );
        setTaskStats(stats);
      }
    } catch (err) {
      console.error("Error fetching dashboard task data", err);
    }
  };

  const fetchChartData = async () => {
    try {
      setChartLoading(true);
      const res = await axios.get(`${config.baseUrl}Tasks/GetUserChartData`);
      if (res.data?.data) {
        setChartData(res.data.data);
        console.log("fetchChartData",res.data.data)
      }
    } catch (error) {
      console.error("Error fetching user chart data", error);
    } finally {
      setChartLoading(false);
    }
  };

  const statCards = [
    { key: "TotalTasks", title: "Total Tasks", icon: "bi-list-task", color: "primary", route: "ALL" },
    { key: "MyTasks", title: "My Tasks", icon: "bi-person-badge", color: "secondary", route: "MYTASK" },
    { key: "ActiveTasks", title: "Active Tasks", icon: "bi-lightning", color: "warning", route: "ACTIVE" },
    { key: "UpcomingDeadlines", title: "Upcoming Deadlines", icon: "bi-calendar-event", color: "info", route: "UPCOMING" },
    { key: "OverdueTasks", title: "Overdue Tasks", icon: "bi-exclamation-octagon", color: "danger", route: "OVERDUE" },
    { key: "CompletedTasks", title: "Tasks Marked Completed", icon: "bi-check2-all", color: "primary", route: "COMPLETED" },
    { key: "Closed", title: "Closed Tasks", icon: "bi-check-circle-fill", color: "success", route: "CLOSED" },
  ];

  // Prepare chart-friendly arrays
  const statusDonutData = (chartData?.tasksByStatus ?? []).map((d) => ({
    name: d.label,
    value: d.count,
  }));

  const radarData = (chartData?.priorityBreakdown ?? []).map((d) => ({
    priority: d.label,
    count: d.count,
    fullMark: Math.max(...(chartData?.priorityBreakdown ?? [{ count: 1 }]).map((x) => x.count), 1),
  }));

  const trendLineData = (chartData?.activityTrend ?? []).map((d) => ({
    week: d.label,
    tasks: d.count,
  }));

  return (
    <Layout>
      {/* ── Page Header ── */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1 fw-bold text-dark">Welcome Back! 👋</h2>
          <p className="text-muted mb-0">Here's a summary of your current tasks.</p>
        </div>
        <button
          className="btn btn-sm"
          style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "#fff", borderRadius: "8px" }}
          onClick={() => { fetchStats(); fetchChartData(); }}
        >
          <i className="bi bi-arrow-clockwise me-1" />
          Refresh
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="row g-3 mb-4">
        {statCards.map((card, idx) => (
          <div className="col-6 col-md-4 col-xl-2" key={idx}>
            <div
              className="card border-0 shadow-sm rounded-lg h-100 card-hover"
              onClick={() => navigate(`/tasks/userTasksDetail/${card.route}`)}
              style={{ cursor: "pointer", borderLeft: `4px solid var(--bs-${card.color}) !important` }}
            >
              <div className="card-body p-3 d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted text-uppercase fw-semibold mb-1" style={{ fontSize: "0.72rem", letterSpacing: "0.5px" }}>
                    {card.title}
                  </p>
                  <h3 className="fw-bold mb-0 text-dark" style={{ fontSize: "1.6rem" }}>
                    {taskStats[card.key] ?? 0}
                  </h3>
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
        <p className="dashboard-section-title">My Task Analytics</p>
        <p className="dashboard-section-sub">Insights into your personal task distribution and progress over time.</p>
      </div>

      {/* ── Charts Row 1: Donut + Radar ── */}
      <div className="row g-3 mb-3">
        {/* My Tasks by Status — Donut */}
        <div className="col-12 col-lg-5">
          <div className="chart-card h-100">
            <div className="chart-card-header">
              <div className="chart-card-icon" style={{ background: "rgba(99,102,241,0.1)" }}>
                <i className="bi bi-pie-chart-fill text-primary" />
              </div>
              <div>
                <p className="chart-card-title">My Tasks by Status</p>
                <p className="chart-card-subtitle">Current task status distribution</p>
              </div>
            </div>
            <div className="chart-card-body">
              {chartLoading ? (
                <div className="chart-loading">
                  <div className="spinner-border spinner-border-sm text-primary" role="status" />
                  Loading chart...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={230}>
                  <PieChart>
                    <Pie
                      data={statusDonutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={98}
                      paddingAngle={3}
                      dataKey="value"
                      nameKey="name"
                      animationBegin={0}
                      animationDuration={850}
                    >
                      {statusDonutData.map((entry, index) => (
                        <Cell key={`status-${index}`} fill={STATUS_COLORS[entry.name] || "#9CA3AF"} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            {!chartLoading && (
              <div className="chart-legend">
                {statusDonutData.map((d) => (
                  <div className="chart-legend-item" key={d.name}>
                    <div className="chart-legend-dot" style={{ background: STATUS_COLORS[d.name] || "#9CA3AF" }} />
                    <span>{d.name} ({d.value})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Priority Breakdown — Radar Chart */}
        <div className="col-12 col-lg-7">
          <div className="chart-card h-100">
            <div className="chart-card-header">
              <div className="chart-card-icon" style={{ background: "rgba(245,158,11,0.1)" }}>
                <i className="bi bi-bullseye text-warning" />
              </div>
              <div>
                <p className="chart-card-title">Priority Breakdown</p>
                <p className="chart-card-subtitle">High / Medium / Low distribution</p>
              </div>
            </div>
            <div className="chart-card-body">
              {chartLoading ? (
                <div className="chart-loading">
                  <div className="spinner-border spinner-border-sm text-warning" role="status" />
                  Loading chart...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius={90}>
                    <PolarGrid stroke="#E5E7EB" />
                    <PolarAngleAxis
                      dataKey="priority"
                      tick={{ fontSize: 12, fill: "#6B7280", fontFamily: "Inter, sans-serif" }}
                    />
                    <Radar
                      name="Tasks"
                      dataKey="count"
                      stroke="#6366F1"
                      fill="#6366F1"
                      fillOpacity={0.25}
                      animationBegin={0}
                      animationDuration={850}
                    />
                    <Tooltip content={<CustomRadarTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </div>
            {!chartLoading && (
              <div className="chart-legend">
                {radarData.map((d) => (
                  <div className="chart-legend-item" key={d.priority}>
                    <div className="chart-legend-dot" style={{ background: PRIORITY_COLORS[d.priority] || "#9CA3AF" }} />
                    <span>{d.priority}: {d.count} tasks</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Charts Row 2: Activity Line Chart ── */}
      <div className="row g-3 mb-4">
        <div className="col-12">
          <div className="chart-card">
            <div className="chart-card-header">
              <div className="chart-card-icon" style={{ background: "rgba(99,102,241,0.1)" }}>
                <i className="bi bi-activity text-primary" />
              </div>
              <div>
                <p className="chart-card-title">My Task Activity</p>
                <p className="chart-card-subtitle">Tasks assigned to you over the last 8 weeks</p>
              </div>
            </div>
            <div className="chart-card-body">
              {chartLoading ? (
                <div className="chart-loading">
                  <div className="spinner-border spinner-border-sm text-primary" role="status" />
                  Loading chart...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={trendLineData} margin={{ top: 10, right: 24, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id={ACTIVITY_GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={LINE_COLOR} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={LINE_COLOR} stopOpacity={0} />
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
                    <Tooltip content={<CustomLineTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="tasks"
                      stroke={LINE_COLOR}
                      strokeWidth={2.5}
                      dot={{ fill: LINE_COLOR, r: 4, strokeWidth: 2, stroke: "#fff" }}
                      activeDot={{ r: 6, fill: LINE_COLOR, stroke: "#fff", strokeWidth: 2 }}
                      animationDuration={900}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserView;
