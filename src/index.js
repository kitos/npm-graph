import { ajaxJson } from './ajax'
import vis from 'vis'
import { normalize, schema } from 'normalizr'

const packageScheme = new schema.Entity('package', {}, {
    idAttribute: 'name'
})

packageScheme.define({
    _dependencies: [packageScheme]
})

const colors = [
    '#97C2FC',
    '#FB7E81',
    '#FFFF00',
    '#7BE141',
    '#EB7DF4',
    '#6E6EFD',
]

const loadDependencyGraph = (pkgToLoad) => {

    ajaxJson(`npm/${pkgToLoad}`)
        .then(packagesTree => {

            const container = document.getElementById('npm-network')

            const packagesMap = normalize(packagesTree, packageScheme).entities.package
            const packages = Object.values(packagesMap)

            const nodes = new vis.DataSet(packages.map((pkg, i) => ({
                id: pkg.name,
                label: pkg.name,
                title: pkg.description,
                shape: 'dot',
                size: 15,
                color: colors[i % colors.length]
            })))

            const edges = new vis.DataSet(packages
                .map((pkg, i) => pkg._dependencies.map(dependencyKey => ({
                        from: pkg.name,
                        to: packagesMap[dependencyKey].name,
                        color: colors[i % colors.length]
                    }))
                ).reduce((res, arr) => res.concat(arr), [])
            )

            const network = new vis.Network(container, {
                nodes: nodes,
                edges: edges,
                width: 1,
            }, {})
        })
}

const search = document.getElementById('search')

document.getElementById('submit')
    .addEventListener('click', () => loadDependencyGraph(search.value))
