type Variant = "sidebar" | "inline" | "footer";

/*
  Slot de anúncio AdSense com altura reservada via CSS (zero CLS).
  Marca cada slot com comentário para inserir o publisher ID depois.
  Nunca sobrepõe nem empurra a ferramenta.
*/
const STYLES: Record<Variant, string> = {
  // 300x600 — coluna lateral desktop, escondido em mobile
  sidebar: "min-h-[600px] sticky top-[86px] hidden lg:flex",
  // bloco depois da ferramenta
  inline: "min-h-[120px] md:min-h-[160px] my-8",
  // banner de rodapé responsivo
  footer: "min-h-[100px] mb-7",
};

// data-ad-slot por variante (placeholders — troca pelos teus)
const SLOT_IDS: Record<Variant, string> = {
  sidebar: "0000000000",
  inline: "1111111111",
  footer: "2222222222",
};

export default function AdSlot({
  variant,
  label,
  className = "",
}: {
  variant: Variant;
  label: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`relative flex items-center justify-center overflow-hidden rounded-xl2 border border-line bg-ad text-[0.74rem] uppercase tracking-[0.08em] text-ink-faint ${STYLES[variant]} ${className}`}
    >
      <span className="absolute left-3 top-2 text-[0.62rem] opacity-60">{label}</span>

      {/* AdSense slot: ad-{variant} */}
      <ins
        className="adsbygoogle block"
        style={
          variant === "sidebar"
            ? { display: "inline-block", width: 300, height: 600 }
            : { display: "block" }
        }
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot={SLOT_IDS[variant]}
        {...(variant === "sidebar"
          ? {}
          : { "data-ad-format": "auto", "data-full-width-responsive": "true" })}
      />
      {/*
        Após inserir o publisher ID, ativa o push num <Script>:
        (adsbygoogle = window.adsbygoogle || []).push({})
      */}
    </div>
  );
}
