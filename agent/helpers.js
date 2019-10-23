exports.withPromise = function (childProcess) {
    let resolve = () => { },
        reject = () => { }

    const promise = new Promise((res, rej) => {
        resolve = res
        reject = rej
    })

    let stdout = ''

    childProcess.stdout.on('data', data => stdout += data)

    let stderr = ''

    childProcess.stderr.on('data', data => stderr += data)

    childProcess.on('exit', (code) => {
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

    return promise
}