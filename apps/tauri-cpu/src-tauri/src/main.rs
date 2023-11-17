#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod utils;
use std::thread;
use std::time::Duration;
use sysinfo::{ProcessExt, System, SystemExt};
use tauri::Window;

#[derive(Clone, serde::Serialize)]
struct Payload {
    cpu_usage: String,
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn init_cpu(window: Window) {
    let mut system = System::new_all();

    std::thread::spawn(move || loop {
        // utils::induce_high_cpu_usage(1);
        system.refresh_all();

        let current_pid = sysinfo::get_current_pid().unwrap();
        system.refresh_cpu();

        if let Some(process) = system.process(current_pid) {
            let cpu_usage = process.cpu_usage();
            let rouded = (cpu_usage * 100f32).floor() / 100.0;
            // thread::sleep(Duration::from_secs(5));

            window
                .emit(
                    "cpu-report",
                    Payload {
                        cpu_usage: rouded.to_string(),
                    },
                )
                .unwrap();
        }
        thread::sleep(Duration::from_secs(1))
    });
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![init_cpu])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
