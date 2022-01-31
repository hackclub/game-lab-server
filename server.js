const express = require('express')
const router = express.Router()
const fetch = require('node-fetch')
const shell = require('shelljs')
const app = express()

async function getCommitFromVersion(versionString) {
  if (versionString.length === 40) {
    // this is probably a git SHA1 commit
    return versionString
  } else {
    // let's assume this is a release tag if not
    const url = `https://api.github.com/repos/hackclub/game-lab/git/refs/tags/${versionString}`
    const release = await fetch(url).then(r => r.json())
    const sha = release.object.sha
    return sha
  }
}

function ensureRootCloned() {
  const alreadyCloned = shell.ls("./clones/root").code === 0
  if (alreadyCloned) {
    shell.exec("git --git-dir ./clones/root fetch").code
  } else {
    shell.exec("git clone https://github.com/hackclub/game-lab ./clones/root --bare").code
  }
}

async function ensureShaCloned(sha) {
  const alreadyCloned = shell.ls(`./clones/${sha}`).code === 0
  if (alreadyCloned) { return true }

  ensureRootCloned()
  shell.exec(`git clone ./clones/root ./clones/${sha}`).code
  console.log(`git --git-dir ./clones/${sha}/.git reset --hard ${sha}`)
  shell.exec(`git --git-dir ./clones/${sha}/.git checkout ${sha}`).code
  // shell.rm(`./clones/${sha}/.git`)
}

async function getFileFromSha(sha, path) {
  await ensureShaCloned(sha)
  return `./clones/${sha}/${path}`
}

// /asldjkklasjdlkajdslaskjdl/assets/run.png
// /0.1.0/assets/run.png
app.get('/:version/*', async (req, res) => {
  console.log({params: req.params})
  
  const versionString = req.params.version
  console.log(versionString, versionString.length)
  const path = req.params[0]
  const commit = await getCommitFromVersion(versionString)
  const file = await getFileFromSha(commit, path)
  res.sendFile(__dirname+'/'+file)
})

app.listen(3000)