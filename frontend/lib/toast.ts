// Minimal toast utility (no external dependencies)
type ToastType = 'success' | 'error' | 'info'

function show(message: string, type: ToastType = 'info') {
  if (typeof window === 'undefined') return

  const existing = document.querySelector('.ag-toast-container')
  const container = existing || (() => {
    const el = document.createElement('div')
    el.className = 'ag-toast-container'
    el.style.cssText = 'position:fixed;top:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:8px;'
    document.body.appendChild(el)
    return el
  })()

  const colors: Record<ToastType, string> = {
    success: '#22c55e',
    error: '#ef4444',
    info: '#C9A66B'
  }

  const el = document.createElement('div')
  el.style.cssText = `
    background: #111111;
    color: #fff;
    padding: 12px 20px;
    border-radius: 8px;
    border-left: 3px solid ${colors[type]};
    font-family: Inter, sans-serif;
    font-size: 14px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    opacity: 0;
    transform: translateX(20px);
    transition: all 0.3s ease;
    min-width: 240px;
    max-width: 320px;
  `
  el.textContent = message
  container.appendChild(el)

  requestAnimationFrame(() => {
    el.style.opacity = '1'
    el.style.transform = 'translateX(0)'
  })

  setTimeout(() => {
    el.style.opacity = '0'
    el.style.transform = 'translateX(20px)'
    setTimeout(() => el.remove(), 300)
  }, 3000)
}

export const toast = {
  success: (msg: string) => show(msg, 'success'),
  error: (msg: string) => show(msg, 'error'),
  info: (msg: string) => show(msg, 'info'),
}
