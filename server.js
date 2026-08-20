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

    // Handle API endpoints
    if (pathname.startsWith('/api/')) {
      if (req.method === 'GET' && pathname === '/api/screenshots') {
        const screenshotsDir = path.join(__dirname, 'screenshots');
        let files = [];
        if (fs.existsSync(screenshotsDir)) {
          files = fs.readdirSync(screenshotsDir)
            .filter(f => /\.(png|jpe?g|webp)$/i.test(f))
            .map(f => {
              const stat = fs.statSync(path.join(screenshotsDir, f));
              return {
                name: f,
                url: `/screenshots/${encodeURIComponent(f)}`,
                size: stat.size,
                mtime: stat.mtime
              };
            })
            .sort((a, b) => a.name.localeCompare(b.name));
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, count: files.length, files }));
        return;
      }

      if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
          try {
            const data = JSON.parse(body || '{}');

            if (pathname === '/api/save-honcot') {
              const honcotFile = path.join(__dirname, 'data', 'honcot.json');
              let list = [];
              if (fs.existsSync(honcotFile)) {
                try {
                  list = JSON.parse(fs.readFileSync(honcotFile, 'utf8') || '[]');
                } catch(e) { list = []; }
              }
              const item = data.item;
              if (!item || !item.id) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Thiếu thông tin item hoặc id' }));
                return;
              }
              const existingIdx = list.findIndex(h => h.id === item.id);
              if (existingIdx >= 0) {
                list[existingIdx] = item;
              } else {
                list.push(item);
              }
              fs.writeFileSync(honcotFile, JSON.stringify(list, null, 2), 'utf8');
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, count: list.length, item }));
              return;
            }

            if (pathname === '/api/save-batch-honcot') {
              const honcotFile = path.join(__dirname, 'data', 'honcot.json');
              let list = [];
              if (fs.existsSync(honcotFile)) {
                try {
                  list = JSON.parse(fs.readFileSync(honcotFile, 'utf8') || '[]');
                } catch(e) { list = []; }
              }
              const items = data.items || [];
              let added = 0, updated = 0;
              for (const item of items) {
                if (!item || !item.id) continue;
                const idx = list.findIndex(h => h.id === item.id);
                if (idx >= 0) {
                  list[idx] = item;
                  updated++;
                } else {
                  list.push(item);
                  added++;
                }
              }
              fs.writeFileSync(honcotFile, JSON.stringify(list, null, 2), 'utf8');
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, total: list.length, added, updated }));
              return;
            }

            if (pathname === '/api/upload-icon') {
              const { filename, base64Data } = data;
              if (!base64Data) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Thiếu base64Data' }));
                return;
              }
              const uploadsDir = path.join(__dirname, 'assets', 'uploads');
              if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
              const safeName = (filename || `icon_${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '_') + '.png';
              const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
              const buffer = Buffer.from(cleanBase64, 'base64');
              const targetPath = path.join(uploadsDir, safeName);
              fs.writeFileSync(targetPath, buffer);
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, iconPath: `assets/uploads/${safeName}` }));
              return;
            }

            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Endpoint không tồn tại' }));
          } catch(err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        });
        return;
      }
    }

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
