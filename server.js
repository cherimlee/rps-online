import http from 'node:http';
import express from 'express';
import { WebSocketServer } from 'ws';

const app = express();
app.use(express.static('public'));

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const BEATS = { rock: 'scissors', scissors: 'paper', paper: 'rock' };
const LABEL = { rock: '✊ 바위', paper: '✋ 보', scissors: '✌️ 가위' };
const rooms = new Map();   // 방코드 → { code, players: [] }

function send(room, msg) {
  const data = JSON.stringify(msg);
  for (const p of room.players) {
    if (p.ws.readyState === 1) p.ws.send(data);
  }
}

function sendState(room) {
  send(room, {
    type: 'state',
    players: room.players.map((p) => ({
      name: p.name, score: p.score, ready: p.choice !== null,
    })),
  });
}

function judge(room) {
  const [a, b] = room.players;
  let text;
  if (a.choice === b.choice) text = '무승부!';
  else if (BEATS[a.choice] === b.choice) { a.score++; text = `${a.name} 승리!`; }
  else { b.score++; text = `${b.name} 승리!`; }

  send(room, {
    type: 'result',
    text,
    reveal: room.players.map((p) => ({ name: p.name, hand: LABEL[p.choice] })),
  });

  for (const p of room.players) p.choice = null;
  sendState(room);
}

wss.on('connection', (ws) => {
  let room = null;
  let me = null;

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }

    if (msg.type === 'join' && !room) {
      const code = String(msg.room || '').trim().toUpperCase();
      if (!code) return;
      if (!rooms.has(code)) rooms.set(code, { code, players: [] });
      room = rooms.get(code);
      me = { ws, name: (msg.name || '익명').slice(0, 12), score: 0, choice: null };
      room.players.push(me);
      ws.send(JSON.stringify({ type: 'joined', room: code }));
      sendState(room);
    }

    if (msg.type === 'choice' && room && me && BEATS[msg.choice]) {
      me.choice = msg.choice;
      const allIn = room.players.length === 2
        && room.players.every((p) => p.choice !== null);
      if (allIn) judge(room);
      else sendState(room);
    }
  });

  ws.on('close', () => {
    if (!room) return;
    room.players = room.players.filter((p) => p !== me);
    if (room.players.length === 0) rooms.delete(room.code);
    else sendState(room);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`http://localhost:${PORT}`));
