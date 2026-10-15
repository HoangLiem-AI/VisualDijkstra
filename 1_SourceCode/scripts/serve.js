// serve.js — Server tĩnh tối giản để mở giao diện web trên máy, không cần cài thêm gói.
// (Trình duyệt chặn ES modules khi mở index.html trực tiếp bằng file://, nên cần server.)
// Cách dùng:  node scripts/serve.js [cổng]     mặc định cổng 8080

import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.argv[2] || process.env.PORT || 8080);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.in': 'text/plain; charset=utf-8',
  '.out': 'text/plain; charset=utf-8',
};

const server = http.createServer(async (req, res) => {
  let path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  if (path.endsWith('/')) path += 'index.html';

  // Chặn truy cập ra ngoài thư mục 1_SourceCode
  const file = resolve(ROOT, '.' + path);
  if (!file.startsWith(ROOT + sep)) {
    res.writeHead(403).end('403 Forbidden');
    return;
  }

  try {
    const body = await readFile(file);
    res.writeHead(200, {
      'Content-Type': MIME[extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store', // luôn lấy bản mới khi sửa code
    });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end(`404: không tìm thấy ${path}`);
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Cổng ${PORT} đang bận. Thử cổng khác: node scripts/serve.js 8081`);
    process.exit(1);
  }
  throw err;
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Đang chạy giao diện tại: http://localhost:${PORT}`);
  console.log('Nhấn Ctrl+C để dừng.');
});
