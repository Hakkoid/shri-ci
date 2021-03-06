const Build = require('./build')

module.exports = class Builds {
    constructor(opt = { maxLength: 200 }) {
        this._countId = 0
        this._entries = []
        this.maxLength = opt.maxLength
    }

    getAll() {
        return this._entries
    }

    get(id) {
        return this._entries.find(item => item.id === parseInt(id))
    }

    makeBuild({ commitHash, command }) {
        if (this._entries.length === this.maxLength) this._entries.shift()

        this._entries.push(
            new Build({
                id: this._countId++,
                commitHash,
                command
            })
        )

        return this._entries[this._entries.length - 1]
    }

    updateBuild(id, { startDate, endDate }) {
        const build = this.get(id)

        if (!build) return

        build.update({ startDate, endDate })
    }

    finishBuild(id, data) {
        const build = this.get(id)

        if (!build) return

        if (data.code === 0) {
            build.resolve(data)
        } else {
            build.reject(data)
        }
    }
}