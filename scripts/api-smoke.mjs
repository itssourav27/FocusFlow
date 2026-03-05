import { spawn } from "node:child_process";
import process from "node:process";

const PORT = 3101;
const BASE_URL = `http://127.0.0.1:${PORT}`;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServerReady(timeoutMs = 30000) {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(`${BASE_URL}/api/meetings`);
      if (response.ok) {
        return;
      }
    } catch {
      // Ignore connection errors while server starts.
    }

    await sleep(500);
  }

  throw new Error(`Timed out waiting for server on ${BASE_URL}`);
}

async function stopServer(child) {
  if (!child || child.killed) {
    return;
  }

  if (process.platform === "win32" && child.pid) {
    await new Promise((resolve) => {
      const killer = spawn(
        "taskkill",
        ["/pid", String(child.pid), "/t", "/f"],
        {
          stdio: "ignore",
        },
      );
      killer.on("close", () => resolve());
      killer.on("error", () => resolve());
    });
    return;
  }

  child.kill("SIGTERM");
}

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "content-type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  return { response, body };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function run() {
  const server = spawn("npm", ["run", "dev", "--", "--port", String(PORT)], {
    shell: true,
    stdio: ["ignore", "pipe", "pipe"],
  });

  server.stdout.on("data", (chunk) => {
    process.stdout.write(`[dev] ${chunk}`);
  });

  server.stderr.on("data", (chunk) => {
    process.stderr.write(`[dev] ${chunk}`);
  });

  try {
    await waitForServerReady();

    const meetingPayload = {
      title: "API Smoke Meeting",
      date: new Date().toISOString(),
      notes: "Created by api smoke test",
    };

    const createdMeeting = await request("/api/meetings", {
      method: "POST",
      body: JSON.stringify(meetingPayload),
    });
    assert(
      createdMeeting.response.status === 201,
      "Expected 201 when creating meeting",
    );
    assert(createdMeeting.body?.id, "Expected created meeting id");

    const meetingId = createdMeeting.body.id;

    const updatedMeeting = await request(`/api/meetings/${meetingId}`, {
      method: "PATCH",
      body: JSON.stringify({ title: "API Smoke Meeting Updated" }),
    });
    assert(
      updatedMeeting.response.status === 200,
      "Expected 200 when updating meeting",
    );
    assert(
      updatedMeeting.body?.title === "API Smoke Meeting Updated",
      "Meeting title was not updated",
    );

    const createdTask = await request("/api/tasks", {
      method: "POST",
      body: JSON.stringify({
        meetingId,
        title: "API Smoke Task",
        deadline: new Date(Date.now() + 86400000).toISOString(),
        status: "pending",
      }),
    });
    assert(
      createdTask.response.status === 201,
      "Expected 201 when creating task",
    );
    assert(createdTask.body?.id, "Expected created task id");

    const taskId = createdTask.body.id;

    const updatedTask = await request(`/api/tasks/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "completed" }),
    });
    assert(
      updatedTask.response.status === 200,
      "Expected 200 when updating task",
    );
    assert(
      updatedTask.body?.status === "completed",
      "Task status was not updated",
    );

    const deletedTask = await request(`/api/tasks/${taskId}`, {
      method: "DELETE",
    });
    assert(
      deletedTask.response.status === 204,
      "Expected 204 when deleting task",
    );

    const deletedMeeting = await request(`/api/meetings/${meetingId}`, {
      method: "DELETE",
    });
    assert(
      deletedMeeting.response.status === 204,
      "Expected 204 when deleting meeting",
    );

    console.log("API smoke test passed.");
  } finally {
    await stopServer(server);
  }
}

run().catch((error) => {
  console.error("API smoke test failed:", error);
  process.exitCode = 1;
});
