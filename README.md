# 가위바위보 온라인

방 코드로 친구와 실시간 대전하는 웹 기반 가위바위보입니다. WebSocket으로 통신하며, 승패 판정은 서버에서 처리합니다.

## 실행 방법

```bash
npm install
npm run dev
```

`http://localhost:3000` 접속 후 닉네임과 방 코드를 입력하면, 같은 방 코드로 들어온 상대와 대전합니다.

## 기술 스택

- Node.js + [Express](https://expressjs.com/) — 정적 파일 제공
- [ws](https://github.com/websockets/ws) — WebSocket 서버
- 프론트엔드는 프레임워크 없이 순수 HTML/CSS/JavaScript

## 구조

```
server.js          방/대전 상태 관리, 승패 판정
public/
  index.html        화면 구조
  app.js            서버와 통신, 화면 갱신
```
