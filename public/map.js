let zips = await fetch('/lower48.json')
zips = await zips.json()
zips = zips.map(x => ({...x, selected: false}))

const zoomInBtn = document.getElementById('zoomIn-btn')
const zoomOutBtn = document.getElementById('zoomOut-btn')
const selectBtn = document.getElementById('select-btn')
const selectPop = document.getElementById('select-pop')

let tool = null
let selectorSquare = null

let selectedPop = 0

const POP = 327529165
const NUM_STATES = 100
const TARGET = POP/NUM_STATES
const MAXLAT = 52
const MINLAT = 22
const MAXLNG = -65
const MINLNG = -127
const HEIGHT = MAXLAT - MINLAT
const WIDTH = MAXLNG - MINLNG
let CANVAS_SIZE = 100

const RATIO = HEIGHT / WIDTH

zoomInBtn.addEventListener('click', ()=>{
    tool = 'zoomIn'
    document.documentElement.style.cursor = 'zoom-in'
})

zoomOutBtn.addEventListener('click', ()=>{
    tool = 'zoomOut'
    document.documentElement.style.cursor = 'zoom-out'
})

selectBtn.addEventListener('click', ()=>{
    tool = 'select'
    document.documentElement.style.cursor = 'crosshair'
})

const mapCanvas = document.querySelector('#map')
setCanvasSize()
const map = mapCanvas.getContext('2d')

const selectorCanvas = document.querySelector('#selector-canvas')
setCanvasSize(selectorCanvas)
const selectorCtx = selectorCanvas.getContext('2d')


selectorCanvas.addEventListener('click', e => {
    switch (tool) {
        case 'zoomIn':
            resizeMap(20)
            break
        case 'zoomOut':
            resizeMap(-20)
            break
    }
})

function setCanvasSize(canvas = mapCanvas) {
    canvas.style.width = CANVAS_SIZE + "%"
    canvas.width = canvas.offsetWidth
    canvas.height = Math.round(canvas.width * RATIO)
}

function handleSelectorMouseMove(e) {
    let {top, left} = e.target.getBoundingClientRect()
    let x = e.clientX - left
    let y = e.clientY - top
    if (!selectorSquare) {
        selectorSquare = [x, y, 0, 0]
    } else {
        selectorSquare[2] = x - selectorSquare[0]
        selectorSquare[3] = y - selectorSquare[1]
    }
    drawSelectorSquare()
}

function drawSelectorSquare() {
    clearSelectorCtx()
    selectorCtx.beginPath()
    selectorCtx.rect(...selectorSquare)
    selectorCtx.strokeStyle = 'red'
    selectorCtx.stroke()
}

function setSelection() {
    let left = selectorSquare[0]
    let top = selectorSquare[1]
    let right = left + selectorSquare[2]
    let bottom = top + selectorSquare[3]
    selectedPop = 0
    zips.forEach(zip => {
        if (
            zip.canvasX >= left &&
            zip.canvasX <= right &&
            zip.canvasY >= top &&
            zip.canvasY <= bottom
        ) {
            zip.selected = true
            selectedPop += zip.population
        } else zip.selected = false
    })
    drawMap()
    selectPop.innerText = commas(selectedPop)
}

function commas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function clearSelectorCtx() {
    selectorCtx.clearRect(0, 0, selectorCanvas.width, selectorCanvas.height)
}

selectorCanvas.addEventListener('mousedown', e => {
    switch (tool) {
        case 'select':
            selectorCanvas.addEventListener('mousemove', handleSelectorMouseMove)
            break
    }
})

selectorCanvas.addEventListener('mouseup', e => {
    switch (tool) {
        case 'select':
            clearSelectorCtx()
            setSelection()
            selectorCanvas.removeEventListener('mousemove', handleSelectorMouseMove)
            selectorSquare = null
            break
    }
})

function getCoords({ lat, lng }) {
    let x = Math.round(((lng - MINLNG) / WIDTH) * mapCanvas.width)
    let y = Math.round(((lat - MINLAT) / HEIGHT) * mapCanvas.height)
    y = mapCanvas.height - y
    return [x, y]
}

function drawDot(x, y, color = 'blue') {
    // if (color === 'red') console.log(x, y);
    map.beginPath()
    map.rect(x, y, 2, 2)
    map.fillStyle = color
    map.fill()
}

function clearMap() {
    map.clearRect(0, 0, mapCanvas.width, mapCanvas.height)
}

function drawMap() {
    clearMap()
    zips.forEach(zip => {
        let [x, y] = getCoords(zip)
        zip.canvasX = x
        zip.canvasY = y
        drawDot(x, y, zip.selected ? 'red' : 'blue')
    })
}

function resizeMap(n) {
    let newSize = CANVAS_SIZE + n
    if (newSize > 500 || newSize <= 20) return
    CANVAS_SIZE = newSize
    setCanvasSize()
    setCanvasSize(selectorCanvas)
    drawMap()
}


drawMap()