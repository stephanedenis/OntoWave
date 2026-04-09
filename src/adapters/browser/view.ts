export const browserView = {
  setHtml(html: string) {
    const app = document.getElementById('app')
    if (app) app.innerHTML = html
  },
  setTitle(title: string) { document.title = title },
  setSidebar(html: string) {
    const sidebar = document.getElementById('sidebar')
    if (sidebar) sidebar.innerHTML = html
  },
  setToc(html: string) {
    const toc = document.getElementById('toc')
    if (toc) toc.innerHTML = html
  },
}
