const express = require('express')
const bodyParser = require('body-parser')
const axios = require('axios')
const { resolve } = require('path')
const Git = require('./git')
const rimraf  = require('rimraf')
const { runCommand } = require('./command')

const {
    port,
    host,
    maxConnectTries,
    pathToRepositories
} = require('./config.json')

const repsPath = resolve(__dirname, pathToRepositories)

const git = new Git(repsPath)
const app = express()

app.use(bodyParser.json())

rimraf(resolve(repsPath, './**/*'), (err) => {
    if(!err){
        console.log(`${repsPath} folder is cleared`)
    } else {
        console.log(`cleared of the ${repsPath} folder failed`)
    }
})

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

let repositoryCount = 0
app.post('/build', (req, res) => {
    const {
        repository,
        command,
        commitHash,
        id
    } = req.body

    const repositoryFolder = `repository${repositoryCount++}`

    res.status(200)
    res.json({
        message: 'build was start',
        successful: true
    })

    let startDate = null,
        endDate = null

    const request = (data) => {
        endDate = Date.now()

        return axios.post('http://localhost:3000/notify_build_result',{
            ...data,
            startDate,
            endDate,
            id,
            host,
            port
        }, {})
    }

    git.clone(repository, { folder: repositoryFolder })
        .then(() => {
            return git.checkout(repositoryFolder, commitHash)
        }).then(() => {
            startDate = Date.now()
            return runCommand(command, resolve(repsPath, repositoryFolder))
        }).then(request, request)
        .then(() => {
            const path = resolve(repsPath, repositoryFolder)
            rimraf(path, (err) => {
                if(!err){
                    console.log(`${path} repository is removed`)
                } else {
                    console.log(`removal of the ${path} repository failed`)
                }
            })
        }).catch(console.log)
})

app.get('/ping', (req, res) => {
    res.status(200)
    res.send('pong')
})

app.listen(port, () => console.log(`Agent listening on port ${port}!`))