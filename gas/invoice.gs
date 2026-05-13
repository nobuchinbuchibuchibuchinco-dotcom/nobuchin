/**
 * 請求書テンプレート生成スクリプト（適格請求書対応）
 *
 * 使い方:
 *   1. Google スプレッドシートを開く
 *   2. 「拡張機能」→「Apps Script」を開く
 *   3. このコードをエディタに貼り付けて保存
 *   4. 「実行」→「createInvoice」を実行
 *   5. スプレッドシートに「請求書」シートが作成される
 */

// ===== 請求書の設定（ここを編集してください） =====
var CONFIG = {
  invoiceNumber:      "INV-001",
  issueDate:          "2026/05/13",
  dueDate:            "2026/06/13",
  registrationNumber: "T1234567890123",   // 適格請求書発行事業者 登録番号

  issuerName:         "株式会社〇〇",
  issuerPostal:       "〒150-0001",
  issuerAddress:      "東京都渋谷区〇〇1-2-3",
  issuerPhone:        "03-0000-0000",
  issuerEmail:        "info@example.com",

  clientName:         "△△株式会社",
  clientPostal:       "〒160-0001",
  clientAddress:      "東京都新宿区△△4-5-6",

  bankName:           "〇〇銀行 〇〇支店",
  bankType:           "普通",
  bankNumber:         "1234567",
  bankHolder:         "カ）〇〇",

  notes: "・お振込手数料はご負担ください。\n・ご不明な点はお気軽にお問い合わせください。",

  // 明細行: [品目, 数量, 単価（税抜）, 税率（10 or 8）]
  items: [
    ["システム開発費",   1, 300000, 10],
    ["保守サポート費",   3,  50000, 10],
    ["食料品（軽減対象）", 2,  5000,  8],
  ],
};
// ===================================================

function createInvoice() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 既存シートを削除して再作成
  var existing = ss.getSheetByName("請求書");
  if (existing) ss.deleteSheet(existing);
  var sheet = ss.insertSheet("請求書");

  // 列幅設定
  sheet.setColumnWidth(1, 20);   // A: マージン
  sheet.setColumnWidth(2, 180);  // B: 品目
  sheet.setColumnWidth(3, 60);   // C: 数量
  sheet.setColumnWidth(4, 100);  // D: 単価
  sheet.setColumnWidth(5, 60);   // E: 税率
  sheet.setColumnWidth(6, 110);  // F: 金額
  sheet.setColumnWidth(7, 20);   // G: マージン
  sheet.setColumnWidth(8, 130);  // H: 発行者情報
  sheet.setColumnWidth(9, 20);   // I: マージン

  var row = 1;

  // ===== タイトル =====
  row++;
  var titleCell = sheet.getRange(row, 2, 1, 5);
  titleCell.merge().setValue("請　求　書")
    .setFontSize(22).setFontWeight("bold").setHorizontalAlignment("center")
    .setBackground("#1a1a2e").setFontColor("#ffffff");
  sheet.setRowHeight(row, 48);
  row++;

  // ===== 請求書番号・日付エリア =====
  row++;
  _label(sheet, row, 2, "請求書番号");
  _value(sheet, row, 3, CONFIG.invoiceNumber, 3);
  _label(sheet, row, 7, "発行日");
  _value(sheet, row, 8, CONFIG.issueDate);
  row++;
  _label(sheet, row, 2, "支払期限");
  _value(sheet, row, 3, CONFIG.dueDate, 3);
  _label(sheet, row, 7, "登録番号");
  _value(sheet, row, 8, CONFIG.registrationNumber);
  row += 2;

  // ===== 請求先 / 発行者 =====
  var clientStart = row;
  _label(sheet, row, 2, "請求先");
  _label(sheet, row, 7, "発行者");
  row++;
  sheet.getRange(row, 2, 1, 4).merge()
    .setValue(CONFIG.clientName + " 御中")
    .setFontSize(14).setFontWeight("bold")
    .setBorder(false, false, true, false, false, false, "#222222", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  _info(sheet, row, 8, CONFIG.issuerName, true);
  row++;
  _info(sheet, row, 2, CONFIG.clientPostal);
  _info(sheet, row, 8, CONFIG.issuerPostal);
  row++;
  _info(sheet, row, 2, CONFIG.clientAddress);
  _info(sheet, row, 8, CONFIG.issuerAddress);
  row++;
  _info(sheet, row, 8, "TEL: " + CONFIG.issuerPhone);
  row++;
  _info(sheet, row, 8, CONFIG.issuerEmail);
  row++;
  _info(sheet, row, 8, "登録番号：" + CONFIG.registrationNumber, false, "#777777", 10);
  row += 2;

  // ===== ご請求金額 =====
  var totals = _calcTotals(CONFIG.items);
  var amountRow = row;
  sheet.getRange(row, 2, 1, 7).merge()
    .setValue("ご請求金額（税込）：  ¥" + _fmt(totals.total))
    .setFontSize(16).setFontWeight("bold").setHorizontalAlignment("center")
    .setBackground("#f0f4ff")
    .setBorder(true, true, true, true, false, false, "#1a1a2e", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  sheet.setRowHeight(row, 40);
  row += 2;

  // ===== 明細ヘッダー =====
  var headerRange = sheet.getRange(row, 2, 1, 5);
  ["品目・内容", "数量", "単価（税抜）", "税率", "金額（税抜）"].forEach(function(h, i) {
    sheet.getRange(row, 2 + i).setValue(h)
      .setBackground("#1a1a2e").setFontColor("#ffffff")
      .setFontWeight("bold").setHorizontalAlignment("center")
      .setFontSize(11);
  });
  sheet.setRowHeight(row, 28);
  row++;

  // ===== 明細行 =====
  var itemStartRow = row;
  CONFIG.items.forEach(function(item, idx) {
    var desc = item[0], qty = item[1], price = item[2], tax = item[3];
    var amount = qty * price;
    var bg = idx % 2 === 0 ? "#ffffff" : "#f9f9f9";

    sheet.getRange(row, 2).setValue(desc + (tax === 8 ? " ※" : "")).setBackground(bg);
    sheet.getRange(row, 3).setValue(qty).setHorizontalAlignment("right").setBackground(bg);
    sheet.getRange(row, 4).setValue(price).setNumberFormat("#,##0").setHorizontalAlignment("right").setBackground(bg);
    sheet.getRange(row, 5).setValue(tax + "%" + (tax === 8 ? "※" : "")).setHorizontalAlignment("center").setBackground(bg);
    sheet.getRange(row, 6).setValue(amount).setNumberFormat("¥#,##0").setHorizontalAlignment("right").setBackground(bg);

    // 罫線
    sheet.getRange(row, 2, 1, 5).setBorder(false, false, true, false, false, false, "#dddddd", SpreadsheetApp.BorderStyle.SOLID);
    sheet.setRowHeight(row, 24);
    row++;
  });

  // ===== 集計 =====
  row++;
  var summaryCol = 4;
  if (totals.subtotal10 > 0) {
    _summaryRow(sheet, row++, "10%対象　小計", totals.subtotal10, false);
    _summaryRow(sheet, row++, "消費税（10%）", totals.tax10, false);
  }
  if (totals.subtotal8 > 0) {
    _summaryRow(sheet, row++, "8%対象　小計（軽減税率）※", totals.subtotal8, false);
    _summaryRow(sheet, row++, "消費税（8%）", totals.tax8, false);
  }
  _summaryRow(sheet, row++, "合計（税込）", totals.total, true);
  row++;

  // ===== 振込先 =====
  _label(sheet, row, 2, "振込先");
  row++;
  _info(sheet, row, 2, CONFIG.bankName + "　" + CONFIG.bankType + "　" + CONFIG.bankNumber);
  row++;
  _info(sheet, row, 2, "口座名義：" + CONFIG.bankHolder);
  row += 2;

  // ===== 備考 =====
  if (CONFIG.notes) {
    _label(sheet, row, 2, "備考");
    row++;
    CONFIG.notes.split("\n").forEach(function(line) {
      _info(sheet, row, 2, line);
      row++;
    });
    row++;
  }

  // ===== 軽減税率注記 =====
  if (totals.subtotal8 > 0) {
    sheet.getRange(row, 2, 1, 5).merge()
      .setValue("※ 軽減税率（8%）対象")
      .setFontSize(10).setFontColor("#777777").setItalic(true);
    row++;
  }

  // 印刷設定
  var pageRange = sheet.getDataRange();
  sheet.setFrozenRows(0);
  sheet.setTabColor("#1a1a2e");

  SpreadsheetApp.getUi().alert("✅ 請求書シートを作成しました！\n\n「ファイル」→「印刷」でPDF保存もできます。");
}

// ===== ヘルパー関数 =====

function _calcTotals(items) {
  var sub10 = 0, sub8 = 0;
  items.forEach(function(item) {
    var amount = item[1] * item[2];
    if (item[3] === 10) sub10 += amount;
    else sub8 += amount;
  });
  return {
    subtotal10: sub10,
    subtotal8:  sub8,
    tax10: Math.floor(sub10 * 0.10),
    tax8:  Math.floor(sub8  * 0.08),
    total: sub10 + sub8 + Math.floor(sub10 * 0.10) + Math.floor(sub8 * 0.08),
  };
}

function _fmt(n) {
  return n.toLocaleString();
}

function _label(sheet, row, col, text) {
  sheet.getRange(row, col).setValue(text)
    .setFontSize(10).setFontColor("#666666").setFontWeight("bold");
}

function _value(sheet, row, col, text, colspan) {
  var cell = colspan ? sheet.getRange(row, col, 1, colspan).merge() : sheet.getRange(row, col);
  cell.setValue(text).setFontSize(12).setFontWeight("bold").setFontColor("#222222");
}

function _info(sheet, row, col, text, bold, color, size) {
  sheet.getRange(row, col).setValue(text)
    .setFontSize(size || 11)
    .setFontWeight(bold ? "bold" : "normal")
    .setFontColor(color || "#444444");
}

function _summaryRow(sheet, row, label, amount, isTotal) {
  sheet.getRange(row, 4, 1, 2).merge().setValue(label)
    .setHorizontalAlignment("left")
    .setFontWeight(isTotal ? "bold" : "normal")
    .setFontSize(isTotal ? 12 : 11)
    .setBackground(isTotal ? "#f0f4ff" : "#ffffff")
    .setBorder(isTotal, false, isTotal, false, false, false, "#1a1a2e", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  sheet.getRange(row, 6).setValue(amount)
    .setNumberFormat("¥#,##0").setHorizontalAlignment("right")
    .setFontWeight(isTotal ? "bold" : "normal")
    .setFontSize(isTotal ? 12 : 11)
    .setBackground(isTotal ? "#f0f4ff" : "#ffffff")
    .setBorder(isTotal, false, isTotal, false, false, false, "#1a1a2e", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
}
