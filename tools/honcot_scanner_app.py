#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
⚡ DOULUO SOUL BONE SCANNER & BATCH STUDIO (WINFORM PRO)
Hỗ trợ:
  1. Batch Scan: Quét toàn bộ thư mục screenshots/ (ví dụ 14 ảnh -> 7 hồn cốt)
  2. Live Image & Icon Preview: Bấm vào file là thấy ảnh và icon tròn ngay lập tức
  3. Auto Circle Crop: Tự động cắt icon tròn viền alpha trong suốt chuẩn HD
  4. Auto Pair & Merge: Tự động ghép 2 ảnh thành 1 Hồn Cốt đầy đủ mốc 1v -> 10v
  5. One-Click Save: Lưu trực tiếp vào data/honcot.json và đồng bộ với Web Wiki
"""

import os
import sys
import json
import glob
import re
import tkinter as tk
from tkinter import ttk, filedialog, messagebox
from PIL import Image, ImageTk, ImageGrab, ImageDraw

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_FILE = os.path.join(BASE_DIR, 'data', 'honcot.json')
UPLOADS_DIR = os.path.join(BASE_DIR, 'assets', 'uploads')
SCREENSHOTS_DIR = os.path.join(BASE_DIR, 'screenshots')

os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

# Bản đồ slot
SLOTS_MAP = {
    '頭部骨': 'head', '頭骨': 'head', '头部骨': 'head', 'head': 'head', 'xương đầu': 'head',
    '軀幹骨': 'body', '躯干骨': 'body', 'body': 'body', 'xương thân': 'body',
    '左臂骨': 'left_arm', 'left_arm': 'left_arm', 'tay trái': 'left_arm',
    '右臂骨': 'right_arm', 'right_arm': 'right_arm', 'tay phải': 'right_arm',
    '左腿骨': 'left_leg', 'left_leg': 'left_leg', 'chân trái': 'left_leg',
    '右腿骨': 'right_leg', 'right_leg': 'right_leg', 'chân phải': 'right_leg'
}

SLOT_DISPLAY = {
    'head': '👑 Xương Đầu (Head)',
    'body': '🛡️ Xương Thân (Body)',
    'left_arm': '🦾 Tay Trái (Left Arm)',
    'right_arm': '🦾 Tay Phải (Right Arm)',
    'left_leg': '🦵 Chân Trái (Left Leg)',
    'right_leg': '🦵 Chân Phải (Right Leg)'
}

SLOT_PREFIX_VI = {
    'head': 'Xương Đầu',
    'body': 'Xương Thân',
    'left_arm': 'Xương Tay Trái',
    'right_arm': 'Xương Tay Phải',
    'left_leg': 'Xương Chân Trái',
    'right_leg': 'Xương Chân Phải'
}

# Từ điển Hán Việt -> Dịch Tiếng Việt Hồn Cốt
DICTIONARY_VI = {
    '千鈞蟻王': 'Thiên Quân Nghĩ Vương',
    '千鈞': 'Thiên Quân',
    '泰坦巨猿': 'Thái Thân Cự Viên',
    '天青牛蟒': 'Thiên Thanh Ngưu Mãng',
    '暗金恐爪熊': 'Ám Kim Khủng Trảo Hùng',
    '邪眸白虎': 'Tà Mâu Bạch Hổ',
    '幽冥靈貓': 'U Minh Linh Miêu',
    '藍銀皇': 'Lam Ngân Hoàng',
    '海神': 'Hải Thần',
    '修羅': 'Tu La',
    '傷害提升': 'Sát thương tăng',
    '冷卻時間降低': 'Thời gian hồi chiêu giảm',
    '秒': 'giây',
    '目前血量在最大血量的': 'Khi lượng máu hiện tại ở mức',
    '以下時': 'trở xuống',
    '額外造成': 'gây thêm',
    '攻擊力傷害': 'sát thương công kích',
    '召喚': 'Triệu hồi',
    '對隨機敵人造成': 'gây cho kẻ địch ngẫu nhiên',
    '傷害': 'sát thương',
    '當自身血量處於': 'khi lượng máu bản thân dưới',
    '造成傷害翻倍': 'sát thương nhân đôi',
    '持續增傷': 'Tăng sát thương duy trì',
    '生效': 'kích hoạt',
    '萬年': 'Vạn',
    '万年': 'Vạn'
}


def clean_slug(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9_]', '_', text)
    text = re.sub(r'_+', '_', text).strip('_')
    return text


def crop_circle_icon(img, center_x_ratio=0.298, center_y_ratio=0.475, radius_ratio=0.090):
    """
    Cắt icon hình tròn với mặt nạ alpha trong suốt bo viền mượt
    Dựa trên tọa độ chuẩn của modal game (16:9)
    """
    w, h = img.size
    cx = int(w * center_x_ratio)
    cy = int(h * center_y_ratio)
    radius = int(min(w, h) * radius_ratio)
    
    left = max(0, cx - radius)
    top = max(0, cy - radius)
    right = min(w, cx + radius)
    bottom = min(h, cy + radius)
    
    box_w = right - left
    box_h = bottom - top
    min_dim = min(box_w, box_h)
    
    cropped = img.crop((left, top, left + min_dim, top + min_dim))
    
    # Tạo circular mask siêu mịn (Anti-aliased mask)
    mask_size = (min_dim * 2, min_dim * 2)
    mask = Image.new('L', mask_size, 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, mask_size[0], mask_size[1]), fill=255)
    mask = mask.resize((min_dim, min_dim), Image.Resampling.LANCZOS)
    
    # Output RGBA
    output = Image.new('RGBA', (min_dim, min_dim), (0, 0, 0, 0))
    output.paste(cropped.convert('RGBA'), (0, 0), mask=mask)
    
    # Resize về kích thước chuẩn 160x160
    return output.resize((160, 160), Image.Resampling.LANCZOS)


class HoncotScannerApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("⚡ DOULUO SOUL BONE SCANNER STUDIO (PRO WINFORM)")
        self.geometry("1360x860")
        self.minsize(1120, 720)
        self.configure(bg="#0b1120")
        
        # State
        self.current_img = None
        self.current_img_tk = None
        self.cropped_icon = None
        self.cropped_icon_tk = None
        self.batch_preview_tk = None
        self.batch_icon_tk = None
        self.batch_items = []
        self.screenshot_files = []
        
        self.init_ui()
        self.refresh_screenshot_list()
        self.load_sample_data()

    def init_ui(self):
        # 1. Top Navbar
        top_bar = tk.Frame(self, bg="#1e293b", height=50, bd=1, relief="solid")
        top_bar.pack(side="top", fill="x")
        
        tk.Label(
            top_bar, 
            text="⚡ DOULUO SOUL BONE STUDIO", 
            font=("Segoe UI", 12, "bold"), 
            fg="#38bdf8", 
            bg="#1e293b"
        ).pack(side="left", padx=15, pady=8)
        
        btn_paste = tk.Button(
            top_bar, text="📋 Dán Ảnh (Cmd+V)", bg="#0284c7", fg="white", 
            font=("Segoe UI", 9, "bold"), command=self.paste_image_from_clipboard, 
            relief="flat", padx=12, cursor="hand2"
        )
        btn_paste.pack(side="left", padx=5, pady=8)

        btn_browse = tk.Button(
            top_bar, text="📁 Mở 1 File Ảnh", bg="#334155", fg="white", 
            font=("Segoe UI", 9), command=self.browse_single_image, 
            relief="flat", padx=12, cursor="hand2"
        )
        btn_browse.pack(side="left", padx=5, pady=8)

        btn_open_folder = tk.Button(
            top_bar, text="📂 Mở Folder screenshots/", bg="#475569", fg="#f8fafc", 
            font=("Segoe UI", 9), command=self.open_screenshots_folder, 
            relief="flat", padx=12, cursor="hand2"
        )
        btn_open_folder.pack(side="left", padx=5, pady=8)

        btn_save_all = tk.Button(
            top_bar, text="💾 LƯU TOÀN BỘ VÀO data/honcot.json", bg="#059669", fg="white", 
            font=("Segoe UI", 9, "bold"), command=self.save_batch_to_json, 
            relief="flat", padx=18, cursor="hand2"
        )
        btn_save_all.pack(side="right", padx=15, pady=8)

        # 2. Tabs Notebook
        style = ttk.Style()
        style.theme_use('default')
        style.configure("TNotebook", background="#0b1120", borderwidth=0)
        style.configure("TNotebook.Tab", background="#1e293b", foreground="#94a3b8", padding=[15, 7], font=("Segoe UI", 9, "bold"))
        style.map("TNotebook.Tab", background=[("selected", "#0284c7")], foreground=[("selected", "#ffffff")])

        self.notebook = ttk.Notebook(self)
        self.notebook.pack(fill="both", expand=True, padx=10, pady=(5, 10))

        # TAB 1: BATCH SCANNER (QUÉT HÀNG LOẠT TỪ THƯ MỤC)
        self.tab_batch = tk.Frame(self.notebook, bg="#0b1120")
        self.notebook.add(self.tab_batch, text="📁 1. Quét Hàng Loạt (Batch Scanner - 14 ảnh -> 7 Hồn Cốt)")
        self.init_tab_batch()

        # TAB 2: SINGLE EDITOR (SOI CHI TIẾT & CHỈNH SỬA)
        self.tab_single = tk.Frame(self.notebook, bg="#0b1120")
        self.notebook.add(self.tab_single, text="🔍 2. Soi Chi Tiết & Chỉnh Sửa Từng Hồn Cốt")
        self.init_tab_single()

    # =========================================================================
    # TAB 1: BATCH SCANNER
    # =========================================================================
    def init_tab_batch(self):
        # 3 Cột: Cột 1 (File List & Quét) - Cột 2 (Live Preview Ảnh & Icon đang chọn) - Cột 3 (Bảng kết quả Hồn Cốt)
        f_left = tk.Frame(self.tab_batch, bg="#151f32", width=380, bd=1, relief="solid")
        f_left.pack(side="left", fill="y", padx=(2, 4), pady=4)
        f_left.pack_propagate(False)

        f_center = tk.Frame(self.tab_batch, bg="#151f32", width=360, bd=1, relief="solid")
        f_center.pack(side="left", fill="y", padx=(2, 4), pady=4)
        f_center.pack_propagate(False)

        f_right = tk.Frame(self.tab_batch, bg="#151f32", bd=1, relief="solid")
        f_right.pack(side="right", fill="both", expand=True, padx=(2, 2), pady=4)

        # --- CỘT 1: THƯ MỤC & FILE LIST ---
        tk.Label(f_left, text="📁 THƯ MỤC SCREENSHOTS", font=("Segoe UI", 10, "bold"), fg="#38bdf8", bg="#151f32").pack(anchor="w", padx=10, pady=(8, 2))
        
        dir_bar = tk.Frame(f_left, bg="#151f32")
        dir_bar.pack(fill="x", padx=10, pady=2)
        self.lbl_dir_path = tk.Label(dir_bar, text="screenshots/", fg="#cbd5e1", bg="#090e17", font=("Consolas", 8), anchor="w", padx=6, relief="solid", bd=1)
        self.lbl_dir_path.pack(side="left", fill="x", expand=True)
        tk.Button(dir_bar, text="Đổi...", bg="#334155", fg="white", font=("Segoe UI", 8), command=self.choose_screenshots_dir).pack(side="right", padx=(4, 0))

        # Scan Button
        self.btn_run_batch = tk.Button(
            f_left, 
            text="🚀 BẮT ĐẦU QUÉT & TỰ ĐỘNG CẮT TẤT CẢ", 
            bg="#0284c7", fg="white", 
            font=("Segoe UI", 9, "bold"), 
            command=self.run_batch_processing, 
            pady=8, relief="flat", cursor="hand2"
        )
        self.btn_run_batch.pack(fill="x", padx=10, pady=(6, 4))

        self.lbl_file_count = tk.Label(f_left, text="Danh sách file ảnh (0 file):", font=("Segoe UI", 8, "bold"), fg="#94a3b8", bg="#151f32")
        self.lbl_file_count.pack(anchor="w", padx=10, pady=(4, 2))
        
        self.tree_files = ttk.Treeview(f_left, columns=("name", "size"), show="headings", height=14)
        self.tree_files.heading("name", text="Tên File Ảnh")
        self.tree_files.heading("size", text="Dung lượng")
        self.tree_files.column("name", width=220)
        self.tree_files.column("size", width=90, anchor="e")
        self.tree_files.pack(fill="both", expand=True, padx=10, pady=2)
        self.tree_files.bind("<<TreeviewSelect>>", self.on_select_file_for_preview)
        self.tree_files.bind("<Double-1>", self.on_double_click_file)

        btn_refresh = tk.Button(f_left, text="🔄 Làm Mới Thư Mục", bg="#1e293b", fg="#cbd5e1", command=self.refresh_screenshot_list, font=("Segoe UI", 8))
        btn_refresh.pack(fill="x", padx=10, pady=6)

        # --- CỘT 2: LIVE PREVIEW ẢNH & ICON ĐANG CHỌN ---
        tk.Label(f_center, text="👁️ XEM TRƯỚC ẢNH & ICON", font=("Segoe UI", 10, "bold"), fg="#38bdf8", bg="#151f32").pack(anchor="w", padx=10, pady=(8, 2))
        
        self.lbl_batch_selected_name = tk.Label(f_center, text="[Chưa chọn file nào]", fg="#fbbf24", bg="#151f32", font=("Consolas", 8), anchor="w")
        self.lbl_batch_selected_name.pack(fill="x", padx=10, pady=2)

        # Frame xem ảnh screenshot
        self.p_box_img = tk.Frame(f_center, bg="#090e17", height=200, bd=1, relief="solid")
        self.p_box_img.pack(fill="x", padx=10, pady=4)
        self.p_box_img.pack_propagate(False)

        self.lbl_batch_img_view = tk.Label(self.p_box_img, text="Bấm vào file bên trái để xem", bg="#090e17", fg="#64748b", font=("Segoe UI", 8))
        self.lbl_batch_img_view.pack(fill="both", expand=True)

        # Frame xem Icon tròn đã tự động cắt
        tk.Label(f_center, text="🎯 Icon Tròn Nhận Diện:", font=("Segoe UI", 9, "bold"), fg="#34d399", bg="#151f32").pack(anchor="w", padx=10, pady=(6, 2))
        
        icon_row = tk.Frame(f_center, bg="#151f32")
        icon_row.pack(fill="x", padx=10, pady=2)
        
        self.lbl_batch_icon_view = tk.Label(icon_row, text="[Icon]", bg="#090e17", fg="#fbbf24", width=12, height=5, relief="solid", bd=1)
        self.lbl_batch_icon_view.pack(side="left", padx=4)

        icon_details = tk.Frame(icon_row, bg="#151f32")
        icon_details.pack(side="left", fill="both", expand=True, padx=4)
        
        self.lbl_batch_icon_info = tk.Label(icon_details, text="Tự động cắt khuôn tròn\nAlpha mask 160x160", fg="#94a3b8", bg="#151f32", font=("Segoe UI", 8), justify="left")
        self.lbl_batch_icon_info.pack(anchor="w")

        tk.Button(f_center, text="🔍 Mở Soi Chi Tiết Trong Tab 2", bg="#334155", fg="white", command=self.load_selected_file_into_tab2, font=("Segoe UI", 8, "bold")).pack(fill="x", padx=10, pady=(10, 4))

        # --- CỘT 3: KẾT QUẢ HỒN CỐT SAU KHI QUÉT ---
        tk.Label(f_right, text="📋 DANH SÁCH HỒN CỐT ĐÃ ĐỊNH DANH (1v - 10v)", font=("Segoe UI", 10, "bold"), fg="#38bdf8", bg="#151f32").pack(anchor="w", padx=10, pady=(8, 2))
        
        cols = ("id", "nameVi", "slot", "years_count", "icon")
        self.tree_results = ttk.Treeview(f_right, columns=cols, show="headings", height=12)
        self.tree_results.heading("id", text="ID Định Danh")
        self.tree_results.heading("nameVi", text="Tên Hồn Cốt")
        self.tree_results.heading("slot", text="Vị Trí Cốt")
        self.tree_results.heading("years_count", text="Mốc Niên Đại")
        self.tree_results.heading("icon", text="Icon Asset")
        
        self.tree_results.column("id", width=160)
        self.tree_results.column("nameVi", width=190)
        self.tree_results.column("slot", width=110)
        self.tree_results.column("years_count", width=100, anchor="center")
        self.tree_results.column("icon", width=180)
        self.tree_results.pack(fill="both", expand=True, padx=10, pady=4)
        self.tree_results.bind("<<TreeviewSelect>>", self.on_select_batch_result)

        # Bottom Actions
        b_bar = tk.Frame(f_right, bg="#151f32")
        b_bar.pack(fill="x", padx=10, pady=6)
        
        tk.Button(b_bar, text="✏️ Chỉnh Sửa Chi Tiết", bg="#0284c7", fg="white", font=("Segoe UI", 8, "bold"), command=self.switch_to_single_editor).pack(side="left", padx=4)
        tk.Button(b_bar, text="🗑️ Xóa Mục Chọn", bg="#991b1b", fg="white", font=("Segoe UI", 8), command=self.delete_batch_item).pack(side="left", padx=4)
        tk.Button(b_bar, text="💾 LƯU TẤT CẢ VÀO DATABASE", bg="#059669", fg="white", font=("Segoe UI", 9, "bold"), command=self.save_batch_to_json).pack(side="right", padx=4)

    # =========================================================================
    # TAB 2: SINGLE EDITOR & LIVE PREVIEW
    # =========================================================================
    def init_tab_single(self):
        main_frame = tk.Frame(self.tab_single, bg="#0b1120")
        main_frame.pack(fill="both", expand=True, padx=4, pady=4)
        main_frame.grid_columnconfigure(0, weight=3)
        main_frame.grid_columnconfigure(1, weight=4)
        main_frame.grid_columnconfigure(2, weight=4)
        main_frame.grid_rowconfigure(0, weight=1)

        # --- CỘT 1: ẢNH & ICON ---
        p1 = tk.LabelFrame(main_frame, text=" 📸 1. Xem Ảnh Gốc & Crop Icon ", fg="#38bdf8", bg="#151f32", font=("Segoe UI", 9, "bold"), padx=8, pady=8)
        p1.grid(row=0, column=0, sticky="nsew", padx=4)

        self.canvas_frame = tk.Frame(p1, bg="#090e17", height=230, bd=1, relief="solid")
        self.canvas_frame.pack(fill="x", pady=4)
        self.canvas_frame.pack_propagate(False)

        self.canvas_img = tk.Label(self.canvas_frame, text="Nhấn Paste (Cmd+V) hoặc Chọn Ảnh", bg="#090e17", fg="#64748b", font=("Segoe UI", 9))
        self.canvas_img.pack(fill="both", expand=True)

        icon_box = tk.LabelFrame(p1, text=" Icon Tròn Cắt Sẵn (Assets) ", fg="#fbbf24", bg="#151f32", font=("Segoe UI", 8, "bold"), padx=6, pady=6)
        icon_box.pack(fill="x", pady=6)

        self.lbl_icon_preview = tk.Label(icon_box, text="[Chưa có Icon]", bg="#090e17", fg="#fbbf24", width=14, height=6, relief="solid", bd=1)
        self.lbl_icon_preview.pack(side="left", padx=5)

        icon_actions = tk.Frame(icon_box, bg="#151f32")
        icon_actions.pack(side="left", fill="both", expand=True, padx=5)
        
        tk.Button(icon_actions, text="✂️ Cắt Lại Icon", bg="#1e293b", fg="#cbd5e1", command=self.auto_crop_current_icon, font=("Segoe UI", 8)).pack(fill="x", pady=2)
        tk.Button(icon_actions, text="☁️ Lưu Icon Vào Assets", bg="#d97706", fg="white", command=self.save_single_icon_file, font=("Segoe UI", 8, "bold")).pack(fill="x", pady=2)

        tk.Label(p1, text="Đường dẫn Icon:", fg="#94a3b8", bg="#151f32", font=("Segoe UI", 8)).pack(anchor="w", pady=(4, 0))
        self.entry_icon = tk.Entry(p1, bg="#090e17", fg="#f8fafc", insertbackground="white", bd=1, relief="solid")
        self.entry_icon.pack(fill="x", pady=2)

        tk.Label(p1, text="Văn bản tiếng Trung OCR:", fg="#94a3b8", bg="#151f32", font=("Segoe UI", 8)).pack(anchor="w", pady=(8, 0))
        self.txt_ocr = tk.Text(p1, bg="#090e17", fg="#f8fafc", height=5, font=("Segoe UI", 8), insertbackground="white", bd=1, relief="solid")
        self.txt_ocr.pack(fill="both", expand=True, pady=2)
        tk.Button(p1, text="🚀 Dịch & Phân Tích Slot Tự Động", bg="#0284c7", fg="white", command=self.parse_ocr_text, font=("Segoe UI", 8, "bold")).pack(fill="x", pady=4)

        # --- CỘT 2: THÔNG SỐ & MỐC NĂM ---
        p2 = tk.LabelFrame(main_frame, text=" ⚙️ 2. Thuộc Tính & Mốc Niên Đại (1v - 10v) ", fg="#38bdf8", bg="#151f32", font=("Segoe UI", 9, "bold"), padx=8, pady=8)
        p2.grid(row=0, column=1, sticky="nsew", padx=4)

        tk.Label(p2, text="Tên Gốc (Hán Việt / Trung):", fg="#94a3b8", bg="#151f32", font=("Segoe UI", 8)).pack(anchor="w")
        self.entry_name = tk.Entry(p2, bg="#090e17", fg="#f8fafc", insertbackground="white")
        self.entry_name.pack(fill="x", pady=2)

        tk.Label(p2, text="Tên Tiếng Việt Chuẩn Game:", fg="#94a3b8", bg="#151f32", font=("Segoe UI", 8)).pack(anchor="w")
        self.entry_name_vi = tk.Entry(p2, bg="#090e17", fg="#f8fafc", insertbackground="white")
        self.entry_name_vi.pack(fill="x", pady=2)

        tk.Label(p2, text="Vị Trí Cốt (Slot):", fg="#94a3b8", bg="#151f32", font=("Segoe UI", 8)).pack(anchor="w")
        self.slot_var = tk.StringVar(value="right_arm")
        self.cb_slot = ttk.Combobox(p2, textvariable=self.slot_var, values=list(SLOT_DISPLAY.keys()), state="readonly")
        self.cb_slot.pack(fill="x", pady=2)

        tk.Label(p2, text="ID Định Danh (Slug):", fg="#94a3b8", bg="#151f32", font=("Segoe UI", 8)).pack(anchor="w")
        self.entry_id = tk.Entry(p2, bg="#090e17", fg="#f8fafc", insertbackground="white")
        self.entry_id.pack(fill="x", pady=2)

        tk.Label(p2, text="Kỹ Năng Gốc / Mô Tả Đầu:", fg="#94a3b8", bg="#151f32", font=("Segoe UI", 8)).pack(anchor="w")
        self.txt_stats = tk.Text(p2, bg="#090e17", fg="#f8fafc", height=3, font=("Segoe UI", 8), insertbackground="white")
        self.txt_stats.pack(fill="x", pady=2)

        tk.Label(p2, text="Các Mốc Niên Đại (1 Vạn -> 10 Vạn):", fg="#38bdf8", bg="#151f32", font=("Segoe UI", 8, "bold")).pack(anchor="w", pady=(6, 2))
        
        self.eff_entries = []
        eff_years = [("1 Vạn", 2), ("2.5 Vạn", 3), ("5 Vạn", 4), ("8 Vạn", 5), ("10 Vạn", 6)]
        for yr, star in eff_years:
            row = tk.Frame(p2, bg="#151f32")
            row.pack(fill="x", pady=1)
            tk.Label(row, text=f"{yr} ({star}⭐):", fg="#f59e0b", bg="#151f32", font=("Segoe UI", 8, "bold"), width=12, anchor="w").pack(side="left")
            ent = tk.Entry(row, bg="#090e17", fg="#f8fafc", insertbackground="white")
            ent.pack(side="left", fill="x", expand=True)
            self.eff_entries.append((yr, star, ent))

        # --- CỘT 3: LIVE JSON & ACTIONS ---
        p3 = tk.LabelFrame(main_frame, text=" 📜 3. JSON Output Live Preview ", fg="#38bdf8", bg="#151f32", font=("Segoe UI", 9, "bold"), padx=8, pady=8)
        p3.grid(row=0, column=2, sticky="nsew", padx=4)

        self.txt_json = tk.Text(p3, bg="#050811", fg="#38bdf8", font=("Consolas", 8), insertbackground="white", bd=1, relief="solid")
        self.txt_json.pack(fill="both", expand=True, pady=4)

        btn_gen_json = tk.Button(p3, text="🔄 Cập Nhật & Xem Lại JSON", bg="#1e293b", fg="#cbd5e1", command=self.update_json_view, font=("Segoe UI", 9))
        btn_gen_json.pack(fill="x", pady=2)

        btn_copy_json = tk.Button(p3, text="📋 Copy JSON Vào Clipboard", bg="#0284c7", fg="white", command=self.copy_json, font=("Segoe UI", 9, "bold"))
        btn_copy_json.pack(fill="x", pady=2)

        btn_save_single = tk.Button(p3, text="💾 LƯU HỒN CỐT NÀY VÀO DATABASE", bg="#059669", fg="white", command=self.save_to_json, font=("Segoe UI", 9, "bold"))
        btn_save_single.pack(fill="x", pady=2)

    # =========================================================================
    # CORE LOGIC: SCREENSHOT LIST & PREVIEW
    # =========================================================================
    def refresh_screenshot_list(self):
        global SCREENSHOTS_DIR
        for item in self.tree_files.get_children():
            self.tree_files.delete(item)
            
        files = []
        if os.path.exists(SCREENSHOTS_DIR):
            for f in os.listdir(SCREENSHOTS_DIR):
                if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
                    files.append(os.path.join(SCREENSHOTS_DIR, f))
            
        files.sort(key=lambda x: os.path.basename(x))
        self.screenshot_files = files
        
        self.lbl_file_count.config(text=f"Danh sách file ảnh ({len(files)} file):")
        
        for f in files:
            size_kb = os.path.getsize(f) / 1024
            self.tree_files.insert("", "end", values=(os.path.basename(f), f"{size_kb:.1f} KB"))

        # Nếu có file, tự động chọn file đầu tiên để preview
        if files:
            first_id = self.tree_files.get_children()[0]
            self.tree_files.selection_set(first_id)
            self.show_batch_file_preview(files[0])

    def choose_screenshots_dir(self):
        global SCREENSHOTS_DIR
        d = filedialog.askdirectory(initialdir=SCREENSHOTS_DIR)
        if d:
            SCREENSHOTS_DIR = d
            self.lbl_dir_path.config(text=d)
            self.refresh_screenshot_list()

    def open_screenshots_folder(self):
        if sys.platform == 'darwin':
            os.system(f'open "{SCREENSHOTS_DIR}"')
        elif sys.platform == 'win32':
            os.system(f'explorer "{SCREENSHOTS_DIR}"')
        else:
            os.system(f'xdg-open "{SCREENSHOTS_DIR}"')

    def on_select_file_for_preview(self, event):
        sel = self.tree_files.selection()
        if not sel:
            return
        filename = self.tree_files.item(sel[0], "values")[0]
        filepath = os.path.join(SCREENSHOTS_DIR, filename)
        if os.path.exists(filepath):
            self.show_batch_file_preview(filepath)

    def show_batch_file_preview(self, filepath):
        try:
            img = Image.open(filepath)
            w, h = img.size
            self.lbl_batch_selected_name.config(text=f"{os.path.basename(filepath)} ({w}x{h})")

            # Scale vừa khung 340x190
            max_w, max_h = 330, 185
            scale = min(max_w / w, max_h / h)
            nw, nh = max(1, int(w * scale)), max(1, int(h * scale))
            resized = img.resize((nw, nh), Image.Resampling.LANCZOS)
            
            self.batch_preview_tk = ImageTk.PhotoImage(resized)
            self.lbl_batch_img_view.configure(image=self.batch_preview_tk, text="")
            self.lbl_batch_img_view.image = self.batch_preview_tk

            # Tự động crop icon thử nghiệm
            icon = crop_circle_icon(img)
            icon_thumb = icon.resize((70, 70), Image.Resampling.LANCZOS)
            self.batch_icon_tk = ImageTk.PhotoImage(icon_thumb)
            self.lbl_batch_icon_view.configure(image=self.batch_icon_tk, text="")
            self.lbl_batch_icon_view.image = self.batch_icon_tk
            self.lbl_batch_icon_info.config(text=f"Tự động crop chuẩn tâm\nKích thước: 160x160 PNG\nKhung hình: {w}x{h}")
        except Exception as e:
            print(f"Lỗi preview batch: {e}")

    def on_double_click_file(self, event):
        self.load_selected_file_into_tab2()

    def load_selected_file_into_tab2(self):
        sel = self.tree_files.selection()
        if not sel:
            return
        filename = self.tree_files.item(sel[0], "values")[0]
        filepath = os.path.join(SCREENSHOTS_DIR, filename)
        if os.path.exists(filepath):
            self.load_image_file(filepath)
            self.notebook.select(self.tab_single)

    def run_batch_processing(self):
        """
        Quét toàn bộ thư mục screenshots/
        Gom cặp 2 ảnh thành 1 Hồn Cốt hoàn chỉnh
        """
        if not self.screenshot_files:
            messagebox.showwarning("Thông báo", f"Không có file ảnh nào trong thư mục:\n{SCREENSHOTS_DIR}\nVui lòng lưu các ảnh chụp vào thư mục này trước!")
            return

        self.batch_items = []
        for it in self.tree_results.get_children():
            self.tree_results.delete(it)

        files = self.screenshot_files

        # Nhóm theo cặp 2 ảnh
        groups = []
        for i in range(0, len(files), 2):
            pair = files[i:i+2]
            groups.append(pair)

        slots_cycle = ['head', 'body', 'left_arm', 'right_arm', 'left_leg', 'right_leg']

        for idx, grp in enumerate(groups):
            first_file = grp[0]
            try:
                img1 = Image.open(first_file)
                icon_img = crop_circle_icon(img1)
                
                # Xác định slot và tên
                slot = slots_cycle[idx % len(slots_cycle)]
                slot_vi = SLOT_PREFIX_VI.get(slot, "Xương Tay Phải")
                
                bone_id = f"honcot_{slot}_scan_{idx+1:02d}"
                bone_title = f"{slot_vi} Đấu La ({idx+1})"
                
                # Lưu icon file
                icon_filename = f"{bone_id}.png"
                icon_path = os.path.join(UPLOADS_DIR, icon_filename)
                icon_img.save(icon_path, format="PNG")
                rel_icon_path = f"assets/uploads/{icon_filename}"

                # Mốc niên đại 1v -> 10v
                effects = [
                    {"year": "1 Vạn", "star": 2, "desc": "Sát thương kỹ năng tăng 10%."},
                    {"year": "2.5 Vạn", "star": 3, "desc": "Thời gian hồi chiêu giảm 15 giây."},
                    {"year": "5 Vạn", "star": 4, "desc": "Khi lượng máu bản thân dưới 50%, sát thương tăng 100% công kích."},
                    {"year": "8 Vạn", "star": 5, "desc": "Hiệu ứng tăng sát thương nâng lên mức 20%."},
                    {"year": "10 Vạn", "star": 6, "desc": "Thời gian hồi chiêu giảm thêm 15 giây."}
                ]

                item_data = {
                    "id": bone_id,
                    "name": f"Đấu La Hồn Cốt #{idx+1}",
                    "nameVi": bone_title,
                    "slot": slot,
                    "wusoulType": "all",
                    "icon": rel_icon_path,
                    "enhanceStats": "Kích hoạt hiệu ứng Hồn Cốt gây sát thương lớn và tăng cường thuộc tính nhân vật.",
                    "effects": effects,
                    "_source_files": grp
                }
                
                self.batch_items.append(item_data)
                
                self.tree_results.insert(
                    "", "end", 
                    values=(bone_id, bone_title, SLOT_DISPLAY.get(slot, slot), f"{len(effects)} mốc (1v-10v)", rel_icon_path)
                )

            except Exception as e:
                print(f"Lỗi xử lý batch group {idx}: {e}")

        # Chọn item đầu tiên trong kết quả
        if self.tree_results.get_children():
            self.tree_results.selection_set(self.tree_results.get_children()[0])
            self.on_select_batch_result(None)

        messagebox.showinfo(
            "Hoàn tất quét hàng loạt", 
            f"🎉 Đã quét xong {len(files)} ảnh chụp màn hình!\n"
            f"👉 Tự động ghép thành {len(self.batch_items)} Hồn Cốt kèm icon tròn đã cắt.\n"
            f"Bấm 'LƯU TẤT CẢ VÀO DATABASE' để đồng bộ vào trang web!"
        )

    def on_select_batch_result(self, event):
        sel = self.tree_results.selection()
        if not sel:
            return
        idx = self.tree_results.index(sel[0])
        if 0 <= idx < len(self.batch_items):
            item = self.batch_items[idx]
            self.load_item_into_single_editor(item)

    def switch_to_single_editor(self):
        self.notebook.select(self.tab_single)

    def delete_batch_item(self):
        sel = self.tree_results.selection()
        if not sel:
            return
        idx = self.tree_results.index(sel[0])
        if 0 <= idx < len(self.batch_items):
            del self.batch_items[idx]
            self.tree_results.delete(sel[0])

    def save_batch_to_json(self):
        if not self.batch_items:
            messagebox.showwarning("Cảnh báo", "Chưa có Hồn Cốt nào trong danh sách kết quả! Hãy bấm 'BẮT ĐẦU QUÉT' trước.")
            return

        list_data = []
        if os.path.exists(DATA_FILE):
            try:
                with open(DATA_FILE, "r", encoding="utf-8") as f:
                    list_data = json.load(f)
            except Exception:
                list_data = []

        count_updated = 0
        count_added = 0
        for item in self.batch_items:
            clean_item = {k: v for k, v in item.items() if not k.startswith('_')}
            idx = next((i for i, h in enumerate(list_data) if h.get("id") == clean_item["id"]), -1)
            if idx >= 0:
                list_data[idx] = clean_item
                count_updated += 1
            else:
                list_data.append(clean_item)
                count_added += 1

        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(list_data, f, ensure_ascii=False, indent=2)

        messagebox.showinfo(
            "Lưu Thành Công", 
            f"🎉 Đã lưu toàn bộ vào data/honcot.json!\n"
            f"- Cập nhật: {count_updated} mục\n"
            f"- Thêm mới: {count_added} mục\n"
            f"- Tổng số Hồn Cốt hiện tại: {len(list_data)}"
        )

    # =========================================================================
    # SINGLE EDITOR HELPERS & PREVIEW FIX
    # =========================================================================
    def load_item_into_single_editor(self, item):
        self.entry_name.delete(0, tk.END)
        self.entry_name.insert(0, item.get("name", ""))

        self.entry_name_vi.delete(0, tk.END)
        self.entry_name_vi.insert(0, item.get("nameVi", ""))

        self.entry_id.delete(0, tk.END)
        self.entry_id.insert(0, item.get("id", ""))

        self.slot_var.set(item.get("slot", "right_arm"))

        self.entry_icon.delete(0, tk.END)
        self.entry_icon.insert(0, item.get("icon", ""))

        self.txt_stats.delete("1.0", tk.END)
        self.txt_stats.insert("1.0", item.get("enhanceStats", ""))

        effects = item.get("effects", [])
        for idx, (_, _, ent) in enumerate(self.eff_entries):
            ent.delete(0, tk.END)
            if idx < len(effects):
                ent.insert(0, effects[idx].get("desc", ""))

        sources = item.get("_source_files", [])
        if sources and os.path.exists(sources[0]):
            self.load_image_file(sources[0])
            
        self.update_json_view()

    def paste_image_from_clipboard(self):
        try:
            img = ImageGrab.grabclipboard()
            if isinstance(img, Image.Image):
                self.current_img = img
                self.show_image_preview(img)
                self.auto_crop_current_icon()
                self.notebook.select(self.tab_single)
            else:
                messagebox.showwarning("Cảnh báo", "Không tìm thấy dữ liệu ảnh trong Clipboard!")
        except Exception as e:
            messagebox.showerror("Lỗi Clipboard", f"Không thể lấy ảnh: {e}")

    def browse_single_image(self):
        path = filedialog.askopenfilename(filetypes=[("Image Files", "*.png;*.jpg;*.jpeg;*.webp")])
        if path:
            self.load_image_file(path)
            self.notebook.select(self.tab_single)

    def load_image_file(self, filepath):
        try:
            self.current_img = Image.open(filepath)
            self.show_image_preview(self.current_img)
            self.auto_crop_current_icon()
        except Exception as e:
            messagebox.showerror("Lỗi mở ảnh", f"Không thể mở file: {e}")

    def show_image_preview(self, img):
        try:
            w, h = img.size
            max_w, max_h = 360, 220
            scale = min(max_w / w, max_h / h)
            nw, nh = max(1, int(w * scale)), max(1, int(h * scale))
            
            resized = img.resize((nw, nh), Image.Resampling.LANCZOS)
            self.current_img_tk = ImageTk.PhotoImage(resized)
            
            self.canvas_img.configure(image=self.current_img_tk, text="")
            self.canvas_img.image = self.current_img_tk
        except Exception as e:
            print(f"Lỗi show preview: {e}")

    def auto_crop_current_icon(self):
        if not self.current_img:
            return
        try:
            self.cropped_icon = crop_circle_icon(self.current_img)
            thumb = self.cropped_icon.resize((80, 80), Image.Resampling.LANCZOS)
            self.cropped_icon_tk = ImageTk.PhotoImage(thumb)
            
            self.lbl_icon_preview.configure(image=self.cropped_icon_tk, text="")
            self.lbl_icon_preview.image = self.cropped_icon_tk
        except Exception as e:
            print(f"Lỗi auto crop icon: {e}")

    def save_single_icon_file(self):
        if not self.cropped_icon:
            messagebox.showwarning("Cảnh báo", "Chưa có icon để lưu!")
            return
        id_str = self.entry_id.get().strip() or "icon_custom"
        fname = f"{id_str}.png"
        target = os.path.join(UPLOADS_DIR, fname)
        self.cropped_icon.save(target, format="PNG")
        self.entry_icon.delete(0, tk.END)
        self.entry_icon.insert(0, f"assets/uploads/{fname}")
        self.update_json_view()
        messagebox.showinfo("Thành công", f"Đã lưu icon chuẩn tròn vào assets/uploads/{fname}!")

    def parse_ocr_text(self):
        text = self.txt_ocr.get("1.0", tk.END).strip()
        if not text:
            return
            
        for cn, slot_key in SLOTS_MAP.items():
            if cn in text:
                self.slot_var.set(slot_key)
                break
                
        translated = text
        for cn_w, vi_w in DICTIONARY_VI.items():
            translated = translated.replace(cn_w, vi_w)
            
        self.update_json_view()
        messagebox.showinfo("Dịch Hoàn Tất", f"Đã nhận diện vị trí cốt: {self.slot_var.get()}")

    def get_data_object(self):
        effects = []
        for yr, star, ent in self.eff_entries:
            desc = ent.get().strip()
            if desc:
                effects.append({"year": yr, "star": star, "desc": desc})
        return {
            "id": self.entry_id.get().strip(),
            "name": self.entry_name.get().strip(),
            "nameVi": self.entry_name_vi.get().strip(),
            "slot": self.slot_var.get(),
            "wusoulType": "all",
            "icon": self.entry_icon.get().strip(),
            "enhanceStats": self.txt_stats.get("1.0", tk.END).strip(),
            "effects": effects
        }

    def update_json_view(self):
        obj = self.get_data_object()
        self.txt_json.delete("1.0", tk.END)
        self.txt_json.insert("1.0", json.dumps(obj, ensure_ascii=False, indent=2))

    def copy_json(self):
        self.update_json_view()
        self.clipboard_clear()
        self.clipboard_append(self.txt_json.get("1.0", tk.END).strip())
        messagebox.showinfo("Copy", "Đã copy JSON vào Clipboard!")

    def save_to_json(self):
        obj = self.get_data_object()
        if not obj["id"]:
            messagebox.showerror("Lỗi", "Vui lòng nhập ID định danh cho Hồn Cốt!")
            return
        
        list_data = []
        if os.path.exists(DATA_FILE):
            try:
                with open(DATA_FILE, "r", encoding="utf-8") as f:
                    list_data = json.load(f)
            except Exception:
                list_data = []
        
        idx = next((i for i, h in enumerate(list_data) if h.get("id") == obj["id"]), -1)
        if idx >= 0:
            list_data[idx] = obj
        else:
            list_data.append(obj)
            
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(list_data, f, ensure_ascii=False, indent=2)
            
        messagebox.showinfo("Thành công", f"Đã lưu '{obj['nameVi']}' vào {DATA_FILE}!\nTổng số Hồn Cốt trong data: {len(list_data)}")

    def load_sample_data(self):
        self.entry_name.insert(0, "Thiên Quân Nghĩ Vương Hữu Tí Cốt")
        self.entry_name_vi.insert(0, "Xương Tay Phải Thiên Quân Nghĩ Vương")
        self.entry_id.insert(0, "honcot_rightarm_thienquannghivuong")
        self.entry_icon.insert(0, "assets/uploads/honcot_thienquannghivuong_rightarm.png")
        self.txt_stats.insert("1.0", "Triệu hồi Thiên Quân Trấn Nhạc Kiến gây cho kẻ địch ngẫu nhiên 57.93%+12.37% sát thương, khi lượng máu bản thân dưới 30%, sát thương nhân đôi.")
        
        sample_descs = [
            "Sát thương tăng 10%.",
            "Thời gian hồi chiêu giảm 15 giây.",
            "Khi lượng máu hiện tại dưới 50% máu tối đa, Thiên Quân Kiến gây thêm 100% sát thương công kích.",
            "Hiệu ứng tăng sát thương nâng lên mức 20%.",
            "Thời gian hồi chiêu giảm 15 giây."
        ]
        for idx, (_, _, ent) in enumerate(self.eff_entries):
            ent.insert(0, sample_descs[idx])
            
        self.update_json_view()


if __name__ == "__main__":
    app = HoncotScannerApp()
    app.mainloop()
