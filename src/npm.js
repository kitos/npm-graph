const request = require('request-promise-native')

const { pick, mapObjIndexed, values, compose, map } = require('ramda')

const packageCache = new Map()

const getPackage = (packageName, version = 'latest', requiredFields, cacheble = true) => {

    const nameAndVersion = `${packageName}/${version.replace(/[\^~>=]/, '')}`

    if (cacheble && packageCache.has(nameAndVersion)) {
        const cachedPkg = packageCache.get(nameAndVersion)

        return cachedPkg.then ? cachedPkg : Promise.resolve(cachedPkg)
    }

    const loadPromise = request('https://registry.npmjs.org/' + nameAndVersion, { json: true })
        .catch(err => {
            return {
                name: packageName,
                description: err.message
            }
        })
        .then(pkg => {

            if (requiredFields) {
                pkg = pick(requiredFields, pkg)
            }

            packageCache.set(nameAndVersion, pkg)

            return pkg
        })

    packageCache.set(nameAndVersion, loadPromise)

    return loadPromise;
}

/**
 * Transforms { react: '15.2.2', redux: '7.0.1' }
 *
 * to [{ name: 'react', version: '15.2.2' }, { name: 'redux', version: '7.0.1' }]
 *
 */
const toDependenciesArray = compose(
    values,
    mapObjIndexed((version, name) => ({ name, version }))
)

const loadPackageWithDependencies = async (packageName, version, requiredFields, level = 0) => {

    const packageInfo = await getPackage(packageName, version, requiredFields)

    packageInfo.level = level

    if (packageInfo.dependencies
        && !Array.isArray(packageInfo.dependencies)) { // we have't loaded them yet

        const loadDependencies = compose(
            Promise.all.bind(Promise),
            map(dependency => loadPackageWithDependencies(dependency.name, dependency.version, requiredFields, level + 1)),
            toDependenciesArray,
            pkg => pkg.dependencies
        )

        packageInfo.dependencies = await loadDependencies(packageInfo)
    }

    return packageInfo
}

module.exports = {
    getPackage,
    loadPackageWithDependencies,
}