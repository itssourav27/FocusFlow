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
      const response = await fetch(`${BASE_URL}/api/health`);
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

    const health = await request("/api/health");
    assert(health.response.status === 200, "Expected 200 from /api/health");
    assert(health.body?.status === "ok", "Expected service health to be ok");
    assert(health.body?.database === "ok", "Expected database health to be ok");

    const initialCounts = await request("/api/tasks/counts");
    assert(
      initialCounts.response.status === 200,
      "Expected 200 from /api/tasks/counts",
    );
    assert(
      typeof initialCounts.body?.all === "number" &&
        typeof initialCounts.body?.pending === "number" &&
        typeof initialCounts.body?.completed === "number" &&
        typeof initialCounts.body?.overdue === "number" &&
        typeof initialCounts.body?.dueSoon === "number",
      "Expected numeric task counts",
    );

    const invalidQueryFallback = await request(
      "/api/tasks?status=not-a-real-status&sort=not-a-real-sort",
    );
    assert(
      invalidQueryFallback.response.status === 200,
      "Expected 200 for invalid tasks query params",
    );
    assert(
      Array.isArray(invalidQueryFallback.body),
      "Expected tasks response body to be an array for invalid query params",
    );
    assert(
      invalidQueryFallback.body.length === initialCounts.body.all,
      "Expected invalid query params to fall back to all tasks",
    );

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

    const countsAfterCreate = await request("/api/tasks/counts");
    assert(
      countsAfterCreate.body?.all === initialCounts.body.all + 1,
      "Expected total task count to increase after create",
    );
    assert(
      countsAfterCreate.body?.pending === initialCounts.body.pending + 1,
      "Expected pending task count to increase after create",
    );
    assert(
      countsAfterCreate.body?.dueSoon === initialCounts.body.dueSoon + 1,
      "Expected due soon task count to increase after create",
    );

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

    const countsAfterComplete = await request("/api/tasks/counts");
    assert(
      countsAfterComplete.body?.pending === initialCounts.body.pending,
      "Expected pending task count to return after completion",
    );
    assert(
      countsAfterComplete.body?.completed === initialCounts.body.completed + 1,
      "Expected completed task count to increase after completion",
    );
    assert(
      countsAfterComplete.body?.dueSoon === initialCounts.body.dueSoon,
      "Expected due soon task count to return after completion",
    );

    const deletedTask = await request(`/api/tasks/${taskId}`, {
      method: "DELETE",
    });
    assert(
      deletedTask.response.status === 204,
      "Expected 204 when deleting task",
    );

    const countsAfterDelete = await request("/api/tasks/counts");
    assert(
      countsAfterDelete.body?.all === initialCounts.body.all,
      "Expected total task count to return after delete",
    );
    assert(
      countsAfterDelete.body?.completed === initialCounts.body.completed,
      "Expected completed task count to return after delete",
    );
    assert(
      countsAfterDelete.body?.dueSoon === initialCounts.body.dueSoon,
      "Expected due soon task count to return after delete",
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
