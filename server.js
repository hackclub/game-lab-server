const express = require('express')
const { path } = require('express/lib/application')
const app = express()

async function getCommitFromTag(tag) {
  const url = `https://api.github.com/repos/hackclub/game-lab/git/refs/tags/${tag}`
  const release = await fetch(url).then(r => r.json())
  const sha = release.object.sha
}

async function ensureShaCloned(sha) {
  // if (sha)
}

async function getFileFromSha(sha, file) {
  await ensureShaCloned(sha)
  return path
}

app.get('/:tag/*', (req, res) => {
  const { tag, ...path } = req.params
  res.json({tag, path})
})

app.listen(3000)