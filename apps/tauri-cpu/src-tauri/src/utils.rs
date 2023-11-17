use std::thread;
use std::time::Duration;

pub(crate) fn induce_high_cpu_usage(duration_secs: u64) {
    let start_time = std::time::Instant::now();

    // Run a loop for the specified duration
    while start_time.elapsed().as_secs() < duration_secs {
        // Perform some CPU-intensive calculations
        let _result: u64 = (0..1_000_000).map(|x| x * x).sum();

        // Print the result to avoid compiler optimizations

        // Sleep for a short duration to avoid busy-waiting
        thread::sleep(Duration::from_micros(100));
    }
}
