import openpyxl
from openpyxl.styles import Border, Side, Font, Alignment, PatternFill
from openpyxl.utils import get_column_letter

wb = openpyxl.Workbook()
ws = wb.active
ws.title = "ポートフォリオ"

# Border styles
thin = Side(style='thin', color='000000')
medium = Side(style='medium', color='000000')
thin_border = Border(left=thin, right=thin, top=thin, bottom=thin)
medium_border = Border(left=medium, right=medium, top=medium, bottom=medium)

def set_border(cell, border=None):
    cell.border = border or thin_border

def apply_border_range(ws, min_row, max_row, min_col, max_col):
    for row in ws.iter_rows(min_row=min_row, max_row=max_row, min_col=min_col, max_col=max_col):
        for cell in row:
            cell.border = thin_border

# Title
ws.merge_cells('A1:H1')
title_cell = ws['A1']
title_cell.value = '2026年5月から日本株高配当株ポートフォリオを作るとしたら'
title_cell.font = Font(bold=True, size=12)
title_cell.alignment = Alignment(horizontal='center', vertical='center')
title_cell.border = thin_border

# Unit note
ws.merge_cells('G1:H1')
# Actually keep title merged A1:H1, unit goes in H2
ws['H2'].value = '（単位：円）'
ws['H2'].alignment = Alignment(horizontal='right')

# Header row
headers = ['No', 'コード', '銘柄名', '配当利回り', 'セクター', '投資割合', '投資額', '配当金']
header_fill = PatternFill(start_color='D9D9D9', end_color='D9D9D9', fill_type='solid')
for col, header in enumerate(headers, 1):
    cell = ws.cell(row=3, column=col, value=header)
    cell.font = Font(bold=True)
    cell.alignment = Alignment(horizontal='center', vertical='center')
    cell.fill = header_fill
    cell.border = thin_border

# Portfolio data
data = [
    (1, 9986, '蔵王産業', '4.07%', '卸売', '2%', 6000, 244),
    (2, 3076, 'あい・HD', '4.14%', '卸売', '2%', 6000, 248),
    (3, 8136, 'サンリオ', '5.18%', '卸売', '2%', 6000, 311),
    (4, 7638, 'サン電子', '3.38%', '小売', '2%', 6000, 203),
    (5, 1332, 'あさひ', '3.84%', '小売', '2%', 6000, 230),
    (6, 4008, '住友化学', '3.71%', '化学', '2%', 6000, 223),
    (7, 4047, '※要確認', '6.09%', '化学', '3%', 9000, 368),
    (8, 4097, '東邦ガス大工業', '3.64%', '化学', '3%', 9000, 328),
    (9, 4958, '長谷川香料', '3.41%', '化学', '3%', 9000, 307),
    (10, 8309, '三井住友トラストG', '2.67%', '銀行', '3%', 9000, 240),
    (11, 8725, 'MS&ADインシュアランスG', '3.88%', '保険', '3%', 9000, 349),
    (12, 8584, 'ジャックス', '4.98%', 'その他金融', '3%', 6000, 299),
    (13, 6785, '鈴木', '3.39%', '金属製品', '2%', 6000, 203),
    (14, 7723, '※要確認', '3.88%', '精密機器', '2%', 6000, 233),
    (15, 3231, '三井不動産HD', '4.41%', '不動産', '3%', 9000, 397),
    (16, '※要確認', '※要確認', '5.10%', '※要確認', '2%', 6000, 306),
    (17, 3169, 'CDS', '8.06%', '※要確認', '2%', 6000, 484),
    (18, 9757, '船井総研HD', '4.30%', 'サービス', '2%', 6000, 258),
    (19, 9769, '学研', '4.53%', 'サービス', '2%', 6000, 272),
    (20, 4641, 'アルノス', '4.31%', 'サービス', '2%', 6000, 259),
    (21, '※要確認', '※要確認', '4.33%', '情報・通信', '2%', 6000, 260),
    (22, 3801, 'ユニシステムズ', '3.93%', '情報・通信', '2%', 6000, 236),
    (23, 4674, 'クレスコ', '4.33%', '情報・通信', '2%', 6000, 260),
    (24, 4746, '東計電算', '3.96%', '情報・通信', '2%', 6000, 238),
    (25, 2003, '日東富士製粉', '3.94%', '食料品', '3%', 9000, 355),
    (26, 1928, '積水ハウス', '3.76%', '建設', '2%', 6000, 226),
    (27, 6345, 'ダイコーバレーション', '4.60%', '機械', '3%', 9000, 414),
    (28, 9364, '上組', '3.51%', '倉庫・運輸関連', '3%', 9000, 316),
    (29, 9381, '※要確認', '※要確認', '倉庫・運輸関連', '3%', 9000, '※要確認'),
    (30, 7988, 'ニフコ', '4.73%', '金属製品', '2%', 6000, 284),
    (31, '※要確認', '※要確認', '3.84%', '金属製品', '2%', 6000, 230),
    (32, 7994, 'オカムラ', '4.15%', 'その他製品', '3%', 9000, 374),
    (33, 4540, 'ツムラ', '3.97%', '医薬品', '3%', 9000, 357),
    (34, 1343, 'NF・J-REIT ETF', '4.49%', 'J-REIT市場', '-', 39000, 1751),
]

for i, row_data in enumerate(data, 4):
    for col, value in enumerate(row_data, 1):
        cell = ws.cell(row=i, column=col, value=value)
        cell.border = thin_border
        cell.alignment = Alignment(horizontal='center', vertical='center')
        if col == 3:  # 銘柄名は左寄せ
            cell.alignment = Alignment(horizontal='left', vertical='center')

# 合計行
total_row = len(data) + 4
ws.merge_cells(f'A{total_row}:E{total_row}')
total_label = ws[f'A{total_row}']
total_label.value = '合計'
total_label.font = Font(bold=True)
total_label.alignment = Alignment(horizontal='center', vertical='center')
total_label.border = thin_border

total_fill = PatternFill(start_color='FFFF00', end_color='FFFF00', fill_type='solid')
for col in range(1, 9):
    ws.cell(row=total_row, column=col).border = thin_border

ws.cell(row=total_row, column=6).value = '100%'
ws.cell(row=total_row, column=6).font = Font(bold=True)
ws.cell(row=total_row, column=6).alignment = Alignment(horizontal='center')
ws.cell(row=total_row, column=6).fill = total_fill

ws.cell(row=total_row, column=7).value = 300000
ws.cell(row=total_row, column=7).font = Font(bold=True)
ws.cell(row=total_row, column=7).alignment = Alignment(horizontal='center')
ws.cell(row=total_row, column=7).fill = total_fill

ws.cell(row=total_row, column=8).value = 12492
ws.cell(row=total_row, column=8).font = Font(bold=True)
ws.cell(row=total_row, column=8).alignment = Alignment(horizontal='center')
ws.cell(row=total_row, column=8).fill = total_fill

# 配当利回り行
yield_row = total_row + 1
ws.merge_cells(f'A{yield_row}:F{yield_row}')
ws[f'A{yield_row}'].value = 'ポートフォリオ配当利回り'
ws[f'A{yield_row}'].font = Font(bold=True)
ws[f'A{yield_row}'].alignment = Alignment(horizontal='right')
ws[f'G{yield_row}'].value = '4.16%'
ws[f'G{yield_row}'].font = Font(bold=True, color='FF0000')
ws[f'G{yield_row}'].alignment = Alignment(horizontal='center')
for col in range(1, 9):
    ws.cell(row=yield_row, column=col).border = thin_border

# Column widths
col_widths = [5, 10, 28, 12, 20, 10, 10, 10]
for i, width in enumerate(col_widths, 1):
    ws.column_dimensions[get_column_letter(i)].width = width

ws.row_dimensions[1].height = 25
ws.row_dimensions[3].height = 20

# ---- セクター別割合シート ----
ws2 = wb.create_sheet(title="セクター別割合（円グラフ用）")

ws2.merge_cells('A1:B1')
ws2['A1'].value = 'セクター別割合（円グラフ用データ）'
ws2['A1'].font = Font(bold=True, size=12)
ws2['A1'].alignment = Alignment(horizontal='center')
ws2['A1'].border = thin_border

sector_headers = ['セクター', '割合(%)']
for col, h in enumerate(sector_headers, 1):
    cell = ws2.cell(row=2, column=col, value=h)
    cell.font = Font(bold=True)
    cell.alignment = Alignment(horizontal='center')
    cell.fill = header_fill
    cell.border = thin_border

sector_data = [
    ('J-REIT市場', 13),
    ('サービス', 10),
    ('化学', 10),
    ('情報・通信', 8),
    ('卸売', 7),
    ('小売', 6),
    ('不動産', 6),
    ('倉庫・運輸関連', 6),
    ('その他製品', 5),
    ('その他金融', 3),
    ('建設', 3),
    ('機械', 3),
    ('食料品', 3),
    ('銀行', 3),
    ('保険', 3),
    ('医薬品', 3),
    ('精密機器', 3),
    ('金属製品', 3),
    ('電気機器', 2),
]

for i, (sector, pct) in enumerate(sector_data, 3):
    ws2.cell(row=i, column=1, value=sector).border = thin_border
    ws2.cell(row=i, column=1).alignment = Alignment(horizontal='left')
    ws2.cell(row=i, column=2, value=pct).border = thin_border
    ws2.cell(row=i, column=2).alignment = Alignment(horizontal='center')

# 合計行
total_s_row = len(sector_data) + 3
ws2.cell(row=total_s_row, column=1, value='合計').border = thin_border
ws2.cell(row=total_s_row, column=1).font = Font(bold=True)
ws2.cell(row=total_s_row, column=1).alignment = Alignment(horizontal='center')
ws2.cell(row=total_s_row, column=2, value=100).border = thin_border
ws2.cell(row=total_s_row, column=2).font = Font(bold=True)
ws2.cell(row=total_s_row, column=2).alignment = Alignment(horizontal='center')

ws2.column_dimensions['A'].width = 22
ws2.column_dimensions['B'].width = 12

wb.save('/home/user/nobuchin/portfolio.xlsx')
print("Done")
