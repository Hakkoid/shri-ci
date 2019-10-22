const { spawn } = require('child_process')
const { resolve } = require('path')
const { withPromise } = require('./helpers')

exports.runCommand = function (command, path) {
    const child = spawn(command, [], {
        cwd: resolve(path),
        shell: true
    })

    return withPromise(child)
}