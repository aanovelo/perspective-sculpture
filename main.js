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

    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Set clear color to black
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

    // Initialize the variables for generating the cubes
    var cubeCountLength = 10;
    var cubeCountHeight = 5;
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
    const radius = 50.0;
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

    // Function to animate the perspective movement
    function animate() {
        // Update the cursor position
        currentCursorX = interpolate(currentCursorX, cursorX, easeFactor);
        currentCursorY = interpolate(currentCursorY, cursorY, easeFactor);

        // Calculate the eye position based on the cursor position
        const newEyePoint = calculateEyePosition(currentCursorX, currentCursorY, radius);

        // Update the view matrix with the new eye position
        const viewMatrix = mat4.create();
        mat4.lookAt(viewMatrix, newEyePoint, lookAtPoint, upVector);
        gl.uniformMatrix4fv(uViewMatrixPointer, false, new Float32Array(viewMatrix))

        // Draw cubes
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        for (var i = 0; i < cubeCount; i++) {
            drawAssets(gl, aPositionPointer, "cube", cubeBuffer, generatedCubes[i], indexBuffer, indices);
            drawAssets(gl, aPositionPointer, "string", stringBuffer, generatedStrings[i], null, null);
        }
        requestAnimationFrame(animate);
    }

    // Start animation
    requestAnimationFrame(animate);
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

// Function to draw assets
function drawAssets(gl, aPositionPointer, whichAsset, assetBuffer, asset, indexBuffer, indices) {
    gl.bindBuffer(gl.ARRAY_BUFFER, assetBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(asset), gl.STATIC_DRAW);
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
