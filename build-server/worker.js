import { spawn } from "child_process"
import fs from "fs/promises"
import path from "path"

const REPO_URL = "https://github.com/user/project.git"
const PROJECT_NAME = "test-project"

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

        // Example:
        // upload dist folder to S3/minio here

    } catch (err) {
        console.error("Deployment failed")
        console.error(err.message)
    } finally {
        await cleanup(projectPath)
    }
}

buildProject()