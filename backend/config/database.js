export async function connectDatabase() {
  // Demo backend currently works entirely in-memory, so there is no real DB.
  // Keep the hook async to avoid changing the rest of the startup flow.
  return Promise.resolve();
}

