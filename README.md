# BỘ TOOL AUTO CÀY CẢNH GIỚI LƯU PHÁI - GAME CỔ TIÊN LỘ (cotienlo.com)

Dành riêng cho khu vực: **Sân tập học đường** (Đấu với bạn tập / người rơm).
Bao gồm **2 phiên bản**:
1. 🖥️ **Bản PC (Windows Tool GUI):** Ứng dụng desktop nhận diện hình ảnh OpenCV đa tỉ lệ.
2. 📱 **Bản Điện Thoại (Mobile Web / Bookmarklet):** Chạy trực tiếp trên trình duyệt điện thoại (iOS / Android), có widget cảm ứng nổi kéo thả thu nhỏ.

---

## 🎯 QUY TRÌNH HOẠT ĐỘNG CHUẨN
1. **Bắt đầu trận:** Quét màn hình thấy nút **`[ F ]`** (Đấu thêm một trận / Đấu với bạn tập) ➔ Tự động bấm phím **`F`**.
2. **Chờ đếm ngược:** Đợi thông báo *"Ra khỏi vòng là thua: 3 ➔ 2 ➔ 1 ➔ 0"* kết thúc (khoảng 3.5 giây) để bắt đầu gây sát thương.
3. **Chiến đấu (Spam skill):** Tự động spam liên tục các kỹ năng đã chọn (mặc định: phím **1, 2, 3**, có thể chọn thêm **4, Q, E**) theo nhịp cooldown.
4. **Nhận diện chiến thắng:** Nhận diện thông báo *"Bạn học lùi ra khỏi vòng, nhận thua..."* ➔ Ngay lập tức ngắt spam chiêu và đếm số trận thắng.
5. **Hồi phục (Điều tức):** Đợi khoảng 2.5 giây để nhân vật thoát trạng thái giao tranh (combat) ➔ Tự động bấm phím **`X`** để ngồi xuống điều tức (hồi máu & chân nguyên).
6. **Lặp lại chu kỳ:** Khi nhân vật ngồi điều tức xong, nút **`[ F ]`** hiện lại ➔ Tool tự động bấm **`F`** để bắt đầu trận mới ngay lập tức. Quá trình lặp lại vô tận cho đến khi bấm dừng.

---

## 📱 PHIÊN BẢN 1: DÀNH CHO ĐIỆN THOẠI (iOS & Android)

Vì Cổ Tiên Lộ là web game, bạn có thể chạy tool trực tiếp trên trình duyệt điện thoại (Safari trên iPhone, Chrome trên Android, Kiwi Browser, v.v.) mà **không cần cài app ngoài, không cần root hay jailbreak!**

### Cách A: Dùng Bookmarklet (Dấu trang thông minh) - Khuyên dùng ⭐⭐⭐
1. Mở file [cotienlo_mobile_bookmarklet.txt](file:///c:/Users/trilt/Documents/Study/CotienloTool/cotienlo_mobile_bookmarklet.txt).
2. Copy đoạn mã bắt đầu bằng `javascript:(function(){...})();`.
3. Trên trình duyệt điện thoại (Safari hoặc Chrome):
   - Tạo một **Dấu trang** (Bookmark) bất kỳ và đặt tên là: `Auto Cổ Tiên Lộ`.
   - Vào chỉnh sửa Dấu trang đó, xóa đường dẫn cũ và **dán đoạn mã vừa copy** vào ô URL.
4. Khi vào game `https://cotienlo.com/choi`:
   - Chỉ cần bấm vào Dấu trang (hoặc gõ chữ `Auto Cổ Tiên Lộ` lên thanh địa chỉ rồi chọn dấu trang đó).
   - Một bảng điều khiển cảm ứng cực đẹp sẽ hiện lên ngay góc màn hình game!
   - Có thể chạm giữ để kéo di chuyển, bấm nút `➖` để thu nhỏ thành bong bóng nổi tròn `⚔️ AUTO` để không che màn hình.

### Cách B: Dùng Tampermonkey trên điện thoại Android
- Nếu dùng điện thoại Android, bạn có thể tải trình duyệt **Kiwi Browser** hoặc **Lemur Browser** (hỗ trợ tiện ích Chrome Extension).
- Cài tiện ích **Tampermonkey** và nạp script từ file [cotienlo_auto.user.js](file:///c:/Users/trilt/Documents/Study/CotienloTool/cotienlo_auto.user.js).
- Script sẽ tự động hiện mỗi khi bạn truy cập web game!

---

## 🖥️ PHIÊN BẢN 2: DÀNH CHO MÁY TÍNH (Windows Desktop)

Tool chạy độc lập trên Windows, sử dụng thuật toán nhận diện hình ảnh OpenCV (Multi-scale matching) không bị ảnh hưởng bởi zoom trình duyệt hay DPI màn hình.

1. **Khởi động:**
   - Nhấp đúp chuột vào file: [Run_CotienloAuto.bat](file:///c:/Users/trilt/Documents/Study/CotienloTool/Run_CotienloAuto.bat)
   - Hoặc mở terminal chạy: `python CotienloAuto.py`

2. **Giao diện & Cài đặt:**
   - **Kỹ năng spam:** Tích chọn các phím kỹ năng bạn muốn spam (Phím 1, 2, 3, 4, Q, E).
   - **Tốc độ spam:** Mặc định 150 ms / chiêu (có thể tăng giảm tùy ý).
   - **Đếm ngược đầu trận:** Mặc định 3.5s.
   - **Chờ hết giao tranh:** Mặc định 2.5s trước khi bấm X.
   - **Nút "Kiểm tra nhận diện":** Bấm thử để xem tool có nhìn thấy nút F hoặc thông báo trên màn hình không.

3. **Phím tắt nhanh toàn cục:**
   - **`F9`**: Bắt đầu / Tạm dừng (Pause / Resume)
   - **`F10`**: Dừng hẳn (Stop)
