use serde::Deserialize;
use tauri::{
    plugin::{Builder, PluginHandle, TauriPlugin},
    AppHandle, Manager, Runtime,
};

const PLUGIN_IDENTIFIER: &str = "chat.atomic.storage";

struct AndroidStorage<R: Runtime>(PluginHandle<R>);

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct SelectedDataFolder {
    path: String,
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("atomic-android-storage")
        .setup(|app, api| {
            let handle = api.register_android_plugin(PLUGIN_IDENTIFIER, "AtomicStoragePlugin")?;
            app.manage(AndroidStorage(handle));
            Ok(())
        })
        .build()
}

/// Open Android's shared-storage directory picker and return a direct path that
/// the desktop-compatible Rust file backend can use with std::fs.
#[tauri::command]
pub async fn select_android_data_folder<R: Runtime>(app: AppHandle<R>) -> Result<String, String> {
    let storage = app.state::<AndroidStorage<R>>();
    storage
        .0
        .run_mobile_plugin_async::<SelectedDataFolder>("selectDataFolder", ())
        .await
        .map(|selection| selection.path)
        .map_err(|error| error.to_string())
}
