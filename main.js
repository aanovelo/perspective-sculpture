function main() {
    // Retrieve <canvas> element
    var canvas = document.getElementById("main_canvas");
    if (!canvas) {
        console.log("Failed to retrieve the <canvas> element");
    }

    // resize canvas to fit the viewport
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Get the rendering context (WebGL)
    var gl = initializeWebGL(canvas, true);

    // Initialize shaders program
    var vertexShader = initializeShader(gl, "vshader");
    var fragmentShader = initializeShader(gl, "fshader");
    var program = initializeProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    // Initialize the vertex position and normal vector attribute
    var aPositionPointer = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(aPositionPointer);
    var aNormalPointer = gl.getAttribLocation(program, "aNormal");
    gl.enableVertexAttribArray(aNormalPointer);

    // Initialize the uniform variables
    //var uFragColorPointer = gl.getUniformLocation(program, "uColor");
    var uModelMatrixPointer = gl.getUniformLocation(program, "uModelMatrix");
    var uViewMatrixPointer = gl.getUniformLocation(program, "uViewMatrix");
    var uProjectionMatrixPointer = gl.getUniformLocation(program, "uProjectionMatrix");

    gl.clearColor(1.0, 1.0, 1.0, 1.0); // Set clear color to black
    gl.clear(gl.COLOR_BUFFER_BIT);     // Clear color buffer

    // Enable depth testing
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.DEPTH_BUFFER_BIT);

    // Variables for transformation matrices
    var modelMatrix;
    var viewMatrix;
    var projectionMatrix;

    /** START PROJECTION MATRIX SPECIFICATION **/
    //var fieldOfViewYAxis = glMatrix.toRadian(30);
    //var aspectRatio = canvas.width / canvas.height;
    var left = -20;
    var right = 20;
    var bottom = -20;
    var top = 20;
    var nearPlane = 1;
    var farPlane = 100;

    projectionMatrix = mat4.create();
    mat4.ortho(projectionMatrix, left, right, bottom, top, nearPlane, farPlane);
    gl.uniformMatrix4fv(uProjectionMatrixPointer, false, new Float32Array(projectionMatrix));
    /** END PROJECTION MATRIX SPECIFICATION **/

    /** START VIEW MATRIX SPECIFICATION **/
    var lookAtX = Math.random() * 5; // random point where the camera is looking at
    var lookAtY = Math.random() * 10;
    var lookAtZ = Math.random() * 10;
    var lookAtPoint = [lookAtX, lookAtY, lookAtZ, 1.0]; // where the camera is looking at
    var eyePoint = [0.0, 0.0, 10.0, 1.0];   // where the camera is placed
    var upVector = [0.0, 1.0, 0.0, 0.0];    // orientation of the camera

    viewMatrix = mat4.create();
    mat4.lookAt(viewMatrix, eyePoint, lookAtPoint, upVector);
    gl.uniformMatrix4fv(uViewMatrixPointer, false, new Float32Array(viewMatrix));
    /**END VIEW MATRIX SPECIFICATION**/

    /** MODEL MATRIX **/
    modelMatrix = mat4.create();
    modelMatrix = mat4.identity(modelMatrix);
    gl.uniformMatrix4fv(uModelMatrixPointer, false, new Float32Array(modelMatrix));

    // Add normal matrix
    var normalMatrix = mat4.create();
    var uNormalMatrixPtr = gl.getUniformLocation(program, "uNormalMatrix");
    mat4.invert(normalMatrix, modelMatrix);
    mat4.transpose(normalMatrix, normalMatrix);
    gl.uniformMatrix4fv(uNormalMatrixPtr, false, new Float32Array(normalMatrix));

    // Set-up light and material parameters
    var uMaterialDiffuseColorPtr = gl.getUniformLocation(program, "uMaterialDiffuseColor");
    gl.uniform4f(uMaterialDiffuseColorPtr, 0.0, 1.0, 0.0, 1.0);

    var uLightDiffuseColorPtr = gl.getUniformLocation(program, "uLightDiffuseColor");
    gl.uniform4f(uLightDiffuseColorPtr, 1.0, 1.0, 1.0, 1.0);

    var uLightDirectionVectorPtr = gl.getUniformLocation(program, "uLightDirectionVector");
    gl.uniform4f(uLightDirectionVectorPtr, -1.0, -3.0, -5.0, 0.0);






    // TEXTURE PART
    /*
        Related Functions
         loadTexture() - MAIN FUNCTION. Takes a URL of the image and then outputs a texture variable.
         initTextureBuffer()
         setTextureAttribute()
        
        Before "drawAssets" is called, the texture must be bound to the buffer using **gl.bindTexture().**
        In the fragment shader program, we completely replace the object's color with the texture:

        precision highp float;
        varying vec4 vPosition;
        varying vec4 vNormal;
        varying highp vec2 vTextureCoord;
        uniform sampler2D uSampler;
        uniform vec4 uLightDiffuseColor;
        uniform vec4 uLightDirectionVector;

        void main() {
            highp vec4 texelColor = texture2D(uSampler, vTextureCoord);
            vec3 normal = normalize(vNormal.xyz);
            vec3 lightDir = normalize(-uLightDirectionVector.xyz);

            float lambertian = max(dot(normal, lightDir), 0.0);
            gl_FragColor = vec4(texelColor.rgb * uLightDiffuseColor.rgb * lambertian, 1.0);
        }

        texture2D is used to get the pixel data of the texture in respect with its coordinates, therefore texelColor.rgb is the one used and
        applied with lighting calculations basta yon

    */

    var aTextureCoordPtr = gl.getAttribLocation(program, "aTextureCoord");

    //
    // Initialize a texture and load an image.
    // When the image finished loading copy it into the texture.
    //
    // FUNCTION FOR LOADING IMAGE, return texture object after
    function loadTexture(gl, url) {
        const texture = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, texture);
        const level = 0;
        const internalFormat = gl.RGBA;
        const width = 1;
        const height = 1;
        const border = 0;
        const srcFormat = gl.RGBA;
        const srcType = gl.UNSIGNED_BYTE;
        const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
        gl.texImage2D(
        gl.TEXTURE_2D,
        level,
        internalFormat,
        width,
        height,
        border,
        srcFormat,
        srcType,
        pixel,
        );
    
        const image = new Image();
        image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            level,
            internalFormat,
            srcFormat,
            srcType,
            image,
        );
    
        // WebGL1 has different requirements for power of 2 images
        // vs. non power of 2 images so check if the image is a
        // power of 2 in both dimensions.
        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            // Yes, it's a power of 2. Generate mips.
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            // No, it's not a power of 2. Turn off mips and set
            // wrapping to clamp to edge
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
        };
        image.src = url;
    
        return texture;
    }
    
    function isPowerOf2(value) {
        return (value & (value - 1)) === 0;
    }

    // Flip image pixels into the bottom-to-top order that WebGL expects.
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);


    // LOAD THE TILES FOLDER
    let textures = [];
    const totalTiles = 117; // Total number of tiles

    for (let i = 1; i <= totalTiles; i++) {
        const texture = loadTexture(gl, `./tiles/mona_lisa_${i}.png`);
        textures.push(texture);
    }

    


    function initTextureBuffer(gl) {
        const textureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
      
        const textureCoordinates = [
          // Front
          0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
          // Back
          0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
          // Top
          0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
          // Bottom
          0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
          // Right
          0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
          // Left
          0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        ];
      
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array(textureCoordinates),
          gl.STATIC_DRAW,
        );
      
        return textureCoordBuffer;
      }

      const textureCoordBuffer = initTextureBuffer(gl);

      function setTextureAttribute(gl) {
        const num = 2; // every coordinate composed of 2 values
        const type = gl.FLOAT; // the data in the buffer is 32-bit float
        const normalize = false; // don't normalize
        const stride = 0; // how many bytes to get from one set to the next
        const offset = 0; // how many bytes inside the buffer to start from
        gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
        gl.vertexAttribPointer(
          aTextureCoordPtr,
          num,
          type,
          normalize,
          stride,
          offset,
        );
        gl.enableVertexAttribArray(aTextureCoordPtr);
      }

      setTextureAttribute(gl);
  










    // Initialize the variables for generating the cubes
    var cubeCountLength = 9;
    var cubeCountHeight = 13;
    var cubeCount = cubeCountLength * cubeCountHeight;
    var edgeLength = 2.0;
    var startCoordX = -cubeCountLength * edgeLength / 2;
    var startCoordY = -cubeCountLength * edgeLength / 2;
    var generatedCubes = [];
    createCubes(cubeCountLength, cubeCountHeight, edgeLength, startCoordX, startCoordY, generatedCubes);

    // Indices of the vertices
    var indices = [
        0, 1, 2, 0, 2, 3,       // Front face
        4, 5, 6, 4, 6, 7,       // Back face
        8, 9, 10, 8, 10, 11,    // Top face
        12, 13, 14, 12, 14, 15, // Bottom face
        16, 17, 18, 16, 18, 19, // Right face
        20, 21, 22, 20, 22, 23  // Left face
    ];

    // Buffer creation for the indices
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    // Normal of each vertex
    var normals = [
        0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0,   // front
        0.0, 0.0, -1.0, 0.0, 0.0, 0.0, -1.0, 0.0, 0.0, 0.0, -1.0, 0.0, 0.0, 0.0, -1.0, 0.0,  // front
        0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0,   // front
        0.0, -1.0, 0.0, 0.0, 0.0, -1.0, 0.0, 0.0, 0.0, -1.0, 0.0, 0.0, 0.0, -1.0, 0.0, 0.0,  // front
        1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0,   // right
        -1.0, 0.0, 0.0, 0.0, -1.0, 0.0, 0.0, 0.0, -1.0, 0.0, 0.0, 0.0, -1.0, 0.0, 0.0, 0.0   // left
    ];

    // Buffer creation for the normal vectors
    var normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
    gl.vertexAttribPointer(aNormalPointer, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aNormalPointer);

    // Initialize the variables for generating the strings
    var generatedStrings = [];
    var cubeCenter = edgeLength / 2;
    createStrings(cubeCount, generatedCubes, cubeCenter, top, generatedStrings);

    // Buffer creation for the cubes and strings
    var cubeBuffer = gl.createBuffer();
    var stringBuffer = gl.createBuffer();


    // CANVAS ROTATION HANDLER
    // left click to rotate

    // How far the cam is from the object
    let radius = 50.0;
    const easeFactor = 0.05;

    // Variables for mouse movement
    let isMouseDown = false;
    let cursorX = 0;
    let cursorY = 0;
    let currentCursorX = 0;
    let currentCursorY = 0;
    let initialMouseX = 0;
    let initialMouseY = 0;

    // Listener for mouse movement
    window.addEventListener('mousemove', (event) => {
        if (isMouseDown) {
            const mouseX = event.clientX;
            const mouseY = event.clientY;

            const deltaX = mouseX - initialMouseX;
            const deltaY = mouseY - initialMouseY;

            const sensitivity = 0.005;
            cursorX += deltaX * sensitivity;
            cursorY += deltaY * sensitivity;

            initialMouseX = mouseX;
            initialMouseY = mouseY;
        }
    });

    // Listener when mouse button is pressed
    window.addEventListener('mousedown', (event) => {
        if (event.button === 0) {
            isMouseDown = true;
            initialMouseX = event.clientX;
            initialMouseY = event.clientY;
        }
    });

    // Listener when mouse button is released
    window.addEventListener('mouseup', (event) => {
        if (event.button === 0) { // Left mouse button (button 0)
            isMouseDown = false;
        }
    });

    window.addEventListener('keydown', (event) => {
        const rotationStep = 0.05; // Adjust rotation step size as needed
        switch (event.key) {
            case 'ArrowLeft': // Rotate left
                cursorX -= rotationStep;
                break;
            case 'ArrowRight': // Rotate right
                cursorX += rotationStep;
                break;
            case 'ArrowUp': // Rotate up
                cursorY += rotationStep;
                break;
            case 'ArrowDown': // Rotate down
                cursorY -= rotationStep;
                break;
        }
    });

    window.addEventListener('wheel', (event) => {
        const zoomStep = 1.0;
        if (event.deltaY < 0) {
            radius = Math.max(5.0, radius - zoomStep); // preventing zooming in too much
        } else {
            radius = Math.min(100.0, radius + zoomStep); // preventing zooming out too far
        }
    });

    let idleTime = 0;
    let isIdle = true;

    function resetIdleState() {
        isIdle = false;
        idleTime = 0;
        setTimeout(() => {
            isIdle = true;
        }, 3000); // 3 seconds of inactivity
    }

    // event listeners to detect user activity
    ['mousemove', 'mousedown', 'keydown', 'wheel'].forEach(eventType => {
        window.addEventListener(eventType, resetIdleState);
    });

    var bufferMap = generateBufferMap(gl, generatedCubes, cubeCount);
    var stringBufferMap = generateStringBufferMap(gl, generatedStrings, cubeCount);


    // Function to animate the perspective movement
    function animate() {
        // Update the cursor position
        currentCursorX = interpolate(currentCursorX, cursorX, easeFactor);
        currentCursorY = interpolate(currentCursorY, cursorY, easeFactor);

        // apply slow levitation when idle
        if (isIdle) {
            idleTime += 0.01;
            cursorY += Math.sin(idleTime) * 0.002; // slow up and down movement
            cursorX += Math.cos(idleTime) * 0.001; // slow rotation
        }

        // calculate the eye position based on the radius (zoom level)
        const eyeX = radius * Math.sin(currentCursorX) * Math.cos(currentCursorY);
        const eyeY = radius * Math.sin(currentCursorY);
        const eyeZ = radius * Math.cos(currentCursorX) * Math.cos(currentCursorY);
        const newEyePoint = [eyeX, eyeY, eyeZ, 1.0];

        // Update the view matrix with the new eye position
        const viewMatrix = mat4.create();
        mat4.lookAt(viewMatrix, newEyePoint, lookAtPoint, upVector);
        gl.uniformMatrix4fv(uViewMatrixPointer, false, new Float32Array(viewMatrix))

        // Draw cubes
        gl.clearColor(1.0, 1.0, 1.0, 1.0); // Set clear color to black
        gl.clear(gl.COLOR_BUFFER_BIT);

        for (var i = 0; i < cubeCount; i++) {

            // index ng picture sorry for weird formula pero it works
            gl.bindTexture(gl.TEXTURE_2D, textures[((((Math.floor(i/13))-1)%9 + 109) - i%13*9)]);

            drawAssets(gl, aPositionPointer, "cube", bufferMap[i], generatedCubes[i], indexBuffer, indices);
            // drawAssets(gl, aPositionPointer, "string", stringBufferMap[i], generatedStrings[i], null, null);
        }

        // drawPlane(gl, aPositionPointer, planeVertexBuffer, planeIndexBuffer, plane.indices.length);
        


        requestAnimationFrame(animate);
    }

    // Start animation
    requestAnimationFrame(animate);
}

function generateBufferMap(gl, generatedCubes, cubeCount) {
    var buffers = []
    for (var i = 0; i < cubeCount; i++) {
        var newBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, newBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(generatedCubes[i]), gl.STATIC_DRAW);
        buffers.push(newBuffer);
    }
    return buffers;
}

function generateStringBufferMap(gl, generatedStrings, cubeCount) {
    var buffers = []
    for (var i = 0; i < cubeCount; i++) {
        var newBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, newBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(generatedStrings[i]), gl.STATIC_DRAW);
        buffers.push(newBuffer);
    }
    return buffers;
}

// Function to draw assets
function drawAssets(gl, aPositionPointer, whichAsset, assetBuffer, asset, indexBuffer, indices) {
    gl.bindBuffer(gl.ARRAY_BUFFER, assetBuffer);
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(asset), gl.STATIC_DRAW);
    gl.vertexAttribPointer(aPositionPointer, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPositionPointer);

    if (whichAsset == "cube") {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0);
    }
    else if (whichAsset == "string") {
        gl.drawArrays(gl.LINES, 0, 2); // Draw the line
    }
}

// Function to create the strings
function createStrings(cubeCount, generatedCubes, cubeCenter, top, generatedStrings) {
    for (var i = 0; i < cubeCount; i++) {
        var x = generatedCubes[i][0] + cubeCenter;  // place the string in the center of the cube
        var y = generatedCubes[i][1] + cubeCenter;
        var z = generatedCubes[i][2] - cubeCenter;
        var string = [
            x, y, z, 1.0,
            x, top, z, 1.0
        ];
        generatedStrings.push(string);
    }
}


// Function to create the cubes
function createCubes(cubeCountLength, cubeCountHeight, edgeLength, startCoordX, startCoordY, generatedCubes) {
    for (var i = 0; i < cubeCountLength; i++) {
        for (var j = 0; j < cubeCountHeight; j++) {
            var x = startCoordX + i * edgeLength;
            var y = startCoordY + j * edgeLength;
            var z = Math.random() * -50;  // random z coordinate
            var cube = [
                // Front face
                x - 1.0, y - 1.0, z + 1.0, 1.0,
                x + 1.0, y - 1.0, z + 1.0, 1.0,
                x + 1.0, y + 1.0, z + 1.0, 1.0,
                x - 1.0, y + 1.0, z + 1.0, 1.0,

                // Back face
                x - 1.0, y - 1.0, z - 1.0, 1.0,
                x - 1.0, y + 1.0, z - 1.0, 1.0,
                x + 1.0, y + 1.0, z - 1.0, 1.0,
                x + 1.0, y - 1.0, z - 1.0, 1.0,

                // Top face
                x - 1.0, y + 1.0, z - 1.0, 1.0,
                x - 1.0, y + 1.0, z + 1.0, 1.0,
                x + 1.0, y + 1.0, z + 1.0, 1.0,
                x + 1.0, y + 1.0, z - 1.0, 1.0,

                // Bottom face
                x - 1.0, y - 1.0, z - 1.0, 1.0,
                x + 1.0, y - 1.0, z - 1.0, 1.0,
                x + 1.0, y - 1.0, z + 1.0, 1.0,
                x - 1.0, y - 1.0, z + 1.0, 1.0,

                // Right face
                x + 1.0, y - 1.0, z - 1.0, 1.0,
                x + 1.0, y + 1.0, z - 1.0, 1.0,
                x + 1.0, y + 1.0, z + 1.0, 1.0,
                x + 1.0, y - 1.0, z + 1.0, 1.0,

                // Left face
                x - 1.0, y - 1.0, z - 1.0, 1.0,
                x - 1.0, y - 1.0, z + 1.0, 1.0,
                x - 1.0, y + 1.0, z + 1.0, 1.0,
                x - 1.0, y + 1.0, z - 1.0, 1.0
            ];
            generatedCubes.push(cube);
        }
    }
}



// Function for linear interpolation
function interpolate(start, end, t) {
    return start + (end - start) * t;
}

// Function to calculate the eye position for the camera
function calculateEyePosition(currentCursorX, currentCursorY, radius) {
    // cursorY stays within limits
    const maxVerticalAngle = Math.PI / 2 - 0.01; // vertical rotation cannot go above 90 degrees
    const clampedCursorY = Math.max(Math.min(currentCursorY, maxVerticalAngle), -maxVerticalAngle);

    const eyeX = radius * Math.sin(currentCursorX) * Math.cos(clampedCursorY); // y axis rotation
    const eyeY = radius * Math.sin(clampedCursorY); // x axis rotation
    const eyeZ = radius * Math.cos(currentCursorX) * Math.cos(clampedCursorY); // y axis rotation
    const newEyePoint = [eyeX, eyeY, eyeZ, 1.0];
    return newEyePoint;
}
