import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FaPaperPlane, FaComments } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { messageAPI } from '../api'
import { useAuthStore } from '../store/authStore'
import { connectSocket } from '../utils/socket'

const MessagesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { token, user } = useAuthStore()
  const [conversations, setConversations] = useState([])
  const [selectedConversationId, setSelectedConversationId] = useState('')
  const [thread, setThread] = useState(null)
  const [message, setMessage] = useState('')
  const [loadingList, setLoadingList] = useState(true)
  const [loadingThread, setLoadingThread] = useState(false)
  const [sending, setSending] = useState(false)
  const socketRef = useRef(null)
  const threadBottomRef = useRef(null)

  const selectedConversation = useMemo(
    () => conversations.find((item) => item.conversationId === selectedConversationId),
    [conversations, selectedConversationId]
  )

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    const bookingId = searchParams.get('booking')
    const requestId = searchParams.get('request')
    const providerId = searchParams.get('provider')

    if (bookingId) {
      setSelectedConversationId(`booking:${bookingId}`)
    } else if (requestId && providerId) {
      setSelectedConversationId(`request:${requestId}:${providerId}`)
    }
  }, [searchParams])

  useEffect(() => {
    if (!selectedConversationId && conversations.length > 0) {
      setSelectedConversationId(conversations[0].conversationId)
    }
  }, [conversations, selectedConversationId])

  useEffect(() => {
    if (!token) return undefined

    const socket = connectSocket(token)
    socketRef.current = socket

    const handleBookingMessage = (payload) => {
      if (payload.conversationId === selectedConversationId) {
        setThread((current) => ({
          ...current,
          messages: [...(current?.messages || []).filter((item) => String(item._id) !== String(payload.message._id)), payload.message]
        }))
      }
      fetchConversations(false)
    }

    const handleRequestMessage = (payload) => {
      if (payload.conversationId === selectedConversationId) {
        setThread((current) => ({
          ...current,
          messages: [...(current?.messages || []).filter((item) => String(item._id) !== String(payload.message._id)), payload.message]
        }))
      }
      fetchConversations(false)
    }

    socket.on('booking-message:new', handleBookingMessage)
    socket.on('request-message:new', handleRequestMessage)
    socket.on('booking-error', (payload) => {
      if (payload?.message) toast.error(payload.message)
    })

    return () => {
      socket.off('booking-message:new', handleBookingMessage)
      socket.off('request-message:new', handleRequestMessage)
      socket.off('booking-error')
    }
  }, [token, selectedConversationId])

  useEffect(() => {
    if (!selectedConversationId || !selectedConversation) return
    fetchThread(selectedConversation)
  }, [selectedConversationId, selectedConversation])

  useEffect(() => {
    threadBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [thread?.messages])

  // Expose debug objects for easier inspection in browser console
  useEffect(() => {
    try {
      window.__APP_DEBUG__ = window.__APP_DEBUG__ || {}
      window.__APP_DEBUG__.messages = thread?.messages || []
      window.__APP_DEBUG__.user = user || null
    } catch (e) {
      // ignore
    }
  }, [thread, user])

  const fetchConversations = async (showLoading = true) => {
    try {
      if (showLoading) setLoadingList(true)
      const res = await messageAPI.getConversations()
      setConversations(res.data.data.conversations || [])
    } catch (error) {
      console.error('Fetch conversations error:', error)
      toast.error('Failed to load conversations')
    } finally {
      if (showLoading) setLoadingList(false)
    }
  }

  const joinRoom = (conversation) => {
    const socket = socketRef.current || (token ? connectSocket(token) : null)
    if (!socket || !conversation) return

    if (conversation.conversationKind === 'request') {
      const providerId = conversation.provider?._id || conversation.provider?.id
      socket.emit('join-request-room', { requestId: conversation.request.id, providerId })
    } else {
      socket.emit('join-booking-room', { bookingId: conversation.booking.id })
    }
  }

  const fetchThread = async (conversation) => {
    if (!conversation) return

    try {
      setLoadingThread(true)

      if (conversation.conversationKind === 'request') {
        const providerId = conversation.provider?._id || conversation.provider?.id
        const res = await messageAPI.getRequestMessages(conversation.request.id, providerId)
        setThread(res.data.data)
        joinRoom(conversation)
      } else {
        const res = await messageAPI.getBookingMessages(conversation.booking.id)
        setThread(res.data.data)
        joinRoom(conversation)
      }
    } catch (error) {
      console.error('Fetch thread error:', error)
      toast.error(error.response?.data?.message || 'Unable to open chat')
      setThread(null)
    } finally {
      setLoadingThread(false)
    }
  }

  const handleSelectConversation = (conversationId) => {
    setSelectedConversationId(conversationId)
    const conversation = conversations.find((item) => item.conversationId === conversationId)
    if (conversation?.conversationKind === 'request') {
      const providerId = conversation.provider?._id || conversation.provider?.id
      setSearchParams({ request: conversation.request.id, provider: providerId })
    } else if (conversation?.booking?.id) {
      setSearchParams({ booking: conversation.booking.id })
    }
  }

  const handleSend = async (event) => {
    event.preventDefault()
    if (!selectedConversation || !message.trim()) return

    try {
      setSending(true)

      let res
      if (selectedConversation.conversationKind === 'request') {
        const providerId = selectedConversation.provider?._id || selectedConversation.provider?.id
        res = await messageAPI.sendRequestMessage(selectedConversation.request.id, providerId, { message })
      } else {
        res = await messageAPI.sendBookingMessage(selectedConversation.booking.id, { message })
      }

      setMessage('')
      fetchConversations(false)

      // If API returned the created message, append it optimistically to thread
      const created = res?.data?.data?.message || res?.data?.data
      if (created) {
        setThread((cur) => ({ ...(cur || {}), messages: [...(cur?.messages || []), created] }))
        setTimeout(() => threadBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
      } else {
        // fallback: reload thread
        fetchThread(selectedConversation)
      }
    } catch (error) {
      console.error('Send message error:', error)
      toast.error(error.response?.data?.message || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const counterpartName = (conversation) => {
    if (!conversation) return 'Chat'

    // Request-based conversation: participants are tourist (request.tourist) and provider (conversation.provider)
    if (conversation.conversationKind === 'request') {
      if (user?.role === 'provider') {
        return conversation?.tourist?.name || conversation?.tourist?.email || 'Tourist'
      }
      // tourist view
      return conversation.provider?.businessInfo?.businessName || conversation.provider?.name || 'Provider'
    }

    // Booking-based conversation: participants are booking.tourist and booking.provider
    if (user?.role === 'tourist') {
      return conversation?.booking?.provider?.businessInfo?.businessName || conversation?.booking?.provider?.name || 'Provider'
    }

    // provider or admin view
    return conversation?.booking?.tourist?.name || conversation?.booking?.tourist?.email || 'Tourist'
  }

  const headerTitle = () => {
    if (!selectedConversation) return 'Chat'
    return counterpartName(selectedConversation)
  }

  const headerSubtitle = () => {
    if (!selectedConversation) return ''
    return selectedConversation.conversationKind === 'request'
      ? selectedConversation.request?.title || 'Tour Request Chat'
      : selectedConversation.booking?.serviceName || 'Booking Chat'
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
      <aside className="bg-white rounded-xl shadow-sm border overflow-hidden lg:col-span-1 flex flex-col">
        <div className="p-4 border-b flex items-center gap-2">
          <FaComments className="text-primary" />
          <h2 className="font-semibold">Conversations</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingList ? (
            <div className="p-4 text-gray-500">Loading conversations...</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-gray-500">No conversations yet.</div>
          ) : (
            conversations.map((conversation) => {
              const isActive = conversation.conversationId === selectedConversationId
              return (
                <button
                  key={conversation.conversationId}
                  onClick={() => handleSelectConversation(conversation.conversationId)}
                  className={`w-full text-left p-4 border-b hover:bg-gray-50 transition ${isActive ? 'bg-primary/5' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 truncate">
                        {counterpartName(conversation)}
                      </div>
                      <div className="text-sm text-gray-600 truncate">
                        {conversation.conversationKind === 'request'
                          ? conversation.request?.title
                          : conversation.booking?.serviceName}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 truncate">
                        {conversation.latestMessage?.message || 'Start the chat'}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {conversation.unreadCount > 0 && (
                        <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">{conversation.unreadCount}</span>
                      )}
                      <span className="text-xs text-gray-400 capitalize">{conversation.conversationKind}</span>
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </aside>

      <section className="bg-white rounded-xl shadow-sm border overflow-hidden lg:col-span-2 flex flex-col">
        {!selectedConversation ? (
          <div className="flex-1 grid place-items-center text-gray-500 p-8 text-center">
            <div>
              <FaComments className="text-5xl mx-auto mb-3 text-gray-300" />
              <p>Select a conversation to start chatting.</p>
            </div>
          </div>
        ) : loadingThread ? (
          <div className="flex-1 grid place-items-center text-gray-500">Loading chat...</div>
        ) : thread ? (
          <>
            <header className="p-4 border-b flex items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-lg">{headerTitle()}</h3>
                <p className="text-sm text-gray-500">{headerSubtitle()}</p>
              </div>
              <button
                onClick={() => {
                  if (selectedConversation.conversationKind === 'request') {
                    const providerId = selectedConversation.provider?._id || selectedConversation.provider?.id
                    navigate(`/tourist/provider/${providerId}?request=${selectedConversation.request.id}`)
                  } else {
                    navigate(user?.role === 'tourist' ? '/tourist/trips' : '/provider/bookings')
                  }
                }}
                className="text-sm text-primary font-medium"
              >
                View Details
              </button>
            </header>

            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
              {thread.messages.length === 0 ? (
                <div className="text-center text-gray-500 py-10">No messages yet. Say hello.</div>
              ) : (
                thread.messages.map((item) => {
                  const extractId = (val) => {
                    if (!val) return null
                    if (typeof val === 'string') return val
                    return val._id || val.id || null
                  }

                  const isMine = String(extractId(item.sender)) === String(extractId(user))
                  return (
                    <div key={item._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} px-3`}>
                      <div
                        className={`inline-block max-w-[75%] px-4 py-3 ${
                          isMine
                            ? 'bg-green-500 text-white rounded-2xl rounded-br-none mr-2 text-right'
                            : 'bg-gray-100 text-gray-900 rounded-2xl rounded-bl-none ml-2 text-left'
                        }`}
                      >
                        <div className="text-sm">{item.message}</div>
                        <div className={`text-[11px] mt-1 ${isMine ? 'text-white/80' : 'text-gray-500'}`}>
                          {new Date(item.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={threadBottomRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 border-t bg-white flex gap-3">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write a message..."
                className="flex-1 border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={sending}
                className="btn btn-primary flex items-center gap-2"
              >
                <FaPaperPlane />
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 grid place-items-center text-gray-500">Open a conversation to chat.</div>
        )}
      </section>
    </div>
  )
}

export default MessagesPage
