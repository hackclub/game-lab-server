const express = require('express')
const fetch = require('node-fetch')
const shell = require('shelljs')
const { createWriteStream } = require('fs')
const { pipeline } = require('stream')
const { promisify } = require('util')
const app = express()

async function ensureTag(tag) {
  const tagDownloaded = shell.test('-e', `./clones/${tag}.zip`)
  if (!tagDownloaded) {
    const url = `https://github.com/hackclub/game-lab/archive/refs/tags/${tag}.zip`
    const streamPipeline = promisify(pipeline)
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`unexpected response ${response.statusText}`)
    }
    await streamPipeline(response.body, createWriteStream(`./clones/${tag}.zip`))
  }
  const unzipped = shell.test('-d', `./clones/${tag}/`)
  if (!unzipped) {
    shell.exec(`unzip ./clones/${tag}.zip -d ./clones/${tag}`).code
    shell.mv(`./clones/${tag}/game-lab-${tag}/*`, `./clones/${tag}/`).code
  }
}

app.get('/:tag/*', async (req, res) => {
  const tag = req.params.tag
  const path = req.params[0]

  await ensureTag(tag)

  res.sendFile(__dirname+'/clones/'+tag+'/'+path)
})

app.listen(3000)