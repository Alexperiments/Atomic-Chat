import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const manifestUrl = new URL(
  '../src-tauri/gen/android/app/src/main/AndroidManifest.xml',
  import.meta.url
)
const manifestPath = fileURLToPath(manifestUrl)
const softInputAttribute = 'android:windowSoftInputMode="adjustResize"'
const requiredPermissions = [
  '<uses-permission android:name="android.permission.MANAGE_EXTERNAL_STORAGE" />',
  '<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />',
  '<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="29" />',
]
const pluginSourceUrl = new URL(
  './android/AtomicStoragePlugin.kt',
  import.meta.url
)
const pluginTargetUrl = new URL(
  '../src-tauri/gen/android/app/src/main/java/chat/atomic/storage/AtomicStoragePlugin.kt',
  import.meta.url
)

let manifest = await readFile(manifestPath, 'utf8')
let manifestChanged = false

for (const permission of requiredPermissions) {
  if (!manifest.includes(permission)) {
    manifest = manifest.replace(/(<manifest\b[^>]*>)/, `$1\n    ${permission}`)
    manifestChanged = true
  }
}

if (!manifest.includes(softInputAttribute)) {
  const mainActivity = /(<activity\b(?=[^>]*android:name="\.MainActivity")[^>]*)(>)/
  if (!mainActivity.test(manifest)) {
    throw new Error(`MainActivity not found in ${manifestPath}`)
  }

  manifest = manifest.replace(
    mainActivity,
    `$1\n            ${softInputAttribute}$2`
  )
  manifestChanged = true
}

if (manifestChanged) {
  await writeFile(manifestPath, manifest)
  console.log('Configured Android manifest for keyboard and shared storage')
}

await mkdir(new URL('.', pluginTargetUrl), { recursive: true })
await copyFile(pluginSourceUrl, pluginTargetUrl)
