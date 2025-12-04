// --- CONFIG ---
const popup = document.getElementById('popup-android');
const btnInstall = document.getElementById('btn-install');
const btnFull = document.getElementById('btn-fullscreen');
const btnClose = document.getElementById('btn-close');
const container = document.getElementById('game-container');
const debugLog = document.getElementById('debug-log');
const installStatus = document.getElementById('install-status');

// --- 1. BIẾN LƯU SỰ KIỆN CÀI ĐẶT ---
let deferredPrompt = null;

// --- 2. SERVICE WORKER (BẮT BUỘC) ---
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
        .then(() => log('SW Registered'))
        .catch(err => log('SW Error: ' + err));
}

// --- 3. PHÁT HIỆN MÔI TRƯỜNG ---
const isAndroid = /Android/i.test(navigator.userAgent);
const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

// --- 4. LOGIC HIỂN THỊ POPUP ---
window.addEventListener('load', () => {
    // Chỉ hiện Popup ở Android Browser (chưa cài app)
    if (isAndroid && !isStandalone) {
        popup.style.display = 'flex';
    } else {
        // iOS hoặc đã cài App -> Tự full
        fixLayout();
    }
    
    // Fix cuộn iOS
    setTimeout(() => window.scrollTo(0, 1), 100);
});

// --- 5. SỰ KIỆN CÀI ĐẶT (QUAN TRỌNG) ---
// Lắng nghe ngay lập tức
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installStatus.innerText = "Đã sẵn sàng cài đặt!";
    btnInstall.style.opacity = '1';
    btnInstall.innerText = "📲 Cài đặt App Ngay";
    log('Event beforeinstallprompt fired!');
});

// Xử lý nút Cài đặt
btnInstall.addEventListener('click', () => {
    if (deferredPrompt) {
        // Trường hợp 1: Browser hỗ trợ cài tự động
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choice) => {
            if (choice.outcome === 'accepted') {
                popup.style.display = 'none';
            }
            deferredPrompt = null;
        });
    } else {
        // Trường hợp 2: Sự kiện chưa bắn hoặc không hỗ trợ -> Hướng dẫn thủ công
        alert("Trình duyệt chưa sẵn sàng tự động cài.\n\nHãy ấn vào dấu 3 chấm (Menu) trên trình duyệt -> Chọn 'Cài đặt ứng dụng' hoặc 'Thêm vào màn hình chính'.");
    }
});

// --- 6. NÚT FULLSCREEN & CLOSE ---
btnFull.addEventListener('click', () => {
    enterFullscreen();
    popup.style.display = 'none';
});

btnClose.addEventListener('click', () => {
    popup.style.display = 'none';
    fixLayout(); // Vẫn chạy layout xoay dù không full
});

function enterFullscreen() {
    const doc = document.documentElement;
    const req = doc.requestFullscreen || doc.webkitRequestFullscreen;
    if (req) {
        req.call(doc).then(() => {
            if (screen.orientation && screen.orientation.lock) {
                screen.orientation.lock('landscape').catch(e => log(e));
            }
        }).catch(e => log(e));
    }
}

// --- 7. FIX LAYOUT FULL VIỀN (MAGIC PIXEL) ---
function fixLayout() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    
    // Lấy kích thước VẬT LÝ màn hình (bao gồm cả thanh điều hướng bị ẩn)
    // screen.width/height luôn không đổi dù có thanh điều hướng hay không
    const screenW = window.screen.width;
    const screenH = window.screen.height;

    const screenInfo = document.getElementById('screen-info');
    screenInfo.innerText = `View: ${w}x${h} | Screen: ${screenW}x${screenH}`;

    // Phát hiện cầm dọc
    if (w < h) {
        // MODE: PORTRAIT -> Cần xoay ngang
        // Thay vì dùng 100vh, ta dùng screenH (chiều cao vật lý tối đa)
        
        // Gán chiều rộng App = Chiều cao vật lý màn hình (để đè lên thanh Home/Nav)
        container.style.width = screenH + 'px';
        
        // Gán chiều cao App = Chiều rộng vật lý màn hình
        container.style.height = screenW + 'px';
        
        // Xoay 90 độ và đẩy nó vào vị trí
        container.style.transform = `rotate(90deg) translateY(-100%)`;
        
        // Thêm class fix viền
        container.classList.add('fix-gap');
        
    } else {
        // MODE: LANDSCAPE -> Đã ngang sẵn
        container.style.width = screenW + 'px';
        container.style.height = screenH + 'px';
        container.style.transform = 'none';
        container.classList.remove('fix-gap');
    }
}

// Chạy liên tục để bắt resize (khi thanh địa chỉ ẩn hiện)
window.addEventListener('resize', fixLayout);
setInterval(fixLayout, 500); // Check định kỳ cho chắc ăn

// Debug logger
function log(msg) {
    console.log(msg);
    debugLog.innerText += msg + '\n'; // Bỏ comment nếu muốn xem log trên màn hình
}

// Chặn kéo
document.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
