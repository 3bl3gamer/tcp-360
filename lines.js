function LinesHost(gl) {
	this.mvMatrix = mat4.identity(mat4.create())

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

LinesHost.prototype.draw = function(gfx) {
	var gl = gfx.gl
	gl.useProgram(this.shaderProgram)
	this._bindBuffers(gfx.gl)

	gl.lineWidth(2)
	gl.blendFunc(gl.ONE, gl.ONE)
	gl.depthMask(false)

	gl.uniformMatrix4fv(this.shaderProgram.pMatrixUniform, false, gfx.camera.pMatrix)
	gl.uniformMatrix4fv(this.shaderProgram.mvMatrixUniform, false, this.mvMatrix)

	for (let [a,b] of [[151.21,-33.87], [-109.35,-27.12], [37.62,55.76], [-74.01,40.71], [31.21,29.99], [49.65,-15.34], [131.89,43.12]]) {
		for (let i=0;i<1;i++){
			var [c,d] = [45.00,53.20]
			gl.uniform2f(this.shaderProgram.rot0Uniform, a/180*Math.PI, b/180*Math.PI+i/10)
			gl.uniform2f(this.shaderProgram.rot1Uniform, c/180*Math.PI, d/180*Math.PI)
			gl.drawArrays(gl.LINE_STRIP, 0, this.vertexPosBuffer.numItems)
		}
		//break
	}

	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
	gl.depthMask(true)
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
