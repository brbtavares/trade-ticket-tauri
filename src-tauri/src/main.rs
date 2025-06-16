#[tauri::command]
async fn trade_action(action: String, quantity: u32) -> String {
    // Simulação de resposta
    match action.as_str() {
        "buy" => format!("Enviada ordem de COMPRA de {} contratos", quantity),
        "sell" => format!("Enviada ordem de VENDA de {} contratos", quantity),
        "close" => "Enviada ordem de ZERAGEM de posição".to_string(),
        _ => "Ação desconhecida".to_string()
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![trade_action])
        .run(tauri::generate_context!())
        .expect("erro ao iniciar app");
}

