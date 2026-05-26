import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaBell, FaCheck, FaRegBell, FaTimes } from 'react-icons/fa'
import { notificationAPI } from '../api'
import { useAuthStore } from '../store/authStore'
import { connectSocket, disconnectSocket } from '../utils/socket'

const formatRelativeTime = (dateValue) => {
  const date = new Date(dateValue)
  const diffMinutes = Math.max(1, Math.round((Date.now() - date.getTime()) / 60000))
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  const diffHours = Math.round(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.round(diffHours / 24)
  return `${diffDays}d ago`
}

const NotificationDropdown = () => {
  const navigate = useNavigate()
  const token = useAuthStore((state) => state.token)
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const response = await notificationAPI.getNotifications()
      const nextNotifications = response.data?.data?.notifications || []
      setNotifications(nextNotifications)
      setUnreadCount(response.data?.data?.unreadCount || 0)
    } catch (error) {
      console.error('Failed to load notifications', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!token) return

    loadNotifications()

    const socket = connectSocket(token)
    const handleNotification = ({ notification }) => {
      if (!notification) return
      setNotifications((current) => [notification, ...current.filter((item) => item._id !== notification._id)])
      if (!notification.read) {
        setUnreadCount((count) => count + 1)
      }
    }

    socket.on('notification:new', handleNotification)

    return () => {
      socket.off('notification:new', handleNotification)
    }
  }, [token])

  useEffect(() => {
    return () => {
      // Keep singleton socket lifecycle simple; disconnect on unmount only if no other dashboard page is active.
    }
  }, [])

  const badgeCount = useMemo(() => unreadCount, [unreadCount])

  const markRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId)
      setNotifications((current) => current.map((item) => (item._id === notificationId ? { ...item, read: true } : item)))
      setUnreadCount((count) => Math.max(0, count - 1))
    } catch (error) {
      console.error('Failed to mark notification as read', error)
    }
  }

  const markAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead()
      setNotifications((current) => current.map((item) => ({ ...item, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all notifications as read', error)
    }
  }

  const handleNavigate = async (notification) => {
    if (!notification.read) {
      await markRead(notification._id)
    }
    setOpen(false)
    if (notification.actionUrl) {
      navigate(notification.actionUrl)
    }
  }

  const iconByType = (type) => {
    if (type === 'sos-created') return <FaBell className="text-rose-500" />
    if (type === 'payment-completed') return <FaCheck className="text-emerald-500" />
    if (type === 'payment-failed') return <FaTimes className="text-amber-500" />
    return <FaRegBell className="text-primary" />
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((current) => !current)}
        className="relative p-3 text-slate-600 hover:bg-slate-100 rounded-2xl transition-colors"
        aria-label="Notifications"
      >
        <FaBell className="text-xl" />
        {badgeCount > 0 && (
          <span className="absolute top-2 right-2 min-w-5 h-5 px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
            {badgeCount > 9 ? '9+' : badgeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-[24rem] max-w-[calc(100vw-2rem)] premium-panel z-30 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Notifications</h3>
              <p className="text-xs text-slate-500">Stay updated in real time</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={markAllRead} className="text-xs font-semibold text-primary hover:text-primary-dark">
                Mark all read
              </button>
              <button onClick={() => setOpen(false)} className="p-2 rounded-xl hover:bg-white text-slate-500">
                <FaTimes />
              </button>
            </div>
          </div>

          <div className="max-h-[32rem] overflow-y-auto bg-white">
            {loading && (
              <div className="px-5 py-6 text-sm text-slate-500">Loading notifications...</div>
            )}

            {!loading && notifications.length === 0 && (
              <div className="px-5 py-10 text-center text-slate-500">
                <div className="mx-auto mb-3 w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <FaRegBell />
                </div>
                <p className="font-semibold text-slate-700">You're all caught up</p>
                <p className="text-sm mt-1">New updates will appear here instantly.</p>
              </div>
            )}

            {!loading && notifications.map((notification) => (
              <button
                key={notification._id}
                onClick={() => handleNavigate(notification)}
                className={`w-full text-left px-5 py-4 border-b border-slate-100 transition-colors hover:bg-slate-50 ${notification.read ? 'bg-white' : 'bg-primary/5'}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                    {iconByType(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <h4 className="font-semibold text-slate-900 truncate">{notification.title}</h4>
                      <span className="text-[11px] text-slate-400 whitespace-nowrap">{formatRelativeTime(notification.createdAt)}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600 leading-6 line-clamp-3">{notification.message}</p>
                    {!notification.read && (
                      <span className="inline-flex mt-2 text-[11px] font-bold text-primary">New</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationDropdown
