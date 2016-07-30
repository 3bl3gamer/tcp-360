var gfx = new GFX(canvas)
var sphere = new TCPSphere(gfx.gl)
var lines = new LinesHost(gfx.gl)

gfx.start(function(gl){
	sphere.draw(gfx)
	lines.draw(gfx)
})

window.onresize = function() {
	gfx.resize()
}



var isGrabbed=false, prevX=0, prevY=0
function singleDown(x, y, is_switching) {
	prevX = x
	prevY = y
	isGrabbed = true
	return true
}
function singleMove(x, y) {
	if (!isGrabbed) return false
	gfx.camera.addRot((x-prevX)/100, (y-prevY)/100)
	prevX = x
	prevY = y
	return true
}
function singleUp(is_switching) {
	if (!isGrabbed) return false
	isGrabbed = false
	return true
}
control.double({
	singleDown: singleDown,
	singleMove: singleMove,
	singleUp: singleUp,
	startElem: canvas,
	stopElem: window
})



var me = null
var handlers = {
	init: function(data) {
		me = data
	},
	packet: function(data) {
		lines.addLine(me, data, data)
	}
}
function handleEvent(data) {
	var handler = handlers[data.event]
	if (!handler) throw new Error("wrong event: "+data.event)
	handler(data)
}



// mocking
function sendInit() {
	handleEvent({
		event: "init",
		ip: "1.2.3.4",
		latitude: 34.165768,
		longtitude: -118.282969,
		caption: "Newbee Street, California, US"
	})
}
function sendRandomPacket() {
	var places = {
		"Penza": [45.00,53.20],
		"Sydney": [151.21,-33.87],
		"Rapa Nui": [-109.35,-27.12],
		"Moscow": [37.62,55.76],
		"New York": [-74.01,40.71],
		"Giza": [31.21,29.99],
		"Madagascar": [49.65,-15.34],
		"Vladivostok": [131.89,43.12]
	}
	var p = Object.keys(places)[Math.random()*8|0]
	handleEvent({
		event: "packet",
		ip: "4.3.2.1",
		latitude: places[p][1]+Math.random()*10,
		longtitude: places[p][0]+Math.random()*10,
		caption: p,
		port: Math.random()*65536|0,
		type: ["TCP", "UDP", "ICMP"][Math.random()*3|0],
		size: Math.random()*4096|0
	})
}
sendInit()
setInterval(sendRandomPacket, 500)
