import { useEffect, useState } from "react";
import axios from "axios";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import API_URL from "../../config/api";

function DashboardChart() {
  // ================= STATE =================

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================= FETCH DOCUMENTS =================

  const fetchChartData = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${API_URL}/api/documents`);

      const documents = response.data;

      // Month names

      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      // Create month-wise data

      const monthlyData = months.map((month, index) => ({
        month,

        documents: documents.filter((document) => {
          if (!document.createdAt) {
            return false;
          }

          const documentDate = new Date(document.createdAt);

          return documentDate.getMonth() === index;
        }).length,
      }));

      setData(monthlyData);
    } catch (error) {
      console.error("Dashboard Chart Error:", error);

      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // ================= LOAD DATA =================

  useEffect(() => {
    fetchChartData();
  }, []);

  // ================= UI =================

  return (
    <div
      style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "15px",
        boxShadow: "0 5px 15px rgba(0,0,0,.1)",
        marginTop: "30px",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <h3
        style={{
          color: "#0f4c81",
          marginBottom: "20px",
        }}
      >
        Monthly Documents Uploaded
      </h3>

      {loading ? (
        <p
          style={{
            textAlign: "center",
            padding: "80px 0",
            color: "#0f4c81",
          }}
        >
          Loading chart data...
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="month" />

            <YAxis allowDecimals={false} />

            <Tooltip />

            <Bar dataKey="documents" fill="#0f4c81" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default DashboardChart;
