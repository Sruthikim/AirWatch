import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

function PollutantChart({ data }) {
  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="day" />

          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="pm25"
            stroke="#38bdf8"
            strokeWidth={2}
            name="PM2.5"
          />

          <Line
            type="monotone"
            dataKey="pm10"
            stroke="#22c55e"
            strokeWidth={2}
            name="PM10"
          />

          <Line
            type="monotone"
            dataKey="no2"
            stroke="#f59e0b"
            strokeWidth={2}
            name="NO₂"
          />

          <Line
            type="monotone"
            dataKey="so2"
            stroke="#ef4444"
            strokeWidth={2}
            name="SO₂"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PollutantChart;