function TCPSphere(gl) {
	this.vertexPosBuffer = null
	this.texCoordBuffer = null
	this.indexBuffer = null

	this.shaderProgram = GFX.buildShaderProgram(gl, TCPSphere.shader)
	this._initBuffers(gl)
	this._bindBuffers(gl)

	;["day", "night"].forEach(function(name, i){
		var img = new Image()
		img.src = "tex_"+name+".jpg"
		img.onload = function() {
			gl.activeTexture(gl['TEXTURE'+i])
			this._imgToTex(gl, img)
		}.bind(this)
	}.bind(this))
}

TCPSphere.shader = {}
TCPSphere.shader.fs = "\
	precision mediump float;\
	varying vec2 vTextureCoord;\
	varying vec3 vNormal;\
	uniform sampler2D uSamplerDay;\
	uniform sampler2D uSamplerNight;\
	uniform float uPhase;\
	uniform vec3 uSunPos;\
	uniform vec3 uCameraPos;\
	\
	void main(void) {\
		vec3 dayCol = texture2D(uSamplerDay, vTextureCoord.st).xyz - vec3(0.1);\
		vec3 nightCol = texture2D(uSamplerNight, vTextureCoord.st).xyz * 1.2;\
		vec3 glowCol = vec3(0.6,0.8,1);\
		\
		float glowK = clamp(1.2-dot(normalize(vNormal), uCameraPos)*1.1 - uPhase*5.0, 0.0, 1.0);\
		float dayNightK = clamp(dot(vNormal, uSunPos)*10.0, 0.0, 1.0);\
		vec3 surfaceCol = mix(dayCol, nightCol, dayNightK);\
		\
		vec3 col = mix(surfaceCol, glowCol, glowK*glowK*(1.0-dayNightK));\
		gl_FragColor = vec4(col, 1.0);\
	}"
TCPSphere.shader.vs = "\
	precision mediump float;\
	attribute vec3 aVertexPosition;\
	attribute vec2 aTextureCoord;\
	varying vec2 vTextureCoord;\
	varying vec3 vNormal;\
	uniform mat4 uMVMatrix;\
	uniform mat4 uPMatrix;\
	uniform float uPhase;\
	\
	void main(void) {\
		float phi = aVertexPosition.x, theta = aVertexPosition.z;\
		vec3 spherePosition = vec3(sin(phi)*cos(theta), cos(phi)*cos(theta), sin(theta));\
		gl_Position = uPMatrix * uMVMatrix * vec4(mix(spherePosition, aVertexPosition, uPhase), 1.0);\
		vNormal = spherePosition;\
		vTextureCoord = aTextureCoord;\
	}"
TCPSphere.shader.init = function(gl, prog) {
	gl.useProgram(prog)

	prog.vertexPosAttribute = gl.getAttribLocation(prog, "aVertexPosition")
	gl.enableVertexAttribArray(prog.vertexPosAttribute)

	prog.texCoordAttribute = gl.getAttribLocation(prog, "aTextureCoord")
	gl.enableVertexAttribArray(prog.texCoordAttribute)

	prog.pMatrixUniform = gl.getUniformLocation(prog, "uPMatrix")
	prog.mvMatrixUniform = gl.getUniformLocation(prog, "uMVMatrix")
	prog.daySamplerUniform = gl.getUniformLocation(prog, "uSamplerDay")
	prog.nightSamplerUniform = gl.getUniformLocation(prog, "uSamplerNight")
	prog.phaseUniform = gl.getUniformLocation(prog, "uPhase")
	prog.sunPosUniform = gl.getUniformLocation(prog, "uSunPos")
	prog.cameraPosUniform = gl.getUniformLocation(prog, "uCameraPos")

	gl.uniform1i(prog.daySamplerUniform, 0)
	gl.uniform1i(prog.nightSamplerUniform, 1)
}

TCPSphere.prototype.draw = function(gfx) {
	var gl = gfx.gl
	gl.useProgram(this.shaderProgram)
	this._bindBuffers(gl)

	var axialTilt = 23.43 * Math.PI/180
	var xRot = Date.now()/5000
	var sunX=Math.cos(xRot)*Math.cos(axialTilt), sunY=Math.sin(xRot)*Math.cos(axialTilt), sunZ=Math.sin(axialTilt)

	var a=gfx.camera.xRot, b=gfx.camera.yRot
	var camX=-Math.sin(a)*Math.cos(b), camY=Math.cos(a)*Math.cos(b), camZ=-Math.sin(b)

	gl.uniformMatrix4fv(this.shaderProgram.pMatrixUniform, false, gfx.camera.pMatrix)
	gl.uniformMatrix4fv(this.shaderProgram.mvMatrixUniform, false, gfx.camera.mvMatrix)
	gl.uniform1f(this.shaderProgram.phaseUniform, (Math.sin(Date.now()/1000)/2+0.5)*0)
	gl.uniform3f(this.shaderProgram.sunPosUniform, sunX, sunY, sunZ)
	gl.uniform3f(this.shaderProgram.cameraPosUniform, camX, camY, camZ)

	gl.drawElements(gl.TRIANGLES, this.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0)
}

TCPSphere.prototype._initBuffers = function(gl) {
	var hsteps = 64, vsteps = hsteps/2
	var vtxNumber = (hsteps+1)*(vsteps+1)
	var indNumber = hsteps*vsteps*6

	var vertices = new Float32Array(vtxNumber*3)
	var texCoords = new Float32Array(vtxNumber*2)
	var indexes = new Uint16Array(indNumber)

	function vtx(o, phi, theta) {
		vertices[o*3  ] = phi-Math.PI
		vertices[o*3+1] = 0
		vertices[o*3+2] = theta-Math.PI/2
	}
	function tex(o, u, v) {
		texCoords[o*2  ] = u
		texCoords[o*2+1] = v
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
			tri(o,   i +j *h, i +j1*h, i1+j*h)
			tri(o+1, i +j1*h, i1+j1*h, i1+j*h)
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

TCPSphere.prototype._bindBuffers = function(gl) {
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPosBuffer)
	gl.vertexAttribPointer(this.shaderProgram.vertexPosAttribute, this.vertexPosBuffer.itemSize, gl.FLOAT, false, 0, 0)

	gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer)
	gl.vertexAttribPointer(this.shaderProgram.texCoordAttribute, this.texCoordBuffer.itemSize, gl.FLOAT, false, 0, 0)

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer)
}

TCPSphere.prototype._imgToTex = function(gl, img) {
	var tex = gl.createTexture()
	gl.bindTexture(gl.TEXTURE_2D, tex)
	//gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img) //RGBA
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR) //NEAREST
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST)
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
