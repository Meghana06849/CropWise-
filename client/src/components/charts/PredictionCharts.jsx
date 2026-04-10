import { ResponsiveContainer, BarChart, Bar, CartesianGrid, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardTitle } from '../ui/card';

const palette = ['#2f8244', '#6fbc79', '#3f9c53', '#256836', '#9fd7a8', '#1d522c'];

export function PredictionCharts({ predictions }) {
  const cropYieldData = predictions.map((item) => ({
    name: item.predicted_crop,
    yield: Number(item.expected_yield || 0)
  }));

  const seasonCounts = predictions.reduce((acc, item) => {
    acc[item.season] = (acc[item.season] || 0) + 1;
    return acc;
  }, {});

  const seasonData = Object.entries(seasonCounts).map(([name, value]) => ({ name, value }));

  const confidenceData = predictions
    .slice()
    .reverse()
    .map((item) => ({
      date: new Date(item.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      confidence: Number(item.confidence || 0)
    }));

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <Card className="xl:col-span-2">
        <CardContent>
          <CardTitle>Crop vs Yield</CardTitle>
          <CardDescription>Expected yield by predicted crop from recent scans</CardDescription>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cropYieldData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Bar dataKey="yield" fill="#2f8244" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <CardTitle>Season Distribution</CardTitle>
          <CardDescription>How predictions are distributed across seasons</CardDescription>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={seasonData} dataKey="value" nameKey="name" outerRadius={110} innerRadius={55} paddingAngle={3}>
                  {seasonData.map((entry, index) => (
                    <Cell key={`cell-${entry.name}`} fill={palette[index % palette.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="xl:col-span-3">
        <CardContent>
          <CardTitle>Confidence Trend</CardTitle>
          <CardDescription>Confidence values over the latest prediction timeline</CardDescription>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={confidenceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" />
                <YAxis stroke="#64748b" domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="confidence" stroke="#2f8244" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
