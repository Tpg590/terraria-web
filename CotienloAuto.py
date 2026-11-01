"""
====================================================================
 TOOL AUTO CÀY CẢNH GIỚI LƯU PHÁI - GAME CỔ TIÊN LỘ (cotienlo.com)
 SÂN TẬP HỌC ĐƯỜNG - BẢN FIX CHUẨN XÁC 100%
====================================================================
"""

import os
import sys
import time
import threading
import ctypes
from ctypes import wintypes
import tkinter as tk
from tkinter import ttk, messagebox
import cv2
import numpy as np
from PIL import ImageGrab

# Bảng mã phím ảo Windows
VK_MAP = {
    '1': 0x31, '2': 0x32, '3': 0x33, '4': 0x34, '5': 0x35,
    'f': 0x46, 'x': 0x58, 'q': 0x51, 'e': 0x45, 'r': 0x52,
    'space': 0x20
}

VK_F9 = 0x78
VK_F10 = 0x79
WM_HOTKEY = 0x0312
WM_QUIT = 0x0012

SCALES_CENTER = (0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.25)

def send_key_press(key_char, hold_time=0.04):
    """Gửi phím qua Windows API chuẩn."""
    key_char = str(key_char).lower().strip()
    vk = VK_MAP.get(key_char, None)
    if vk is None:
        try:
            vk = ord(key_char.upper())
        except Exception:
            return
            
    user32 = ctypes.windll.user32
    scan_code = user32.MapVirtualKeyW(vk, 0)
    user32.keybd_event(vk, scan_code, 0, 0)
    time.sleep(hold_time)
    user32.keybd_event(vk, scan_code, 0x0002, 0)


class WindowsGlobalHotkeys(threading.Thread):
    def __init__(self, on_f9, on_f10):
        super().__init__(daemon=True)
        self.on_f9 = on_f9
        self.on_f10 = on_f10
        self.running = True
        self.thread_id = None

    def run(self):
        user32 = ctypes.windll.user32
        kernel32 = ctypes.windll.kernel32
        self.thread_id = kernel32.GetCurrentThreadId()

        user32.RegisterHotKey(None, 1, 0, VK_F9)
        user32.RegisterHotKey(None, 2, 0, VK_F10)

        msg = wintypes.MSG()
        while self.running:
            res = user32.GetMessageW(ctypes.byref(msg), None, 0, 0)
            if res <= 0:
                break
            if msg.message == WM_HOTKEY:
                if msg.wParam == 1 and self.on_f9:
                    self.on_f9()
                elif msg.wParam == 2 and self.on_f10:
                    self.on_f10()
            user32.TranslateMessage(ctypes.byref(msg))
            user32.DispatchMessageW(ctypes.byref(msg))

        user32.UnregisterHotKey(None, 1)
        user32.UnregisterHotKey(None, 2)

    def stop(self):
        self.running = False
        if self.thread_id:
            ctypes.windll.user32.PostThreadMessageW(self.thread_id, WM_QUIT, 0, 0)


class CotienloBot:
    def __init__(self, log_callback=None, status_callback=None, count_callback=None):
        self.log_callback = log_callback
        self.status_callback = status_callback
        self.count_callback = count_callback
        
        self.is_running = False
        self.is_paused = False
        self.thread = None
        self.matches_count = 0
        
        # Cấu hình mặc định
        self.skills = ['1', '2', '3']
        self.spam_delay_ms = 150
        self.countdown_sec = 3.5
        self.post_victory_wait_sec = 2.5
        
        self.base_dir = os.path.dirname(os.path.abspath(__file__))
        self.assets_dir = os.path.join(self.base_dir, 'assets')
        
        # Load các mẫu chuẩn gốc (không dùng mẫu vụn để tránh nhận diện nhầm)
        self.tpl_f_key = self._load_template('f_key.png')
        self.tpl_f_prompt = self._load_template('f_prompt.png')
        self.tpl_victory_text = self._load_template('victory_text.png')

    def _load_template(self, filename):
        path = os.path.join(self.assets_dir, filename)
        if os.path.exists(path):
            return cv2.imread(path)
        return None

    def log(self, msg):
        timestamp = time.strftime("%H:%M:%S")
        formatted = f"[{timestamp}] {msg}"
        print(formatted)
        if self.log_callback:
            self.log_callback(formatted)

    def set_status(self, text, color="#222222"):
        if self.status_callback:
            self.status_callback(text, color)

    def update_count(self):
        self.matches_count += 1
        if self.count_callback:
            self.count_callback(self.matches_count)

    def capture_screen(self):
        try:
            screenshot = ImageGrab.grab()
            img_np = np.array(screenshot)
            if img_np.shape[2] == 4:
                return cv2.cvtColor(img_np, cv2.COLOR_RGBA2BGR)
            return cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)
        except Exception as e:
            self.log(f"Lỗi chụp màn hình: {e}")
            return None

    def find_template(self, image, template, scales=SCALES_CENTER, threshold=0.75):
        """Khớp mẫu đa tỉ lệ với ngưỡng an toàn cao."""
        if template is None or image is None:
            return False, 0.0, None
            
        scr_gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        tpl_gray = cv2.cvtColor(template, cv2.COLOR_BGR2GRAY)
        
        best_val = -1.0
        best_loc = None
        
        sh, sw = scr_gray.shape[:2]
        th, tw = tpl_gray.shape[:2]
        
        for scale in scales:
            target_w = int(tw * scale)
            target_h = int(th * scale)
            if target_w >= sw or target_h >= sh or target_w < 5 or target_h < 5:
                continue
            interp = cv2.INTER_AREA if scale < 1.0 else cv2.INTER_LINEAR
            scaled_tpl = cv2.resize(tpl_gray, (target_w, target_h), interpolation=interp)
            res = cv2.matchTemplate(scr_gray, scaled_tpl, cv2.TM_CCOEFF_NORMED)
            _, max_val, _, max_loc = cv2.minMaxLoc(res)
            if max_val > best_val:
                best_val = max_val
                best_loc = max_loc
                
        return (best_val >= threshold), best_val, best_loc

    def check_f_in_center(self, screen):
        """
        Kiểm tra nút [ F ] ở KHU VỰC TRUNG TÂM (quanh nhân vật trong lôi đài).
        Tránh hoàn toàn việc quét nhầm chữ F trong bảng nhiệm vụ bên trái.
        """
        if screen is None or self.tpl_f_key is None:
            return False, 0.0, None
            
        h, w = screen.shape[:2]
        # Cắt lấy vùng trung tâm 40% (x: 30%..70%, y: 30%..70%)
        center_roi = screen[int(h * 0.30):int(h * 0.70), int(w * 0.30):int(w * 0.70)]
        found, val, loc = self.find_template(center_roi, self.tpl_f_key, threshold=0.80)
        return found, val, loc

    def check_victory_top(self, screen):
        """
        Kiểm tra thông báo chiến thắng ở VÙNG TRÊN CÙNG GIỮA MÀN HÌNH (y < 25%, x: 20%..80%).
        Tránh hoàn toàn quét nhầm vào bảng nhiệm vụ bên trái hay chat bên dưới.
        """
        if screen is None or self.tpl_victory_text is None:
            return False, 0.0, None
            
        h, w = screen.shape[:2]
        top_roi = screen[:int(h * 0.25), int(w * 0.20):int(w * 0.80)]
        found, val, loc = self.find_template(top_roi, self.tpl_victory_text, threshold=0.70)
        return found, val, loc

    def start(self):
        if self.is_running:
            return
        self.is_running = True
        self.is_paused = False
        self.thread = threading.Thread(target=self._run_loop, daemon=True)
        self.thread.start()
        self.log(">>> BẮT ĐẦU AUTO CÀY LƯU PHÁI <<<")

    def stop(self):
        self.is_running = False
        self.is_paused = False
        self.set_status("Đã dừng", "red")
        self.log(">>> ĐÃ DỪNG AUTO <<<")

    def toggle_pause(self):
        if not self.is_running:
            self.start()
            return
        self.is_paused = not self.is_paused
        if self.is_paused:
            self.set_status("Đang tạm dừng (F9 để tiếp tục)", "orange")
            self.log("--- TẠM DỪNG ---")
        else:
            self.set_status("Đang chạy...", "green")
            self.log("--- TIẾP TỤC ---")

    def _run_loop(self):
        self.log(f"Thiết lập kỹ năng spam: {', '.join(self.skills)}")
        self.log(f"Tốc độ spam: {self.spam_delay_ms} ms / lần bấm")
        self.log(f"Chờ đếm ngược: {self.countdown_sec}s | Chờ hết giao tranh: {self.post_victory_wait_sec}s")

        while self.is_running:
            if self.is_paused:
                time.sleep(0.3)
                continue

            # ==========================================================
            # BƯỚC 1: TÌM VÀ BẤM NÚT [ F ] ĐỂ BẮT ĐẦU TRẬN ĐẤU
            # ==========================================================
            self.set_status("Đang tìm nút [ F ] bắt đầu...", "#0066cc")
            
            while self.is_running and not self.is_paused:
                screen = self.capture_screen()
                if screen is not None:
                    # Kiểm tra nút F ở khu vực nhân vật
                    has_f, val_f, _ = self.check_f_in_center(screen)
                    if has_f:
                        self.log(f"Phát hiện nút [ F ] trên đầu nhân vật (khớp: {val_f:.2f}) -> Bấm F bắt đầu!")
                        send_key_press('f')
                        time.sleep(0.6)
                        break
                        
                time.sleep(0.4)

            if not self.is_running:
                break

            # ==========================================================
            # BƯỚC 2: CHỜ ĐẾM NGƯỢC (3.5s)
            # ==========================================================
            self.set_status(f"Đang chờ đếm ngược ({self.countdown_sec}s)...", "#cc6600")
            self.log(f"Đang đếm ngược {self.countdown_sec} giây trước khi gây sát thương...")
            
            t_start_cd = time.time()
            while time.time() - t_start_cd < self.countdown_sec:
                if not self.is_running or self.is_paused:
                    break
                time.sleep(0.2)

            if not self.is_running:
                break

            # ==========================================================
            # BƯỚC 3: CHIẾN ĐẤU - SPAM KỸ NĂNG VÀ THEO DÕI CHIẾN THẮNG
            # ==========================================================
            self.set_status(f"Đang giao chiến! Spam: {','.join(self.skills)}", "green")
            self.log(f"Bắt đầu spam chiêu: {', '.join(self.skills)}")
            
            fight_start_time = time.time()
            victory_detected = False
            f_already_ready = False
            skill_idx = 0
            
            while self.is_running and not self.is_paused:
                if self.skills:
                    curr_skill = self.skills[skill_idx % len(self.skills)]
                    send_key_press(curr_skill)
                    skill_idx += 1
                
                time.sleep(self.spam_delay_ms / 1000.0)

                # Mỗi 2 chiêu quét kiểm tra kết quả
                if skill_idx % 2 == 0:
                    screen = self.capture_screen()
                    if screen is not None:
                        # Cách 1: Quét thông báo chiến thắng ở phía trên cùng
                        is_vic, v_val, _ = self.check_victory_top(screen)
                        if is_vic:
                            victory_detected = True
                            duration = time.time() - fight_start_time
                            self.log(f"★ CHIẾN THẮNG! (Thông báo thắng khớp {v_val:.2f}, đánh trong: {duration:.1f}s)")
                            self.update_count()
                            break

                        # Cách 2 (Cực chuẩn cho máy bạn): Sau khi đánh ít nhất 3 giây,
                        # nếu bạn tập ĐÃ RA KHỎI VÒNG thì nút [ F ] sẽ hiện ngay trên đầu nhân vật!
                        if time.time() - fight_start_time >= 3.0:
                            has_f_now, val_f_now, _ = self.check_f_in_center(screen)
                            if has_f_now:
                                victory_detected = True
                                f_already_ready = True
                                duration = time.time() - fight_start_time
                                self.log(f"★ CHIẾN THẮNG! (Bạn tập đã ra vòng, nút [ F ] hiện lại khớp {val_f_now:.2f}, đánh: {duration:.1f}s)")
                                self.update_count()
                                break

                # Timeout 90 giây
                if time.time() - fight_start_time > 90:
                    self.log("Trận đấu kéo dài hơn 90s, tự động chuyển bước phục hồi.")
                    break

            if not self.is_running:
                break

            # ==========================================================
            # BƯỚC 4: XỬ LÝ SAU TRẬN ĐẤU & CHUẨN BỊ TRẬN TIẾP THEO
            # ==========================================================
            # Nếu nút F đã hiện sẵn trên nhân vật (bạn tập ra khỏi vòng), chuẩn bị trận mới luôn!
            if f_already_ready:
                self.log("Nút [ F ] đã xuất hiện sẵn, chuẩn bị bắt đầu trận mới ngay...")
                time.sleep(0.5)
                continue

            # Nếu chưa có nút F, đợi thoát giao tranh rồi bấm X điều tức
            self.set_status(f"Thắng! Đợi hết giao tranh ({self.post_victory_wait_sec}s)...", "#6600cc")
            self.log(f"Đợi {self.post_victory_wait_sec}s để thoát trạng thái giao tranh hoàn toàn...")
            time.sleep(self.post_victory_wait_sec)

            self.set_status("Bấm [ X ] điều tức...", "#008888")
            self.log("Bấm phím [ X ] để ngồi xuống điều tức.")
            send_key_press('x')
            time.sleep(1.0)

            # Đợi nút F xuất hiện lại sau khi ngồi điều tức
            max_x_retry = 4
            for retry in range(max_x_retry):
                if not self.is_running or self.is_paused:
                    break
                screen = self.capture_screen()
                has_f, val_f, _ = self.check_f_in_center(screen)
                if has_f:
                    self.log(f"Đã phát hiện nút [ F ] sau khi điều tức (khớp: {val_f:.2f})!")
                    break
                else:
                    self.log(f"Chưa thấy [ F ], thử bấm lại [ X ] lần {retry + 1}...")
                    send_key_press('x')
                    time.sleep(1.2)

            self.log("Hoàn tất 1 chu kỳ, chuẩn bị đấu trận tiếp theo!\n" + "-"*40)
            time.sleep(0.5)

        self.set_status("Đã dừng", "red")


# ======================================================================
# GIAO DIỆN NGƯỜI DÙNG (TKINTER GUI)
# ======================================================================
class CotienloApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Cổ Tiên Lộ - Auto Cày Lưu Phái (Sân Tập Học Đường)")
        self.root.geometry("520x620")
        self.root.resizable(False, False)
        
        self.always_on_top_var = tk.BooleanVar(value=True)
        self.root.attributes("-topmost", True)

        self.bot = CotienloBot(
            log_callback=self.append_log,
            status_callback=self.update_status_ui,
            count_callback=self.update_count_ui
        )

        self._build_ui()

        self.hotkeys = WindowsGlobalHotkeys(
            on_f9=self._hotkey_f9,
            on_f10=self._hotkey_f10
        )
        self.hotkeys.start()
        self.root.protocol("WM_DELETE_WINDOW", self._on_close)

    def _build_ui(self):
        header_frame = tk.Frame(self.root, bg="#2a1f18", height=60)
        header_frame.pack(fill="x")
        
        title_lbl = tk.Label(
            header_frame, 
            text="⚔️ CỔ TIÊN LỘ - AUTO CÀY LƯU PHÁI ⚔️", 
            font=("Arial", 13, "bold"), 
            bg="#2a1f18", 
            fg="#e8c37d"
        )
        title_lbl.pack(pady=4)
        
        sub_lbl = tk.Label(
            header_frame, 
            text="Sân tập học đường • Tự động F -> Spam Skill -> Thắng -> X -> Lặp lại", 
            font=("Arial", 9), 
            bg="#2a1f18", 
            fg="#cccccc"
        )
        sub_lbl.pack(pady=(0, 6))

        status_box = tk.LabelFrame(self.root, text="Trạng thái hoạt động", font=("Arial", 9, "bold"), padx=10, pady=6)
        status_box.pack(fill="x", padx=12, pady=6)

        self.status_lbl = tk.Label(status_box, text="Chưa bắt đầu", font=("Arial", 11, "bold"), fg="#666666")
        self.status_lbl.pack(anchor="w")

        info_frame = tk.Frame(status_box)
        info_frame.pack(fill="x", pady=4)
        
        self.count_lbl = tk.Label(info_frame, text="Số trận thắng: 0", font=("Arial", 10, "bold"), fg="#008800")
        self.count_lbl.pack(side="left")

        always_top_chk = tk.Checkbutton(
            info_frame, 
            text="Ghim cửa sổ trên cùng", 
            variable=self.always_on_top_var,
            command=self._toggle_always_on_top
        )
        always_top_chk.pack(side="right")

        cfg_box = tk.LabelFrame(self.root, text="Cài đặt kỹ năng & thời gian", font=("Arial", 9, "bold"), padx=10, pady=8)
        cfg_box.pack(fill="x", padx=12, pady=4)

        skill_frame = tk.Frame(cfg_box)
        skill_frame.pack(fill="x", pady=2)
        
        tk.Label(skill_frame, text="Kỹ năng spam:", font=("Arial", 9, "bold")).pack(side="left", padx=(0, 10))
        
        self.s1_var = tk.BooleanVar(value=True)
        self.s2_var = tk.BooleanVar(value=True)
        self.s3_var = tk.BooleanVar(value=True)
        self.s4_var = tk.BooleanVar(value=False)
        self.sq_var = tk.BooleanVar(value=False)
        self.se_var = tk.BooleanVar(value=False)

        tk.Checkbutton(skill_frame, text="Phím 1", variable=self.s1_var).pack(side="left", padx=4)
        tk.Checkbutton(skill_frame, text="Phím 2", variable=self.s2_var).pack(side="left", padx=4)
        tk.Checkbutton(skill_frame, text="Phím 3", variable=self.s3_var).pack(side="left", padx=4)
        tk.Checkbutton(skill_frame, text="Phím 4", variable=self.s4_var).pack(side="left", padx=4)
        tk.Checkbutton(skill_frame, text="Phím Q", variable=self.sq_var).pack(side="left", padx=4)
        tk.Checkbutton(skill_frame, text="Phím E", variable=self.se_var).pack(side="left", padx=4)

        delay_frame = tk.Frame(cfg_box)
        delay_frame.pack(fill="x", pady=4)

        tk.Label(delay_frame, text="Tốc độ spam:").grid(row=0, column=0, sticky="w", padx=2, pady=2)
        self.delay_spin = ttk.Spinbox(delay_frame, from_=50, to=1000, increment=25, width=6)
        self.delay_spin.set(150)
        self.delay_spin.grid(row=0, column=1, sticky="w", padx=4, pady=2)
        tk.Label(delay_frame, text="ms / chiêu").grid(row=0, column=2, sticky="w", padx=(0, 20), pady=2)

        tk.Label(delay_frame, text="Đếm ngược đầu trận:").grid(row=0, column=3, sticky="w", padx=2, pady=2)
        self.cd_spin = ttk.Spinbox(delay_frame, from_=1.0, to=10.0, increment=0.5, width=5)
        self.cd_spin.set(3.5)
        self.cd_spin.grid(row=0, column=4, sticky="w", padx=4, pady=2)
        tk.Label(delay_frame, text="giây").grid(row=0, column=5, sticky="w", padx=2, pady=2)

        delay_frame2 = tk.Frame(cfg_box)
        delay_frame2.pack(fill="x", pady=2)
        tk.Label(delay_frame2, text="Chờ hết giao tranh sau khi thắng:").pack(side="left", padx=2)
        self.post_vic_spin = ttk.Spinbox(delay_frame2, from_=1.0, to=8.0, increment=0.5, width=5)
        self.post_vic_spin.set(2.5)
        self.post_vic_spin.pack(side="left", padx=4)
        tk.Label(delay_frame2, text="giây (trước khi bấm X)").pack(side="left", padx=2)

        btn_frame = tk.Frame(self.root)
        btn_frame.pack(fill="x", padx=12, pady=6)

        self.btn_start = tk.Button(
            btn_frame, 
            text="▶ BẮT ĐẦU (F9)", 
            font=("Arial", 10, "bold"), 
            bg="#28a745", 
            fg="white", 
            padx=12, 
            pady=6,
            command=self._on_start_click
        )
        self.btn_start.pack(side="left", expand=True, fill="x", padx=3)

        self.btn_pause = tk.Button(
            btn_frame, 
            text="⏸ TẠM DỪNG (F9)", 
            font=("Arial", 10, "bold"), 
            bg="#ffc107", 
            fg="#222222", 
            padx=12, 
            pady=6,
            command=self._on_pause_click
        )
        self.btn_pause.pack(side="left", expand=True, fill="x", padx=3)

        self.btn_stop = tk.Button(
            btn_frame, 
            text="⏹ DỪNG HẲN (F10)", 
            font=("Arial", 10, "bold"), 
            bg="#dc3545", 
            fg="white", 
            padx=12, 
            pady=6,
            command=self._on_stop_click
        )
        self.btn_stop.pack(side="left", expand=True, fill="x", padx=3)

        test_frame = tk.Frame(self.root)
        test_frame.pack(fill="x", padx=12, pady=2)
        self.btn_test = tk.Button(
            test_frame,
            text="🔍 Kiểm tra nhận diện màn hình hiện tại",
            font=("Arial", 9),
            bg="#e2e3e5",
            command=self._test_screen_detection
        )
        self.btn_test.pack(fill="x")

        log_box = tk.LabelFrame(self.root, text="Nhật ký hoạt động (Log)", font=("Arial", 9, "bold"), padx=6, pady=4)
        log_box.pack(fill="both", expand=True, padx=12, pady=4)

        self.log_text = tk.Text(log_box, height=9, font=("Consolas", 8), bg="#f8f9fa")
        self.log_text.pack(side="left", fill="both", expand=True)
        
        scrollbar = tk.Scrollbar(log_box, command=self.log_text.yview)
        scrollbar.pack(side="right", fill="y")
        self.log_text.config(yscrollcommand=scrollbar.set)

    def _toggle_always_on_top(self):
        self.root.attributes("-topmost", self.always_on_top_var.get())

    def _apply_config(self):
        skills = []
        if self.s1_var.get(): skills.append('1')
        if self.s2_var.get(): skills.append('2')
        if self.s3_var.get(): skills.append('3')
        if self.s4_var.get(): skills.append('4')
        if self.sq_var.get(): skills.append('q')
        if self.se_var.get(): skills.append('e')
        if not skills:
            skills = ['1', '2', '3']
        self.bot.skills = skills

        try:
            self.bot.spam_delay_ms = max(50, int(self.delay_spin.get()))
        except ValueError:
            self.bot.spam_delay_ms = 150

        try:
            self.bot.countdown_sec = max(1.0, float(self.cd_spin.get()))
        except ValueError:
            self.bot.countdown_sec = 3.5

        try:
            self.bot.post_victory_wait_sec = max(1.0, float(self.post_vic_spin.get()))
        except ValueError:
            self.bot.post_victory_wait_sec = 2.5

    def _on_start_click(self):
        self._apply_config()
        self.bot.start()

    def _on_pause_click(self):
        self.bot.toggle_pause()

    def _on_stop_click(self):
        self.bot.stop()

    def _test_screen_detection(self):
        screen = self.bot.capture_screen()
        if screen is None:
            messagebox.showerror("Lỗi", "Không thể chụp ảnh màn hình!")
            return

        has_f, val_f, _ = self.bot.check_f_in_center(screen)
        has_vic, val_v, _ = self.bot.check_victory_top(screen)

        msg = (
            f"KẾT QUẢ QUÉT MÀN HÌNH HIỆN TẠI:\n\n"
            f"1. Phím [ F ] (ở trung tâm nhân vật) : {'THẤY' if has_f else 'Không'} (độ khớp: {val_f:.2f})\n"
            f"2. Thông báo chiến thắng (ở trên cùng): {'THẤY' if has_vic else 'Không'} (độ khớp: {val_v:.2f})\n\n"
            f"(Nếu đang đánh nhau: Cả hai phải là 'Không' -> Đúng chuẩn)\n"
            f"(Nếu vừa thắng / sẵn sàng: Nút [ F ] phải là 'THẤY' -> Đúng chuẩn)"
        )
        messagebox.showinfo("Kết quả kiểm tra nhận diện", msg)

    def _hotkey_f9(self):
        if not self.bot.is_running:
            self.root.after(0, self._on_start_click)
        else:
            self.root.after(0, self._on_pause_click)

    def _hotkey_f10(self):
        self.root.after(0, self._on_stop_click)

    def append_log(self, text):
        def _append():
            self.log_text.insert(tk.END, text + "\n")
            self.log_text.see(tk.END)
        self.root.after(0, _append)

    def update_status_ui(self, text, color):
        def _update():
            self.status_lbl.config(text=text, fg=color)
        self.root.after(0, _update)

    def update_count_ui(self, count):
        def _update():
            self.count_lbl.config(text=f"Số trận thắng: {count}")
        self.root.after(0, _update)

    def _on_close(self):
        self.bot.stop()
        if self.hotkeys:
            self.hotkeys.stop()
        self.root.destroy()


def main():
    root = tk.Tk()
    app = CotienloApp(root)
    root.mainloop()

if __name__ == "__main__":
    main()
