import { normalize, schema } from 'normalizr'
import { pipe, values, __, curry, path } from 'ramda';
import { ajaxJson } from './ajax'

const packageScheme = new schema.Entity('package', {}, {
    idAttribute: 'name'
})

packageScheme.define({
    dependencies: [packageScheme]
})

export const getPackage = pkgToLoad => ajaxJson(`npm/${pkgToLoad}`)

    .then(pipe(
        curry(normalize)(__, packageScheme),
        path(['entities', 'package']),
        values
    ))
