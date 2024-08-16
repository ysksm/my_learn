// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::command;


const SETTINGS_FILE: &str = "settings.json";

fn get_settings_path() -> PathBuf {
    println!("{:?}", tauri::api::path::app_config_dir(&tauri::Config::default()));
    tauri::api::path::app_config_dir(&tauri::Config::default())
        .expect("Failed to get config directory")
        .join(SETTINGS_FILE)
}

fn read_settings() -> Vec<JiraSetting> {
    let path = get_settings_path();
    if path.exists() {
        let data = fs::read_to_string(path).expect("Unable to read settings file");
        serde_json::from_str(&data).expect("Unable to parse settings file")
    } else {
        // vec形式で返すように変更
        vec![JiraSetting::default()]
    }
}

fn write_settings(settings: Vec<JiraSetting>) {
    let path = get_settings_path();
    let data = serde_json::to_string(&settings).expect("Unable to serialize settings");
    fs::write(path, data).expect("Unable to write settings file");
}


#[derive(Serialize, Deserialize)]
struct JiraSetting {
    id: String,
    base_url: String,
    user_name: String,
    api_token: String,
}

impl Default for JiraSetting {
    fn default() -> Self {
        Self {
            // idはGUIDの文字列を生成
            // cargo add uuid でuuidを使えるようにする
            id: uuid::Uuid::new_v4().to_string(),
            base_url: "http://hostname.atlassian.net".into(),
            user_name: "username@gmail.com".into(),
            api_token: "".into(),
        }
    }
}

#[command]
fn create_connect_setting() -> JiraSetting {
    JiraSetting::default()
}

#[command]
fn get_jira_settings() -> Vec<JiraSetting> {
    read_settings()
}

#[command]
fn update_jira_settings(settings: Vec<JiraSetting>) {
    write_settings(settings);
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            greet,
            create_connect_setting,get_jira_settings,
            update_jira_settings])
        // .invoke_handler(tauri::generate_handler![update_jira_settings])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
