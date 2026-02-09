import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <title>업무 판단 보조 시스템</title>
      </head>
      <body className="min-h-screen bg-neutral-100 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  )
}
