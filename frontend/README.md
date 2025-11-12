# Electron + Vite + React + TypeScript + Shadcn UI

A modern desktop application template built with Electron, Vite, React, TypeScript, and Shadcn UI components.

## Features

- 🚀 **Electron Forge** - Simplified Electron application deployment
- ⚡ **Vite** - Fast development and building experience
- ⚛️ **React** - Component-based UI library
- 🔷 **TypeScript** - Type safety and improved developer experience
- 🎨 **Shadcn UI** - Beautiful, accessible UI components
- 🌙 **Dark mode support** - Automatically adapts to system preferences

## Prerequisites

- [Node.js](https://nodejs.org/) (version 16 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

## Getting Started

### Installation

```bash
# Clone the repository (or download the zip)
https://github.com/just-ign/electron-vite-react-shadcn-template
cd electron-vite-react-shadcn-template

# Install dependencies
npm install
# or
yarn
```

### Development

Start the app in development mode:

```bash
npm run dev
# or
yarn dev
```

### Building

Build the app for production:

```bash
npm run make
# or
yarn make
```

This will generate platform-specific distributables in the `out` directory.

## Project Structure

```
├── src/                # Application source code
│   ├── main.ts         # Electron main process
│   ├── preload.ts      # Preload script
│   ├── App.tsx         # Main React component
│   └── ...
├── components/         # UI components
│   └── ui/             # Shadcn UI components
├── lib/                # Utility functions and helpers
├── public/             # Static assets
└── ...
```

## Customization

### Adding Shadcn UI Components

```bash
npx shadcn@latest add [component-name]
```

Example:
```bash
npx shadcn@latest add dropdown-menu
```

## License

MIT
