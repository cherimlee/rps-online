const $ = (id) => document.getElementById(id);
const ws = new WebSocket(`ws://${location.host}`);

$('join').onclick = () => {
  ws.send(JSON.stringify({
    type: 'join',
    room: $('room').value,
    name: $('nick').value,
  }));
};

ws.onmessage = (e) => {
  const msg = JSON.parse(e.data);

  if (msg.type === 'joined') {
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
