const request = require('request-promise-native')

const getPackage = (packageName, version = 'latest') => {

    const nameAndVersion = `${packageName}/${version.replace(/[\^~>=]/, '')}`

    return request('https://registry.npmjs.org/' + nameAndVersion, { json: true })
}

module.exports = {
    getPackage
}