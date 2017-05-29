const Koa = require('koa')
const serve = require('koa-static')
const _ = require('koa-route')
const app = new Koa()

const { pick, mapObjIndexed, values, compose, map } = require('ramda')

const { getPackage } = require('./npm')

app.use(serve('./public'))

app.use(_.get('/npm/:package/:version?', async (ctx, packageName, version) => {

    ctx.body = await loadPackageWithDependencies(packageName, version)
}))

const removeExtraFields = pick([
    'name',
    'description',
    'dependencies',
    'version'
])

const packageCache = new Map()

const loadPackage = (packageName, version) => {

    const packageKey = packageName + version

    if (packageCache.has(packageKey)) {
        const cachedPkg = packageCache.get(packageKey)

        return cachedPkg.then ? cachedPkg : Promise.resolve(cachedPkg)
    }

    const loadPromise = getPackage(packageName, version)
        .then(pkg => {

            console.info('Load', packageName, version)

            pkg = removeExtraFields(pkg)
            packageCache.set(packageKey, pkg)
            return pkg
        })
        .catch(err => {

            console.error(packageName, version, err.message)

            return {
                name: packageName,
                description: err.message
            }
        })

    packageCache.set(packageKey, loadPromise)

    return loadPromise
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

const loadPackageWithDependencies = async (packageName, version, level = 0) => {

    const packageInfo = await loadPackage(packageName, version)

    packageInfo.level = level

    if (packageInfo.dependencies
        && !Array.isArray(packageInfo.dependencies)) { // we have't loaded them yet

        const loadDependencies = compose(
            Promise.all.bind(Promise),
            map(dependency => loadPackageWithDependencies(dependency.name, dependency.version, level + 1)),
            toDependenciesArray,
            pkg => pkg.dependencies
        )

        packageInfo.dependencies = await loadDependencies(packageInfo)
    }

    return packageInfo
}

app.listen(3000, () => console.info('Server started.'))
