const isDev = process.env.NODE_ENV === 'development'

const hostPermissions = [
  'https://online.vlu.edu.vn/*',
  'https://*.vlu.edu.vn/*',
]

const connectSrc = [
  "'self'",
  'https://online.vlu.edu.vn',
  'https://*.vlu.edu.vn',
]

if (isDev) {
  hostPermissions.push('http://localhost:3000/*')
  connectSrc.push('http://localhost:3000')
}

export function buildManifest() {
  return {
    manifest_version: 3,
    default_locale: 'vi',
    name: '__MSG_extensionName__',
    browser_specific_settings: {
      gecko: {
        id: 'example@example.com',
        strict_min_version: '109.0',
      },
    },
    version: process.env.npm_package_version ?? '2.0.0',
    description: '__MSG_extensionDescription__',
    host_permissions: hostPermissions,
    permissions: ['cookies', 'storage', 'activeTab', 'tabs'],
    background: {
      service_worker: 'background.js',
      type: 'module',
    },
    content_security_policy: {
      extension_pages: `default-src 'self'; connect-src ${connectSrc.join(' ')}; img-src 'self' data:; style-src 'self' 'unsafe-inline'`,
    },
    action: {
      default_popup: 'popup/index.html',
      default_icon: 'icon-34.png',
    },
    icons: {
      '128': 'icon-128.png',
    },
  }
}
