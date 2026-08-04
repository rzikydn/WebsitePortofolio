const ftp = require("basic-ftp");
const path = require("path");
const fs = require("fs");

async function deploy() {
    const client = new ftp.Client();
    client.ftp.verbose = true;
    client.ftp.timeout = 30000; // 30 seconds timeout for operations

    let rawHost = process.env.FTP_SERVER || "";
    // Clean up host string (strip protocol prefix and trailing slashes)
    rawHost = rawHost.replace(/^[a-z]+:\/\//i, "").trim();
    let port = 21;
    if (rawHost.includes(":")) {
        const parts = rawHost.split(":");
        rawHost = parts[0];
        port = parseInt(parts[1], 10) || 21;
    }
    const host = rawHost.replace(/\/+$|\s+/g, "");
    const user = process.env.FTP_USERNAME;
    const password = process.env.FTP_PASSWORD;

    if (!host || !user || !password) {
        console.error("❌ Missing required FTP environment variables (FTP_SERVER, FTP_USERNAME, FTP_PASSWORD).");
        process.exit(1);
    }

    async function connectWithRetry(maxAttempts = 5) {
        let lastError = null;

        // Try standard FTP first, then fallback to FTPS (explicit TLS) if needed
        const secureOptionsList = [
            { secure: false, name: "Standard FTP (secure: false)" },
            { secure: true, secureOptions: { rejectUnauthorized: false }, name: "FTPS Explicit TLS (secure: true)" }
        ];

        for (const secOpt of secureOptionsList) {
            console.log(`\nAttempting connection mode: ${secOpt.name}`);
            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                try {
                    console.log(`[CONNECT] Host: ${host}:${port} (Attempt ${attempt}/${maxAttempts})...`);
                    client.close(); // Clean up existing socket
                    await client.access({
                        host: host,
                        port: port,
                        user: user,
                        password: password,
                        secure: secOpt.secure,
                        secureOptions: secOpt.secureOptions
                    });
                    console.log(`[CONNECT SUCCESS] Connected using ${secOpt.name}`);
                    return;
                } catch (err) {
                    lastError = err;
                    console.error(`[CONNECT ERROR] Attempt ${attempt} failed: ${err.message}`);
                    if (attempt < maxAttempts) {
                        console.log("[RECOVERY] Waiting 5 seconds before retrying...");
                        await new Promise(r => setTimeout(r, 5000));
                    }
                }
            }
        }

        throw new Error(`Failed to connect to FTP server after trying all modes. Last error: ${lastError ? lastError.message : "Unknown error"}`);
    }

    try {
        await connectWithRetry();

        const localDir = path.join(__dirname, "dist");

        async function uploadDir(localPath, remotePath) {
            const items = fs.readdirSync(localPath);

            await client.ensureDir(remotePath);

            for (const item of items) {
                const localItemPath = path.join(localPath, item);
                const remoteItemPath = path.posix.join(remotePath, item);
                const stat = fs.statSync(localItemPath);

                if (stat.isDirectory()) {
                    await uploadDir(localItemPath, remoteItemPath);
                } else {
                    let attempts = 0;
                    const maxAttempts = 6;

                    while (attempts < maxAttempts) {
                        try {
                            console.log(`[DEPLOY] Uploading ${item} -> ${remoteItemPath} (Attempt ${attempts + 1}/${maxAttempts})`);
                            await client.ensureDir(remotePath);
                            await client.uploadFrom(localItemPath, item);
                            console.log(`[SUCCESS] Uploaded ${item} successfully.`);
                            break;
                        } catch (err) {
                            attempts++;
                            console.error(`[ERROR] Failed to upload ${item}: ${err.message}`);

                            if (attempts >= maxAttempts) {
                                throw new Error(`Failed to upload ${item} after ${maxAttempts} attempts: ${err.message}`);
                            }

                            console.log("[RECOVERY] Waiting 3 seconds before retrying upload...");
                            await new Promise(resolve => setTimeout(resolve, 3000));

                            console.log("[RECOVERY] Re-establishing clean FTP connection...");
                            try {
                                await connectWithRetry(3);
                            } catch (reconnErr) {
                                console.error(`[RECOVERY] Reconnection failed: ${reconnErr.message}`);
                            }
                        }
                    }
                }
            }
        }

        console.log("Starting deployment of 'dist' folder...");
        await uploadDir(localDir, "/");
        console.log("🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!");
    } catch (err) {
        console.error("❌ DEPLOYMENT FAILED:", err.message);
        process.exit(1);
    } finally {
        client.close();
    }
}

deploy();

