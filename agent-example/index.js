const express = require('express')
const bodyParser = require('body-parser')
const axios = require('axios')
const path = require('path')
const Git = require('git')
const rimraf  = require('rimraf')
const { runCommand } = require('./command')

const {
    port,
    host,
    maxConnectTries,
    pathToRepositories
} = require('./config.json')

const git = new Git(pathToRepositories)
const app = express()

app.use(bodyParser.json())

let countConnects = 0
;(function connectToServer() {
    countConnects++

    const data = {
        port,
        host
    }

    axios.post('http://localhost:3000/notify_agent', data, {}).then(e => {

    }, () => {
        if (countConnects < maxConnectTries) {
            setTimeout(connectToServer, 1000)
        } else {
            process.exit(1)
        }
    })
})();

rimraf(resolve(pathToRepositories, './**'), (err) => {
    if(!err){
        console.log(`${resolve(pathToRepositories, repositoryFolder)} repository is removed`)
    } else {
        console.log(`removal of the ${resolve(pathToRepositories, repositoryFolder)} repository failed`)
    }
})


let repositoryCount = 0
app.post('/build', (req, res) => {
    const {
        repository,
        command,
        commitHash
    } = req.body

    const repositoryFolder = `repository${repositoryCount++}`

    git.clone(repository, { folder: repositoryFolder })
        .then(() => {
            return git.checkout(commitHash, {
                cwd: path.resolve(
                    pathToRepositories,
                    repositoryFolder
                )
            })
        }).then(() => {
            return runCommand(command, resolve(pathToRepositories, repositoryFolder))
        }).then(data => {
            res.status(200)
            res.json({
                ...data,
                commitHash,
                repository
            })
        }, data => {
            res.status(500)
            res.json({
                ...data,
                commitHash,
                repository
            })
        }).then(() => {
            rimraf(resolve(pathToRepositories, repositoryFolder), (err) => {
                if(!err){
                    console.log(`${resolve(pathToRepositories, repositoryFolder)} repository is removed`)
                } else {
                    console.log(`removal of the ${resolve(pathToRepositories, repositoryFolder)} repository failed`)
                }
            })
        })
})

app.listen(port, () => console.log(`Agent listening on port ${port}!`))