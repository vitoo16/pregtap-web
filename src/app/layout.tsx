import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "PregTap - Người bạn đồng hành thai kỳ",
  description: "Nền tảng chăm sóc thai kỳ toàn diện. Bắt đầu hành trình làm mẹ an tâm, khoa học và ngập tràn niềm vui.",
  keywords: ["pregnancy", "thai kỳ", "chăm sóc thai kỳ", "mang thai", "pregnancy tracker"],
  icons: {
    icon: "/splash_logo_embedded.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${nunito.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
