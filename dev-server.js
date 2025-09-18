import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = 8080

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
}

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`)
  
  let filePath = req.url === '/' ? './index.html' : '.' + req.url
  
  // Handle React Router routes - serve index.html for non-file requests
  if (!path.extname(filePath) && !filePath.includes('.')) {
    filePath = './index.html'
  }
  
  const extname = path.extname(filePath).toLowerCase()
  const contentType = mimeTypes[extname] || 'application/octet-stream'
  
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // File not found, serve index.html for SPA routing
        fs.readFile('./index.html', (err, indexContent) => {
          if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' })
            res.end('404 Not Found')
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' })
            res.end(indexContent, 'utf-8')
          }
        })
      } else {
        res.writeHead(500)
        res.end(`Server Error: ${error.code}`)
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType })
      res.end(content, 'utf-8')
    }
  })
})

server.listen(PORT, () => {
  console.log(`\n🚀 Development server running at:`)
  console.log(`   Local:   http://localhost:${PORT}`)
  console.log(`   Network: http://localhost:${PORT}\n`)
  console.log('📱 Ready to test Phase 1 components!')
})