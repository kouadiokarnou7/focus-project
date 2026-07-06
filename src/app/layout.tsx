import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { AppProvider } from "@/context/AppContext";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FocusFlow - Compagnon Intelligent de Productivité",
  description: "FocusFlow combine la méthode Pomodoro, la gestion des tâches avancée et la gamification pour booster votre productivité au quotidien.",
  keywords: ["productivité", "pomodoro", "gestion de tâches", "kanban", "focus", "timer", "gamification"],
  authors: [{ name: "FocusFlow" }],
  openGraph: {
    title: "FocusFlow - Compagnon Intelligent de Productivité",
    description: "Combinez Pomodoro, Kanban et gamification pour une productivité maximale.",
    siteName: "FocusFlow",
    locale: "fr_FR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background-obsidian">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}

