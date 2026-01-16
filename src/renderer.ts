import './style.css'

interface ElectronAPI {
    minimize: () => void
    maximize: () => void
    close: () => void
    onRestore: (callback: () => void) => void
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
        // Wait for part of the animation
        setTimeout(() => {
            action()
            // Wait a bit for OS resize then show again
            setTimeout(() => {
                appElement.classList.remove('maximizing')
                appElement.classList.add('visible') // Ensure visible is set
            }, 100)
        }, 200)
    } else {
        action()
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

window.addEventListener('load', () => {
    requestAnimationFrame(() => {
        appElement?.classList.add('visible')
    })
})

window.electronAPI.onRestore(() => {
    if (appElement) {
        appElement.classList.remove('fading-out')
        requestAnimationFrame(() => {
            appElement.classList.add('visible')
        })
    }
})

// Color Slider Logic
const slider = document.getElementById('color-slider') as HTMLInputElement
if (slider) {
    slider.addEventListener('input', (e) => {
        const hue = (e.target as HTMLInputElement).value
        document.documentElement.style.setProperty('--hue', hue)
    })
}

console.log('Renderer process loaded with complex animations and slider!')
