import { useEffect, useState } from 'react';
import { reportService, DailyReport, WeeklyReport, MonthlyReport } from '../services/reports';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { format, startOfWeek, endOfWeek } from 'date-fns';

type ReportType = 'daily' | 'weekly' | 'monthly';

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyReport, setDailyReport] = useState<DailyReport | null>(null);
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReport | null>(null);
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReport();
  }, [reportType, selectedDate]);

  const loadReport = async () => {
    setLoading(true);
    try {
      if (reportType === 'daily') {
        const data = await reportService.getDailyReport(selectedDate);
        setDailyReport(data);
      } else if (reportType === 'weekly') {
        const data = await reportService.getWeeklyReport(selectedDate);
        setWeeklyReport(data);
      } else {
        const data = await reportService.getMonthlyReport(selectedDate);
        setMonthlyReport(data);
      }
    } catch (error) {
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatHours = (seconds: number): number => {
    return Math.round((seconds / 3600) * 10) / 10;
  };

  const currentReport = reportType === 'daily' ? dailyReport : reportType === 'weekly' ? weeklyReport : monthlyReport;
  const taskBreakdown = currentReport?.taskBreakdown || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Reports</h1>
      </div>

      {/* Report Type Selector */}
      <div className="card">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setReportType('daily')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                reportType === 'daily'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setReportType('weekly')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                reportType === 'weekly'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setReportType('monthly')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                reportType === 'monthly'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              Monthly
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-gray-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Work Time</h3>
              <p className="text-3xl font-bold text-blue-500">
                {formatDuration(currentReport?.totalWorkTime || 0)}
              </p>
            </div>

            <div className="card">
              <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Sessions</h3>
              <p className="text-3xl font-bold text-purple-500">
                {currentReport?.sessionCount || 0}
              </p>
            </div>

            <div className="card">
              <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-2">Break Time</h3>
              <p className="text-3xl font-bold text-teal-500">
                {formatDuration(currentReport?.totalBreakTime || 0)}
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Task Distribution Pie Chart */}
            {taskBreakdown.length > 0 && (
              <div className="card">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <PieChartIcon className="text-purple-500" />
                  Task Distribution
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={taskBreakdown}
                      dataKey="totalTime"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={(entry) => `${entry.name}: ${formatDuration(entry.totalTime)}`}
                    >
                      {taskBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatDuration(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Task Breakdown Bar Chart */}
            {taskBreakdown.length > 0 && (
              <div className="card">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="text-blue-500" />
                  Time per Task
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={taskBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={formatHours} />
                    <Tooltip formatter={(value: number) => `${formatHours(value)}h`} />
                    <Bar dataKey="totalTime" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Weekly Trend Line Chart */}
            {reportType === 'weekly' && weeklyReport && (
              <div className="card lg:col-span-2">
                <h2 className="text-xl font-bold mb-4">Weekly Trend</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weeklyReport.dailyBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => format(new Date(date), 'EEE')}
                    />
                    <YAxis tickFormatter={formatHours} />
                    <Tooltip
                      formatter={(value: number) => `${formatHours(value)}h`}
                      labelFormatter={(date) => format(new Date(date), 'MMM dd')}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="workTime"
                      stroke="#3b82f6"
                      name="Work Time"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Task Breakdown Table */}
          {taskBreakdown.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Detailed Breakdown</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4">Task</th>
                      <th className="text-left py-3 px-4">Category</th>
                      <th className="text-right py-3 px-4">Time</th>
                      <th className="text-right py-3 px-4">Sessions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {taskBreakdown.map((task, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: task.color }}
                            />
                            <span className="font-medium">{task.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                          {task.category || '-'}
                        </td>
                        <td className="py-3 px-4 text-right font-bold">
                          {formatDuration(task.totalTime)}
                        </td>
                        <td className="py-3 px-4 text-right">{task.sessionCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {taskBreakdown.length === 0 && (
            <div className="card text-center py-12 text-gray-500 dark:text-gray-400">
              No data available for the selected period
            </div>
          )}
        </>
      )}
    </div>
  );
}

