// Tiny IPC child used by build-with-sandbox.mjs to detect whether the host
// permits child_process.fork (forbidden in some agent/CI sandboxes).
if (process.send) process.send('ok');
setImmediate(() => process.exit(0));
