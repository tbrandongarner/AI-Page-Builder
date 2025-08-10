const id = String(++this.counter)
    this.toasts = [...this.toasts, { id, message, type }]
    this.emit()
    if (duration > 0) {
      setTimeout(() => this.remove(id), duration)
    }
    return id
  }

  remove(id: string) {
    this.toasts = this.toasts.filter(t => t.id !== id)
    this.emit()
  }

  removeOldest() {
    if (this.toasts.length === 0) return
    const [, ...rest] = this.toasts
    this.toasts = rest
    this.emit()
  }

  clear() {
    this.toasts = []
    this.emit()
  }

  onChange(listener: (toasts: Toast[]) => void) {
    this.listeners.add(listener)
  }

  offChange(listener: (toasts: Toast[]) => void) {
    this.listeners.delete(listener)
  }

  private emit() {
    const snapshot = [...this.toasts]
    this.listeners.forEach(fn => fn(snapshot))
  }
}

const manager = new ToastManager()

export function showToast(
  message: string,
  type: ToastType = 'info',
  duration?: number
): string {
  return manager.add(message, type, duration ?? 5000)
}

export function hideToast(id: string) {
  manager.remove(id)
}

export function hideOldestToast() {
  manager.removeOldest()
}

export function clearAll() {
  manager.clear()
}

const NotificationToast: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const handler = (newToasts: Toast[]) => {
      setToasts(newToasts)
    }
    manager.onChange(handler)
    return () => {
      manager.offChange(handler)
    }
  }, [])

  return (
    <div className="notification-toast-container">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`notification-toast notification-toast--${toast.type}`}
        >
          <span className="notification-toast__message">{toast.message}</span>
          <button
            className="notification-toast__close"
            onClick={() => hideToast(toast.id)}
          >
            ?
          </button>
        </div>
      ))}
    </div>
  )
}

export default NotificationToast