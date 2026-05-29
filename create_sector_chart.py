import openpyxl
from openpyxl.chart import PieChart, Reference, Series
from openpyxl.chart.label import DataLabelList
from openpyxl.styles import Font, PatternFill, Border, Side, Alignment
from openpyxl.utils import get_column_letter

# データ
sectors = [
    ("ETF・他",         14.7, 38940),
    ("サービス業",       9.5, 27739),
    ("化学",             9.5, 32538),
    ("情報・通信業",     6.7, 20402),
    ("卸売業",           6.8, 19426),
    ("倉庫・運輸関連業", 6.5, 18798),
    ("その他製品",       6.2, 16606),
    ("小売業",           5.4, 18579),
    ("不動産業",         5.9, 17232),
    ("その他金融業",     4.8, 10815),
    ("機械",             3.6,  9310),
    ("金属製品",         3.8,  9852),
    ("建設業",           3.5, 10098),
    ("保険業",           2.5,  8700),
    ("精密機器",         2.7,  8940),
    ("食料品",           2.8,  8765),
    ("医薬品",           2.3,  7934),
    ("電気機器",         1.7,  6450),
    ("銀行業",           1.5,  5740),
]

# ワークブック作成
wb = openpyxl.Workbook()

# ─── シート1: セクター別割合 ───────────────────────────────────────
ws1 = wb.active
ws1.title = "セクター別割合"

# スタイル定義
header_font   = Font(bold=True)
header_fill   = PatternFill(fill_type="solid", fgColor="C0C0C0")  # グレー
thin_side     = Side(style="thin", color="000000")
thin_border   = Border(left=thin_side, right=thin_side, top=thin_side, bottom=thin_side)
center_align  = Alignment(horizontal="center")

def apply_border(cell):
    cell.border = thin_border

# ヘッダー行
headers = ["セクター", "投資割合(%)", "投資額(円)"]
for col, h in enumerate(headers, start=1):
    cell = ws1.cell(row=1, column=col, value=h)
    cell.font   = header_font
    cell.fill   = header_fill
    cell.border = thin_border
    cell.alignment = center_align

# データ行
for row_idx, (sector, pct, amount) in enumerate(sectors, start=2):
    ws1.cell(row=row_idx, column=1, value=sector).border  = thin_border
    ws1.cell(row=row_idx, column=2, value=pct).border     = thin_border
    ws1.cell(row=row_idx, column=3, value=amount).border  = thin_border

# 合計行
total_row = len(sectors) + 2
total_pct    = round(sum(s[1] for s in sectors), 1)
total_amount = sum(s[2] for s in sectors)

cell_label  = ws1.cell(row=total_row, column=1, value="合計")
cell_pct    = ws1.cell(row=total_row, column=2, value=total_pct)
cell_amount = ws1.cell(row=total_row, column=3, value=total_amount)

for cell in [cell_label, cell_pct, cell_amount]:
    cell.font   = Font(bold=True)
    cell.fill   = PatternFill(fill_type="solid", fgColor="E0E0E0")
    cell.border = thin_border

# 列幅調整
ws1.column_dimensions["A"].width = 22
ws1.column_dimensions["B"].width = 14
ws1.column_dimensions["C"].width = 14

# ─── シート2: 円グラフ ────────────────────────────────────────────
ws2 = wb.create_sheet(title="円グラフ")

# PieChart 作成
chart = PieChart()
chart.title = "セクター別投資割合"

# データ参照（B2:B20 = 投資割合）
data_ref = Reference(ws1, min_col=2, min_row=1, max_row=len(sectors) + 1)
chart.add_data(data_ref, titles_from_data=True)

# ラベル参照（A2:A20 = セクター名）
label_ref = Reference(ws1, min_col=1, min_row=2, max_row=len(sectors) + 1)
chart.set_categories(label_ref)

# データラベル（%表示）
chart.dataLabels              = DataLabelList()
chart.dataLabels.showPercent  = True
chart.dataLabels.showCatName  = False
chart.dataLabels.showVal      = False
chart.dataLabels.showSerName  = False
chart.dataLabels.showLegendKey = False

# グラフサイズ（幅600px=約17cm, 高さ500px=約14cm）
chart.width  = 20   # cm
chart.height = 15   # cm

ws2.add_chart(chart, "B2")

# ─── 保存 ────────────────────────────────────────────────────────
output_path = "/home/user/nobuchin/sector_chart.xlsx"
wb.save(output_path)
print(f"完成: {output_path}")
print(f"合計割合: {total_pct}%  合計投資額: {total_amount:,}円")
