# Local Link

<div align="center">

[![Latest Release](https://img.shields.io/badge/Download-Latest%20Release-brightgreen?style=for-the-badge)](https://github.com/AnferneeDev/Local-Link/releases)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/anfernee-pichardo-0787a637a/)
![Electron](https://img.shields.io/badge/Electron-47848F?style=for-the-badge&logo=electron&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge&logo=shadcnui&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![License](https://img.shields.io/badge/License-Proprietary-red.svg?style=for-the-badge)

</div>

---

<div align="center">

### [Download the Latest Release](https://github.com/AnferneeDev/Local-Link/releases)

</div>

---

## Table of Contents

- [About The Project](#about-the-project)
- [Core Features](#core-features)
- [Demo](#demo)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Building](#building)
- [License](#license)
- [Contact](#contact)

---

## About The Project

**Local Link** is a desktop utility that creates a private, local network for sharing files and text.

It allows you to quickly transfer content from your computer to any other device on your network (like a phone or laptop) without needing cables, cloud services, or internet access. The host runs the Electron app, and any other device can connect via a simple QR code.

---

## Core Features

- **Local Network Server**: Runs a self-contained Express.js server on your local network.
- **QR Code Access**: Instantly connect mobile devices to your host app by scanning a QR code.
- **Real-Time Sharing**: Uses WebSockets (Socket.io) to push new files and text to all connected clients instantly.
- **Drag & Drop Uploads**: Easily upload multiple files from your desktop with progress tracking.
- **Text & Link Sharing**: Quickly send a snippet of text or a URL to all connected devices.
- **Bilingual UI**: Supports both English and Spanish.
- **Dynamic Port**: Automatically finds an open port to run on, avoiding conflicts with `localhost:3000`.

---

## Demo

![App Demo](frontend/assets/images/demo.gif)

---

## Tech Stack

- Framework: Electron (with React & Vite)
- UI Components: shadcn/ui
- Styling: Tailwind CSS
- Backend Server: Express.js (embedded)
- Real-Time Engine: Socket.io (embedded)
- File Uploads: Multer
- Language: TypeScript
- Bundler: Vite
- Installer: Electron Forge (Maker Squirrel)

---

## Getting Started

### Prerequisites

- Node.js (v18.x or later recommended)
- npm or yarn
- Git

### Local Setup

# Clone the repository

```bash
git clone https://github.com/AnferneeDev/Local-Link.git
```

# Navigate to the project directory

```bash
cd Local-Link/frontend
```

# Install dependencies

```bash
npm install
```

## Environment Variables

This project requires no environment variables to run in development.

---

## Run Development Server

```bash
npm run start
```

To build the standalone .exe installer for Windows:

```bash
npm run make
```

## License

PROPRIETARY LICENSE

Copyright (c) 2025 Anfernee Pichardo All rights reserved.

This software is confidential and proprietary. No part of this software may be copied, reproduced, modified, distributed, or used in any way without the express written permission of Anfernee Pichardo.

See the LICENSE file for more details.

---

## Contact

**Anfernee Pichardo**

[LinkedIn](https://www.linkedin.com/in/anfernee-pichardo-0787a637a/) • anfernee.developer@gmail.com

Project Link: [https://github.com/AnferneeDev/Clear_Feed](https://github.com/AnferneeDev/Local-Link)
