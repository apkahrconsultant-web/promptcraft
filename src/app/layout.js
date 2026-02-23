import './globals.css'

export const metadata = {
  title: 'PromptCraft AI — Turn any idea into a perfect AI prompt',
  description: 'Stop guessing how to talk to AI. PromptCraft generates optimized, structured prompts in 3 levels — Basic, Advanced, and Expert. Works with GPT-4, Claude, Gemini.',
  keywords: 'AI prompts, prompt engineering, ChatGPT prompts, Claude prompts, Gemini prompts',
  openGraph: {
    title: 'PromptCraft AI',
    description: 'Turn any idea into a perfect AI prompt in seconds.',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Syne:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
