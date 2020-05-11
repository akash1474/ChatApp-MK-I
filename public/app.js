const socket = io();
const messages = document.querySelector('.messages');
const { username } = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
});
socket.emit('join', username);

socket.on('oldMessages', (data) => {
    data.forEach((chat) => {
        createChatEl(chat);
    });
});

socket.on('liveUsers', (data) => {
    document.querySelector('.noUsers').textContent = data;
});

socket.on('welcome', (data) => {
    let color = `rgba(73, 241, 177, 0.377)`;
    if (data.split(' ').includes('left')) color = `rgba(255, 141, 175, 0.377)`;
    const el = `<div class="message center">
    <div class="message_text bot" style="background:${color};">${data}</div>
</div>`;
    messages.insertAdjacentHTML('beforeend', el);
    messages.scrollTop = messages.scrollHeight;
});

socket.on('message', (data) => {
    createChatEl(data);
});

document.getElementById('form').addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = e.target.elements.text.value;
    if (msg.length === 0) return;
    socket.emit('sentMessage', { msg, username }, () => {});
    e.target.elements.text.value = '';
    e.target.elements.text.focus();
});

const createChatEl = (data) => {
    let me = { iAm: 'me', side: 'right', name: false };
    if (data.username !== username) me = { iAm: 'else', side: 'left', name: true };
    const el = `<div class="message ${me.side}">
    <div class="message ${me.side} user">${me.name ? data.username : ''}</div>
    <div class="message_text ${me.iAm}">${data.msg}</div>
    <p class="message ${me.side} time">Sent &nbsp${data.time}</p>
    </div>`;
    messages.insertAdjacentHTML('beforeend', el);
    messages.scrollTop = messages.scrollHeight;
};
