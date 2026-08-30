import { useState } from "react";
import { motion } from "framer-motion";
import { FaLock, FaBell, FaSlidersH, FaSave, FaExclamationCircle } from "react-icons/fa";

const Setting = () => {
  // Configuration UI State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [notifications, setNotifications] = useState({
    hackathonAlerts: true,
    mentorMessages: true,
    deadlineReminders: false,
  });

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const toggleNotification = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      alert("New passwords do not match!");
      return;
    }
    alert("Password updated successfully!");
    setPasswordForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Section Heading Header */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Account Settings</h2>
          <p className="text-sm text-slate-500 mt-1">Manage your access key credentials and system preferences</p>
        </div>

        {/* Security Password Form card block */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6"
        >
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FaLock size={16} /></div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Update Security Passwords</h3>
              <p className="text-xs text-slate-400">Keep your account secure with robust passphrase protection</p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  required
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-2 text-sm outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  required
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-2 text-sm outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmNewPassword"
                  required
                  value={passwordForm.confirmNewPassword}
                  onChange={handlePasswordChange}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-2 text-sm outline-none transition-all"
                />
              </div>
            </div>
            
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
              >
                <FaSave size={12} />
                <span>Change Password</span>
              </button>
            </div>
          </form>
        </motion.div>

        {/* Portal Alert Toggle controls */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6"
        >
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FaBell size={16} /></div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Communication Preferences</h3>
              <p className="text-xs text-slate-400">Configure how and when you want to receive alerts</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 text-sm">
            <div className="py-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-700">Hackathon Notifications</p>
                <p className="text-xs text-slate-400">Get alerts when a new college event timeline drops</p>
              </div>
              <input 
                type="checkbox" 
                checked={notifications.hackathonAlerts} 
                onChange={() => toggleNotification("hackathonAlerts")}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
            </div>

            <div className="py-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-700">Mentor Messages</p>
                <p className="text-xs text-slate-400">Receive instant pings when your review evaluation updates</p>
              </div>
              <input 
                type="checkbox" 
                checked={notifications.mentorMessages} 
                onChange={() => toggleNotification("mentorMessages")}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
            </div>

            <div className="py-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-700">Registration Deadlines</p>
                <p className="text-xs text-slate-400">Send reminder briefs 24 hours prior to link closure</p>
              </div>
              <input 
                type="checkbox" 
                checked={notifications.deadlineReminders} 
                onChange={() => toggleNotification("deadlineReminders")}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
            </div>
          </div>
        </motion.div>

        {/* Danger Account actions row */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-red-50/50 border border-red-100 rounded-2xl p-5 flex items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3">
            <FaExclamationCircle className="text-red-500 mt-0.5 flex-shrink-0" size={16} />
            <div>
              <h4 className="text-sm font-bold text-red-900">Deactivate Account</h4>
              <p className="text-xs text-red-600/80 leading-relaxed">Temporarily lock your account profile. You can recover access via college IT desk validation.</p>
            </div>
          </div>
          <button className="px-4 py-2 border border-red-200 hover:bg-red-100/50 text-red-700 font-semibold text-xs rounded-xl transition-colors flex-shrink-0">
            Request Freeze
          </button>
        </motion.div>

      </div>
    </div>
  );
};

export default Setting;