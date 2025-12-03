import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'

const md = new MarkdownIt({
  html: false,   // kein rohes HTML erlauben
  breaks: true,  // Zeilenumbrüche -> <br>
  linkify: true, // URLs automatisch verlinken
})

export function useMarkdown() {
  const render = (src: string) => {
    const raw = md.render(src || '')
    const clean = DOMPurify.sanitize(raw)
    return clean
  }
  return { render }
}
