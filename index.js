const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const formidableMiddleware = require('express-formidable')
const Builds = require('./builds')
const Agents = require('./agents')

const app = express()


app.use(bodyParser.json())
app.use(formidableMiddleware())
app.use(express.static(path.join(__dirname, 'public')))

const agents = new Agents()
const builds = new Builds()

const repository = 'https://github.com/substack/minimist.git'

app.engine('pug', require('pug').renderFile)

app.get('/', (req, res) => {
    res.render('index.pug', {
        builds: builds.getAll()
    })
})

app.post('/', (req, res) => {
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
    } else if(agents.checkAbilityToBuild()){
        const build = builds.makeBuild({
            command,
            commitHash
        })

        agents.build({
            id: build.id,
            command,
            commitHash,
            repository
        })

        message = {
            text: 'build started',
            type: 'success'
        }
    } else {
        message = {
            type: 'error',
            text: 'making new builds is not available now, try later'
        }
    }

    res.render('index.pug', {
        builds: builds.getAll(),
        message
    })
})

app.get('/build/:id', (req, res, next) => {
    const id = req.params.id
    const build = builds.get(id)

    if(!build) return next()

    res.render('build.pug', {
        build
    })
})

app.listen(3000, () => console.log(`Example app listening on port 3000!`))