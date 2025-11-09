import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { taskService, Task } from '../services/tasks';
import { reportService, DailyReport } from '../services/reports';
import Timer from '../components/Timer';
import { BarChart3, Coffee, Clock } from 'lucide-react';
import { breakService } from '../services/breaks';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { setUser, setTasks, tasks, activeBreak, setActiveBreak } = useStore();
  const [dailyReport, setDailyReport] = useState<DailyReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tasksData, report] = await Promise.all([
        taskService.getTasks(),
        reportService.getDailyReport(),
      ]);

      setTasks(tasksData);
      setDailyReport(report);

      // Try to load active break
      try {
        const activeBreakData = await breakService.getActiveBreak();
        setActiveBreak(activeBreakData);
      } catch (error) {
        // No active break
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartBreak = async () => {
    try {
      const breakData = await breakService.startBreak();
      setActiveBreak(breakData);
      toast.success('Break started!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to start break');
    }
  };

  const handleEndBreak = async () => {
    if (!activeBreak) return;

    try {
      await breakService.endBreak(activeBreak.id);
      setActiveBreak(null);
      toast.success('Break ended!');
      loadData(); // Refresh data
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to end break');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-4">
          {!activeBreak ? (
            <button onClick={handleStartBreak} className="btn-accent flex items-center gap-2">
              <Coffee size={20} />
              Start Break
            </button>
          ) : (
            <button onClick={handleEndBreak} className="btn-secondary flex items-center gap-2">
              <Coffee size={20} />
              End Break
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Clock className="text-blue-500" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Today's Work Time</p>
              <p className="text-2xl font-bold">{formatDuration(dailyReport?.totalWorkTime || 0)}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <BarChart3 className="text-purple-500" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Sessions Today</p>
              <p className="text-2xl font-bold">{dailyReport?.sessionCount || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-100 dark:bg-teal-900 rounded-lg">
              <Coffee className="text-teal-500" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Break Time</p>
              <p className="text-2xl font-bold">{formatDuration(dailyReport?.totalBreakTime || 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Timer and Recent Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Timer tasks={tasks} onSessionEnd={loadData} />

        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Today's Task Breakdown</h2>
          
          {dailyReport && dailyReport.taskBreakdown.length > 0 ? (
            <div className="space-y-4">
              {dailyReport.taskBreakdown.map((task, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: task.color }}
                    />
                    <div>
                      <p className="font-medium">{task.name}</p>
                      {task.category && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">{task.category}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatDuration(task.totalTime)}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {task.sessionCount} session{task.sessionCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No sessions recorded today. Start tracking your time!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

