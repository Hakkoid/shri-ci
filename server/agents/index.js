const axios = require('axios')

class Agents {
    constructor() {
        this._entries = []
        this._counterId = 0
    }

    registry({ host, port }) {
        const agent = this._entries.find(item => host === item.host && item.port === port)
        if(agent) {
            return axios.post(`${agent.host}:${agent.port}/ping`).then(() => {
                throw new Error('port and host are already reserved')
            }, () => {
                this.add({ host, port })
                return 'agent is registered'
            })
        }

        this.add({ host, port })

        return new Promise(res => res('agent is registered'))
    }

    add({ host, port }) {
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
        agent.timer = setInterval(() => {

            axios.post(`${agent.host}:${agent.port}/ping`)
                .catch(() => {
                    clearInterval(agent.timer)
                    this.utilize(agent)
                })
        }, 10 * 60 * 1000);
    }

    utilize(agent) {
        const index = this._entries.findIndex(item => item.id === agent.id)

        clearTimeout(agent.timer)
        if (index >= 0) {
            this._entries = [
                ...this._entries.slice(0, index),
                ...this._entries.slice(index + 1)
            ]

        }
    }

    build({ id, command, repository, commitHash }, tries = 0) {
        const agent = this._entries.find(item => item.free)
        const data = { id, command, repository, commitHash }

        if (agent) {

            return axios.post(`${agent.host}:${agent.port}/build`, data)
                .then(e => {

                    if (e.status !== 200) {
                        if (e.data.free === false) {
                            agent.free = false
                        } else {
                            throw(new Error('agent don\'t works'))
                        }
                    }
                })
                .catch(() => {
                    this.utilize(agent)

                    if (tries < 5) {
                        this.build(data, tries)
                    } else {
                        throw(new Error('send task to agent is failed'))
                    }
                })
        } else {
            return new Promise((resolve, reject) => {
                reject('no free agents now')
            })
        }
    }
}

module.exports = Agents