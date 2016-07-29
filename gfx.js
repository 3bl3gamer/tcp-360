function GFX(canvas) {
	this.canvas = canvas
	this.camera = new GFX.Camera()
	this.resize()

	this.gl = this.gl = this.canvas.getContext('webgl') ||
		this.canvas.getContext("experimental-webgl")

	var gl = this.gl
	gl.clearColor(0.1, 0.1, 0.1, 1)
	gl.enable(gl.BLEND)
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
	gl.enable(gl.DEPTH_TEST)
	gl.depthFunc(gl.LESS)
}

GFX.prototype.resize = function() {
	var rect = this.canvas.getBoundingClientRect()
	var scale = devicePixelRatio
	this.canvas.width = rect.width * scale
	this.canvas.height = rect.height * scale
	this.camera.setAspectRatio(this.canvas.width / this.canvas.height)
}

GFX.prototype.start = function(frameFunc) {
	var onAnimationFrame = function() {
		requestAnimationFrame(onAnimationFrame, this.canvas)
		var gl = this.gl
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
		frameFunc(gl)
	}.bind(this)
	onAnimationFrame()
}

GFX.buildShader = function(gl, shaderText, type) {
	var shader = gl.createShader(type) //type: gl.FRAGMENT_SHADER or gl.VERTEX_SHADER

	gl.shaderSource(shader, shaderText)
	gl.compileShader(shader)
	
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		throw new Error("Shader compile error:\n" + gl.getShaderInfoLog(shader))
	}
	return shader
}

GFX.buildShaderProgram = function(gl, params /*{fs, vs, init(gl,prog)}*/) {
	var fsText=params.fs, vsText=params.vs, init=params.init
	var fragmentShader = this.buildShader(gl, fsText, gl.FRAGMENT_SHADER)
	var vertexShader = this.buildShader(gl, vsText, gl.VERTEX_SHADER)

	var prog = gl.createProgram()
	gl.attachShader(prog, vertexShader)
	gl.attachShader(prog, fragmentShader)
	gl.linkProgram(prog)

	if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
		var err = gl.getProgramInfoLog(prog)
		gl.deleteProgram(prog)
		throw new Error("Shader linking error:\n" + err)
	}

	if (init) init(gl, prog)
	return prog
}

GFX.Camera = function() {
	this.pMatrix = mat4.create()
	this.fov = 50
	this.aspectRatio = 1
	this.xRot = 0
	this.yRot = 0
}

GFX.Camera.prototype._updateMatrix = function() {
	mat4.perspective(this.fov, this.aspectRatio, 0.1, 10.0, this.pMatrix)
	mat4.translate(this.pMatrix, [0, 0, -3])
	mat4.rotateX(this.pMatrix, this.yRot + Math.PI/2)
	mat4.rotateZ(this.pMatrix, this.xRot)
}

GFX.Camera.prototype.setAspectRatio = function(aspectRatio) {
	this.aspectRatio = aspectRatio
	this._updateMatrix()
}

GFX.Camera.prototype.setRot = function(dx, dy) {
	this.xRot = dx
	this.yRot = dy
	this._updateMatrix()
}
