var gfx = new GFX(canvas)
var sphere = new TCPSphere(gfx.gl)
var lines = new LinesHost(gfx.gl)

gfx.start(function(gl){
	sphere.draw(gfx)
	lines.draw(gfx)
})

window.onmousemove = function(e) {
	gfx.camera.setRot(e.clientX / 100, e.clientY / 100)
}
