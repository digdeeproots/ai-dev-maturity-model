import { marked } from 'marked'

export function useMarkdown() {
  function md(text: string): string {
    return marked.parse(text, { async: false }) as string
  }

  function mdList(items: string[]): string {
    return items.map(item => marked.parse(item, { async: false }) as string).join('')
  }

  return { md, mdList }
}
