const Koa = require('koa')
const serve = require('koa-static')
const _ = require('koa-route')

const app = new Koa()

const { loadPackageWithDependencies } = require('./npm')

app.use(serve('./public'))

app.use(_.get('/npm/:package/:version?', async (ctx, packageName, version) => {

    ctx.body = await loadPackageWithDependencies(packageName, version, [
        'name',
        'description',
        'dependencies',
        'version'
    ])
}))

app.listen(3000, () => console.info('Server started.'))
