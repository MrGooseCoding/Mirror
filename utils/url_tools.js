const { URL } = require('url')

function get_search_params (url) {
    const params = new URL(url).search
    const url_params = new URLSearchParams(params)
    return url_params
}

function search_params_to_dict (search_params) {
    return Object.fromEntries(search_params.entries());
}

function format_pathname (pathname) {
    return pathname.endsWith('/') ? pathname : `${pathname}/`
}

module.exports = { get_search_params, search_params_to_dict, format_pathname }