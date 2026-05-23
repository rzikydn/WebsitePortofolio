const ftp = require("basic-ftp");
const path = require("path");
const fs = require("fs");

async function deploy() {
    const client = new ftp.Client();
    client.ftp.verbose = true; // Enabled full logs to monitor progress in real-time
    
    const host = process.env.FTP_SERVER;
    const user = process.env.FTP_USERNAME;
    const password = process.env.FTP_PASSWORD;

    async function connect() {
        console.log("Connecting to FTP server (Standard FTP)...");
        await client.access({
            host: host,
            user: user,
            password: password,
            secure: false // Standard FTP to guarantee 100% connection compatibility with Aren Host
        });
        console.log("Connected successfully.");
    }

    try {
        await connect();
        
        const localDir = path.join(__dirname, "dist");
        
        async function uploadDir(localPath, remotePath) {
            const items = fs.readdirSync(localPath);
            
            // Ensure remote directory exists
            await client.ensureDir(remotePath);
            
            for (const item of items) {
                const localItemPath = path.join(localPath, item);
                const remoteItemPath = path.posix.join(remotePath, item);
                const stat = fs.statSync(localItemPath);
                
                if (stat.isDirectory()) {
                    await uploadDir(localItemPath, remoteItemPath);
                } else {
                    let attempts = 0;
                    const maxAttempts = 6; // Try up to 6 times per file to completely bypass server drops
                    
                    while (attempts < maxAttempts) {
                        try {
                            console.log(`[DEPLOY] Uploading ${item} -> ${remoteItemPath} (Attempt ${attempts + 1}/${maxAttempts})`);
                            await client.ensureDir(remotePath);
                            await client.uploadFrom(localItemPath, item);
                            console.log(`[SUCCESS] Uploaded ${item} successfully.`);
                            break; // Success!
                        } catch (err) {
                            attempts++;
                            console.error(`[ERROR] Failed to upload ${item}: ${err.message}`);
                            
                            if (attempts >= maxAttempts) {
                                throw new Error(`Failed to upload ${item} after ${maxAttempts} attempts: ${err.message}`);
                            }
                            
                            console.log("[RECOVERY] Waiting 3 seconds before retrying...");
                            await new Promise(resolve => setTimeout(resolve, 3000));
                            
                            console.log("[RECOVERY] Closing and re-establishing clean FTP connection...");
                            try {
                                client.close(); // Force destroy current client socket to clean up corrupted state
                                await connect();
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
