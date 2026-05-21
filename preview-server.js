const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'text/javascript',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png':  'image/png',
  '.avif': 'image/avif',
  '.webp': 'image/webp',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
};

http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';

  const filePath = path.join(ROOT, urlPath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found: ' + urlPath);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME[ext] || 'application/octet-stream';

    if (ext === '.html') {
      let html = data.toString('utf8');
      // Disable mobile redirect for local preview
      html = html.replace(
        /(<script>if\s*\(window\.innerWidth\s*<=\s*768\).*?<\/script>)/,
        '<!-- mobile redirect disabled for local preview -->'
      );
      // Neutralize Google Maps iframe to avoid blocking screenshots
      html = html.replace(
        /(<iframe[^>]*class="contacto-mapa"[^>]*)src="[^"]*"/,
        '$1src="about:blank"'
      );
      // Remove Google Fonts to avoid network block in local preview
      html = html.replace(
        /<link[^>]*fonts\.googleapis\.com[^>]*>/g,
        ''
      );
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(html, 'utf8');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    }
  });
}).listen(PORT, () => console.log('Preview server running on http://localhost:' + PORT));
