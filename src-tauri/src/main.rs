#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::{CustomMenuItem, Menu, MenuItem, Submenu};
use tauri_plugin_store::PluginBuilder;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]

fn main() {
    let modal_settings = CustomMenuItem::new("Modal_Settings".to_string(), "Settings")
        .accelerator("CmdOrCtrl+,")
        .into();
    let modal_shortcuts = CustomMenuItem::new("Modal_Shortcuts".to_string(), "Shortcuts")
        .accelerator("CmdOrCtrl+/")
        .into();
    let submenu_app = Submenu::new(
        "Help",
        Menu::new()
            .add_item(modal_settings)
            .add_item(modal_shortcuts),
    );

    let submenu_edit = Submenu::new(
        "Edit",
        Menu::new()
            .add_native_item(MenuItem::Undo)
            .add_native_item(MenuItem::Redo)
            .add_native_item(MenuItem::Separator)
            .add_native_item(MenuItem::Cut)
            .add_native_item(MenuItem::Copy)
            .add_native_item(MenuItem::Paste)
            .add_native_item(MenuItem::Separator)
            .add_native_item(MenuItem::SelectAll),
    );

    let to_dashboard = CustomMenuItem::new("Router_Dashboard".to_string(), "Switch to Dashboard")
        .accelerator("CmdOrCtrl+1")
        .into();
    let to_note = CustomMenuItem::new("Router_Note".to_string(), "Switch to Note")
        .accelerator("CmdOrCtrl+2")
        .into();
    let to_review = CustomMenuItem::new("Router_Review".to_string(), "Switch to Review")
        .accelerator("CmdOrCtrl+3")
        .into();
    let fold_messages = CustomMenuItem::new("Editor_FoldAll".to_string(), "Fold All")
        .accelerator("CmdOrCtrl+Shift+f")
        .into();
    let submenu_view = Submenu::new(
        "View",
        Menu::new()
            .add_item(to_dashboard)
            .add_item(to_note)
            .add_item(to_review)
            .add_native_item(MenuItem::Separator)
            .add_item(fold_messages),
    );
    let menu = Menu::new()
        .add_native_item(MenuItem::Copy)
        .add_native_item(MenuItem::Quit)
        .add_item(CustomMenuItem::new("hide", "Hide"))
        .add_submenu(submenu_edit)
        .add_submenu(submenu_view)
        .add_submenu(submenu_app);

    tauri::Builder::default()
        .menu(menu)
        .on_menu_event(|event| {
            #[derive(Clone, serde::Serialize)]
            struct Payload {
                message: String,
            }
            let event_id = event.menu_item_id();
            event
                .window()
                .emit(
                    "menu_event",
                    Payload {
                        message: event_id.into(),
                    },
                )
                .unwrap()
        })
        .plugin(PluginBuilder::default().build())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
