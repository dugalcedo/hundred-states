const express = require('express')
const app = express()
const { readFileSync } = require('fs')
const { join } = require('path')
let notLower48 = ["HI", "AK", "GU", "AS", "MP", "PR", "VI"]
const getFile = path => readFileSync(join(__dirname, path), { encoding: 'utf-8' })
const getJSON = path => JSON.parse(getFile(path))
const getAll = () => getJSON('zips.json')
const get48 = () => getJSON('public/lower48.json')
const renderZip = zip => `
    <div class="zip" style="margin-bottom: 1rem;">
        <b>${zip.zip}, ${zip.city}, ${zip.state_id}</b><br>
        <i>${zip.lat}, ${zip.lng}</i><br>
        Population: ${zip.population}
    </div>
`

// const pop48 = get48().reduce((acc, cv) => acc + Number(cv.population), 0)
const POP = 327529165
const NUM_STATES = 100
const TARGET = POP/NUM_STATES
const MAXLAT = 50
const MINLAT = 24
const MAXLNG = -67
const MINLNG = -125

app.use(express.static(join(__dirname, 'public')))

app.get('/by/:x', (req, res) => {
    const { x } = req.params
    let zips = get48()
    zips.sort((a, b) => b[x] - a[x])
    let html = ``
    zips.forEach(zip => {
        html += renderZip(zip)
    })
    res.send(html)
})

app.get('/', (req, res) => {
    res.send(getFile('map.html'))
})

/*
{
    "zip": "00601",
    "lat": 18.18027,
    "lng": -66.75266,
    "city": "Adjuntas",
    "state_id": "PR",
    "state_name": "Puerto Rico",
    "zcta": "TRUE",
    "parent_zcta": "",
    "population": 17126,
    "density": 102.6,
    "county_fips": 72001,
    "county_name": "Adjuntas",
    "county_weights": {
    "72001": 98.73,
    "72141": 1.27
    },
    "county_names_all": "Adjuntas|Utuado",
    "county_fips_all": "72001|72141",
    "imprecise": "FALSE",
    "military": "FALSE",
    "timezone": "America/Puerto_Rico"
},
*/


app.listen(4321, ()=>{console.log('Listening on 4321')})