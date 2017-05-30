import { normalize, schema } from 'normalizr'
import { compose, values, __, curry, path } from 'ramda';
import { ajaxJson } from './ajax'

const packageScheme = new schema.Entity('package', {}, {
    idAttribute: 'name'
})

packageScheme.define({
    dependencies: [packageScheme]
})

export const getPackage = pkgToLoad => ajaxJson(`npm/${pkgToLoad}`)

    .then(compose(
        values,
        path(['entities', 'package']),
        curry(normalize)(__, packageScheme)
    ))
