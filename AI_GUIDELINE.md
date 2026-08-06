# AI Guideline V2.2 - Rules for Automated Data Generation (AI_GUIDELINE.md)

Tài liệu này quy định các quy tắc bắt buộc cho AI & Image Recognition Assistant trong dự án **Douluo MMO Wiki** V2.2.

---

## 🛑 Quy Tắc Bắt Buộc V2.2

1. **KHÔNG XUẤT CHỈ SỐ 1-100**:
   - Dữ liệu Hero không lưu hoặc render 4 thanh chỉ số Công, Thủ, HP, Tốc độ 1-100.

2. **TYPED REQUIREMENT OBJECTS**:
   - Mọi điều kiện mở khóa mốc Niên Hạn phải sinh dạng Typed Object:
     `{ "type": "star", "color": "gold", "count": 4 }`
   - Tuyệt đối không lưu chuỗi chữ thuần túy `"Võ hồn 4 sao vàng"`.
