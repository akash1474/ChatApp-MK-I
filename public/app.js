const socket = io();
const messages = document.querySelector('.messages');
const fileSelector = document.getElementById('selector');
const { username } = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
});
socket.emit('join', username);

socket.on('oldMessages', (data) => {
    data.forEach((chat) => {
        createChatEl(chat);
    });
});

socket.on('uploadedFile', (data) => {
    let id = Date.now();
    const el = `<div id="p95" class="message file download" style="--width: 0;">
    <p class="download username">${data.username}</p>
    <svg
        class="file_icon"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 24 24"
        fill="#696969"
    >
        <path
            d="M6 2C4.9057453 2 4 2.9057453 4 4L4 20C4 21.094255 4.9057453 22 6 22L18 22C19.094255 22 20 21.094255 20 20L20 8L14 2L6 2 z M 6 4L13 4L13 9L18 9L18 20L6 20L6 4 z M 8 12L8 14L16 14L16 12L8 12 z M 8 16L8 18L16 18L16 16L8 16 z"
            fill="#fff"
        />
        </svg>
        <div class="file_info" style="color: #666;">
            <p class="file_name">${data.name}.${data.type}</p>
            <p style="color: #666;" class="file_size">${data.fileInfo}</p>
        </div>
        <img src="./svg/download.svg" alt="" id="downloadBtn" class="file_download" />
    </div>`;
    messages.insertAdjacentHTML('beforeend', el);
    const downloadBtn = document.querySelector('.file.download');
    downloadBtn.addEventListener('click', async () => {
        try {
            console.log('Download Started!!!');
            const data = await axios.get(`/uploads/abstract-3.jpeg`, {
                onDownloadProgress: (e) => {
                    const percent = Math.round((e.loaded / e.total) * 100);
                    downloadBtn.style.setProperty('--width', percent);
                },
            });
            downloadBtn.style.setProperty('--width', 0);
            console.log(data);
        } catch (err) {
            console.log(err);
        }
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

fileSelector.addEventListener('change', async (e) => {
    if (e.target.files.length === 0) return;
    const file = e.target.files[0];
    const id = Date.now();
    const fileInfo = createFileMessage(file, id);
    const progressBar = document.querySelector(`.file.a${id}`);
    const downloadIcon = document.querySelector(`.file_download.a${id + 1}`);
    const formData = new FormData();
    formData.append('file', file);
    try {
        const res = await axios.post('/uploads', formData, {
            onUploadProgress: (e) => {
                const percent = Math.round((e.loaded / e.total) * 100);
                progressBar.style.setProperty('--width', percent);
            },
        });
        progressBar.style.setProperty('--width', 0);
        downloadIcon.src = './svg/done.svg';
        //Sending the file back to the server
        socket.emit('file', {
            name: file.name.slice(0, 10),
            type: file.type.split('/')[1],
            username,
            fileInfo,
        });
        console.log(res);
    } catch (err) {
        console.log(err);
    }
});

const createFileMessage = (file, id) => {
    const filename = file.name.slice(0, 10);
    let unit = 'Kb';
    let fileSize = file.size / 1024;
    if (fileSize > 1024) {
        unit = 'Mb';
        fileSize = fileSize / 1024;
    }
    fileSize = fileSize.toString().slice(0, fileSize.toString().indexOf('.') + 3);
    const el = `<div class="message file a${id}" style="--width: 0;">
    <svg class="file_icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24" fill="#696969">
  <path d="M6 2C4.9057453 2 4 2.9057453 4 4L4 20C4 21.094255 4.9057453 22 6 22L18 22C19.094255 22 20 21.094255 20 20L20 8L14 2L6 2 z M 6 4L13 4L13 9L18 9L18 20L6 20L6 4 z M 8 12L8 14L16 14L16 12L8 12 z M 8 16L8 18L16 18L16 16L8 16 z" fill="#fff" />
</svg>
    <div class="file_info">
        <p class="file_name">${filename + file.type.split('/')[1]}</p>
        <p class="file_size">${fileSize} ${unit}</p>
    </div>
    <img src="./svg/spinner.svg" alt="" class="file_download a${id + 1}" />
</div>`;
    messages.insertAdjacentHTML('beforeend', el);
    return `${fileSize} ${unit}`;
};
