function GFX(canvas) {
	this.canvas = canvas
	this.resize()

	this.gl = this.gl = this.canvas.getContext('webgl') ||
		this.canvas.getContext("experimental-webgl")

	var gl = this.gl
	gl.clearColor(0.3, 0.3, 0.3, 1)
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
