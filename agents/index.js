const axios = require('axios')

class Agents {
    constructor(opt = { maxTasksOnEntry: 10 }) {
        this._entries = []
        this.maxTasksOnEntry = opt.maxTasksOnEntry
    }

    registry({ host, port }) {
        this._entries.push({
            host,
            port,
            tasks: 0
        })
    }

    checkAbilityToBuild() {
        return this._entries.find( item => item.tasks < this.maxTasksOnEntry)
    }

    build({ id, command, repository, commitHash }) {
        const agent = this._entries.find( item => item.tasks < this.maxTasksOnEntry)

        if(agent) {
            axios.post(`${agent.host}:${agent.port}/build`, {
                id,
                command,
                commitHash,
                repository
            }).then( data => {
                console.log(data)
            }, err => {
                console.log(err)
            })
        }
    }
}

module.exports = Agents