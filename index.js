#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const os = require("os");
const readline = require("readline");
const WebSocket = require("ws");

// ---------------------------
// CONFIG
// ---------------------------
const PORT = 6000;
const inboxDir = path.join(__dirname, "shared", "inbox");
const outboxDir = path.join(__dirname, "shared", "outbox");

fs.mkdirSync(inboxDir, { recursive: true });
fs.mkdirSync(outboxDir, { recursive: true });

const hostname = os.hostname();
let chatMode = false;
const peers = new Map(); // { ip -> websocket }

// ---------------------------
// READLINE I/O
// ---------------------------
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function print(msg) {
  readline.clearLine(process.stdout, 0);
  readline.cursorTo(process.stdout, 0);
  console.log(msg);
  rl.prompt(true);
}

function isValidIp(ip) {
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(ip);
}

// ---------------------------
// CHAT LOOP
// ---------------------------
function startChat() {
  if (chatMode) return;
  chatMode = true;

  print(`🗨️  Chat/File mode started — type messages freely`);
  print(`Commands: /send-file   /exit`);
  rl.setPrompt("> ");
  rl.prompt();

  rl.on("line", async (line) => {
    const input = line.trim();
    if (!input) return rl.prompt();

    if (input === "/exit") process.exit(0);

    if (input === "/send-file") {
      const files = fs.readdirSync(outboxDir);
      if (files.length === 0) {
        print("📁 No files in outbox/");
        return rl.prompt();
      }

      console.log("Select a file:");
      files.forEach((f, i) => console.log(`${i + 1}. ${f}`));

      rl.question("Enter number: ", (n) => {
        const idx = parseInt(n) - 1;
        const file = files[idx];
        if (!file) return print("Invalid choice.");

        const filepath = path.join(outboxDir, file);
        const base64 = fs.readFileSync(filepath).toString("base64");

        peers.forEach(ws => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: "file",
              from: hostname,
              filename: file,
              base64
            }));
          }
        });

        print(`📤 Sent file: ${file}`);
      });

      return;
    }

    // Send chat message
    peers.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: "chat",
          from: hostname,
          message: input
        }));
      }
    });

    rl.prompt();
  });
}

// ---------------------------
// HANDLE INCOMING
// ---------------------------
function handleIncoming(ws, raw) {
  try {
    const data = JSON.parse(raw);

    if (data.type === "chat") {
      print(`💬 [${data.from}]: ${data.message}`);
      return;
    }

    if (data.type === "file") {
      const filePath = path.join(inboxDir, data.filename);
      fs.writeFileSync(filePath, Buffer.from(data.base64, "base64"));
      print(`📥 File received from ${data.from}: ${data.filename}`);
      return;
    }
  } catch (e) {
    print(`⚠️ Invalid incoming JSON`);
  }
}

// ---------------------------
// CONNECT TO PEER
// ---------------------------
function connect(ip) {
  if (peers.has(ip)) return;

  const ws = new WebSocket(`ws://${ip}:${PORT}`);

  ws.on("open", () => {
    peers.set(ip, ws);
    print(`✅ Connected to peer ${ip}`);
    startChat();
  });

  ws.on("message", (msg) => handleIncoming(ws, msg));

  ws.on("close", () => {
    peers.delete(ip);
    print(`⚠️ Peer disconnected: ${ip}`);
  });

  ws.on("error", (err) => {
    print(`❌ Failed to connect to ${ip}: ${err.message}`);
  });
}

// ---------------------------
// WEBSOCKET SERVER
// ---------------------------
const server = new WebSocket.Server({ port: PORT });

server.on("connection", (ws, req) => {
  const ip = req.socket.remoteAddress.replace(/^::ffff:/, "");
  peers.set(ip, ws);

  print(`🔗 Incoming peer connected: ${ip}`);

  ws.on("message", (msg) => handleIncoming(ws, msg));
  ws.on("close", () => peers.delete(ip));

  startChat();
});

// ---------------------------
// INITIAL PROMPT
// ---------------------------
console.log("🌐 P2P LAN Chat + File Share");
rl.question("Enter peer IPv4 to connect (or press Enter to wait): ", (ip) => {
  const trimmed = ip.trim();
  if (trimmed && isValidIp(trimmed)) {
    connect(trimmed);
  } else {
    print("Waiting for incoming peer...");
  }
});

