# 🌲 Terraria Web (Online & Offline Sandbox)

Một phiên bản Terraria 2D Sandbox hoàn chỉnh chạy trên Web, hỗ trợ chơi Online qua WebRTC Peer-to-Peer, hỗ trợ đầy đủ cho **PC** và **Điện thoại** (Mobile Touch Controls), hoạt động **100% Offline (PWA)** và sẵn sàng deploy lên **Vercel** chỉ với 1 cú click!

---

## ✨ Tính Năng Nổi Bật

1. **Thế Giới Procedural (Sinh ngẫu nhiên & Khám phá)**:
   - Bản đồ địa hình đồi cỏ, cây cối, hang động ngầm sâu uốn lượn.
   - Các tầng địa chất: Bầu trời, Mặt đất, Lòng đất (Dirt / Stone), Tầng hầm sâu (Caverns) và Địa ngục (Underworld).
   - Quặng phong phú: Than (Coal), Đồng (Copper), Sắt (Iron), Vàng (Gold), Hồng ngọc (Ruby), Lam ngọc (Sapphire).
   - Ngôi nhà gỗ khởi đầu trên bề mặt với Bàn chế tạo (Work Bench), Cửa và Rương chứa đồ (Chest).

2. **Cơ Chế Khai Thác & Xây Dựng (Terraria authentic)**:
   - Cuốc (Pickaxe) đào đất, đá, quặng với 4 giai đoạn nứt vỡ (Crack stages).
   - Rìu (Axe) chặt cây đổ từ trên xuống.
   - Đặt khối gạch (Dirt, Stone, Wood, Brick, Glass...) và Tường nền (Walls) ở lớp phía sau.
   - Đuốc (Torch), Lò luyện (Furnace), Đe rèn (Anvil), Cửa gỗ đóng/mở.

3. **Hệ Thống Ánh Sáng Động 2D (Dynamic 2D Lighting)**:
   - Chu kỳ Ngày & Đêm (Day / Night cycle) mượt mà: Bình minh, Trưa nắng, Hoàng hôn và Đêm tối đầy sao.
   - Ánh sáng khuếch tán lan tỏa qua không khí, bị cản bởi đất đá. Đuốc và lò lửa tỏa ánh sáng vàng ấm áp trong hang tối.

4. **Chiến Đấu & Quái Vật (Enemies & Bosses)**:
   - **Ban ngày**: Slime xanh lá và Slime xanh dương nhảy tưng tưng tiếp cận người chơi.
   - **Ban đêm**: Zombie lang thang tấn công và Mắt quỷ (Demon Eye) bay lượn từ trên trời sà xuống.
   - **Mini-Boss Eye of Cthulhu**: Triệu hồi bằng vật phẩm *Suspicious Looking Eye*, gầm thét, lao tới ở tốc độ cao và chuyển dạng mở mồm răng sắc nhọn khi dưới 50% HP!
   - Số sát thương nảy lên (Floating combat text), hiệu ứng văng máu/hạt khi trúng đòn.

5. **Âm Thanh Tự Tổng Hợp (Web Audio API Synthesizer)**:
   - 100% Offline, không phụ thuộc file âm thanh ngoài.
   - Âm thanh đào đất, tiếng choang cuốc đập đá, chặt gỗ, chém kiếm, bắn cung, cast phép, tiếng rơi đau và nhạc nền Chiptune 8-bit hoài niệm.

6. **Chơi Online Nhiều Người (P2P WebRTC Multiplayer)**:
   - Không cần thuê server! Sử dụng công nghệ WebRTC Peer-to-Peer.
   - Người Host tạo phòng nhận mã phòng (ví dụ `TR-892A`) hoặc link chia sẻ.
   - Bạn bè nhập mã trên PC hoặc Điện thoại để vào chung thế giới, cùng đào, xây dựng và đánh boss!
   - Khung chat trực tiếp trong game.

7. **Chơi Offline 100% & Lưu Trữ (Progressive Web App - PWA)**:
   - Service Worker lưu bộ nhớ đệm (Cache) toàn bộ game.
   - Hỗ trợ lưu thế giới vào trình duyệt (`localStorage`), hỗ trợ 3 Slot lưu, tự động lưu (Auto-save) mỗi 45s.
   - Tính năng **Export file thế giới (.json)** để sao lưu hoặc gửi cho bạn bè và **Import file** để tải lại.

8. **Điều Khiển Thân Thiện Cho Cả PC & Điện Thoại**:
   - **PC**:
     - `A` / `D` hoặc `←` / `→`: Di chuyển
     - `W` / `Space` / `↑`: Nhảy (Hỗ trợ nhảy 2 lần nếu nhặt được *Cloud in a Bottle*)
     - `S` / `↓`: Rơi xuyên qua cầu thang gỗ (Wooden Platform)
     - `Chuột Trái`: Đào / Tấn công / Dùng đồ
     - `Chuột Phải`: Đặt khối / Mở rương / Đóng mở cửa
     - Phím `1` - `0` hoặc Cuộn chuột: Chọn ô đồ trên Hotbar
     - `E` hoặc `I`: Mở Túi đồ (Inventory) & Chế tạo (Crafting)
     - `M`: Mở phòng Online
     - `Esc`: Menu Cài đặt / Lưu game
   - **Điện Thoại / Máy Tính Bảng**:
     - Cần điều khiển ảo (Virtual Joystick) góc trái màn hình.
     - Nút nhảy to tròn (JUMP) và nút đánh/dùng đồ (USE) ở góc phải.
     - Chạm trực tiếp vào màn hình để đào hoặc đặt khối (giữ ngón tay để đào liên tục).
     - Hỗ trợ phóng to / thu nhỏ (Zoom) và nút Bật toàn màn hình (Fullscreen).

---

## 🚀 Hướng Dẫn Deploy Lên Vercel

### Cách 1: Deploy qua GitHub & Vercel Dashboard (Khuyên dùng)

1. Tạo một repository mới trên GitHub (ví dụ: `terraria-web`).
2. Mở terminal tại thư mục này và chạy các lệnh:
   ```bash
   git init
   git add .
   git commit -m "feat: initial Terraria Web release"
   git branch -M main
   git remote add origin https://github.com/TÊN_GITHUB_CỦA_BẠN/terraria-web.git
   git push -u origin main
   ```
3. Truy cập [vercel.com](https://vercel.com) và đăng nhập bằng GitHub.
4. Bấm **"Add New..."** -> **"Project"** -> Chọn repository `terraria-web`.
5. Vercel sẽ tự động nhận diện **Vite**:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Bấm **Deploy**. Sau ~30 giây, bạn sẽ có đường link web miễn phí dạng `https://terraria-web.vercel.app`!

### Cách 2: Deploy trực tiếp bằng Vercel CLI

Nếu bạn đã cài `vercel`:
```bash
npm i -g vercel
vercel
```
Làm theo hướng dẫn trên màn hình và trang web sẽ online ngay lập tức!

---

## 📲 Hướng Dẫn Cài Đặt Chơi Offline Trên Điện Thoại

Vì game là **Progressive Web App (PWA)**, bạn có thể cài đặt như một ứng dụng native:

- **Trên iPhone / iPad (Safari)**:
  1. Mở trang web game trên Safari.
  2. Bấm nút **Chia sẻ** (biểu tượng ô vuông có mũi tên chỉ lên).
  3. Chọn **"Thêm vào Màn hình chính" (Add to Home Screen)**.
  4. Mở icon game từ màn hình chính để chơi toàn màn hình ngay cả khi tắt mạng Wifi/4G!

- **Trên Android (Chrome)**:
  1. Mở trang web game trên Google Chrome.
  2. Bấm vào menu 3 chấm ở góc phải trên.
  3. Chọn **"Cài đặt ứng dụng"** hoặc **"Thêm vào Màn hình chính"**.

---

## 🛠️ Chạy Thử Trên Máy Tính (Local Development)

```bash
# Cài đặt thư viện
npm install

# Chạy server phát triển
npm run dev

# Mở trình duyệt tại http://localhost:3000
```
