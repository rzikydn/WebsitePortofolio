const ftp = require("basic-ftp");
const path = require("path");
const fs = require("fs");

async function deploy() {
    const client = new ftp.Client();
    client.ftp.verbose = false; // Set to false to keep log output clean and readable
    
    const host = process.env.FTP_SERVER;
    const user = process.env.FTP_USERNAME;
    const password = process.env.FTP_PASSWORD;

    async function connect() {
        console.log("Connecting to FTP server via FTPS...");
        await client.access({
            host: host,
            user: user,
            password: password,
            secure: true,
            options: {
                rejectUnauthorized: false // loose SSL verification to bypass firewall restrictions
            }
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
                    const maxAttempts = 6; // Try up to 6 times per file to completely neutralize drops
                    
                    while (attempts < maxAttempts) {
                        try {
                            console.log(`[DEPLOY] Uploading ${item} -> ${remoteItemPath} (Attempt ${attempts + 1}/${maxAttempts})`);
                            // Navigate to directory and upload
                            await client.ensureDir(remotePath);
                            await client.uploadFrom(localItemPath, item);
                            console.log(`[SUCCESS] Uploaded ${item} successfully.`);
                            break; // Exit loop on success
                        } catch (err) {
                            attempts++;
                            console.error(`[ERROR] Failed to upload ${item}: ${err.message}`);
                            
                            if (attempts >= maxAttempts) {
                                throw new Error(`Failed to upload ${item} after ${maxAttempts} attempts: ${err.message}`);
                            }
                            
                            console.log("[RECOVERY] Waiting 3 seconds before retrying...");
                            await new Promise(resolve => setTimeout(resolve, 3000));
                            
                            if (client.closed || !client.ftp.isConnected) {
                                console.log("[RECOVERY] Connection lost. Re-establishing FTP connection...");
                                try {
                                    await connect();
                                } catch (reconnErr) {
                                    console.error(`[RECOVERY] Reconnection failed: ${reconnErr.message}`);
                                }
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
