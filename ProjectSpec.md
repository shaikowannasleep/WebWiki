# Douluo Wiki Studio V3.1 Specification (ProjectSpec.md)

## 1. Game Midnight Navy Palette (#0B1120)

Khôi phục và tinh chỉnh dải màu Midnight Navy của game để giải quyết triệt để lỗi màu tối xỉn, chói mắt:

- `--bg-dark`: `#0B1120` (Nền tổng web: Xanh đen cực sâu)
- `--bg-card`: `#151E32` (Nền Panel/Card Navy)
- `--bg-surface`: `#1E293B` (Nền nút bấm / Form input phân lớp)
- `--border-glass`: `#334155` (Viền Slate dịu mắt)
- `--accent-gold`: `#FBBF24` (Vàng Kim rực rỡ)
- `--accent-cyan`: `#06B6D4` (Cyan hiệu ứng)
- `--text-sub`: `#CBD5E1` (Văn bản Slate dịu mắt, chống chói mắt)

---

## 2. Douluo Wiki Studio Dashboard (8 Modules Architecture)

`edit.html` được chuyển đổi thành **Website Wiki Studio** với 8 Module quản trị:

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ Studio Top Bar (Disk Save, Hero Select, Viewport Sim)                    │
├──────────────────────────────────────────────────────────────────────────┤
│ 8 Modules Tab Bar (1: Layout, 2: Data, 3: OCR, 4: Assets, 5: Rules, ...)  │
├──────────────┬───────────────────────────────────────────┬───────────────┤
│ Left Sidebar │          CENTER LIVE VIEWER               │ Right         │
│ (Explorer &  │          (Interactive Canvas)             │ Inspector     │
│ Layout Vis)  │          - Section Avatar / Banner        │ Panel         │
│              │          - Radial Skill Menu              │ (Properties & │
│              │          - Star Requirements              │  Star Req)    │
├──────────────┴───────────────────────────────────────────┴───────────────┤
│ Module 3: Vision OCR Rich Text Buffer Console                            │
└──────────────────────────────────────────────────────────────────────────┘
```

1. **🌐 Module 1: Website Layout Builder**:
   - Quản lý Ẩn/Hiện (Toggle Visibility) các khối trên giao diện: Avatar, Banner, Title, Bio, Radial Menu, Ring Upgrades.
2. **📊 Module 2: Data Manager**: Quản lý Hồn Sư & Kỹ Năng.
3. **🤖 Module 3: Vision OCR Assistant**: Rich Text Output Buffer độc lập + Convert Keywords + Keyword Analyzer.
4. **🖼️ Module 4: Asset Studio**: Drag/Paste Image Canvas, Asset Explorer.
5. **⚙️ Module 5: Rule & Schema Engine**: Quản lý Quy tắc Group Kỹ Năng (`hasBranch`, `hasRingUpgrades`).
6. **🎨 Module 6: Theme Tokens Customizer**: Spacing, Card Radius, Shadows.
7. **📱 Module 7: Preview Studio**: Viewport Simulator (Desktop, Tablet, Phone).
8. **💾 Module 8: Publish & Backup**: Lưu đĩa cứng trực tiếp (File System Access API).
