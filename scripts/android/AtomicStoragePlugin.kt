package chat.atomic.storage

import android.Manifest
import android.app.Activity
import android.content.ActivityNotFoundException
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.DocumentsContract
import android.provider.Settings
import app.tauri.PermissionState
import app.tauri.annotation.ActivityCallback
import app.tauri.annotation.Command
import app.tauri.annotation.Permission
import app.tauri.annotation.PermissionCallback
import app.tauri.annotation.TauriPlugin
import app.tauri.plugin.Invoke
import app.tauri.plugin.JSObject
import app.tauri.plugin.Plugin
import java.io.File

private const val SHARED_STORAGE_PERMISSION = "sharedStorage"

@TauriPlugin(
  permissions = [
    Permission(
      strings = [
        Manifest.permission.READ_EXTERNAL_STORAGE,
        Manifest.permission.WRITE_EXTERNAL_STORAGE
      ],
      alias = SHARED_STORAGE_PERMISSION
    )
  ]
)
class AtomicStoragePlugin(private val activity: Activity) : Plugin(activity) {
  @Command
  fun selectDataFolder(invoke: Invoke) {
    when {
      Build.VERSION.SDK_INT >= Build.VERSION_CODES.R &&
        !Environment.isExternalStorageManager() -> requestAllFilesAccess(invoke)

      Build.VERSION.SDK_INT < Build.VERSION_CODES.R &&
        getPermissionState(SHARED_STORAGE_PERMISSION) != PermissionState.GRANTED ->
        requestPermissionForAlias(
          SHARED_STORAGE_PERMISSION,
          invoke,
          "sharedStoragePermissionResult"
        )

      else -> openDirectoryPicker(invoke)
    }
  }

  private fun requestAllFilesAccess(invoke: Invoke) {
    val appSettings = Intent(
      Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION,
      Uri.parse("package:${activity.packageName}")
    )

    try {
      startActivityForResult(invoke, appSettings, "allFilesAccessResult")
    } catch (_: ActivityNotFoundException) {
      val globalSettings = Intent(Settings.ACTION_MANAGE_ALL_FILES_ACCESS_PERMISSION)
      startActivityForResult(invoke, globalSettings, "allFilesAccessResult")
    }
  }

  @ActivityCallback
  @Suppress("UNUSED_PARAMETER")
  fun allFilesAccessResult(invoke: Invoke, result: androidx.activity.result.ActivityResult) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R ||
      Environment.isExternalStorageManager()
    ) {
      openDirectoryPicker(invoke)
    } else {
      invoke.reject("Shared-storage access was not granted")
    }
  }

  @PermissionCallback
  private fun sharedStoragePermissionResult(invoke: Invoke) {
    if (getPermissionState(SHARED_STORAGE_PERMISSION) == PermissionState.GRANTED) {
      openDirectoryPicker(invoke)
    } else {
      invoke.reject("Shared-storage access was not granted")
    }
  }

  private fun openDirectoryPicker(invoke: Invoke) {
    val intent = Intent(Intent.ACTION_OPEN_DOCUMENT_TREE).apply {
      addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
      addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION)
      addFlags(Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION)
      addFlags(Intent.FLAG_GRANT_PREFIX_URI_PERMISSION)
    }
    startActivityForResult(invoke, intent, "directoryPickerResult")
  }

  @ActivityCallback
  fun directoryPickerResult(invoke: Invoke, result: androidx.activity.result.ActivityResult) {
    if (result.resultCode != Activity.RESULT_OK) {
      invoke.reject("Folder selection was cancelled")
      return
    }

    val data = result.data
    val treeUri = data?.data
    if (treeUri == null) {
      invoke.reject("The selected folder did not return a storage location")
      return
    }

    val takeFlags = data.flags and
      (Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION)
    try {
      activity.contentResolver.takePersistableUriPermission(treeUri, takeFlags)
    } catch (_: SecurityException) {
      // MANAGE_EXTERNAL_STORAGE supplies direct-path access. Persisting the SAF
      // grant is still useful when the document provider supports it.
    }

    val path = directPathForTree(treeUri)
    if (path == null) {
      invoke.reject(
        "Choose a folder on this device or an SD card; cloud document providers are not supported"
      )
      return
    }

    val response = JSObject()
    response.put("path", path)
    invoke.resolve(response)
  }

  private fun directPathForTree(uri: Uri): String? {
    if (uri.authority != "com.android.externalstorage.documents") return null

    val documentId = DocumentsContract.getTreeDocumentId(uri)
    if (documentId.startsWith("raw:")) {
      return File(documentId.removePrefix("raw:")).canonicalPath
    }

    val parts = documentId.split(":", limit = 2)
    if (parts.size != 2) return null

    val volume = parts[0]
    val relativePath = parts[1]
    val root = when {
      volume.equals("primary", ignoreCase = true) ->
        Environment.getExternalStorageDirectory()
      volume.equals("home", ignoreCase = true) ->
        Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOCUMENTS)
      else -> File("/storage", volume)
    }

    return if (relativePath.isEmpty()) {
      root.canonicalPath
    } else {
      File(root, relativePath).canonicalPath
    }
  }
}
