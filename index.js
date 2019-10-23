const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const formidableMiddleware = require('express-formidable')
const Builds = require('./builds')
const Agents = require('./agents')
const config = require('./config')

const app = express()

app.use(express.json());
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'public')))

const agents = new Agents()
const builds = new Builds()

app.engine('pug', require('pug').renderFile)

app.get('/', (req, res) => {
    res.render('index.pug', {
        builds: builds.getAll()
    })
})

app.post('/notify_agent', (req, res) => {
    const {
        host,
        port
    } = req.body

    agents.registry({
        host,
        port
    }).then(() => {
        res.status(200)

        res.json({
            message: 'success registry',
            successful: true
        })
    },() => {
        res.status(500)

        res.json({
            message: 'fail registry',
            successful: false
        })
    })
})

app.post('/build', formidableMiddleware(), (req, res) => {
    const {
        command,
        commitHash
    } = req.fields

    let message = {
        type: 'default',
        text: ''
    }

    if (!command || !commitHash) {
        message = {
            text: 'please fill all fields',
            type: 'error'
        }
    } else {
        const build = builds.makeBuild({
            command,
            commitHash
        })

        agents.build({
            id: build.id,
            command,
            commitHash,
            repository: config.repository
        }).then(() => {
            res.render('index.pug', {
                builds: builds.getAll(),
                message: {
                    text: 'build started',
                    type: 'success'
                }
            })

            setTimeout(() => { build.reject() }, config.maxTimeWaitForBuild)
        }, e => {
            build.reject()

            res.render('index.pug', {
                builds: builds.getAll(),
                message: {
                    text: 'there is no way to make a build right now, please try again later',
                    type: 'error'
                }
            })
        })

        return
    }

    res.render('index.pug', {
        builds: builds.getAll(),
        message
    })
})

app.post('/notify_build_result', (req, res) => {
    const {
        host,
        port,
        id,
        free
    } = req.body

    const agent = agents.find(item => item.host === host && item.port === port)
    if (agent && free) agent.free = true

    builds.finishBuild(id, req.body)

    res.status(200)
    res.json({
        message: "build saved",
        successful: true
    })
})


app.get('/build/:id', (req, res, next) => {
    const id = req.params.id
    const build = builds.get(id)

    if (!build) return next()

    res.render('build.pug', {
        build
    })
})

app.listen(config.port, () => console.log(`Server listening on port ${config.port}!`))