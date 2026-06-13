import { spawn } from "child_process"
import fs from "fs/promises"
import path from "path"
import "dotenv/config"
import { uploadDirectory } from "./lib/uploadDirectory.js"

const REPO_URL = process.env.REPO_URL || "https://github.com/omsaraykar/gdg-website"
const PROJECT_NAME = process.env.PROJECT_NAME || "gdg-website"
const BASE_DIR = "/"

async function ensureDir(dir) {
    await fs.mkdir(dir, { recursive: true })
}

function runCommand(command, args, cwd) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            cwd,
            shell: true
        })

        child.stdout.on("data", (data) => {
            process.stdout.write(data.toString())
        })

        child.stderr.on("data", (data) => {
            process.stderr.write(data.toString())
        })

        child.on("close", (code) => {
            if (code === 0) {
                resolve()
            } else {
                reject(new Error(`${command} exited with code ${code}`))
            }
        })

        child.on("error", (err) => {
            reject(err)
        })
    })
}

async function cleanup(projectPath) {
    try {
        await fs.rm(projectPath, {
            recursive: true,
            force: true
        })

        console.log("Cleaned up project directory")
    } catch (err) {
        console.error("Cleanup failed:", err.message)
    }
}

async function buildProject() {
    const projectPath = path.join(BASE_DIR, PROJECT_NAME)

    try {
        console.log("Creating workspace...")
        await ensureDir(BASE_DIR)

        console.log("Removing old project if exists...")
        await cleanup(projectPath)

        console.log("Cloning repository...")
        await runCommand(
            "git",
            ["clone", REPO_URL, projectPath],
            BASE_DIR
        )

        console.log("Installing dependencies...")
        await runCommand(
            "npm",
            ["install"],
            projectPath
        )

        console.log("Running build...")
        await runCommand(
            "npm",
            ["run", "build"],
            projectPath
        )

        console.log("Build completed successfully")

        console.log("Uploading to S3...")
        await uploadDirectory(
            path.join(projectPath, "dist"),
            PROJECT_NAME
        )
        console.log("Uploaded to S3 successfully")

    } catch (err) {
        console.error("Deployment failed")
        console.error(err.message)
    } finally {
        await cleanup(projectPath)
    }
}

buildProject()