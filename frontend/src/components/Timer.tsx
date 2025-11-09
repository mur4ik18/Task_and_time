import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Clock } from 'lucide-react';
import { useStore } from '../store/useStore';
import { sessionService } from '../services/sessions';
import { Task } from '../services/tasks';
import toast from 'react-hot-toast';

interface TimerProps {
  tasks: Task[];
  onSessionEnd?: () => void;
}

export default function Timer({ tasks, onSessionEnd }: TimerProps) {
  const { activeSession, setActiveSession, settings } = useStore();
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [timeLimit, setTimeLimit] = useState<number>(settings?.default_time_limit || 3600);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLimitReached, setTimeLimitReached] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load active session on mount
  useEffect(() => {
    const loadActiveSession = async () => {
      try {
        const session = await sessionService.getActiveSession();
        setActiveSession(session);
        setSelectedTaskId(session.task_id);
        if (session.time_limit) {
          setTimeLimit(session.time_limit);
        }
        const elapsed = Math.floor((Date.now() - new Date(session.start_time).getTime()) / 1000);
        setElapsedTime(elapsed);
        setIsRunning(true);
        
        // Load from localStorage if available
        const savedState = localStorage.getItem('timerState');
        if (savedState) {
          const state = JSON.parse(savedState);
          setIsPaused(state.isPaused || false);
        }
      } catch (error) {
        // No active session
      }
    };

    loadActiveSession();
  }, [setActiveSession]);

  // Timer tick
  useEffect(() => {
    if (isRunning && !isPaused && activeSession) {
      intervalRef.current = setInterval(() => {
        setElapsedTime((prev) => {
          const newTime = prev + 1;
          
          // Save to localStorage
          localStorage.setItem('timerState', JSON.stringify({
            sessionId: activeSession.id,
            elapsedTime: newTime,
            isPaused: false,
          }));

          // Check time limit
          if (timeLimit && newTime >= timeLimit && !timeLimitReached) {
            setTimeLimitReached(true);
            playNotificationSound();
            sessionService.markTimeLimitReached(activeSession.id);
            toast('Time limit reached!', {
              icon: '⏰',
              duration: 5000,
            });
          }

          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, activeSession, timeLimit, timeLimitReached]);

  const playNotificationSound = () => {
    if (settings?.notification_sound_url && settings.enable_notifications) {
      if (!audioRef.current) {
        audioRef.current = new Audio(settings.notification_sound_url);
      }
      audioRef.current.play().catch(console.error);
    }
  };

  const handleStart = async () => {
    if (!selectedTaskId) {
      toast.error('Please select a task first');
      return;
    }

    try {
      const session = await sessionService.startSession(selectedTaskId, timeLimit);
      setActiveSession(session);
      setElapsedTime(0);
      setIsRunning(true);
      setIsPaused(false);
      setTimeLimitReached(false);
      toast.success('Timer started!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to start timer');
    }
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
    localStorage.setItem('timerState', JSON.stringify({
      sessionId: activeSession?.id,
      elapsedTime,
      isPaused: !isPaused,
    }));
  };

  const handleStop = async () => {
    if (!activeSession) return;

    try {
      await sessionService.endSession(activeSession.id);
      setActiveSession(null);
      setIsRunning(false);
      setIsPaused(false);
      setElapsedTime(0);
      setTimeLimitReached(false);
      localStorage.removeItem('timerState');
      toast.success('Timer stopped and session saved!');
      onSessionEnd?.();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to stop timer');
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = timeLimit ? (elapsedTime / timeLimit) * 100 : 0;
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Clock className="text-blue-500" />
        Timer
      </h2>

      {/* Timer Display */}
      <div className="relative w-64 h-64 mx-auto mb-8">
        <svg className="transform -rotate-90 w-64 h-64">
          <circle
            cx="128"
            cy="128"
            r="120"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-200 dark:text-gray-700"
          />
          <circle
            cx="128"
            cy="128"
            r="120"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={`transition-all duration-1000 ${
              timeLimitReached ? 'text-red-500' : 'text-gradient-to-r from-blue-500 to-purple-600'
            }`}
            style={{
              stroke: timeLimitReached ? '#ef4444' : 'url(#gradient)',
            }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#9333ea" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-4xl font-bold">{formatTime(elapsedTime)}</div>
          {timeLimit > 0 && (
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Limit: {formatTime(timeLimit)}
            </div>
          )}
        </div>
      </div>

      {/* Task Selection */}
      {!isRunning && (
        <div className="space-y-4 mb-6">
          <div>
            <label className="label">Select Task</label>
            <select
              value={selectedTaskId || ''}
              onChange={(e) => setSelectedTaskId(Number(e.target.value))}
              className="input"
            >
              <option value="">Choose a task...</option>
              {tasks.filter(t => t.is_active).map((task) => (
                <option key={task.id} value={task.id}>
                  {task.name} {task.category && `(${task.category})`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Time Limit (seconds, 0 for none)</label>
            <input
              type="number"
              value={timeLimit}
              onChange={(e) => setTimeLimit(Number(e.target.value))}
              className="input"
              min="0"
            />
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-4 justify-center">
        {!isRunning ? (
          <button onClick={handleStart} className="btn-primary flex items-center gap-2">
            <Play size={20} />
            Start
          </button>
        ) : (
          <>
            <button onClick={handlePause} className="btn-secondary flex items-center gap-2">
              {isPaused ? <Play size={20} /> : <Pause size={20} />}
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button
              onClick={handleStop}
              className="bg-red-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-600 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <Square size={20} />
              Stop
            </button>
          </>
        )}
      </div>
    </div>
  );
}

