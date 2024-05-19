import '../global.css'
import './tent-sheet.css'
import { exampleData } from './exampleData'
import moment from 'moment'
import QRCode from 'qrcode'

const data = {
    count: 0,
    structure: null,
    status: 'waiting',
    tableConnected: false,
    rowConnected: false,
    haveRows: false,
}
let app = undefined

Vue.filter('fallback', function (value, str) {
    if (!value) {
        throw new Error('Please provide column ' + str)
    }
    return value
})

Vue.filter('asDate', function (value) {
    if (typeof value === 'number') {
        value = new Date(value * 1000)
    }
    const date = moment.utc(value)

    return date.isValid() ? date.format('MMMM D') : value
})

Vue.filter('mapLink', function (structure) {
    if (!structure.Location) {
        return ''
    }
    const [lat, lon] = structure.Location.split(',')
    return `https://map.emfcamp.org/?embed=true#18/${lat}/${lon}/B,P,St`
})

Vue.filter('round', function (value) {
    if (!value) {
        return ''
    }
    return Math.round(value)
})

function tweakUrl(url) {
    if (!url) {
        return url
    }
    if (url.toLowerCase().startsWith('http')) {
        return url
    }
    return 'https://' + url
}

function handleError(err) {
    console.error(err)
    const target = app || data
    target.structure = ''
    target.status = String(err).replace(/^Error: /, '')
    console.log(data)
}

function updateStructure(row) {
    try {
        data.status = ''
        if (row === null) {
            throw new Error('(No data - not on row - please add or select a row)')
        }
        if (row.References) {
            try {
                Object.assign(row, row.References)
            } catch (err) {
                throw new Error('Could not understand References column. ' + err)
            }
        }

        data.structure = Object.assign({}, data.structure, row)

        const [lat, lon] = data.structure.Location.split(',')

        QRCode.toDataURL(
            `https://map.emfcamp.org/#17.5/${lat}/${lon}/B,P,St/m=${lat},${lon}`,
            { errorCorrectionLevel: 'H' },
            function (err, url) {
                if (err) {
                    console.error(err)
                    return
                }
                data.structure.qrcode = url
            }
        )
    } catch (err) {
        handleError(err)
    }
}

ready(function () {
    // Update the invoice anytime the document data changes.
    grist.ready()
    grist.onRecord(updateStructure)

    // Monitor status so we can give user advice.
    grist.on('message', (msg) => {
        // If we are told about a table but not which row to access, check the
        // number of rows.  Currently if the table is empty, and "select by" is
        // not set, onRecord() will never be called.
        if (msg.tableId && !app.rowConnected) {
            grist.docApi
                .fetchSelectedTable()
                .then((table) => {
                    if (table.id && table.id.length >= 1) {
                        app.haveRows = true
                    }
                })
                .catch((e) => console.log(e))
        }
        if (msg.tableId) {
            app.tableConnected = true
        }
        if (msg.tableId && !msg.dataChange) {
            app.RowConnected = true
        }
    })

    Vue.config.errorHandler = function (err, vm, info) {
        console.log('Vue error:', err, vm, info)
        handleError(err)
    }

    app = new Vue({
        el: '#app',
        data: data,
    })

    if (document.location.search.includes('demo')) {
        updateStructure(exampleData)
    }
})

function ready(fn) {
    if (document.readyState !== 'loading') {
        fn()
    } else {
        document.addEventListener('DOMContentLoaded', fn)
    }
}
