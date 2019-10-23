const axios = require('axios')

class Agents {
    constructor() {
        this._entries = []
        this._counterId = 0
    }

    registry({ host, port }) {
        this._entries.push({
            id: this._counterId++,
            host,
            port,
            tasks: 0,
            free: true
        })

        const last = this._entries[this._entries.length - 1]
        this.pinging(last)
    }

    find(cb) {
        return this._entries.find(cb)
    }

    pinging(agent) {
        const timer = setInterval(() => {

            axios.get(`${agent.host}:${agent.port}/ping`)
                .catch(() => {
                    clearInterval(timer)
                    this.utilize(agent)
                })
        }, 10 * 60 * 1000);
    }

    utilize(agent) {
        const index = this._entries.findIndex(item => item.id === agent.id)
                    
        if (index >= 0) {
            this._entries = [
                ...this._entries.slice(0, index),
                ...this._entries.slice(index + 1)
            ]

        }
    }

    build({ id, command, repository, commitHash }) {
        const agent = this._entries.find(item => item.free)

        if (agent) {
            agent.free = false

            return axios.post(`${agent.host}:${agent.port}/build`, {
                id,
                command,
                commitHash,
                repository
            }).catch(() => {
                this.utilize(agent)
            })
        } else {
            return new Promise((resolve, reject) => {
                reject('no free agents now')
            })
        }
    }
}

module.exports = Agents