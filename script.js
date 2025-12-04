// --- Service Worker (Giữ nguyên) ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js');
    });
}

// --- XỬ LÝ FULLSCREEN & XOAY ---

const overlay = document.getElementById('start-overlay');
const appContainer = document.getElementById('app-container');

// Hàm kích hoạt Fullscreen
function enterFullscreen() {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(err => console.log(err));
    } else if (elem.webkitRequestFullscreen) { /* Safari */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE11 */
        elem.msRequestFullscreen();
    }
}

// Khi người dùng chạm vào Overlay -> Vào app & Fullscreen
overlay.addEventListener('click', () => {
    enterFullscreen();
    
    // Ẩn Overlay
    overlay.style.opacity = '0';
    setTimeout(() => {
        overlay.style.display = 'none';
    }, 500);

    // Kích hoạt khóa xoay màn hình (chỉ Android hỗ trợ API này)
    if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('landscape').catch(e => {
            console.log('Thiết bị không hỗ trợ khóa xoay phần cứng, dùng CSS thay thế.');
        });
    }
});

// --- XỬ LÝ CÀI ĐẶT PWA ---
let deferredPrompt;
const installBtn = document.getElementById('installBtn');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = 'block';
});

installBtn.addEventListener('click', () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                installBtn.style.display = 'none';
            }
            deferredPrompt = null;
        });
    }
});
