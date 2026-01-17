import './style.css'

interface ElectronAPI {
    minimize: () => void
    maximize: () => void
    close: () => void
    onRestore: (callback: () => void) => void
    onMaximize: (callback: () => void) => void
    onUnmaximize: (callback: () => void) => void
    appReady: () => void
    startResize: (direction: string) => void
    stopResize: () => void
}

declare global {
    interface Window {
        electronAPI: ElectronAPI
    }
}

const appElement = document.getElementById('app')

// Helper to handle exit animations
const animateAndAction = (action: () => void) => {
    if (appElement) {
        appElement.classList.add('fading-out')
        appElement.classList.remove('visible')

        // Wait for animation
        setTimeout(() => {
            action()
        }, 200)
    } else {
        action()
    }
}

// Helper for maximize animation (fade out briefly then snap back)
const animateMaximize = (action: () => void) => {
    if (appElement) {
        appElement.classList.add('maximizing')
        appElement.classList.remove('visible')
        // Wait for part of the animation
        setTimeout(() => {
            action()
        }, 200)
    } else {
        action()
    }
}

// Animation after maximize/unmaximize completes
const animateFadeIn = () => {
    if (appElement) {
        appElement.classList.remove('maximizing')
        appElement.classList.remove('fading-out')
        requestAnimationFrame(() => {
            appElement.classList.add('visible')
        })
    }
}

document.getElementById('minimize')?.addEventListener('click', () => {
    animateAndAction(() => window.electronAPI.minimize())
})

document.getElementById('maximize')?.addEventListener('click', () => {
    animateMaximize(() => window.electronAPI.maximize())
})

document.getElementById('close')?.addEventListener('click', () => {
    animateAndAction(() => window.electronAPI.close())
})

// Loading Screen Logic - Consolidated
window.addEventListener('load', () => {
    requestAnimationFrame(() => {
        appElement?.classList.add('visible')
    })
    // Tell Main Process we are ready to show window
    window.electronAPI.appReady()
})

// Handle Restore Animation
window.electronAPI.onRestore(() => {
    animateFadeIn()
})

// Handle Maximize/Unmaximize Animations
window.electronAPI.onMaximize(() => {
    setTimeout(animateFadeIn, 100) // Wait for window resize
})

window.electronAPI.onUnmaximize(() => {
    setTimeout(animateFadeIn, 100) // Wait for window resize
})

// Setup Resize Handles
document.querySelectorAll('.resize-handle').forEach(handle => {
    handle.addEventListener('mousedown', (e) => {
        e.preventDefault()
        const direction = (handle as HTMLElement).dataset.dir
        if (direction) {
            window.electronAPI.startResize(direction)
        }
    })
})

// Global mouseup to stop resizing
window.addEventListener('mouseup', () => {
    window.electronAPI.stopResize()
})

// Color Slider Logic
const slider = document.getElementById('color-slider') as HTMLInputElement
if (slider) {
    slider.addEventListener('input', (e) => {
        const hue = (e.target as HTMLInputElement).value
        document.documentElement.style.setProperty('--hue', hue)
    })
}

// View Switching Logic
const views = {
    home: document.getElementById('home-view'),
    calculator: document.getElementById('calculator-view'),
    timer: document.getElementById('timer-view'),
    converter: document.getElementById('converter-view'),
    todo: document.getElementById('todo-view')
}

const showView = (viewName: keyof typeof views) => {
    // Hide all views first
    Object.values(views).forEach(el => {
        if (el) {
            el.classList.add('hidden')
            el.classList.remove('fade-in')
        }
    })

    // Show target view
    const target = views[viewName]
    if (target) {
        target.classList.remove('hidden')
        // Trigger reflow for animation
        void target.offsetWidth
        target.classList.add('fade-in')
    }
}

// Navigation Event Listeners
document.getElementById('btn-calculator')?.addEventListener('click', () => showView('calculator'))
document.getElementById('btn-timer')?.addEventListener('click', () => showView('timer'))
document.getElementById('btn-converter')?.addEventListener('click', () => showView('converter'))
document.getElementById('btn-todo')?.addEventListener('click', () => showView('todo'))

// Fix back button logic to specifically target 'home'
document.querySelectorAll('.back-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        showView('home')
    })
})

// ... Calculator & Timer Logic ... (Keep existing, assuming they are above or I'll append)

// --- Unit Converter Logic ---
const inputs = {
    m: document.getElementById('conv-meters') as HTMLInputElement,
    ft: document.getElementById('conv-feet') as HTMLInputElement,
    kg: document.getElementById('conv-kg') as HTMLInputElement,
    lbs: document.getElementById('conv-lbs') as HTMLInputElement,
}

if (inputs.m && inputs.ft) {
    inputs.m.addEventListener('input', () => {
        const val = parseFloat(inputs.m.value)
        inputs.ft.value = isNaN(val) ? '' : (val * 3.28084).toFixed(2)
    })
    inputs.ft.addEventListener('input', () => {
        const val = parseFloat(inputs.ft.value)
        inputs.m.value = isNaN(val) ? '' : (val / 3.28084).toFixed(2)
    })
}

if (inputs.kg && inputs.lbs) {
    inputs.kg.addEventListener('input', () => {
        const val = parseFloat(inputs.kg.value)
        inputs.lbs.value = isNaN(val) ? '' : (val * 2.20462).toFixed(2)
    })
    inputs.lbs.addEventListener('input', () => {
        const val = parseFloat(inputs.lbs.value)
        inputs.kg.value = isNaN(val) ? '' : (val / 2.20462).toFixed(2)
    })
}

// --- To-Do List Logic ---
interface Todo {
    id: number
    text: string
}

let todos: Todo[] = JSON.parse(localStorage.getItem('todos') || '[]')
const todoList = document.getElementById('todo-list')
const todoInput = document.getElementById('todo-input') as HTMLInputElement
const todoAddBtn = document.getElementById('todo-add-btn')

const saveTodos = () => {
    localStorage.setItem('todos', JSON.stringify(todos))
}

const renderTodo = (todo: Todo) => {
    const li = document.createElement('li')
    li.className = 'todo-item'
    li.innerHTML = `
        <span>${todo.text}</span>
        <button class="todo-delete" data-id="${todo.id}">🗑️</button>
    `
    li.querySelector('.todo-delete')?.addEventListener('click', (e) => {
        const id = parseInt((e.target as HTMLElement).dataset.id || '0')
        todos = todos.filter(t => t.id !== id)
        saveTodos()
        li.remove()
    })
    todoList?.appendChild(li)
}

// Initial render
todos.forEach(renderTodo)

const addTodo = () => {
    const text = todoInput.value.trim()
    if (!text) return

    const newTodo: Todo = {
        id: Date.now(),
        text
    }
    todos.push(newTodo)
    saveTodos()
    renderTodo(newTodo)
    todoInput.value = ''
}

todoAddBtn?.addEventListener('click', addTodo)
todoInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo()
})

console.log('Renderer process loaded with all modules!')
