# 🌐 P2P LAN Chat + File Share

[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
![platform](https://img.shields.io/badge/platform-Linux%20%7C%20macOS%20%7C%20Windows-blue?style=for-the-badge)
![license](https://img.shields.io/badge/license-MIT-yellow?style=for-the-badge)
![status](https://img.shields.io/badge/status-active-success?style=for-the-badge)
![ws](https://img.shields.io/badge/WebSocket-enabled-orange?style=for-the-badge)

A lightweight **peer-to-peer LAN chat** with **file sharing** using
WebSockets --- no servers, no accounts, no internet required. Just
connect two machines on the same Wi-Fi/LAN and chat/send files in real
time.

## ✨ Features

✔️ Peer-to-peer LAN communication\
✔️ Send / receive chat messages\
✔️ Send files to all connected peers\
✔️ Shared inbox/outbox directories\
✔️ Auto-accept incoming files\
✔️ Simple terminal UI\
✔️ Works cross-platform\
✔️ No external server required

## 📁 Project Structure

    .
    ├── shared/
    │   ├── inbox/     # received files
    │   └── outbox/    # files to send
    ├── index.js       # main p2p chat script
    └── README.md

## 🚀 Getting Started

### 1. Install dependencies

``` sh
npm install
```

### 2. Start via npm

``` sh
npm start
```

This launches the WebSocket server and opens the chat prompt.

### 3. Connect peers

-   Machine A: Run and **press Enter** to wait
-   Machine B: Run and enter IPv4 of Machine A

Example:

    Enter peer IPv4 to connect: 192.168.1.42

## 💬 Chat Commands

  Command             Action
  ------------------- ------------------------------------------
  `/send-file`        choose file from `shared/outbox` to send
  `/exit`             exit application
  *(anything else)*   sends a chat message

## 📦 File Sharing

To send a file:

1.  Place file in: `shared/outbox/`
2.  Use `/send-file`
3.  Receiver gets file in: `shared/inbox/`

## 🏗 Technical Overview

-   Communication via **WebSockets**
-   Each instance runs both: ✔ WebSocket server\
    ✔ WebSocket client\
-   Multi-peer broadcast supported

## 🧩 Dependencies

  Package      Purpose
  ------------ ---------------------------
  `ws`         WebSocket server & client
  `fs`         file handling
  `readline`   terminal interaction

## 🔐 Notes

⚠ LAN-only (no NAT traversal)\
⚠ No encryption → use trusted networks\
⚠ IPv4 only (can extend)

## 🗺 Future Ideas

-   [ ] File chunking for large files
-   [ ] Encryption (TLS or libsodium)
-   [ ] Peer auto-discovery (UDP)
-   [ ] GUI interface
-   [ ] Direct peer selection

## 📜 License

MIT --- free for personal & commercial use.
