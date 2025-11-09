import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { settingsService } from '../services/settings';
import { exportService } from '../services/export';
import { Settings as SettingsIcon, Upload, Download, Volume2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { settings, setSettings, theme, toggleTheme } = useStore();
  const [formData, setFormData] = useState({
    default_time_limit: 3600,
    enable_notifications: true,
  });
  const [soundFile, setSoundFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await settingsService.getSettings();
      setSettings(data);
      setFormData({
        default_time_limit: data.default_time_limit,
        enable_notifications: data.enable_notifications,
      });
    } catch (error) {
      toast.error('Failed to load settings');
    }
  };

  const handleSaveSettings = async () => {
    try {
      const updated = await settingsService.updateSettings(formData);
      setSettings(updated);
      toast.success('Settings saved successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save settings');
    }
  };

  const handleUploadSound = async () => {
    if (!soundFile) {
      toast.error('Please select a sound file');
      return;
    }

    setUploading(true);
    try {
      const response = await settingsService.uploadSound(soundFile);
      const updated = await settingsService.updateSettings({
        notification_sound_url: response.url,
      });
      setSettings(updated);
      setSoundFile(null);
      toast.success('Sound uploaded successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to upload sound');
    } finally {
      setUploading(false);
    }
  };

  const handleTestSound = () => {
    if (settings?.notification_sound_url) {
      const audio = new Audio(settings.notification_sound_url);
      audio.play().catch(() => toast.error('Failed to play sound'));
    } else {
      toast.error('No notification sound set');
    }
  };

  const handleExportData = async () => {
    try {
      const blob = await exportService.exportData();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `time-tracker-export-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Data exported successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to export data');
    }
  };

  const handleImportData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await exportService.importData(data);
      toast.success('Data imported successfully');
      window.location.reload();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to import data');
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      {/* General Settings */}
      <div className="card">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <SettingsIcon className="text-blue-500" />
          General Settings
        </h2>

        <div className="space-y-6">
          <div>
            <label className="label">Default Time Limit (seconds)</label>
            <input
              type="number"
              value={formData.default_time_limit}
              onChange={(e) =>
                setFormData({ ...formData, default_time_limit: Number(e.target.value) })
              }
              className="input"
              min="0"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Current: {formatTime(formData.default_time_limit)} (0 for no limit)
            </p>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enable_notifications}
                onChange={(e) =>
                  setFormData({ ...formData, enable_notifications: e.target.checked })
                }
                className="w-4 h-4 rounded"
              />
              <span className="label mb-0">Enable Notifications</span>
            </label>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={theme === 'dark'}
                onChange={toggleTheme}
                className="w-4 h-4 rounded"
              />
              <span className="label mb-0">Dark Mode</span>
            </label>
          </div>

          <button onClick={handleSaveSettings} className="btn-primary">
            Save Settings
          </button>
        </div>
      </div>

      {/* Sound Settings */}
      <div className="card">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Volume2 className="text-purple-500" />
          Notification Sound
        </h2>

        <div className="space-y-4">
          {settings?.notification_sound_url && (
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-between">
              <span className="text-sm">Current sound: {settings.notification_sound_url}</span>
              <button onClick={handleTestSound} className="btn-secondary text-sm py-2">
                Test Sound
              </button>
            </div>
          )}

          <div>
            <label className="label">Upload Custom Sound</label>
            <div className="flex gap-4">
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => setSoundFile(e.target.files?.[0] || null)}
                className="flex-1 input"
              />
              <button
                onClick={handleUploadSound}
                disabled={!soundFile || uploading}
                className="btn-primary flex items-center gap-2"
              >
                <Upload size={20} />
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Supported formats: MP3, WAV, OGG, M4A, AAC (max 5MB)
            </p>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="card">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Download className="text-teal-500" />
          Data Management
        </h2>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Export your data to back it up or transfer it to another account
            </p>
            <button onClick={handleExportData} className="btn-accent flex items-center gap-2">
              <Download size={20} />
              Export Data
            </button>
          </div>

          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Import previously exported data
            </p>
            <label className="btn-secondary flex items-center gap-2 inline-flex cursor-pointer">
              <Upload size={20} />
              Import Data
              <input
                type="file"
                accept="application/json"
                onChange={handleImportData}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

