const stage = document.getElementById('stage');
const debug = document.getElementById('debug-info');

function resizeApp() {
    // Lấy kích thước khung nhìn thực tế (bao gồm cả vùng tai thỏ/home bar)
    const browserWidth = window.innerWidth;
    const browserHeight = window.innerHeight;

    // Logic: Chúng ta luôn muốn App hiển thị ngang (Width > Height).
    // Nhưng nếu người dùng cầm dọc (browserWidth < browserHeight), ta phải xoay.

    if (browserWidth < browserHeight) {
        // --- CHẾ ĐỘ: CẦM DỌC (PORTRAIT) -> XOAY 90 ĐỘ ---
        
        // Chiều rộng App = Chiều cao màn hình
        stage.style.width = browserHeight + 'px';
        
        // Chiều cao App = Chiều rộng màn hình
        stage.style.height = browserWidth + 'px';
        
        // Xoay 90 độ, và đẩy sang phải (translateX) để khớp màn hình
        // transform-origin đã set là top left trong CSS
        stage.style.transform = `rotate(90deg) translateY(-${browserWidth}px)`;
        
        // Fix toạ độ top/left sau khi xoay
        // Khi xoay 90 độ quanh top-left:
        // Trục X cũ hướng xuống dưới, Trục Y cũ hướng sang phải.
        // Ta cần dịch chuyển để nó lấp đầy màn hình.
        stage.style.transformOrigin = 'top left';
        stage.style.transform = `rotate(90deg) translateY(-100%)`;

        debug.innerHTML = `Chế độ: GIẢ LẬP NGANG<br>Gốc: ${browserWidth}x${browserHeight}`;
    } else {
        // --- CHẾ ĐỘ: CẦM NGANG (LANDSCAPE) -> GIỮ NGUYÊN ---
        
        stage.style.width = browserWidth + 'px';
        stage.style.height = browserHeight + 'px';
        stage.style.transform = 'none';
        
        debug.innerHTML = `Chế độ: NGANG CHUẨN<br>Gốc: ${browserWidth}x${browserHeight}`;
    }
}

// --- SỰ KIỆN TỰ ĐỘNG ---

// 1. Chạy ngay lập tức khi load
window.addEventListener('load', () => {
    resizeApp();
    // Đăng ký Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js');
    }
});

// 2. Chạy lại khi xoay hoặc resize
// debounce nhẹ để tránh giật lag
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resizeApp, 50);
});

// 3. CỰC KỲ QUAN TRỌNG: Chặn hành vi kéo của iOS (Rubber banding)
// Nếu không có cái này, khi kéo mạnh sẽ lộ ra khoảng đen của trình duyệt
document.addEventListener('touchmove', (e) => {
    // Chỉ chặn nếu touch vào vùng trống, cho phép scroll ở các div có class 'scrollable' nếu muốn
    if (!e.target.closest('.scrollable')) {
        e.preventDefault();
    }
}, { passive: false });

// 4. Hack nhỏ để ẩn thanh địa chỉ trên một số Android cũ
window.addEventListener('load', () => {
    setTimeout(() => {
        window.scrollTo(0, 1);
    }, 100);
});
