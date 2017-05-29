const Koa = require('koa')
const serve = require('koa-static')
const _ = require('koa-route')
const request = require('request-promise-native')
const app = new Koa()

const { pick } = require('ramda')

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

const loadPackage = (packageName, version = 'latest') => {

    const nameAndVersion = `${packageName}/${version.replace(/[\^~>=]/, '')}`;

    if (packageCache.has(nameAndVersion)) {
        const cachedPkg = packageCache.get(nameAndVersion)

        return cachedPkg.then ? cachedPkg : Promise.resolve(cachedPkg)
    }

    return request('https://registry.npmjs.org/' + nameAndVersion, { json: true })
        .then(pkg => {

            console.info('Load', packageName, version)

            pkg = removeExtraFields(pkg)
            packageCache.set(nameAndVersion, pkg)
            return pkg
        })
        .catch(err => {

            console.error(packageName, version, err.message)

            return {
                name: packageName,
                description: err.message
            }
        })
}

const loadPackageWithDependencies = async (packageName, version) => {

    const packageInfo = await loadPackage(packageName, version)

    packageInfo._dependencies = await Promise.all(Object.keys(packageInfo.dependencies || {})
        .map(dependencyName => ({
            name: dependencyName,
            version: packageInfo.dependencies[dependencyName]
        }))
        .map(async dependency => {

            return await loadPackageWithDependencies(dependency.name, dependency.version)
        }))


    return packageInfo
}

app.listen(3000, () => console.info('Server started.'))
