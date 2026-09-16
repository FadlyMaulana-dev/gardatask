import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo
} from 'react'
import { useAuth } from './AuthContext'
import { API_URL } from '../lib/api'
import useDebounce from '../hooks/useDebounce'

const TaskContext = createContext()

export function TaskProvider({ children }) {
  const { token, logout } = useAuth()

  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [activeProjectId, setActiveProjectId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Task Detail Modal
  const [selectedTask, setSelectedTask] = useState(null)
  const [taskDetailOpen, setTaskDetailOpen] = useState(false)

  // Search
  const [searchQuery, setSearchQuery] = useState('')

  // ==========================
  // FETCH TASKS
  // ==========================
  const fetchTasks = useCallback(async () => {
    if (!token) return

    setIsLoading(true)

    try {
      const res = await fetch(`${API_URL}/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (res.status === 401) {
        logout()
        return
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      const json = await res.json()
      // API returns: { data: [...] }  (plain array from get())
      // or legacy:   { data: { data: [...], total: ... } }  (paginated)
      const raw = json.data
      let items = []
      if (Array.isArray(raw)) {
        items = raw
      } else if (raw && Array.isArray(raw.data)) {
        items = raw.data
      }

      setTasks(items)
    } catch (err) {
      console.error('TaskContext: Failed to fetch tasks', err)
    } finally {
      setIsLoading(false)
    }
  }, [token, logout])

  // ==========================
  // FETCH PROJECTS
  // ==========================
  const fetchProjects = useCallback(async () => {
    if (!token) return

    try {
      const res = await fetch(`${API_URL}/projects`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (res.status === 401) {
        logout()
        return
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      const json = await res.json()
      const items = json.data?.data || json.data || []

      setProjects(Array.isArray(items) ? items : [])
    } catch (err) {
      console.error('TaskContext: Failed to fetch projects', err)
    }
  }, [token, logout])

  // ==========================
  // FETCH USERS
  // ==========================
  const fetchUsers = useCallback(async () => {
    if (!token) return

    try {
      const res = await fetch(`${API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (res.status === 401) {
        logout()
        return
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      const json = await res.json()
      setUsers(json.data || [])
    } catch (err) {
      console.error('TaskContext: Failed to fetch users', err)
    }
  }, [token, logout])

  // ==========================
  // INITIAL LOAD — all 3 in parallel
  // ==========================
  useEffect(() => {
    if (!token) return

    // Fire all 3 requests concurrently instead of sequentially
    Promise.all([fetchTasks(), fetchProjects(), fetchUsers()])
  }, [token, fetchTasks, fetchProjects, fetchUsers])

  // ==========================
  // TASK DETAIL
  // ==========================
  const openTaskDetail = (task) => {
    setSelectedTask(task)
    setTaskDetailOpen(true)
  }

  const closeTaskDetail = () => {
    setSelectedTask(null)
    setTaskDetailOpen(false)
  }

  // ==========================
  // CREATE TASK
  // ==========================
  const createTask = async (taskData) => {
    try {
      console.log('Sending:', taskData)

      const res = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(taskData)
      })

      const data = await res.json()

      console.log('Status:', res.status)
      console.log('Response:', data)

      if (!res.ok) {
        return false
      }

      await fetchTasks()
      return true
    } catch (err) {
      console.error(err)
      return false
    }
  }
  // ==========================
  // UPDATE TASK
  // ==========================
  const updateTask = async (taskId, updates) => {
    try {
      const res = await fetch(
        `${API_URL}/tasks/${taskId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(updates)
        }
      )

      if (res.status === 401) {
        logout()
        return false
      }

      if (!res.ok) {
        const err = await res.json()
        console.error('Update task error:', err)
        return false
      }

      await fetchTasks()
      return true
    } catch (err) {
      console.error('Update task error:', err)
      return false
    }
  }

  // ==========================
  // DELETE TASK
  // ==========================
  const deleteTask = async (taskId) => {
    try {
      const res = await fetch(
        `${API_URL}/tasks/${taskId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (res.status === 401) {
        logout()
        return false
      }

      if (!res.ok) {
        return false
      }

      await fetchTasks()
      return true
    } catch (err) {
      console.error('Delete task error:', err)
      return false
    }
  }

  // ==========================
  // SEARCH
  // ==========================
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  
  const searchResults = useMemo(() => {
    if (debouncedSearchQuery.trim().length >= 2) {
      return tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
          (t.description &&
            t.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase()))
      )
    }
    return []
  }, [debouncedSearchQuery, tasks])

  return (
    <TaskContext.Provider
      value={{
        tasks,
        projects,
        users,
        activeProjectId,
        setActiveProjectId,
        isLoading,
        refreshTasks: fetchTasks,
        refreshProjects: fetchProjects,
        createTask,
        updateTask,
        deleteTask,
        openTaskDetail,
        closeTaskDetail,
        selectedTask,
        taskDetailOpen,
        searchQuery,
        setSearchQuery,
        searchResults
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}

export function useTaskContext() {
  const ctx = useContext(TaskContext)

  if (!ctx) {
    throw new Error(
      'useTaskContext must be used within TaskProvider'
    )
  }

  return ctx
}