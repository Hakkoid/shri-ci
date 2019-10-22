const { spawn } = require('child_process')
const { withPromise } = require('./helpers')

module.exports = class Git {
    constructor({ path }) {
        this.path = path
    }

    clone(url, { folder } = {}) {
        const path = this.path

        let resolve = () => { },
            reject = () => { }

        const promise = new Promise((res, rej) => {
            resolve = res
            reject = rej
        })

        const params = ['clone', `${url}`]
        if (folder) params.push(folder)

        const cloneProcess = spawn('git', params, {
            cwd: path
        })

        let stdout = ''

        cloneProcess.stdout.on('data', data => {
            updateTimer(cloneProcess)
            stdout += data
        })

        let stderr = ''

        cloneProcess.stderr.on('data', data => {
            updateTimer(cloneProcess)
            stderr += data
        })

        cloneProcess.on('exit', (code) => {
            const result = {
                stdout,
                stderr,
                code
            }

            if (code === 0) {
                resolve(result)
            } else {
                reject(result)
            }
        })

        let timer = null
            ; (function updateTimer(proc) {
                clearTimeout(timer)

                setTimeout(() => {
                    proc.kill()

                    reject({
                        stderr,
                        stdout
                    })
                }, 5000)
            })(cloneProcess);

        return promise
    }

    checkout(repository, hash) {
        const path = this.path

        const checkoutProcess = spawn('git', [
            'checkout', `${hash}`
        ], {
            cwd: resolve(path, repository)
        })

        return withPromise(checkoutProcess)
    }
}
