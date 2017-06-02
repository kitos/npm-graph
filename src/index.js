import vis from 'vis'
import {
    pipe,
    map,
    reduce,
    max,
    prop,
    filter,
    has,
    unnest,
    curry,
    addIndex,
    when,
    head,
    isNil,
    complement
} from 'ramda'
import { DOM } from 'rx-lite-dom-events'
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

const maxLevel = pipe(
    map(prop('level')),
    reduce(max, 0)
)

const edge = curry((from, to) => ({ from, to }))

const edges = pipe(
    filter(has('dependencies')),
    map(pkg => map(edge(pkg.name), pkg.dependencies)),
    unnest
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

const loader = document.querySelector('.loader')

const toggleLoader = v => loader.style.display = v ? 'block' : 'none'

network.on('stabilizationIterationsDone', () => toggleLoader(false))

const loadDependencyGraph = (pkgToLoad) => {

    toggleLoader(true)

    return getPackage(pkgToLoad)

        .then(packages => network.setData({

            nodes: new vis.DataSet(nodes(packages)),
            edges: new vis.DataSet(edges(packages)),
        }))
}

const isNotNil = complement(isNil)

network.on('doubleClick',
    pipe(
        prop('nodes'), // selected nodes
        head,
        when(isNotNil, loadDependencyGraph)
    )
)

DOM.submit(document.querySelector('.form'))
    .map(e => {
        e.preventDefault()

        return document.getElementById('search')
    })
    .pluck('value')
    .filter(text => text.length)
    .distinctUntilChanged()
    .subscribe(loadDependencyGraph)

loadDependencyGraph('react')
