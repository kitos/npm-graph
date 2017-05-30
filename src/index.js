import vis from 'vis'
import {
    compose,
    map,
    reduce,
    max,
    prop,
    filter,
    has,
    unnest,
    curry,
    addIndex
} from 'ramda'
import { getPackage } from './npm-client'

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

const maxLevel = compose(
    reduce(max, 0),
    map(prop('level'))
)

const edge = curry((from, to) => ({ from, to }))

const edges = compose(
    unnest,
    map(pkg => map(edge(pkg.name), pkg.dependencies)),
    filter(has('dependencies'))
)

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

const nodes = addIndex(map)((pkg, i, packages) => ({
    id: pkg.name,
    label: pkg.name,
    title: pkg.description,
    shape: 'dot',
    size: 40 * (maxLevel(packages) - pkg.level + 1) / 25,
    color: colors[i % colors.length]
}))

const loadDependencyGraph = (pkgToLoad) => {

    toggleLoader(true)

    return getPackage(pkgToLoad)

        .then(packages => network.setData({

            nodes: new vis.DataSet(nodes(packages)),
            edges: new vis.DataSet(edges(packages)),
        }))
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
