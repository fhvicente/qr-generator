import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import QRGenerator from "@/components/QRGenerator";
import AdSlot from "@/components/AdSlot";
import Reveal from "@/components/Reveal";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const tHero = await getTranslations("hero");
  const tTrust = await getTranslations("trust");
  const tSec = await getTranslations("sections");
  const tFaq = await getTranslations("faq");
  const tFoot = await getTranslations("footer");
  const tAds = await getTranslations("ads");
  const adLabel = tAds("label");

  const cases = [
    { t: tSec("case1Title"), d: tSec("case1Desc"), icon: <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" /> },
    { t: tSec("case2Title"), d: tSec("case2Desc"), icon: <><path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0" /><circle cx="12" cy="19.5" r="1" fill="currentColor" /></> },
    { t: tSec("case3Title"), d: tSec("case3Desc"), icon: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="M5.5 16a3.5 3.5 0 0 1 7 0M15 9h4M15 13h4" /></> },
    { t: tSec("case4Title"), d: tSec("case4Desc"), icon: <><path d="M3 9 12 3l9 6v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 21V12h6v9" /></> },
  ];

  const faqs = [1, 2, 3, 4, 5].map((n) => ({ q: tFaq(`q${n}`), a: tFaq(`a${n}`), open: n === 1 }));

  return (
    <>
      <Reveal />
      <a href="#tool" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-[10px] focus:bg-ink focus:px-4 focus:py-2.5 focus:text-bg">
        ↧
      </a>

      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-line backdrop-blur-md" style={{ background: "color-mix(in srgb, var(--bg) 82%, transparent)" }}>
        <div className="mx-auto flex h-[66px] max-w-site items-center justify-between px-[22px]">
          <Link href="/" className="flex items-center gap-[11px] font-display text-[1.22rem] font-extrabold tracking-tight">
            <span className="grid h-[34px] w-[34px] place-items-center rounded-[9px] bg-ink text-bg" aria-hidden="true">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><path d="M14 14h3v3M20 14v.01M14 20h.01M17 20h.01M20 17v4" strokeLinecap="round" /></svg>
            </span>
            QRkit
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main>
        {/* HERO + FERRAMENTA */}
        <section id="tool" className="pb-[26px] pt-[30px]">
          <div className="mx-auto max-w-site px-[22px]">
            <div className="mx-auto mb-[26px] max-w-[720px] text-center">
              <span className="mb-[18px] inline-flex items-center gap-2 rounded-full border border-line bg-surface-2 px-[13px] py-1.5 text-[0.78rem] font-bold uppercase tracking-wide text-ink-soft">
                <span className="h-[7px] w-[7px] rounded-full bg-accent" />
                {tHero("badge")}
              </span>
              <h1 className="m-0 mb-3.5 font-display text-[clamp(2.1rem,5.4vw,3.5rem)] font-extrabold leading-[1.02] tracking-[-0.035em]">
                {tHero("title1")} <em className="not-italic text-accent">{tHero("titleEm")}</em> {tHero("title2")}
              </h1>
              <p className="m-0 text-[1.08rem] text-ink-soft">{tHero("subtitle")}</p>
            </div>

            <div className="grid grid-cols-1 items-start gap-[26px] lg:grid-cols-[minmax(0,1fr)_300px]">
              <QRGenerator />
              <aside>
                <AdSlot variant="sidebar" label={adLabel} />
              </aside>
            </div>

            {/* faixa de confiança */}
            <div className="mt-[22px] flex flex-wrap justify-center gap-x-[22px] gap-y-2 text-[0.88rem] text-ink-soft">
              <span className="inline-flex items-center gap-[7px]"><CheckIcon />{tTrust("free")}</span>
              <span className="inline-flex items-center gap-[7px]"><CheckIcon />{tTrust("noLogin")}</span>
              <span className="inline-flex items-center gap-[7px]">
                <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
                {tTrust("local")}
              </span>
            </div>
          </div>
        </section>

        {/* CONTEÚDO SEO */}
        <div className="mx-auto max-w-site px-[22px] pb-2.5 pt-[18px]">
          {/* anúncio inline */}
          <AdSlot variant="inline" label={adLabel} className="reveal" />

          <section id="about" className="reveal border-t border-line py-10">
            <h2 className="m-0 mb-2 font-display text-[clamp(1.6rem,3.6vw,2.3rem)] font-extrabold tracking-tight">{tSec("aboutTitle")}</h2>
            <p className="m-0 mb-[26px] max-w-[680px] text-[1.05rem] text-ink-soft">{tSec("aboutLead")}</p>
            <div className="space-y-4">
              <p className="max-w-[720px] text-ink-soft">{tSec("aboutP1")}</p>
              <p className="max-w-[720px] text-ink-soft">{tSec("aboutP2")}</p>
            </div>
          </section>

          <section id="cases" className="reveal border-t border-line py-10">
            <h2 className="m-0 mb-2 font-display text-[clamp(1.6rem,3.6vw,2.3rem)] font-extrabold tracking-tight">{tSec("casesTitle")}</h2>
            <p className="m-0 mb-[26px] max-w-[680px] text-[1.05rem] text-ink-soft">{tSec("casesLead")}</p>
            <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
              {cases.map((c, i) => (
                <div key={i} className="rounded-xl2 border border-line bg-surface p-[22px] transition hover:-translate-y-1 hover:shadow-soft">
                  <div className="mb-3.5 grid h-10 w-10 place-items-center rounded-[11px] bg-surface-2 text-accent">
                    <svg className="h-[21px] w-[21px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{c.icon}</svg>
                  </div>
                  <h3 className="m-0 mb-1.5 font-display text-[1.12rem] font-bold tracking-tight">{c.t}</h3>
                  <p className="m-0 text-[0.94rem] text-ink-soft">{c.d}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="faq" className="reveal border-t border-line py-10">
            <h2 className="m-0 mb-2 font-display text-[clamp(1.6rem,3.6vw,2.3rem)] font-extrabold tracking-tight">{tFaq("title")}</h2>
            <p className="m-0 mb-[26px] max-w-[680px] text-[1.05rem] text-ink-soft">{tFaq("lead")}</p>
            <div className="grid max-w-[780px] gap-2.5">
              {faqs.map((f, i) => (
                <details key={i} open={f.open} className="group rounded-[12px] border border-line bg-surface px-[18px] py-0.5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3.5 py-4 text-[1.02rem] font-semibold [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span className="flex-none text-[1.3rem] leading-none text-accent transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="m-0 mb-4 text-ink-soft">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        </div>

        {/* banner de rodapé */}
        <div className="mx-auto max-w-site px-[22px]">
          <AdSlot variant="footer" label={adLabel} />
        </div>
      </main>

      {/* FOOTER */}
      <footer className="mt-5 border-t border-line py-9 text-[0.92rem] text-ink-soft">
        <div className="mx-auto flex max-w-site flex-wrap items-center justify-between gap-[18px] px-[22px]">
          <div>
            <strong>QRkit</strong> · {tFoot("tagline")}
            <br />
            <span className="text-ink-faint">{tFoot("sub")}</span>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap gap-5">
            <a href="#about" className="no-underline hover:text-ink">{tFoot("about")}</a>
            <a href="#faq" className="no-underline hover:text-ink">{tFoot("faq")}</a>
            <a href="#about" className="no-underline hover:text-ink">{tFoot("privacy")}</a>
          </nav>
        </div>
      </footer>
    </>
  );
}

function CheckIcon() {
  return (
    <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
