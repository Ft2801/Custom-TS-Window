# Custom TS Window

A modern, frameless desktop application template built with **Electron**, **TypeScript**, and **Vite**.

This project demonstrates how to create a highly customizable, beautiful desktop UI with advanced window management and animations.

## ✨ Features

*   **Frameless Design**: Completely custom title bar that blends seamlessly with the application.
*   **Glassmorphism UI**: Modern transparency, blur effects, and subtle borders.
*   **Window Management**: Custom Minimize, Maximize/Restore, and Close buttons with smooth fade-out animations.
*   **Dynamic Theme**:
    *   **Rainbow Slider**: Real-time color customization using a hue slider.
    *   **Global Tint**: Changing the slider updates the entire window's color theme (glows, borders, gradients).
*   **Smooth Animations**:
    *   Fade-in on startup and restore.
    *   Fade-out on close and minimize.
    *   Scale effects for maximizing.

## 🛠️ Tech Stack

*   [Electron](https://www.electronjs.org/)
*   [Vite](https://vitejs.dev/)
*   [TypeScript](https://www.typescriptlang.org/)
*   [CSS3](https://developer.mozilla.org/en-US/docs/Web/CSS) (Variables, Transitions, Flexbox/Grid)

## 🚀 Getting Started

### Prerequisites

*   [Node.js](https://nodejs.org/) (v16.0.0 or higher recommended)
*   npm (comes with Node.js)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/custom-electron-window.git
    cd custom-electron-window
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

### 🏃‍♂️ Usage

**Development Mode** (Hot Reload)
Runs the app in development mode with live reloading.
```bash
npm run dev
```

**Build for Production**
Builds the application for your OS (creates an executable in the `dist` folder).
```bash
npm run build
```

## 🎮 How to Use

1.  Launch the application.
2.  Use the top-right controls to manage the window (Minimize, Maximize, Close).
3.  **Drag** the window using the top title bar area.
4.  **Slider**: Use the rainbow slider at the bottom of the window to change the application's accent color. All lighting effects and borders will update immediately!

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
