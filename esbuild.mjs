import * as esbuild from 'esbuild'
import dotenv from 'dotenv'
import { spawn } from 'node:child_process'
import { createServer, request as httpRequest } from 'node:http'
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { resolvePublicPath } from './scripts/resolve-public-path.mjs'

dotenv.config()

const root = dirname(fileURLToPath(import.meta.url))
const distDir = join(root, 'dist')
const cssOutFile = join(distDir, 'main.css')
const command = process.argv[2] ?? 'build'
const isProd = command === 'build' || command === 'preview'
const publicPath = resolvePublicPath({
  isProd: command === 'build',
  envPublicPath: process.env.PUBLIC_PATH,
})

function loadDefine() {
  const redirectSignIn =
    process.env.AWS_REDIRECT_SIGN_IN ?? 'http://localhost:3000/'
  const redirectSignOut =
    process.env.AWS_REDIRECT_SIGN_OUT ?? redirectSignIn

  return {
    GOOGLE_CLIENT_ID: JSON.stringify(process.env.GOOGLE_CLIENT_ID ?? ''),
    AWS_REGION: JSON.stringify(process.env.AWS_REGION ?? ''),
    AWS_USER_POOL_ID: JSON.stringify(process.env.AWS_USER_POOL_ID ?? ''),
    AWS_USER_POOL_CLIENT_ID: JSON.stringify(
      process.env.AWS_USER_POOL_CLIENT_ID ?? '',
    ),
    AWS_COGNITO_DOMAIN: JSON.stringify(process.env.AWS_COGNITO_DOMAIN ?? ''),
    AWS_REDIRECT_SIGN_IN: JSON.stringify(redirectSignIn),
    AWS_REDIRECT_SIGN_OUT: JSON.stringify(redirectSignOut),
    DEFAULT_API_BASE_URL: JSON.stringify(
      process.env.DEFAULT_API_BASE_URL ??
        'https://autoshopapiservice.onrender.com',
    ),
  }
}

/** CSS is built by Tailwind CLI into dist/main.css and linked from index.html. */
const ignoreCssPlugin = {
  name: 'ignore-css',
  setup(build) {
    build.onLoad({ filter: /\.css$/ }, () => ({
      contents: '',
      loader: 'js',
    }))
  },
}

function cleanDist() {
  rmSync(distDir, { recursive: true, force: true })
  mkdirSync(distDir, { recursive: true })
}

function copyPublicAssets() {
  const publicDir = join(root, 'public')
  if (!existsSync(publicDir)) return
  cpSync(publicDir, distDir, { recursive: true })
}

function writeIndexHtml(jsPath) {
  const template = readFileSync(join(root, 'index.html'), 'utf8')
  const tags = [
    `<link rel="stylesheet" href="${publicPath}main.css">`,
    `<script type="module" src="${publicPath}${jsPath}"></script>`,
  ]

  const html = template.replace(
    '</head>',
    `    ${tags.join('\n    ')}\n  </head>`,
  )

  writeFileSync(join(distDir, 'index.html'), html)
}

function toDistRelative(file) {
  const normalized = file.replace(/\\/g, '/')
  const base = distDir.replace(/\\/g, '/')
  if (normalized.startsWith(`${base}/`)) {
    return normalized.slice(base.length + 1)
  }
  return normalized.split('/').pop() ?? file
}

function getJsOutputPath(result) {
  const outputs = result.metafile?.outputs ?? {}

  for (const [file, info] of Object.entries(outputs)) {
    const relative = toDistRelative(file)
    if (info.entryPoint?.endsWith('src/main.tsx') && relative.endsWith('.js')) {
      return relative
    }
  }

  return 'main.js'
}

function runTailwindCss({ watch = false, minify = false } = {}) {
  return new Promise((resolve, reject) => {
    const args = [
      '@tailwindcss/cli',
      '-i',
      join(root, 'src/index.css'),
      '-o',
      cssOutFile,
    ]

    if (minify) args.push('--minify')
    if (watch) args.push('--watch')

    const child = spawn('npx', args, {
      cwd: root,
      stdio: 'inherit',
      shell: false,
    })

    if (watch) {
      child.on('spawn', () => resolve(child))
      child.on('error', reject)
      return
    }

    child.on('exit', (code) => {
      if (code === 0) resolve(undefined)
      else reject(new Error(`Tailwind CSS build failed (exit ${code})`))
    })
    child.on('error', reject)
  })
}

function createJsBuildOptions() {
  return {
    entryPoints: [join(root, 'src/main.tsx')],
    bundle: true,
    outdir: distDir,
    entryNames: isProd ? '[name]-[hash]' : '[name]',
    assetNames: 'assets/[name]-[hash]',
    publicPath,
    format: 'esm',
    platform: 'browser',
    target: ['es2020'],
    sourcemap: true,
    minify: isProd,
    jsx: 'automatic',
    define: loadDefine(),
    metafile: true,
    logLevel: 'info',
    loader: {
      '.png': 'file',
      '.jpg': 'file',
      '.jpeg': 'file',
      '.gif': 'file',
      '.svg': 'file',
      '.webp': 'file',
    },
    plugins: [ignoreCssPlugin],
  }
}

async function buildOnce() {
  cleanDist()

  await runTailwindCss({ minify: isProd })
  const result = await esbuild.build(createJsBuildOptions())

  copyPublicAssets()
  writeIndexHtml(getJsOutputPath(result))

  return result
}

async function startDev() {
  cleanDist()
  copyPublicAssets()

  const tailwindProcess = await runTailwindCss({ watch: true })

  const ctx = await esbuild.context(createJsBuildOptions())

  const rebuildAndWriteHtml = async () => {
    const result = await ctx.rebuild()
    writeIndexHtml(getJsOutputPath(result))
    return result
  }

  await ctx.watch()
  await rebuildAndWriteHtml()

  const { port: assetPort } = await ctx.serve({
    servedir: distDir,
    port: 0,
    fallback: 'index.html',
  })

  const devPort = 3000
  const apiTarget = { host: '127.0.0.1', port: 3001 }

  const devServer = createServer((req, res) => {
    const url = req.url ?? '/'

    if (url.startsWith('/api')) {
      const proxyReq = httpRequest(
        {
          hostname: apiTarget.host,
          port: apiTarget.port,
          path: url,
          method: req.method,
          headers: {
            ...req.headers,
            host: `${apiTarget.host}:${apiTarget.port}`,
          },
        },
        (proxyRes) => {
          res.writeHead(proxyRes.statusCode ?? 502, proxyRes.headers)
          proxyRes.pipe(res)
        },
      )

      proxyReq.on('error', () => {
        res.writeHead(502, { 'Content-Type': 'text/plain' })
        res.end(
          'Notification API is not running. Start it with: npm run server',
        )
      })

      req.pipe(proxyReq)
      return
    }

    // Rewrite Host so esbuild serve accepts *.localhost (and other) Host headers.
    // Webpack equivalent: devServer.allowedHosts = 'all'
    const assetReq = httpRequest(
      {
        hostname: '127.0.0.1',
        port: assetPort,
        path: url,
        method: req.method,
        headers: {
          ...req.headers,
          host: `127.0.0.1:${assetPort}`,
        },
      },
      (assetRes) => {
        res.writeHead(assetRes.statusCode ?? 500, assetRes.headers)
        assetRes.pipe(res)
      },
    )

    assetReq.on('error', () => {
      res.writeHead(500, { 'Content-Type': 'text/plain' })
      res.end('Dev asset server error')
    })

    req.pipe(assetReq)
  })

  await new Promise((resolve, reject) => {
    devServer.listen(devPort, '0.0.0.0', () => resolve())
    devServer.on('error', reject)
  })

  console.info(`Dev server: http://localhost:${devPort}`)
  console.info(`  Customer:  http://localhost:${devPort}`)
  console.info(`  Owner:     http://internal.localhost:${devPort}`)
  console.info(`  Dual mode: http://dev.localhost:${devPort}`)
  console.info(
    `(esbuild assets on port ${assetPort}, API proxy → ${apiTarget.port})`,
  )

  const shutdown = () => {
    devServer.close()
    tailwindProcess.kill()
    void ctx.dispose()
    process.exit(0)
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

async function startPreview() {
  if (!existsSync(join(distDir, 'index.html'))) {
    await buildOnce()
  }

  const { createReadStream, statSync } = await import('node:fs')
  const { extname } = await import('node:path')

  const previewPort = 3000
  const mime = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.map': 'application/json',
    '.ico': 'image/x-icon',
  }

  const server = createServer((req, res) => {
    const urlPath = decodeURIComponent((req.url ?? '/').split('?')[0] ?? '/')
    let filePath = join(distDir, urlPath === '/' ? 'index.html' : urlPath)

    if (!filePath.startsWith(distDir)) {
      res.writeHead(403).end('Forbidden')
      return
    }

    if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
      filePath = join(distDir, 'index.html')
    }

    const type = mime[extname(filePath)] ?? 'application/octet-stream'
    res.writeHead(200, { 'Content-Type': type })
    createReadStream(filePath).pipe(res)
  })

  await new Promise((resolve, reject) => {
    server.listen(previewPort, '0.0.0.0', () => resolve())
    server.on('error', reject)
  })

  console.info(`Preview server: http://localhost:${previewPort}`)

  const shutdown = () => {
    server.close()
    process.exit(0)
  }
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

try {
  if (command === 'dev') {
    await startDev()
  } else if (command === 'preview' || command === 'prod') {
    await startPreview()
  } else {
    await buildOnce()
    console.info('Build complete → dist/')
  }
} catch (error) {
  console.error(error)
  process.exit(1)
}
