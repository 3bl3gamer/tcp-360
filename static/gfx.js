function GFX(canvas) {
	this.canvas = canvas
	this.scale = 1
	this.camera = new GFX.Camera()

	var params = {antialias:true, alpha:false}
	this.gl = this.canvas.getContext("webgl", params) ||
		this.canvas.getContext("experimental-webgl", params)

	this.resize()

	var gl = this.gl
	gl.clearColor(0, 0, 0, 1)
	gl.enable(gl.BLEND)
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
	gl.enable(gl.DEPTH_TEST)
	gl.depthFunc(gl.LESS)
	gl.enable(gl.CULL_FACE)
	//gl.cullFace(gl.BACK)
}

GFX.prototype.resize = function() {
	var rect = this.canvas.getBoundingClientRect()
	this.scale = devicePixelRatio
	this.canvas.width = rect.width * this.scale
	this.canvas.height = rect.height * this.scale
	this.camera.setAspectRatio(this.canvas.width / this.canvas.height)
	this.gl.viewport(0, 0, this.canvas.width, this.canvas.height)
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
	this.mvMatrix = mat4.create()
	this.fov = 25
	this.aspectRatio = 1
	this.xRot = 0
	this.yRot = 0
}

GFX.Camera.prototype._updateMatrices = function() {
	mat4.perspective(this.fov, this.aspectRatio, 0.1, 10.0, this.pMatrix)
	mat4.identity(this.mvMatrix)
	mat4.translate(this.mvMatrix, [0, 0, -5])
	mat4.rotateX(this.mvMatrix, this.yRot + Math.PI/2)
	mat4.rotateZ(this.mvMatrix, -this.xRot)
}

GFX.Camera.prototype.setAspectRatio = function(aspectRatio) {
	this.aspectRatio = aspectRatio
	this._updateMatrices()
}

GFX.Camera.prototype.addRot = function(dx, dy) {
	this.xRot += dx
	this.yRot = Math.max(-Math.PI/2.1, Math.min(this.yRot+dy, Math.PI/2.1))
	this._updateMatrices()
}
