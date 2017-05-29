import { normalize, schema } from 'normalizr'
import { ajaxJson } from './ajax'

const packageScheme = new schema.Entity('package', {}, {
    idAttribute: 'name'
})

packageScheme.define({
    dependencies: [packageScheme]
})

export const getPackage = pkgToLoad => ajaxJson(`npm/${pkgToLoad}`)

    .then(packagesTree => normalize(packagesTree, packageScheme).entities.package)
