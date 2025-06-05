#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde_json::Value;
use tauri::command;

#[command]
fn salvar_ordem(ordem: Value) {
    println!("📦 Ordem recebida: {:?}", ordem);
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![salvar_ordem])
        .run(tauri::generate_context!())
        .expect("Erro ao iniciar o app Tauri");
}
