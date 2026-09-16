import React, { useState } from 'react'
import { X, Trash2, Filter } from 'lucide-react'

export default function NotificationsCenter({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'task_assigned',
      title: 'New task assigned',
      message: 'John assigned you to "Build Kanban board"',
      icon: '📋',
      timestamp: '2 minutes ago',
      read: false,
      action: 'View Task',
    },
    {
      id: 2,
      type: 'comment_added',
      title: 'New comment',
      message: 'Jane commented on "Design Dashboard"',
      icon: '💬',
      timestamp: '15 minutes ago',
      read: false,
      action: 'View Comment',
    },
    {
      id: 3,
      type: 'task_updated',
      title: 'Task updated',
      message: 'Michael moved "API Integration" to Review',
      icon: '⚡',
      timestamp: '1 hour ago',
      read: true,
      action: 'View Update',
    },
    {
      id: 4,
      type: 'task_due_soon',
      title: 'Task due soon',
      message: '"Database Schema" is due tomorrow',
      icon: '⏰',
      timestamp: '3 hours ago',
      read: true,
      action: 'View Task',
    },
    {
      id: 5,
      type: 'team_member_added',
      title: 'Team member joined',
      message: 'Sarah Wilson joined the team',
      icon: '👥',
      timestamp: '1 day ago',
      read: true,
      action: 'View Profile',
    },
  ])

  const [filter, setFilter] = useState('all')

  const unreadCount = notifications.filter((n) => !n.read).length

  const filteredNotifications =
    filter === 'all'
      ? notifications
      : filter === 'unread'
      ? notifications.filter((n) => !n.read)
      : notifications.filter((n) => n.type === filter)

  const handleMarkAsRead = (id) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const handleDelete = (id) => {
    setNotifications(notifications.filter((n) => n.id !== id))
  }

  const handleClearAll = () => {
    setNotifications([])
  }

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-2xl z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Notifications</h2>
            {unreadCount > 0 && (
              <p className="text-xs text-slate-600">{unreadCount} unread</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="px-6 py-3 border-b border-slate-200">
          <div className="flex gap-2 overflow-x-auto">
            {[
              { id: 'all', label: 'All' },
              { id: 'unread', label: 'Unread' },
              { id: 'task_assigned', label: 'Tasks' },
              { id: 'comment_added', label: 'Comments' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setFilter(item.id)}
                className={`px-3 py-1 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                  filter === item.id
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6">
              <div className="text-4xl mb-2">🔔</div>
              <p className="text-slate-600">No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-slate-50 transition-colors group ${
                    !notification.read ? 'bg-brand-50' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Icon */}
                    <div className="text-2xl mt-1">{notification.icon}</div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900 truncate">
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-brand-600 flex-shrink-0 mt-1" />
                        )}
                      </div>

                      <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                        {notification.message}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">{notification.timestamp}</span>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                            >
                              Mark read
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(notification.id)}
                            className="p-1 hover:bg-red-100 rounded text-red-600"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <button className="mt-2 text-xs text-brand-600 hover:text-brand-700 font-semibold">
                        {notification.action} →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {notifications.length > 0 && (
          <div className="border-t border-slate-200 px-6 py-3 flex gap-2">
            <button
              onClick={handleMarkAllAsRead}
              className="flex-1 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Mark all as read
            </button>
            <button
              onClick={handleClearAll}
              className="flex-1 px-3 py-2 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
            >
              Clear all
            </button>
          </div>
        )}
      </div>
    </>
  )
}
