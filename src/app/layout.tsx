import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "calendarVLU 2.0",
  description: "Web app for VLU students to manage their schedule, export to Google Calendar, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
