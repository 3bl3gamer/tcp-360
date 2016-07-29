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
	\
	void main(void) {\
		gl_FragColor = vec4(vec3(1,1,1)*0.3,1);\
	}"
LinesHost.shader.vs = "\
	precision mediump float;\
	attribute vec3 aVertexPosition;\
	uniform mat4 uMVMatrix;\
	uniform mat4 uPMatrix;\
	uniform vec2 uRot0;\
	uniform vec2 uRot1;\
	const float PI = 3.1415926535897932384626433832795;\
	\
	void main(void) {\
		float k = aVertexPosition.x;\
		vec3 f = vec3(sin(uRot0.x)*cos(uRot0.y), cos(uRot0.x)*cos(uRot0.y), -sin(uRot0.y));\
		vec3 t = vec3(sin(uRot1.x)*cos(uRot1.y), cos(uRot1.x)*cos(uRot1.y), -sin(uRot1.y));\
		vec3 mid = normalize(f+t);\
		float l = distance(t, f);\
		gl_Position = uPMatrix * uMVMatrix * vec4(mix(f, t, cos(k*PI)*0.5+0.5) + mid*sin(k*PI)*l*0.5, 1.0);\
	}"
LinesHost.shader.init = function(gl, prog) {
	gl.useProgram(prog)

	prog.vertexPosAttribute = gl.getAttribLocation(prog, "aVertexPosition")
	gl.enableVertexAttribArray(prog.vertexPosAttribute)

	prog.pMatrixUniform = gl.getUniformLocation(prog, "uPMatrix")
	prog.mvMatrixUniform = gl.getUniformLocation(prog, "uMVMatrix")
	prog.rot0Uniform = gl.getUniformLocation(prog, "uRot0")
	prog.rot1Uniform = gl.getUniformLocation(prog, "uRot1")
}

LinesHost.prototype.getPos = function(dest, phi, theta) {
	dest[0] = Math.sin(phi) * Math.cos(theta)
	dest[1] = Math.cos(phi) * Math.cos(theta)
	dest[2] = Math.sin(theta)
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

	gl.lineWidth(2)
	gl.blendFunc(gl.ONE, gl.ONE)
	gl.depthMask(false)

	gl.uniformMatrix4fv(this.shaderProgram.pMatrixUniform, false, gfx.camera.pMatrix)
	gl.uniformMatrix4fv(this.shaderProgram.mvMatrixUniform, false, this.mvMatrix)

	var k = Math.PI/180
	for (var i=0; i<this.lines.length; i++) {
		var line = this.lines[i]
		gl.uniform2f(this.shaderProgram.rot0Uniform, line.data.start.longtitude*k, line.data.start.latitude*k)
		gl.uniform2f(this.shaderProgram.rot1Uniform, line.data.end.longtitude*k, line.data.end.latitude*k)
		gl.drawArrays(gl.LINE_STRIP, 0, this.vertexPosBuffer.numItems)
	}

	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
	gl.depthMask(true)
}

LinesHost.prototype.addLine = function(data) {
	this.lines.push(new Line(data))
}


function Line(data) {
	this.data = data
	this.created_at = Date.now()
}

Line.prototype.hasExpired = function() {
	return Date.now() - this.created_at > 3000
}
