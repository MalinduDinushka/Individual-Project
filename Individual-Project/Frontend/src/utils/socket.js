import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'
let socket = null

export const getSocket = (token) => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      withCredentials: true,
      auth: { token }
    })
  }

  if (token) {
    socket.auth = { token }
  }

  return socket
}

export const connectSocket = (token) => {
  const instance = getSocket(token)
  if (!instance.connected) {
    instance.connect()
  }
  return instance
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
