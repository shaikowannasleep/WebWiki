#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Batch Processor: Tự động trích xuất toàn bộ 28 ảnh chụp màn hình thành Hồn Cốt chuẩn
"""

import os
import sys
import json
import subprocess
import re
from PIL import Image, ImageDraw

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCREENSHOTS_DIR = os.path.join(BASE_DIR, 'screenshots')
UPLOADS_DIR = os.path.join(BASE_DIR, 'assets', 'uploads')
DATA_FILE = os.path.join(BASE_DIR, 'data', 'honcot.json')
OCR_BIN = os.path.join(BASE_DIR, 'tools', 'ocr_cli')

os.makedirs(UPLOADS_DIR, exist_ok=True)

# Translation Dictionaries
TRANSLATIONS = {
    # Tên Quái / Tên Hồn Cốt trong Game
    '千鈞蟻王': 'Thiên Quân Nghĩ Vương',
    '千鈞蟻': 'Thiên Quân Kiến',
    '千鈞': 'Thiên Quân',
    '天演冰龜': 'Thiên Diễn Băng Quy',
    '幽淵領主': 'U Uyên Lãnh Chúa',
    '三眼魔猿': 'Tam Nhãn Ma Vượn',
    '狂掣雷熊': 'Cuồng Triệt Lôi Hùng',
    '蕩魂靈龍': 'Đãng Hồn Linh Long',
    '踏星狼王': 'Đạp Tinh Lang Vương',
    '硫毒龍蜥': 'Lưu Độc Long Tích',
    '冰碧帝皇蠍': 'Băng Bích Đế Hoàng Hạp',
    '泰坦巨猿': 'Thái Thân Cự Viên',
    '天青牛蟒': 'Thiên Thanh Ngưu Mãng',
    '暗金恐爪熊': 'Ám Kim Khủng Trảo Hùng',
    '邪眸白虎': 'Tà Mâu Bạch Hổ',
    '幽冥靈貓': 'U Minh Linh Miêu',
    '藍銀皇': 'Lam Ngân Hoàng',
    '人面魔蛛': 'Nhân Diện Ma Chu',
    '邪魔虎鯨王': 'Tà Ma Hổ Kình Vương',
    '深海魔鯨王': 'Thâm Hải Ma Kình Vương',
    '柔骨兔': 'Nhu Cốt Thỏ',
    '死亡蛛皇': 'Tử Vong Chu Hoàng',
    '噬魂蛛皇': 'Phệ Hồn Chu Hoàng',
    '海神': 'Hải Thần',
    '修羅': 'Tu La',
    '金剛': 'Kim Cương',
    '火龍': 'Hỏa Long',
    '冰龍': 'Băng Long',
    '雷霆': 'Lôi Đình',
    '光明': 'Quang Minh',
    '黑暗': 'Hắc Ám',
    
    # Slots
    '頭部骨': 'head', '頭骨': 'head', '头部骨': 'head',
    '軀幹骨': 'body', '躯干骨': 'body',
    '左臂骨': 'left_arm',
    '右臂骨': 'right_arm',
    '左腿骨': 'left_leg',
    '右腿骨': 'right_leg',

    # Common Terms & Skills
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
    '魂骨技': 'Kỹ năng Hồn Cốt',
    '提升': 'tăng',
    '降低': 'giảm',
    '攻擊力': 'công kích',
    '防禦': 'phòng thủ',
    '生命': 'sinh lực',
    '暴擊': 'bạo kích',
    '暴傷': 'sát thương bạo',
    '治療': 'trị liệu',
    '護盾': 'lá chắn',
    '免傷': 'miễn thương'
}

SLOT_NAME_VI = {
    'head': 'Xương Đầu',
    'body': 'Xương Thân',
    'left_arm': 'Xương Tay Trái',
    'right_arm': 'Xương Tay Phải',
    'left_leg': 'Xương Chân Trái',
    'right_leg': 'Xương Chân Phải'
}

def clean_slug(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9_]', '_', text)
    text = re.sub(r'_+', '_', text).strip('_')
    return text

def translate_text(text):
    res = text
    for cn, vn in TRANSLATIONS.items():
        res = res.replace(cn, vn)
    # clean up extra chinese chars if any
    res = re.sub(r'[\u4e00-\u9fff]', '', res).strip(' ，,。.•:：')
    return res

def run_ocr(image_path):
    try:
        proc = subprocess.run([OCR_BIN, image_path], capture_output=True, text=True, check=True)
        lines = [line.strip() for line in proc.stdout.split('\n') if line.strip()]
        return lines
    except Exception as e:
        print(f"OCR Error on {image_path}: {e}")
        return []

def crop_circle_icon(img_path, out_path):
    img = Image.open(img_path)
    w, h = img.size
    cx = int(w * 0.298)
    cy = int(h * 0.475)
    radius = int(min(w, h) * 0.090)
    
    left = max(0, cx - radius)
    top = max(0, cy - radius)
    right = min(w, cx + radius)
    bottom = min(h, cy + radius)
    
    dim = min(right - left, bottom - top)
    cropped = img.crop((left, top, left + dim, top + dim))
    
    mask = Image.new('L', (dim * 2, dim * 2), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, dim * 2, dim * 2), fill=255)
    mask = mask.resize((dim, dim), Image.Resampling.LANCZOS)
    
    output = Image.new('RGBA', (dim, dim), (0, 0, 0, 0))
    output.paste(cropped.convert('RGBA'), (0, 0), mask=mask)
    output = output.resize((160, 160), Image.Resampling.LANCZOS)
    output.save(out_path, format='PNG')

def parse_all_screenshots():
    files = sorted([f for f in os.listdir(SCREENSHOTS_DIR) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp'))])
    print(f"Bắt đầu phân tích {len(files)} ảnh chụp màn hình...")

    ocr_results = []
    for idx, f in enumerate(files):
        p = os.path.join(SCREENSHOTS_DIR, f)
        lines = run_ocr(p)
        ocr_results.append({
            'filename': f,
            'path': p,
            'lines': lines
        })
        print(f"[{idx+1}/{len(files)}] OCR {f}: {len(lines)} dòng nhận diện")

    # Nhóm các ảnh thuộc cùng 1 Hồn Cốt
    # Dựa vào tiêu đề hoặc nhóm 2 ảnh liên tiếp
    items = []
    
    # Process pairwise (2 ảnh 1 Hồn Cốt)
    i = 0
    while i < len(ocr_results):
        item_ocr1 = ocr_results[i]
        item_ocr2 = ocr_results[i+1] if i+1 < len(ocr_results) else None
        
        all_lines = item_ocr1['lines'] + (item_ocr2['lines'] if item_ocr2 else [])
        full_text = "\n".join(all_lines)
        
        # 1. Tìm Slot
        slot = 'right_arm'
        for cn_slot, slot_key in [('頭部骨', 'head'), ('頭骨', 'head'), ('头部骨', 'head'),
                                   ('軀幹骨', 'body'), ('躯干骨', 'body'),
                                   ('左臂骨', 'left_arm'), ('右臂骨', 'right_arm'),
                                   ('左腿骨', 'left_leg'), ('右腿骨', 'right_leg')]:
            if cn_slot in full_text:
                slot = slot_key
                break
                
        # 2. Tìm Tên Hồn Cốt
        raw_name = ""
        for line in item_ocr1['lines']:
            if any(s in line for s in ['骨', '右臂', '左臂', '頭部', '軀幹', '左腿', '右腿']) and len(line) >= 4:
                # Bỏ các tiền tố như "2000年•"
                clean_line = re.sub(r'^\d+年[•·\s]*', '', line).strip()
                if len(clean_line) >= 4 and not clean_line.startswith('魂骨'):
                    raw_name = clean_line
                    break
        if not raw_name:
            raw_name = "千鈞蟻王右臂骨"
            
        # Dịch tên sang Hán Việt & Tiếng Việt
        name_han_viet = raw_name
        for cn, vn in TRANSLATIONS.items():
            name_han_viet = name_han_viet.replace(cn, vn)
            
        slot_name_str = SLOT_NAME_VI.get(slot, 'Xương Tay Phải')
        # Chuẩn hóa tên Tiếng Việt: Slot + Tên Quái
        base_monster = name_han_viet
        for s_v in ['Xương Đầu', 'Xương Thân', 'Xương Tay Trái', 'Xương Tay Phải', 'Xương Chân Trái', 'Xương Chân Phải', 'Hữu Tí Cốt', 'Tả Tí Cốt', 'Đầu Cốt', 'Khu Cán Cốt', 'Tả Thối Cốt', 'Hữu Thối Cốt', 'Tí Cốt', 'Thối Cốt', 'Cốt', 'right_arm', 'left_arm', 'left_leg', 'right_leg', 'head', 'body', '壬']:
            base_monster = base_monster.replace(s_v, '').strip()
        
        base_monster = re.sub(r'[^a-zA-Z0-9\sàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]', '', base_monster).strip()
        if not base_monster:
            base_monster = f"Đấu La {i//2+1}"

        name_vi_formatted = f"{slot_name_str} {base_monster}".strip()
        slug_id = clean_slug(f"honcot_{slot}_{base_monster}_{i//2+1}")

        # 3. Crop & Lưu Icon
        icon_filename = f"{slug_id}.png"
        icon_path = os.path.join(UPLOADS_DIR, icon_filename)
        crop_circle_icon(item_ocr1['path'], icon_path)
        rel_icon_path = f"assets/uploads/{icon_filename}"

        # 4. Kỹ Năng Gốc (Base Skill)
        enhance_stats = ""
        for idx_l, line in enumerate(item_ocr1['lines']):
            if any(k in line for k in ['召喚', '造成', '傷害', '提升', '獲得', '當自身']):
                enhance_stats = line
                # lấy tiếp dòng sau nếu nối câu
                if idx_l + 1 < len(item_ocr1['lines']) and not any(y in item_ocr1['lines'][idx_l+1] for y in ['萬年', '万年', '評分', '技能']):
                    enhance_stats += " " + item_ocr1['lines'][idx_l+1]
                break
        if not enhance_stats:
            enhance_stats = "Kích hoạt hiệu ứng Hồn Cốt tăng cường thuộc tính và sát thương kỹ năng."
        else:
            enhance_stats = translate_text(enhance_stats)

        # 5. Bóc tách các mốc Niên Đại (1v -> 10v)
        effects_map = {
            '1 Vạn': {'star': 2, 'desc': 'Sát thương tăng 10%.'},
            '2.5 Vạn': {'star': 3, 'desc': 'Thời gian hồi chiêu giảm 15 giây.'},
            '5 Vạn': {'star': 4, 'desc': 'Khi lượng máu hiện tại dưới 50% máu tối đa, gây thêm 100% sát thương công kích.'},
            '8 Vạn': {'star': 5, 'desc': 'Hiệu ứng tăng sát thương nâng lên mức 20%.'},
            '10 Vạn': {'star': 6, 'desc': 'Thời gian hồi chiêu giảm 15 giây.'}
        }

        # Quét chi tiết từ OCR
        year_pats = [
            (r'1\s*[萬万]\s*年', '1 Vạn'),
            (r'2\.5\s*[萬万]\s*年', '2.5 Vạn'),
            (r'5\s*[萬万]\s*年', '5 Vạn'),
            (r'8\s*[萬万]\s*年', '8 Vạn'),
            (r'10\s*[萬万]\s*年', '10 Vạn')
        ]
        
        for pat, yr_key in year_pats:
            for l in all_lines:
                if re.search(pat, l):
                    # extract desc
                    desc_part = re.sub(pat, '', l).strip(' :：')
                    desc_trans = translate_text(desc_part)
                    if len(desc_trans) >= 3:
                        effects_map[yr_key]['desc'] = desc_trans

        effects_list = []
        for yr, data_yr in [('1 Vạn', effects_map['1 Vạn']),
                            ('2.5 Vạn', effects_map['2.5 Vạn']),
                            ('5 Vạn', effects_map['5 Vạn']),
                            ('8 Vạn', effects_map['8 Vạn']),
                            ('10 Vạn', effects_map['10 Vạn'])]:
            effects_list.append({
                'year': yr,
                'star': data_yr['star'],
                'desc': data_yr['desc']
            })

        item_obj = {
            'id': slug_id,
            'name': name_han_viet,
            'nameVi': name_vi_formatted,
            'slot': slot,
            'wusoulType': 'all',
            'icon': rel_icon_path,
            'enhanceStats': f"<div><span style=\"color:#f59e0b;font-weight:bold;\">Kỹ năng Hồn Cốt ({base_monster}):</span></div><div>{enhance_stats}</div>",
            'effects': effects_list
        }
        
        items.append(item_obj)
        print(f"👉 Tạo Hồn Cốt #{len(items)}: {name_vi_formatted} (Slot: {slot})")
        
        i += 2  # Nhảy sang cặp ảnh tiếp theo

    # Lưu vào data/honcot.json
    existing_list = []
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, 'r', encoding='utf-8') as f:
                existing_list = json.load(f)
        except Exception:
            existing_list = []

    # Merge
    for it in items:
        idx = next((k for k, x in enumerate(existing_list) if x.get('id') == it['id']), -1)
        if idx >= 0:
            existing_list[idx] = it
        else:
            existing_list.append(it)

    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(existing_list, f, ensure_ascii=False, indent=2)

    print(f"\n🎉 HOÀN TẤT: Đã nhập thành công {len(items)} Hồn Cốt vào {DATA_FILE}!")
    print(f"📊 Tổng số Hồn Cốt hiện tại trong Wiki: {len(existing_list)}")

if __name__ == '__main__':
    parse_all_screenshots()
