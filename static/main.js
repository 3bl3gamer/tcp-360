var gfx = new GFX(canvas)
var sphere = new TCPSphere(gfx.gl)
var lines = new LinesHost(gfx.gl)

gfx.start(function(gl){
	sphere.draw(gfx)
	lines.draw(gfx)
})

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

window.onresize = function() {
	gfx.resize()
}


function genRandomPacket() {
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
	var p1 = Object.keys(places)[Math.random()*8|0]
	var p2 = Object.keys(places)[Math.random()*8|0]
	var data = {
		start: {
			latitude: places[p1][1],
			longtitude: places[p1][0],
			caption: p1
		},
		end: {
			latitude: places[p2][1],
			longtitude: places[p2][0],
			caption: p2,
			ip: "2.2.2.2"
		},
		type: ["tcp", "udp"][Math.random()*2|0],
		size: 1+Math.random()*2048
	}
	lines.addLine(data)
}
for (var i=10;i--;) genRandomPacket()
