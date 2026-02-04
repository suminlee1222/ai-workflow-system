import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <title>업무 자동화</title>
      </head>
      <body className="bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  )
}
