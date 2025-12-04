// CONFIG
const popup = document.getElementById('popup-android');
const btnInstall = document.getElementById('btn-install');
const btnFull = document.getElementById('btn-fullscreen');
const btnClose = document.getElementById('btn-close');
const container = document.getElementById('game-container');
const statusDebug = document.getElementById('status-debug');

let deferredPrompt = null;

// 1. SW Register
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js');
}

// 2. CHECK MOI TRUONG
const isAndroid = /Android/i.test(navigator.userAgent);
const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

window.addEventListener('load', () => {
    // Nếu là Android Browser (chưa cài App) -> Hiện Popup
    if (isAndroid && !isStandalone) {
        popup.style.display = 'flex';
    } else {
        statusDebug.innerText = "Chế độ App / iOS / PC";
    }
    
    checkOrientation();
    setTimeout(() => window.scrollTo(0, 1), 100);
});

// 3. LOGIC INSTALL APP (FIX)
// Lắng nghe sự kiện từ trình duyệt
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // Ngăn popup mặc định của Chrome
    deferredPrompt = e;
    
    // KHI BẮT ĐƯỢC SỰ KIỆN -> MỚI HIỆN NÚT
    btnInstall.style.display = 'block';
    console.log("Install prompt captured!");
});

btnInstall.addEventListener('click', () => {
    if (deferredPrompt) {
        deferredPrompt.prompt(); // Hiện hộp thoại cài đặt hệ thống
        deferredPrompt.userChoice.then((choice) => {
            if (choice.outcome === 'accepted') {
                popup.style.display = 'none'; // Người dùng đồng ý -> tắt popup
            }
            deferredPrompt = null;
        });
    }
});

// 4. LOGIC FULLSCREEN & CLOSE
btnFull.addEventListener('click', () => {
    const doc = document.documentElement;
    // Yêu cầu Fullscreen
    const req = doc.requestFullscreen || doc.webkitRequestFullscreen;
    if (req) {
        req.call(doc).then(() => {
            // Khi đã full -> Thử lock xoay
            if (screen.orientation && screen.orientation.lock) {
                screen.orientation.lock('landscape').catch(() => {});
            }
        }).catch(err => console.log(err));
    }
    popup.style.display = 'none';
});

btnClose.addEventListener('click', () => {
    popup.style.display = 'none';
});

// 5. LOGIC XOAY & FIX LAYOUT
function checkOrientation() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    if (w < h) {
        // Cầm dọc -> Xoay
        container.classList.add('force-landscape');
        statusDebug.innerText = "Chế độ: Xoay Ngang";
    } else {
        // Cầm ngang -> Giữ nguyên
        container.classList.remove('force-landscape');
        statusDebug.innerText = "Chế độ: Gốc";
    }
}

window.addEventListener('resize', checkOrientation);
document.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
