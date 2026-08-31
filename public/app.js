const $ = (id) => document.getElementById(id);
const proto = location.protocol === 'https:' ? 'wss' : 'ws';
const ws = new WebSocket(`${proto}://${location.host}`);

const saved = JSON.parse(localStorage.getItem('rps') || 'null');
let lastName = saved?.name || '';
let lastRoom = saved?.room || '';

function join(name, room) {
  lastName = name;
  lastRoom = room;
  ws.send(JSON.stringify({ type: 'join', room, name }));
}

ws.onopen = () => {
  if (saved) join(saved.name, saved.room);   // 새로고침이면 자동 재입장
};

$('join').onclick = () => {
  join($('nick').value, $('room').value);
};

ws.onmessage = (e) => {
  const msg = JSON.parse(e.data);

  if (msg.type === 'joined') {
    localStorage.setItem('rps', JSON.stringify({ name: lastName, room: lastRoom }));
    $('nick').value = lastName;
    $('room').value = lastRoom;
    $('lobby').hidden = true;
    $('game').hidden = false;
  }

  if (msg.type === 'state') {
    $('players').textContent = msg.players
      .map((p) => `${p.name} ${p.score}점 · ${p.ready ? '제출 완료' : '고르는 중'}`)
      .join('   |   ');
  }

  if (msg.type === 'result') {
    $('result').textContent =
      msg.reveal.map((p) => `${p.name} ${p.hand}`).join('  vs  ') + ` → ${msg.text}`;
  }
};

document.querySelectorAll('[data-hand]').forEach((btn) => {
  btn.onclick = () => {
    ws.send(JSON.stringify({ type: 'choice', choice: btn.dataset.hand }));
  };
});
