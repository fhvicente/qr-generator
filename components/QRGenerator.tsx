"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";

/* =====================================================================
   QRkit — gerador. 100% client-side. qr-code-styling + jsPDF carregados
   dinamicamente (dependem de window/document, não podem correr no SSR).
   ===================================================================== */

type QRType = "url" | "wifi" | "email" | "phone" | "sms" | "vcard";
type EC = "L" | "M" | "Q" | "H";

// campos de cada formulário (labels/placeholders vêm das traduções)
type Field = { k: string; type?: "text" | "textarea" | "select"; hero?: boolean; opts?: string[] };
const FORMS: Record<QRType, Field[]> = {
  url: [{ k: "text", type: "textarea", hero: true }],
  wifi: [
    { k: "ssid" },
    { k: "pass" },
    { k: "enc", type: "select", opts: ["WPA", "WEP", "nopass"] },
  ],
  email: [{ k: "to", hero: true }, { k: "subj" }, { k: "body", type: "textarea" }],
  phone: [{ k: "num", hero: true }],
  sms: [{ k: "num", hero: true }, { k: "msg", type: "textarea" }],
  vcard: [{ k: "name", hero: true }, { k: "org" }, { k: "phone" }, { k: "email" }, { k: "url" }],
};

const TAB_ICONS: Record<QRType, React.ReactNode> = {
  url: <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />,
  wifi: (<><path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0" /><circle cx="12" cy="19.5" r="1" fill="currentColor" /></>),
  email: (<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>),
  phone: <path d="M5 4h4l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />,
  sms: <path d="M21 11.5a8.5 8.5 0 0 1-12 7.7L3 21l1.8-6A8.5 8.5 0 1 1 21 11.5z" />,
  vcard: (<><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="M5.5 16a3.5 3.5 0 0 1 7 0M15 9h4M15 13h4" /></>),
};

const TYPES: QRType[] = ["url", "wifi", "email", "phone", "sms", "vcard"];
const PREVIEW_PX = 300;

function escapeWifi(s: string) {
  return String(s || "").replace(/([\\;,:"])/g, "\\$1");
}

export default function QRGenerator() {
  const tTabs = useTranslations("tabs");
  const tForms = useTranslations("forms");
  const tCustom = useTranslations("customize");
  const tPreview = useTranslations("preview");
  const tExport = useTranslations("export");

  const [type, setType] = useState<QRType>("url");
  const [data, setData] = useState<Record<string, string>>({});
  const [fg, setFg] = useState("#16150f");
  const [bg, setBg] = useState("#ffffff");
  const [logo, setLogo] = useState<string | null>(null);
  const [ec, setEc] = useState<EC>("M");
  const [margin, setMargin] = useState(2);
  const [res, setRes] = useState(1024);
  const [copyMsg, setCopyMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<any>(null);
  const QRClassRef = useRef<any>(null);

  // ---- string de dados do QR conforme o tipo ----
  const buildData = useCallback(() => {
    const d = data;
    switch (type) {
      case "url":
        return (d.text || "").trim();
      case "wifi": {
        if (!(d.ssid || "").trim()) return "";
        const enc = d.enc || "WPA";
        const pass = enc === "nopass" ? "" : escapeWifi(d.pass || "");
        return `WIFI:T:${enc};S:${escapeWifi(d.ssid)};P:${pass};;`;
      }
      case "email": {
        if (!(d.to || "").trim()) return "";
        const p: string[] = [];
        if (d.subj) p.push("subject=" + encodeURIComponent(d.subj));
        if (d.body) p.push("body=" + encodeURIComponent(d.body));
        return `mailto:${d.to.trim()}${p.length ? "?" + p.join("&") : ""}`;
      }
      case "phone":
        return (d.num || "").trim() ? `tel:${d.num.replace(/\s+/g, "")}` : "";
      case "sms": {
        if (!(d.num || "").trim()) return "";
        const n = d.num.replace(/\s+/g, "");
        return d.msg ? `SMSTO:${n}:${d.msg}` : `sms:${n}`;
      }
      case "vcard": {
        if (!(d.name || "").trim()) return "";
        const L = ["BEGIN:VCARD", "VERSION:3.0", `FN:${d.name}`];
        if (d.org) L.push(`ORG:${d.org}`);
        if (d.phone) L.push(`TEL:${d.phone}`);
        if (d.email) L.push(`EMAIL:${d.email}`);
        if (d.url) L.push(`URL:${d.url}`);
        L.push("END:VCARD");
        return L.join("\n");
      }
    }
    return "";
  }, [type, data]);

  const value = buildData();
  const hasData = value.trim().length > 0;

  // opções partilhadas por preview e export
  const qrOptions = useCallback(
    (size: number, kind: "canvas" | "svg" = "canvas") => ({
      width: size,
      height: size,
      type: kind,
      data: buildData() || " ",
      margin: margin * (size / 40),
      qrOptions: { errorCorrectionLevel: ec },
      dotsOptions: { color: fg, type: "rounded" },
      backgroundOptions: { color: bg },
      cornersSquareOptions: { color: fg, type: "extra-rounded" },
      cornersDotOptions: { color: fg },
      image: logo || undefined,
      imageOptions: { crossOrigin: "anonymous", margin: 4, imageSize: 0.32, hideBackgroundDots: true },
    }),
    [buildData, margin, ec, fg, bg, logo]
  );

  // carrega a lib uma vez (client only)
  useEffect(() => {
    let active = true;
    import("qr-code-styling").then((mod) => {
      if (active) QRClassRef.current = mod.default;
    });
    return () => {
      active = false;
    };
  }, []);

  // render do preview com debounce ~300ms
  useEffect(() => {
    const id = setTimeout(() => {
      const QR = QRClassRef.current;
      if (!QR || !canvasRef.current) return;
      if (!hasData) {
        canvasRef.current.innerHTML = "";
        qrRef.current = null;
        return;
      }
      const opts = qrOptions(PREVIEW_PX);
      if (!qrRef.current) {
        qrRef.current = new QR(opts);
        canvasRef.current.innerHTML = "";
        qrRef.current.append(canvasRef.current);
      } else {
        qrRef.current.update(opts);
      }
    }, 300);
    return () => clearTimeout(id);
  }, [hasData, qrOptions]);

  // ---- export helpers ----
  function filename(ext: string) {
    const base =
      (type === "url" ? data.text || "qrcode" : type)
        .toString()
        .replace(/^https?:\/\//, "")
        .replace(/[^a-z0-9]+/gi, "-")
        .slice(0, 32)
        .replace(/^-|-$/g, "") || "qrcode";
    return `qrkit-${base}.${ext}`;
  }
  function makeExportQR(kind: "canvas" | "svg") {
    const QR = QRClassRef.current;
    return new QR(qrOptions(res, kind));
  }

  function downloadPng() {
    makeExportQR("canvas").download({ name: filename("png"), extension: "png" });
  }
  function downloadSvg() {
    makeExportQR("svg").download({ name: filename("svg"), extension: "svg" });
  }
  function downloadJpg() {
    makeExportQR("canvas").download({ name: filename("jpg"), extension: "jpeg" });
  }
  async function downloadPdf() {
    const blob: Blob = await makeExportQR("canvas").getRawData("png");
    const dataUrl: string = await new Promise((r) => {
      const fr = new FileReader();
      fr.onload = () => r(fr.result as string);
      fr.readAsDataURL(blob);
    });
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF({ unit: "mm", format: "a4" });
    const pageW = pdf.internal.pageSize.getWidth();
    const size = 100;
    const x = (pageW - size) / 2;
    pdf.addImage(dataUrl, "PNG", x, 40, size, size);
    pdf.setFontSize(10);
    pdf.setTextColor(120);
    pdf.text(tExport("pdfFooter"), pageW / 2, 40 + size + 12, { align: "center" });
    pdf.save(filename("pdf"));
  }
  async function copyImage() {
    try {
      const blob: Blob = await makeExportQR("canvas").getRawData("png");
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setCopyMsg({ text: tExport("copied"), ok: true });
    } catch {
      setCopyMsg({ text: tExport("copyFail"), ok: false });
    }
    setTimeout(() => setCopyMsg(null), 2500);
  }

  function onLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fr = new FileReader();
    fr.onload = () => setLogo(fr.result as string);
    fr.readAsDataURL(file);
  }

  // helper: label/placeholder traduzidos por campo
  const fLabel = (t: QRType, k: string) => tForms(`${t}.${k}_label`);
  // v4: t() lança em chave inexistente — verifica com has() (campos select não têm _ph)
  const fPh = (t: QRType, k: string) =>
    tForms.has(`${t}.${k}_ph`) ? tForms(`${t}.${k}_ph`) : "";

  const inputBase =
    "w-full font-body text-base text-ink bg-bg border-[1.5px] border-line rounded-[12px] px-[15px] py-[13px] transition focus:outline-none focus:border-ink focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--ink)_10%,transparent)]";

  return (
    <div className="grid grid-cols-1 overflow-hidden rounded-xl2 border border-line bg-surface shadow-soft md:grid-cols-[1fr_minmax(300px,380px)]">
      {/* ---------------- INPUT ---------------- */}
      <div className="min-w-0 p-[22px] pb-6">
        {/* TABS */}
        <div role="tablist" aria-label="QR type" className="mb-[18px] flex flex-wrap gap-1.5">
          {TYPES.map((tp) => {
            const selected = tp === type;
            return (
              <button
                key={tp}
                role="tab"
                aria-selected={selected}
                onClick={() => {
                  setType(tp);
                  setData({});
                }}
                className={`inline-flex items-center gap-1.5 rounded-full px-[13px] py-2 text-[0.86rem] font-semibold transition hover:-translate-y-0.5 ${
                  selected ? "bg-ink text-bg" : "bg-surface-2 text-ink-soft"
                }`}
              >
                <svg className="h-[15px] w-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {TAB_ICONS[tp]}
                </svg>
                {tTabs(tp)}
              </button>
            );
          })}
        </div>

        {/* FORM */}
        <div>
          {FORMS[type].map((f) => {
            const id = `f_${f.k}`;
            const val = data[f.k] ?? "";
            const common = {
              id,
              value: val,
              placeholder: fPh(type, f.k),
              onChange: (e: any) => setData((d) => ({ ...d, [f.k]: e.target.value })),
            };
            return (
              <div key={f.k} className="mb-3.5 last:mb-0">
                <label htmlFor={id} className="mb-[7px] block text-[0.82rem] font-semibold text-ink-soft">
                  {fLabel(type, f.k)}
                </label>
                {f.type === "textarea" ? (
                  <textarea {...common} className={`${inputBase} min-h-[120px] resize-y leading-relaxed ${f.hero ? "text-[1.12rem]" : ""}`} />
                ) : f.type === "select" ? (
                  <select
                    id={id}
                    value={val || (f.opts ? f.opts[0] : "")}
                    onChange={(e) => setData((d) => ({ ...d, [f.k]: e.target.value }))}
                    className={inputBase}
                  >
                    {f.opts?.map((o) => (
                      <option key={o} value={o}>
                        {o === "WPA" ? tForms("wifi.enc_wpa") : o === "WEP" ? tForms("wifi.enc_wep") : tForms("wifi.enc_none")}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input type="text" {...common} className={`${inputBase} ${f.hero ? "text-[1.12rem] py-[17px]" : ""}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* CUSTOMIZE — colapsado */}
        <details className="group mt-[18px] border-t border-dashed border-line pt-4">
          <summary className="flex cursor-pointer select-none list-none items-center gap-2.5 text-[0.92rem] font-semibold text-ink [&::-webkit-details-marker]:hidden">
            <svg className="text-ink-faint transition-transform group-open:rotate-90" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 6 6 6-6 6" />
            </svg>
            {tCustom("title")}
            <span className="ml-auto text-[0.72rem] font-semibold text-ink-faint">{tCustom("pill")}</span>
          </summary>

          <div className="grid animate-fade gap-4 pt-[18px]">
            {/* cores */}
            <div>
              <span className="mb-[7px] block text-[0.82rem] font-semibold text-ink-soft">{tCustom("colors")}</span>
              <div className="flex flex-wrap items-center gap-3.5">
                <span className="flex items-center gap-2.5">
                  <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} aria-label={tCustom("colorFg")} className="h-[42px] w-[42px] cursor-pointer rounded-[11px] border-[1.5px] border-line bg-transparent p-[3px]" />
                  <span className="text-[0.84rem] text-ink-soft">{tCustom("colorFg")}</span>
                </span>
                <span className="flex items-center gap-2.5">
                  <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} aria-label={tCustom("colorBg")} className="h-[42px] w-[42px] cursor-pointer rounded-[11px] border-[1.5px] border-line bg-transparent p-[3px]" />
                  <span className="text-[0.84rem] text-ink-soft">{tCustom("colorBg")}</span>
                </span>
              </div>
            </div>

            {/* logo */}
            <div>
              <span className="mb-[7px] block text-[0.82rem] font-semibold text-ink-soft">{tCustom("logo")}</span>
              <div className="flex flex-wrap items-center gap-3 rounded-[12px] border-[1.5px] border-dashed border-line px-3.5 py-3">
                <label className="cursor-pointer rounded-[10px] border border-line bg-surface-2 px-[13px] py-[9px] text-[0.84rem] font-semibold text-ink transition hover:-translate-y-0.5">
                  {tCustom("logoChoose")}
                  <input type="file" accept="image/*" onChange={onLogo} className="sr-only" />
                </label>
                {logo && (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logo} alt="" className="h-[38px] w-[38px] rounded-[9px] border border-line object-cover" />
                    <button type="button" onClick={() => setLogo(null)} className="rounded-[10px] border border-line bg-surface-2 px-[13px] py-[9px] text-[0.84rem] font-semibold text-ink transition hover:-translate-y-0.5">
                      {tCustom("logoRemove")}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* correção + margem */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="ec" className="mb-[7px] block text-[0.82rem] font-semibold text-ink-soft">{tCustom("ec")}</label>
                <select id="ec" value={ec} onChange={(e) => setEc(e.target.value as EC)} className={inputBase}>
                  <option value="L">{tCustom("ecL")}</option>
                  <option value="M">{tCustom("ecM")}</option>
                  <option value="Q">{tCustom("ecQ")}</option>
                  <option value="H">{tCustom("ecH")}</option>
                </select>
              </div>
              <div className="grid gap-1.5">
                <span className="block text-[0.82rem] font-semibold text-ink-soft">{tCustom("margin")}</span>
                <div className="flex justify-between text-[0.82rem] text-ink-soft">
                  <span>{tCustom("marginDesc")}</span>
                  <b className="font-semibold text-ink">{margin} {tCustom("marginUnit")}</b>
                </div>
                <input type="range" min={0} max={10} value={margin} onChange={(e) => setMargin(+e.target.value)} className="w-full accent-accent" />
              </div>
            </div>

            <p className="-mt-1.5 text-[0.78rem] text-ink-faint">{tCustom("hint")}</p>
          </div>
        </details>
      </div>

      {/* ---------------- PREVIEW + EXPORT ---------------- */}
      <div className="flex flex-col items-center gap-[18px] border-t border-line bg-surface-2 px-[22px] py-6 md:border-l md:border-t-0">
        {/* stage */}
        <div className="relative grid aspect-square w-full max-w-[300px] place-items-center rounded-[12px] bg-white p-3.5 shadow-soft">
          <div ref={canvasRef} aria-live="polite" className={`flex h-full w-full items-center justify-center ${hasData ? "" : "hidden"}`} />
          {!hasData && (
            <div className="flex flex-col items-center gap-2.5 px-5 text-center text-[0.9rem] text-ink-faint">
              <svg className="h-10 w-10 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
              <span>{tPreview("empty")}</span>
            </div>
          )}
        </div>

        {/* resolução */}
        <div className="w-full">
          <span id="resLbl" className="mb-[7px] block text-center text-[0.82rem] font-semibold text-ink-soft">{tExport("resolution")}</span>
          <div role="group" aria-labelledby="resLbl" className="grid grid-cols-3 gap-1 rounded-[12px] border border-line bg-bg p-1">
            {[512, 1024, 2048].map((r) => (
              <button
                key={r}
                type="button"
                aria-pressed={res === r}
                onClick={() => setRes(r)}
                className={`rounded-[9px] px-1 py-2 text-[0.82rem] font-semibold transition ${res === r ? "bg-ink text-bg" : "text-ink-soft"}`}
              >
                {r}px
              </button>
            ))}
          </div>
        </div>

        {/* export */}
        <div className="grid w-full grid-cols-2 gap-[9px]">
          <button disabled={!hasData} onClick={downloadPng} className="col-span-2 inline-flex items-center justify-center gap-2 rounded-[12px] border border-transparent bg-accent px-3 py-[15px] text-base font-bold text-accent-ink transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:translate-y-0">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14" /></svg>
            {tExport("downloadPng")}
          </button>
          <button disabled={!hasData} onClick={downloadSvg} className="rounded-[12px] border border-line bg-surface px-3 py-[13px] text-[0.92rem] font-bold text-ink transition hover:-translate-y-0.5 hover:border-ink-faint hover:shadow-soft disabled:cursor-not-allowed disabled:opacity-40 disabled:translate-y-0">{tExport("svg")}</button>
          <button disabled={!hasData} onClick={downloadJpg} className="rounded-[12px] border border-line bg-surface px-3 py-[13px] text-[0.92rem] font-bold text-ink transition hover:-translate-y-0.5 hover:border-ink-faint hover:shadow-soft disabled:cursor-not-allowed disabled:opacity-40 disabled:translate-y-0">{tExport("jpg")}</button>
          <button disabled={!hasData} onClick={downloadPdf} className="col-span-2 rounded-[12px] border border-line bg-surface px-3 py-[13px] text-[0.92rem] font-bold text-ink transition hover:-translate-y-0.5 hover:border-ink-faint hover:shadow-soft disabled:cursor-not-allowed disabled:opacity-40 disabled:translate-y-0">{tExport("pdf")}</button>
          <button disabled={!hasData} onClick={copyImage} className="col-span-2 inline-flex items-center justify-center gap-2 rounded-[12px] border border-line bg-surface px-3 py-[13px] text-[0.92rem] font-bold text-ink transition hover:-translate-y-0.5 hover:border-ink-faint hover:shadow-soft disabled:cursor-not-allowed disabled:opacity-40 disabled:translate-y-0">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>
            {tExport("copy")}
          </button>
        </div>
        <p aria-live="polite" className={`min-h-[18px] text-center text-[0.82rem] ${copyMsg?.ok ? "font-semibold text-[#1a9e57]" : "text-ink-faint"}`}>
          {copyMsg?.text}
        </p>
      </div>
    </div>
  );
}
