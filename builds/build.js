const statuses = {
    pending: 'pending',
    successful: 'successful',
    failed: 'failed'
}

class Build {
    constructor({
        status = statuses.pending,
        commitHash,
        command,
        id
    }) {
        if (!commitHash) throw Error('commitHash option is required')
        if (!command) throw Error('command option is required')
        if (typeof id !== 'number') throw Error('id option option is required')

        this.id = id
        this.commitHash = commitHash
        this.command = command

        this.startDate = null
        this.endDate = null
        this.stdout = null
        this.stderr = null
        this.code = null

        this.status = status
    }

    update({ startDate, endDate }) {
        this.startDate = startDate || this.startDate
        this.endDate = endDate || this.endDate
    }

    resolve({ startDate, endDate, stdout, stderr, code }) {
        if (this.status !== statuses.pending) return

        if (!startDate) throw Error('startDate option is required')
        if (!endDate) throw Error('endDate option is required')

        this.startDate = startDate || this.startDate
        this.endDate = endDate || this.endDate
        this.stdout = stdout || this.stdout
        this.stderr = stderr || this.stdout
        this.code = typeof code === 'number' ? code : null

        this.status = statuses.successful
    }

    reject({ startDate, endDate, stdout, stderr, code }) {
        if (this.status !== statuses.pending) return


        this.startDate = startDate || this.startDate
        this.endDate = endDate || this.endDate
        this.stdout = stdout || this.stdout
        this.stderr = stderr || this.stdout
        this.status = statuses.failed
    }
}

Build.statuses = statuses

module.exports = Build