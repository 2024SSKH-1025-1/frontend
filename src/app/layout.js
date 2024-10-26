import localFont from "next/font/local";
import "./globals.css";

const goormSansBold = localFont({
  src: "./fonts/goorm-sans-bold.woff2",
  variable: "--font-goorm-bold",
  weight: "700"
});

const goormSansMedium = localFont({
  src: "./fonts/goorm-sans-medium.woff2",
  variable: "--font-goorm-medium",
  weight: "500"
});

const goormSansRegular = localFont({
  src: "./fonts/goorm-sans-regular.woff2",
  variable: "--font-goorm-regular",
  weight: "400"
});

export const metadata = {
  title: "RehabiTrainer AI",
  description: "Rehabilitate your body. Train yourself with Artificial Intelligence.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body
        className={`${goormSansRegular.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

export const runtime = 'edge';
