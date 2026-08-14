const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const DEFAULT_PORT = 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

function createServer(port) {
  const server = http.createServer((req, res) => {
    // CORS headers for local testing
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const parsedUrl = url.parse(req.url);
    let pathname = decodeURIComponent(parsedUrl.pathname);

    // Default to index.html if root
    if (pathname === '/') {
      pathname = '/index.html';
    }

    const filePath = path.join(__dirname, pathname);

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
          <div style="font-family: sans-serif; text-align: center; padding: 3rem;">
            <h1>404 - Không tìm thấy trang</h1>
            <p>Trang <code>${pathname}</code> không tồn tại.</p>
            <p><a href="/" style="color: #0284c7;">← Về Trang Chủ</a> | <a href="/edit.html" style="color: #f59e0b;">🛠️ Vào Studio Editor</a></p>
          </div>
        `);
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.writeHead(200, { 'Content-Type': contentType });
      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
    });
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️ Cổng ${port} đang bận, tự động chuyển sang cổng ${port + 1}...`);
      createServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });

  server.listen(port, () => {
    console.log('\n======================================================');
    console.log('🚀 DOULUO WIKI STUDIO SERVER ĐANG CHẠY!');
    console.log('======================================================');
    console.log(`🌐 Trang Chủ:      http://localhost:${port}/`);
    console.log(`🛠️ Studio Editor:  http://localhost:${port}/edit.html`);
    console.log(`👤 Hồn Sư:        http://localhost:${port}/hero.html`);
    console.log(`🦴 Hồn Hạch:       http://localhost:${port}/honhach.html`);
    console.log(`🦴 Hồn Cốt:        http://localhost:${port}/honcot.html`);
    console.log('======================================================');
    console.log('Nhấn Ctrl + C để dừng server.\n');
  });
}

createServer(DEFAULT_PORT);
