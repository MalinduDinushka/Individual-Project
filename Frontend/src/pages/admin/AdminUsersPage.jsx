import { useEffect, useMemo, useState } from 'react'
import { FaSearch, FaTrash, FaToggleOn, FaToggleOff, FaUserShield } from 'react-icons/fa'
import { adminAPI } from '../../api'
import { toast } from 'react-hot-toast'
import { connectSocket } from '../../utils/socket'
import { useAuthStore } from '../../store/authStore'

const roleOptions = [
  { value: '', label: 'All Roles' },
  { value: 'tourist', label: 'Tourist' },
  { value: 'provider', label: 'Provider' },
  { value: 'admin', label: 'Admin' }
]

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' }
]

const AdminUsersPage = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')

  const fetchUsers = async (filters = {}) => {
    try {
      setLoading(true)
      const response = await adminAPI.getAllUsers(filters)
      if (response.data.success) {
        setUsers(response.data.data || [])
      }
    } catch (error) {
      console.error('Load users error:', error)
      toast.error(error.response?.data?.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const token = useAuthStore(state => state.token)
  useEffect(() => {
    if (!token) return
    const socket = connectSocket(token)
    const handleVerificationUpdated = (payload) => {
      // Refresh users list when a verification status changes
      fetchUsers()
    }

    socket.on('verification:updated', handleVerificationUpdated)
    return () => socket.off('verification:updated', handleVerificationUpdated)
  }, [token])

  const filteredUsers = useMemo(() => users, [users])

  const handleSearch = async (event) => {
    event.preventDefault()
    const params = {}
    if (search.trim()) params.search = search.trim()
    if (role) params.role = role
    if (status === 'active') params.active = true
    if (status === 'inactive') params.active = false
    await fetchUsers(params)
  }

  const toggleActive = async (user) => {
    try {
      const response = await adminAPI.updateUserStatus(user._id, { isActive: !user.isActive })
      if (response.data.success) {
        toast.success(response.data.message)
        setUsers((current) => current.map((item) => item._id === user._id ? response.data.data.user : item))
      }
    } catch (error) {
      console.error('Toggle user status error:', error)
      toast.error(error.response?.data?.message || 'Failed to update user')
    }
  }

  const deleteUser = async (user) => {
    const confirmed = window.confirm(`Delete ${user.name}? This cannot be undone.`)
    if (!confirmed) return

    try {
      const response = await adminAPI.deleteUser(user._id)
      if (response.data.success) {
        toast.success(response.data.message)
        setUsers((current) => current.filter((item) => item._id !== user._id))
      }
    } catch (error) {
      console.error('Delete user error:', error)
      toast.error(error.response?.data?.message || 'Failed to delete user')
    }
  }

  if (loading) {
    return <div className="rounded-xl bg-white p-6 shadow-md">Loading users...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
        <p className="text-gray-600">Search, deactivate, or delete platform users.</p>
      </div>

      <form onSubmit={handleSearch} className="grid gap-3 md:grid-cols-4 bg-white p-4 rounded-xl shadow-md">
        <label className="md:col-span-2 flex items-center gap-2 rounded-lg border px-3 py-2">
          <FaSearch className="text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full outline-none"
            placeholder="Search by name or email"
          />
        </label>

        <select value={role} onChange={(e) => setRole(e.target.value)} className="rounded-lg border px-3 py-2">
          {roleOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>

        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border px-3 py-2">
          {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>

        <div className="md:col-span-4 flex gap-2">
          <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-white">Filter</button>
          <button
            type="button"
            onClick={() => {
              setSearch('')
              setRole('')
              setStatus('')
              fetchUsers()
            }}
            className="rounded-lg border px-4 py-2 text-gray-700"
          >
            Reset
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-xl bg-white shadow-md">
        <table className="w-full">
          <thead className="bg-gray-50 text-left text-sm text-gray-600">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Verified</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredUsers.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-gray-500" colSpan="5">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="font-medium text-gray-800">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-4 py-4 capitalize text-gray-700">{user.role}</td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${user.isVerified ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      <FaUserShield />
                      {user.isVerified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        onClick={() => toggleActive(user)}
                        className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        {user.isActive ? <FaToggleOff /> : <FaToggleOn />}
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => deleteUser(user)}
                        className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-3 py-2 text-sm text-white hover:bg-red-600"
                      >
                        <FaTrash />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminUsersPage
