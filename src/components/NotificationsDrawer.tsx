import React from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  ExternalLink,
  Check
} from 'lucide-react';
import { AppNotification } from '../types';
import { markNotificationAsRead } from '../utils/api';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onRefreshNotifications: () => void;
  onSelectChallengeId?: (id: string) => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onRefreshNotifications,
  onSelectChallengeId
}) => {
  if (!isOpen) return null;

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      onRefreshNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-400" />
            <h2 className="font-bold text-white text-base">Civic Notifications</h2>
            <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-0.5 rounded-full font-semibold">
              {notifications.filter(n => !n.read).length} Unread
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 text-sm font-semibold"
          >
            ✕
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-xs">
              No notifications yet.
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                className={`p-3.5 rounded-xl border transition-all text-xs ${
                  n.read
                    ? 'bg-slate-950/40 border-slate-800/60 text-slate-400'
                    : 'bg-slate-950 border-slate-800 text-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    {n.type === 'alert' && <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                    {n.type === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                    {n.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                    {n.type === 'info' && <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                    <span className="line-clamp-1">{n.title}</span>
                  </div>

                  {!n.read && (
                    <button
                      onClick={() => handleMarkAsRead(n.id)}
                      className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-0.5 shrink-0"
                    >
                      <Check className="w-3 h-3" />
                      <span>Read</span>
                    </button>
                  )}
                </div>

                <p className="text-slate-300 text-[11px] leading-relaxed mb-2">{n.message}</p>

                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span className="capitalize font-semibold text-slate-400">Target: {n.recipientRole}</span>
                  <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 text-center">
          <span className="text-[11px] text-slate-400">
            Real-time cross-stakeholder alerts powered by CivicSolve
          </span>
        </div>
      </div>
    </div>
  );
};
