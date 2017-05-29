export function ajaxJson(url, method = 'get', params) {
    return fetch(url, {
        method,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: params && JSON.stringify(params),
    })
        .then(response => response.json());
}