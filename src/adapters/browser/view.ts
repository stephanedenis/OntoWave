const app = document.getElementById('app')!
const sidebar = document.getElementById('sidebar')
const toc = document.getElementById('toc')

export const browserView = {
  setHtml(html: string) { app.innerHTML = html },
  setTitle(title: string) { document.title = title },
  setSidebar(html: string) { if (sidebar) sidebar.innerHTML = html },
  setToc(html: string) { if (toc) toc.innerHTML = html },
}
