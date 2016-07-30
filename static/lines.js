function LinesHost(gl) {
	this.mvMatrix = mat4.identity(mat4.create())
	this.lines = []

	this.vertexPosBuffer = null
	this.shaderProgram = GFX.buildShaderProgram(gl, LinesHost.shader)
	this._initBuffers(gl)
	this._bindBuffers(gl)
}

LinesHost.shader = {}
LinesHost.shader.fs = "\
	precision mediump float;\
	varying float vBrightness;\
	uniform vec3 uColor;\
	\
	void main(void) {\
		gl_FragColor = vec4(uColor*vBrightness, 1);\
	}"
LinesHost.shader.vs = "\
	precision mediump float;\
	attribute vec3 aVertexPosition;\
	varying float vBrightness;\
	uniform mat4 uMVMatrix;\
	uniform mat4 uPMatrix;\
	uniform vec2 uRot0;\
	uniform vec2 uRot1;\
	uniform float uFill;\
	const float PI = 3.1415926535897932384626433832795;\
	\
	void main(void) {\
		float k = aVertexPosition.x;\
		vec3 f = vec3(sin(uRot0.x)*cos(uRot0.y), cos(uRot0.x)*cos(uRot0.y), -sin(uRot0.y));\
		vec3 t = vec3(sin(uRot1.x)*cos(uRot1.y), cos(uRot1.x)*cos(uRot1.y), -sin(uRot1.y));\
		float len = distance(t, f);\
		float dis = distance(-t, f)*0.5;\
		vec3 mid = normalize(f+t);\
		gl_Position = uPMatrix * uMVMatrix * vec4(mix(f, t, cos(k*PI)*0.5+0.5) + mid*sin(k*PI)*(1.05-dis), 1.0);\
		vBrightness = clamp((k+uFill-0.9)*10.0, 0.0, 1.0);\
	}"
LinesHost.shader.init = function(gl, prog) {
	gl.useProgram(prog)

	prog.vertexPosAttribute = gl.getAttribLocation(prog, "aVertexPosition")
	gl.enableVertexAttribArray(prog.vertexPosAttribute)

	prog.pMatrixUniform = gl.getUniformLocation(prog, "uPMatrix")
	prog.mvMatrixUniform = gl.getUniformLocation(prog, "uMVMatrix")
	prog.rot0Uniform = gl.getUniformLocation(prog, "uRot0")
	prog.rot1Uniform = gl.getUniformLocation(prog, "uRot1")
	prog.colorUniform = gl.getUniformLocation(prog, "uColor")
	prog.fillUniform = gl.getUniformLocation(prog, "uFill")
}

LinesHost.prototype._initBuffers = function(gl) {
	var vertices = new Float32Array(32)
	for (var i=0; i<vertices.length; i++) vertices[i] = i/(vertices.length-1)

	this.vertexPosBuffer = gl.createBuffer()
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPosBuffer)
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
	this.vertexPosBuffer.itemSize = 1
	this.vertexPosBuffer.numItems = vertices.length
}

LinesHost.prototype._bindBuffers = function(gl) {
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPosBuffer)
	gl.vertexAttribPointer(this.shaderProgram.vertexPosAttribute, this.vertexPosBuffer.itemSize, gl.FLOAT, false, 0, 0)
	//gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
}

LinesHost.prototype.draw = function(gfx) {
	var gl = gfx.gl
	gl.useProgram(this.shaderProgram)
	this._bindBuffers(gl)

	gl.lineWidth(2*gfx.scale)
	gl.blendFunc(gl.ONE, gl.ONE)
	gl.depthMask(false)

	gl.uniformMatrix4fv(this.shaderProgram.pMatrixUniform, false, gfx.camera.pMatrix)
	gl.uniformMatrix4fv(this.shaderProgram.mvMatrixUniform, false, this.mvMatrix)

	while (this.lines.length>0 && this.lines[0].hasExpired())
		this.lines.shift()

	var deg2rad = Math.PI/180
	var now = Date.now()
	for (var i=0; i<this.lines.length; i++) {
		var line = this.lines[i]

		var timedelta = now - line.createdAt
		var kFill = timedelta/500
		var kFadeout = Math.min(1, (Line.lifeTime - timedelta)/1000)
		var color = line.color

		gl.uniform2f(this.shaderProgram.rot0Uniform, line.start.longitude*deg2rad, line.start.latitude*deg2rad)
		gl.uniform2f(this.shaderProgram.rot1Uniform, line.end.longitude*deg2rad,   line.end.latitude*deg2rad)
		gl.uniform3f(this.shaderProgram.colorUniform, color[0]*kFadeout, color[1]*kFadeout, color[2]*kFadeout)
		gl.uniform1f(this.shaderProgram.fillUniform, kFill)
		gl.drawArrays(gl.LINE_STRIP, 0, this.vertexPosBuffer.numItems)
	}

	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
	gl.depthMask(true)
}

LinesHost.prototype.addLine = function(start, end, params) {
	this.lines.push(new Line(start, end, params))
}


function Line(start, end, params) {
	this.start = start
	this.end = end
	this.params = params
	this.color = new Float32Array(Line.colors[params.protocol] || Line.colors.default)
	this.createdAt = Date.now()
}

Line.lifeTime = 3000
Line.colors = {
	TCP: [0.5, 0.5, 1],
	UDP: [0.5, 1, 0.5],
	ICMP: [1, 0.5, 1],
	default: [0.8, 0.8, 0.8]
}

Line.prototype.hasExpired = function() {
	return Date.now() - this.createdAt > Line.lifeTime
}
