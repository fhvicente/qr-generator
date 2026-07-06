import createNextIntlPlugin from "next-intl/plugin";

// Aponta para o ficheiro de configuração de pedido do next-intl
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default withNextIntl(nextConfig);
