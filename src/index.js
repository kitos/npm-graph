import vis from 'vis'
import { getPackage } from './npm-client'

const colors = [
    '#97C2FC',
    '#663399',
    '#E87E04',
    '#26A65B',
    '#FB7E81',
    '#FFFF00',
    '#7BE141',
    '#F7CA18',
    '#2574A9',
    '#EB7DF4',
    '#6E6EFD',
]

const network = new vis.Network(
    document.getElementById('npm-network'), {},
    {
        edges: {
            arrows: {
                to: {
                    enabled: true,
                    scaleFactor: .4,
                },
            }
        }
    })

const loadDependencyGraph = (pkgToLoad) => {

    toggleLoader(true)

    return getPackage(pkgToLoad)
        .then(packagesMap => {

            const packages = Object.values(packagesMap)
            const maxLevel = packages.reduce((max, pkg) => Math.max(max, pkg.level), 0)

            const nodes = new vis.DataSet(packages.map((pkg, i) => ({
                id: pkg.name,
                label: pkg.name,
                title: pkg.description,
                shape: 'dot',
                size: 40 * (maxLevel - pkg.level + 1) / 25,
                color: colors[i % colors.length]
            })))

            const edges = new vis.DataSet(packages
                .map((pkg, i) => pkg.dependencies

                    ? pkg.dependencies.map(dependencyKey => ({
                        from: pkg.name,
                        to: packagesMap[dependencyKey].name,
                        color: colors[i % colors.length]
                    }))

                    : []
                ).reduce((res, arr) => res.concat(arr), [])
            )

            network.setData({
                nodes,
                edges
            })
        })
}

network.on('doubleClick', ({ nodes }) => nodes.length && loadDependencyGraph(nodes[0]))

const search = document.getElementById('search')
const loader = document.querySelector('.loader')

const toggleLoader = v => loader.style.display = v ? 'block' : 'none'

toggleLoader(false)
network.on('stabilizationIterationsDone', () => toggleLoader(false))

document.getElementById('submit')
    .addEventListener('click', e => {
        e.preventDefault()

        loadDependencyGraph(search.value)
    })
