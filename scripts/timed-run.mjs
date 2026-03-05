import { spawn } from "node:child_process";
import process from "node:process";

const scriptName = process.argv[2] ?? "verify";
const command = `npm run ${scriptName}`;

const start = process.hrtime.bigint();
console.log(`Starting timed run: ${command}`);

const child = spawn(command, {
  shell: true,
  stdio: "inherit",
});

child.on("error", (error) => {
  console.error("Failed to start npm command:", error);
  process.exit(1);
});

child.on("close", (code, signal) => {
  const end = process.hrtime.bigint();
  const seconds = Number(end - start) / 1_000_000_000;

  console.log(`Timed run completed in ${seconds.toFixed(1)}s.`);

  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
