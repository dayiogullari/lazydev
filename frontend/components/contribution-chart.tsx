import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

function ContributionChart() {
  const data = [
    { week: "Week 1", points: 50 },
    { week: "Week 2", points: 120 },
    { week: "Week 3", points: 80 },
    { week: "Week 4", points: 150 },
    { week: "Week 5", points: 200 },
    { week: "Week 6", points: 250 },
    { week: "Week 7", points: 300 },
    { week: "Week 8", points: 200 },
    { week: "Week 9", points: 250 },
    { week: "Week 10", points: 100 },
    { week: "Week 11", points: 150 },
    { week: "Week 12", points: 200 },
    { week: "Week 13", points: 150 },
  ];

  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-6">
      <h2 className="text-xl font-bold mb-4">Contribution Trend</h2>
      <LineChart
        width={500}
        height={250}
        data={data}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#444"
        />
        <XAxis
          dataKey="week"
          stroke="#ccc"
        />
        <YAxis stroke="#ccc" />
        <Tooltip
          contentStyle={{ backgroundColor: "#2D2D2D", border: "none" }}
          labelStyle={{ color: "#fff" }}
        />
        <Line
          type="monotone"
          dataKey="points"
          stroke="#82ca9d"
          strokeWidth={2}
        />
      </LineChart>
    </div>
  );
}

export default ContributionChart;
