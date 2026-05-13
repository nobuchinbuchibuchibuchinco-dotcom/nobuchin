"use client";

import { useState } from "react";
import styles from "./invoice.module.css";

type TaxRate = 10 | 8;

interface LineItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: TaxRate;
}

interface InvoiceData {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  registrationNumber: string;
  issuerName: string;
  issuerAddress: string;
  issuerPhone: string;
  issuerEmail: string;
  clientName: string;
  clientAddress: string;
  items: LineItem[];
  notes: string;
}

const today = new Date().toISOString().split("T")[0];
const due = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];

const defaultData: InvoiceData = {
  invoiceNumber: "INV-001",
  issueDate: today,
  dueDate: due,
  registrationNumber: "T1234567890123",
  issuerName: "株式会社〇〇",
  issuerAddress: "東京都渋谷区〇〇1-2-3",
  issuerPhone: "03-0000-0000",
  issuerEmail: "info@example.com",
  clientName: "△△株式会社",
  clientAddress: "東京都新宿区△△4-5-6",
  items: [
    { id: 1, description: "システム開発費", quantity: 1, unitPrice: 300000, taxRate: 10 },
    { id: 2, description: "保守サポート費", quantity: 3, unitPrice: 50000, taxRate: 10 },
  ],
  notes: "お振込手数料はご負担ください。",
};

function calcTotals(items: LineItem[]) {
  const subtotal10 = items
    .filter((i) => i.taxRate === 10)
    .reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const subtotal8 = items
    .filter((i) => i.taxRate === 8)
    .reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const tax10 = Math.floor(subtotal10 * 0.1);
  const tax8 = Math.floor(subtotal8 * 0.08);
  const total = subtotal10 + subtotal8 + tax10 + tax8;
  return { subtotal10, subtotal8, tax10, tax8, total };
}

function fmt(n: number) {
  return n.toLocaleString("ja-JP");
}

export default function InvoicePage() {
  const [data, setData] = useState<InvoiceData>(defaultData);
  const [editing, setEditing] = useState(true);
  const totals = calcTotals(data.items);

  const setField = <K extends keyof InvoiceData>(key: K, value: InvoiceData[K]) =>
    setData((d) => ({ ...d, [key]: value }));

  const updateItem = (id: number, field: keyof LineItem, value: string | number) =>
    setData((d) => ({
      ...d,
      items: d.items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));

  const addItem = () =>
    setData((d) => ({
      ...d,
      items: [
        ...d.items,
        { id: Date.now(), description: "", quantity: 1, unitPrice: 0, taxRate: 10 },
      ],
    }));

  const removeItem = (id: number) =>
    setData((d) => ({ ...d, items: d.items.filter((i) => i.id !== id) }));

  return (
    <div className={styles.page}>
      {editing && (
        <div className={styles.toolbar}>
          <h2 className={styles.toolbarTitle}>請求書エディタ</h2>
          <button className={styles.previewBtn} onClick={() => setEditing(false)}>
            プレビュー・印刷
          </button>
        </div>
      )}

      {editing ? (
        <div className={styles.editor}>
          <section className={styles.section}>
            <h3>基本情報</h3>
            <div className={styles.grid2}>
              <label>
                請求書番号
                <input value={data.invoiceNumber} onChange={(e) => setField("invoiceNumber", e.target.value)} />
              </label>
              <label>
                登録番号（インボイス）
                <input value={data.registrationNumber} onChange={(e) => setField("registrationNumber", e.target.value)} />
              </label>
              <label>
                発行日
                <input type="date" value={data.issueDate} onChange={(e) => setField("issueDate", e.target.value)} />
              </label>
              <label>
                支払期限
                <input type="date" value={data.dueDate} onChange={(e) => setField("dueDate", e.target.value)} />
              </label>
            </div>
          </section>

          <section className={styles.section}>
            <h3>発行者情報</h3>
            <div className={styles.grid2}>
              <label>
                会社名・氏名
                <input value={data.issuerName} onChange={(e) => setField("issuerName", e.target.value)} />
              </label>
              <label>
                電話番号
                <input value={data.issuerPhone} onChange={(e) => setField("issuerPhone", e.target.value)} />
              </label>
              <label>
                住所
                <input value={data.issuerAddress} onChange={(e) => setField("issuerAddress", e.target.value)} />
              </label>
              <label>
                メールアドレス
                <input value={data.issuerEmail} onChange={(e) => setField("issuerEmail", e.target.value)} />
              </label>
            </div>
          </section>

          <section className={styles.section}>
            <h3>請求先情報</h3>
            <div className={styles.grid2}>
              <label>
                会社名・氏名
                <input value={data.clientName} onChange={(e) => setField("clientName", e.target.value)} />
              </label>
              <label>
                住所
                <input value={data.clientAddress} onChange={(e) => setField("clientAddress", e.target.value)} />
              </label>
            </div>
          </section>

          <section className={styles.section}>
            <h3>明細</h3>
            <table className={styles.editorTable}>
              <thead>
                <tr>
                  <th>品目・内容</th>
                  <th>数量</th>
                  <th>単価（税抜）</th>
                  <th>税率</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <input
                        value={item.description}
                        onChange={(e) => updateItem(item.id, "description", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min={0}
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, "unitPrice", Number(e.target.value))}
                      />
                    </td>
                    <td>
                      <select
                        value={item.taxRate}
                        onChange={(e) => updateItem(item.id, "taxRate", Number(e.target.value) as TaxRate)}
                      >
                        <option value={10}>10%</option>
                        <option value={8}>8%（軽減）</option>
                      </select>
                    </td>
                    <td>
                      <button className={styles.removeBtn} onClick={() => removeItem(item.id)}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className={styles.addBtn} onClick={addItem}>＋ 明細を追加</button>
          </section>

          <section className={styles.section}>
            <h3>備考</h3>
            <textarea
              value={data.notes}
              onChange={(e) => setField("notes", e.target.value)}
              rows={3}
            />
          </section>
        </div>
      ) : (
        <div className={styles.printArea}>
          <div className={styles.printToolbar}>
            <button className={styles.editBtn} onClick={() => setEditing(true)}>← 編集に戻る</button>
            <button className={styles.printBtn} onClick={() => window.print()}>印刷 / PDFで保存</button>
          </div>

          <div className={styles.invoice}>
            <div className={styles.invoiceHeader}>
              <h1 className={styles.invoiceTitle}>請　求　書</h1>
              <div className={styles.invoiceMeta}>
                <p>請求書番号：{data.invoiceNumber}</p>
                <p>発行日：{data.issueDate.replace(/-/g, "/")}</p>
                <p>支払期限：{data.dueDate.replace(/-/g, "/")}</p>
              </div>
            </div>

            <div className={styles.parties}>
              <div className={styles.client}>
                <p className={styles.clientName}>{data.clientName} 御中</p>
                <p className={styles.clientAddress}>{data.clientAddress}</p>
              </div>
              <div className={styles.issuer}>
                <p className={styles.issuerName}>{data.issuerName}</p>
                <p>{data.issuerAddress}</p>
                <p>TEL: {data.issuerPhone}</p>
                <p>{data.issuerEmail}</p>
                <p className={styles.regNumber}>登録番号：{data.registrationNumber}</p>
              </div>
            </div>

            <div className={styles.totalBox}>
              <span>ご請求金額（税込）</span>
              <span className={styles.totalAmount}>¥{fmt(totals.total)}</span>
            </div>

            <table className={styles.itemTable}>
              <thead>
                <tr>
                  <th className={styles.colDesc}>品目・内容</th>
                  <th className={styles.colNum}>数量</th>
                  <th className={styles.colPrice}>単価</th>
                  <th className={styles.colTax}>税率</th>
                  <th className={styles.colAmount}>金額（税抜）</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.description}{item.taxRate === 8 ? " ※" : ""}</td>
                    <td className={styles.right}>{item.quantity}</td>
                    <td className={styles.right}>¥{fmt(item.unitPrice)}</td>
                    <td className={styles.center}>{item.taxRate}%{item.taxRate === 8 ? "※" : ""}</td>
                    <td className={styles.right}>¥{fmt(item.quantity * item.unitPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className={styles.summaryArea}>
              <table className={styles.summaryTable}>
                <tbody>
                  {totals.subtotal10 > 0 && (
                    <>
                      <tr>
                        <td>10%対象 小計</td>
                        <td className={styles.right}>¥{fmt(totals.subtotal10)}</td>
                      </tr>
                      <tr>
                        <td>消費税（10%）</td>
                        <td className={styles.right}>¥{fmt(totals.tax10)}</td>
                      </tr>
                    </>
                  )}
                  {totals.subtotal8 > 0 && (
                    <>
                      <tr>
                        <td>8%対象 小計（軽減税率）※</td>
                        <td className={styles.right}>¥{fmt(totals.subtotal8)}</td>
                      </tr>
                      <tr>
                        <td>消費税（8%）</td>
                        <td className={styles.right}>¥{fmt(totals.tax8)}</td>
                      </tr>
                    </>
                  )}
                  <tr className={styles.totalRow}>
                    <td>合計（税込）</td>
                    <td className={styles.right}>¥{fmt(totals.total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {data.notes && (
              <div className={styles.notesArea}>
                <p className={styles.notesLabel}>備考</p>
                <p>{data.notes}</p>
              </div>
            )}

            {totals.subtotal8 > 0 && (
              <p className={styles.footnote}>※ 軽減税率（8%）対象</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
