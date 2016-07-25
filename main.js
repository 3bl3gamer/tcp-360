function TCPSphere(canvas) {
	this.canvas = canvas
	this.gl = null
	this.shaderProgram = null
	this.vertexPosBuffer = null
	this.texCoordBuffer = null
	this.indexBuffer = null

	this.fov = 75
	this.xRot = 0
	this.yRot = 0

	this.resize()
	this._initGL()
	this._initShaders()
	this._initBuffers()
	this._bindBuffers()

	var gl = this.gl
	gl.clearColor(0.3, 0.3, 0.3, 1)
	gl.enable(gl.BLEND)
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
	gl.enable(gl.DEPTH_TEST)
	gl.depthFunc(gl.LESS)

	window.onmousemove = function(e) {
		this.xRot = e.clientX / 100
		this.yRot = e.clientY / 100
	}.bind(this)
	this._draw()

	var img = new Image()
	img.src = "tex.jpg"
	img.onload = function() {
		this._imgToTex(img)
	}.bind(this)

	setInterval(function(){ this._draw() }.bind(this), 16)
}

TCPSphere.shader = {}
TCPSphere.shader.fs = "\
	precision mediump float;\
	varying vec2 vTextureCoord;\
	uniform sampler2D uSampler;\
	\
	void main(void) {\
		gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));\
	}"
TCPSphere.shader.vs = "\
	precision mediump float;\
	attribute vec3 aVertexPosition;\
	attribute vec2 aTextureCoord;\
	uniform mat4 uMVMatrix;\
	uniform mat4 uPMatrix;\
	uniform float uPhase;\
	varying vec2 vTextureCoord;\
	\
	void main(void) {\
		float phi = aVertexPosition.x, theta = aVertexPosition.z;\
		vec3 spherePosition = vec3(sin(phi)*cos(theta), cos(phi)*cos(theta), sin(theta));\
		gl_Position = uPMatrix * uMVMatrix * vec4(mix(spherePosition, aVertexPosition, uPhase), 1.0);\
		vTextureCoord = aTextureCoord;\
	}"

TCPSphere.prototype.resize = function() {
	var rect = this.canvas.getBoundingClientRect()
	var scale = devicePixelRatio
	this.canvas.width = rect.width * scale
	this.canvas.height = rect.height * scale
}

TCPSphere.prototype._initGL = function() {
	this.gl = this.canvas.getContext('webgl') ||
		this.canvas.getContext("experimental-webgl")
}

TCPSphere.prototype._draw = function() {
	var gl = this.gl

	var pMatrix = mat4.create()
	mat4.perspective(this.fov, this.canvas.width / this.canvas.height, 0.1, 10.0, pMatrix)
	mat4.translate(pMatrix, [0, 0, -3])
	mat4.rotateX(pMatrix, this.yRot + Math.PI/2)
	mat4.rotateZ(pMatrix, this.xRot)
	var mvMatrix = mat4.identity(mat4.create())

	gl.uniformMatrix4fv(this.shaderProgram.pMatrixUniform, false, pMatrix)
	gl.uniformMatrix4fv(this.shaderProgram.mvMatrixUniform, false, mvMatrix)
	gl.uniform1f(this.shaderProgram.phaseUniform, Math.sin(Date.now()/1000)/2+0.5)
	
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
	gl.drawElements(gl.TRIANGLES, this.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0)
}

TCPSphere.prototype._buildShader = function(gl, shaderText, type) {
	var shader = gl.createShader(type) //type: gl.FRAGMENT_SHADER or gl.VERTEX_SHADER

	gl.shaderSource(shader, shaderText)
	gl.compileShader(shader)
	
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		throw new Error("Shader compile error:\n" + gl.getShaderInfoLog(shader))
	}
	return shader
}

TCPSphere.prototype._buildShaderProgram = function(gl, fsText, vsText) {
	var fragmentShader = this._buildShader(gl, fsText, gl.FRAGMENT_SHADER)
	var vertexShader = this._buildShader(gl, vsText, gl.VERTEX_SHADER)

	var prog = gl.createProgram()
	gl.attachShader(prog, vertexShader)
	gl.attachShader(prog, fragmentShader)
	gl.linkProgram(prog)

	if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
		var err = gl.getProgramInfoLog(prog)
		gl.deleteProgram(prog)
		throw new Error("Shader linking error:\n" + err)
	}
	return prog
}

TCPSphere.prototype._initShaders = function() {
	var gl = this.gl
	var prog = this._buildShaderProgram(gl, TCPSphere.shader.fs, TCPSphere.shader.vs)
	gl.useProgram(prog)
	
	prog.vertexPosAttribute = gl.getAttribLocation(prog, "aVertexPosition")
	gl.enableVertexAttribArray(prog.vertexPosAttribute)

	prog.texCoordAttribute = gl.getAttribLocation(prog, "aTextureCoord")
	gl.enableVertexAttribArray(prog.texCoordAttribute)

	prog.pMatrixUniform = gl.getUniformLocation(prog, "uPMatrix")
	prog.mvMatrixUniform = gl.getUniformLocation(prog, "uMVMatrix")
	prog.samplerUniform = gl.getUniformLocation(prog, "uSampler")
	prog.phaseUniform = gl.getUniformLocation(prog, "uPhase")

	this.shaderProgram = prog
}

TCPSphere.prototype._initBuffers = function() {
	var gl = this.gl
	var hsteps = 32, vsteps = hsteps/2
	var vtxNumber = (hsteps+1)*(vsteps+1)
	var indNumber = hsteps*vsteps*6

	var vertices = new Float32Array(vtxNumber*3)
	var texCoords = new Float32Array(vtxNumber*2)
	var indexes = new Uint16Array(indNumber)

	function vtx(o, phi, theta) {
		vertices[o*3  ] = phi-Math.PI//Math.cos(phi) * Math.sin(theta)
		vertices[o*3+1] = 0//Math.sin(phi) * Math.sin(theta)
		vertices[o*3+2] = theta-Math.PI/2//Math.cos(theta)
	}
	function tex(o, u, v) {
		texCoords[o*2  ] = 1-u
		texCoords[o*2+1] = 1-v
	}
	function tri(o, i0, i1, i2) {
		indexes[o*3  ] = i0
		indexes[o*3+1] = i1
		indexes[o*3+2] = i2
	}

	for (var i=0; i<hsteps+1; i++) {
		for (var j=0; j<vsteps+1; j++) {
			var o = i + j*(hsteps+1)
			var phi = i/hsteps * 2*Math.PI
			var theta = j/vsteps * Math.PI
			vtx(o, phi, theta)
			tex(o, i/hsteps, j/vsteps)
		}
	}
	for (var i=0; i<hsteps; i++) {
		for (var j=0; j<vsteps; j++) {
			var o = (i + j*hsteps)*2
			var h = hsteps+1
			var i1=i+1, j1=j+1
			tri(o,   i +j *h, i1+j*h, i +j1*h)
			tri(o+1, i +j1*h, i1+j*h, i1+j1*h)
		}
	}

	this.vertexPosBuffer = gl.createBuffer()
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPosBuffer)
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
	this.vertexPosBuffer.itemSize = 3
	this.vertexPosBuffer.numItems = vertices.length / 3

	this.texCoordBuffer = gl.createBuffer()
	gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer)
	gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW)
	this.texCoordBuffer.itemSize = 2
	this.texCoordBuffer.numItems = texCoords.length / 2
	
	this.indexBuffer = gl.createBuffer()
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer)
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexes, gl.STATIC_DRAW)
	this.indexBuffer.itemSize = 1
	this.indexBuffer.numItems = indexes.length
}

TCPSphere.prototype._bindBuffers = function() {
	var gl = this.gl
	
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPosBuffer)
	gl.vertexAttribPointer(this.shaderProgram.vertexPosAttribute, this.vertexPosBuffer.itemSize, gl.FLOAT, false, 0, 0)
	
	gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer)
	gl.vertexAttribPointer(this.shaderProgram.texCoordAttribute, this.texCoordBuffer.itemSize, gl.FLOAT, false, 0, 0)
	
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer)
}

TCPSphere.prototype._imgToTex = function(img) {
	var gl = this.gl
	var tex = gl.createTexture()
	gl.bindTexture(gl.TEXTURE_2D, tex)
	//gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img) //RGBA
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR) //NEAREST
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
	gl.generateMipmap(gl.TEXTURE_2D)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
	//gl.bindTexture(gl.TEXTURE_2D, null)
	var ext = gl.getExtension('EXT_texture_filter_anisotropic') ||
		    gl.getExtension('MOZ_EXT_texture_filter_anisotropic') ||
		    gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic')
	if (ext){
		var max = gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT)
		gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, max)
	}
	return tex
}

new TCPSphere(canvas)
