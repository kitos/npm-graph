const request = require('request-promise-native')

const packageCache = new Map()

const getPackage = (packageName, version = 'latest', cacheble = true) => {

    const nameAndVersion = `${packageName}/${version.replace(/[\^~>=]/, '')}`

    if (cacheble && packageCache.has(nameAndVersion)) {
        const cachedPkg = packageCache.get(nameAndVersion)

        return cachedPkg.then ? cachedPkg : Promise.resolve(cachedPkg)
    }

    const loadPromise = request('https://registry.npmjs.org/' + nameAndVersion, { json: true })
        .then(pkg => {

            packageCache.set(nameAndVersion, pkg)

            return pkg
        })

    packageCache.set(nameAndVersion, loadPromise)

    return loadPromise;
}

module.exports = {
    getPackage
}