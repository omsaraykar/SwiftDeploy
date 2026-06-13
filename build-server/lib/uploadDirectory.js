import fs from "fs/promises"
import path from "path"

import { PutObjectCommand } from "@aws-sdk/client-s3"
import { s3 } from "./s3.js"

async function getFiles(dir) {
    const entries = await fs.readdir(dir, {
        withFileTypes: true
    })

    const files = []

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)

        if (entry.isDirectory()) {
            files.push(...await getFiles(fullPath))
        } else {
            files.push(fullPath)
        }
    }

    return files
}

export async function uploadDirectory(localDir, projectSlug) {
    const files = await getFiles(localDir)

    for (const filePath of files) {
        const content = await fs.readFile(filePath)

        const key =
            `${projectSlug}/${path.relative(localDir, filePath)}`

        await s3.send(
            new PutObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: key,
                Body: content
            })
        )

        console.log(`Uploaded ${key}`)
    }
}