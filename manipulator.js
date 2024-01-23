module.exports = function (RED) {
    var generateHTML = function () {
        var HTML = String.raw`<div style="width: 500px; height: 400px; position: relative;" id="circleLineWidgetContainer">`;
        HTML += String.raw`
        <button id="resetButton" style="position: absolute; 
        top: 10px; 
        left: 0;">Сброс</button>

        <div id="cube" style = "
        position:absolute;
        top: 10px;
        left: 70px;
        background-color: blue;
        width: 30px;
        height: 20px;
        ">
        </div>
        
        <canvas id="myCanvas" width="500" height="350" style="
        position:absolute; 
        top:50px; 
        left:0;">
        </canvas>
        
        <div id="manipulator" style="
        width: 50px; 
        height: 50px; 
        border-radius: 50%; 
        background-color: black; 
        position: absolute; 
        top: 200px; 
        left: 85px;">
        </div>

        <div class="circle" id="circle" style="
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: yellow;
        position: absolute;
        top: 50px; 
        left: 100px;
        transition: left 1s ease-in-out, top 1s ease-in-out;
        ">
        </div>
        `;
        HTML += "</div>";
        return HTML;
    }

    var ui = undefined;
    function ManipulatorWidget(config) {
        try {
            var node = this;
            if (ui === undefined) {
                ui = RED.require("node-red-dashboard")(RED);
            }

            RED.nodes.createNode(this, config);
            var done = ui.addWidget({
                node: node,
                format: generateHTML(config),
                templateScope: "local",
                group: config.group,
                emitOnlyNewValues: false,
                forwardInputMessages: false,
                storeFrontEndInputAsState: true,
                group: config.group,
                order: config.order,
                width: config.width,
                height: config.height,

                initController: function ($scope) {
                    var prevX = 100;
                    var prevY = 50;
                    var staticHeight = 215;
                    var staticLeft = 100;
                    var hand = document.getElementById('circle');
                    var resetButton = document.getElementById('resetButton');
                    var lamp = document.getElementById('cube');
                    var canvas = document.getElementById('myCanvas');
                    var ctx = canvas.getContext('2d');
                    var xDiff = 0;
                    var yDiff = 0;
                    var lowX = 0;
                    var lowY = 0;
                    var startTime;
                    var animationDuration = 10000;

                    function animateLineDrawing() {
                        if (!startTime) {
                            startTime = Date.now();
                        }

                        var currentTime = Date.now();
                        var elapsed = currentTime - startTime;
                        var progress = elapsed / animationDuration;

                        if (progress > 1) {
                            progress = 1;
                        }

                        var currentX = prevX + 10 + xDiff * 0.0001;
                        var currentY = prevY + 10 + yDiff * 0.0001;

                        ctx.beginPath();
                        ctx.moveTo(lowX, lowY);
                        ctx.lineTo(currentX, currentY);
                        ctx.strokeStyle = 'red';
                        ctx.stroke();
                        lowX = currentX;
                        lowY = currentY;

                        if (progress < 1) {
                            requestAnimationFrame(animateLineDrawing);
                        } else {
                            startTime = null;
                        }
                    }

                    $scope.$watch('msg', function (msg) {
                        if (msg) {
                            if (
                                msg.payload.X != null &&
                                msg.payload.Y != null &&
                                msg.payload.X <= 350 &&
                                ((msg.payload.X >= 50 && msg.payload.Y <= 150 && msg.payload.Y >= -150) ||
                                  (msg.payload.Y > 50 || msg.payload.Y < -50))
                              ){
                                    let x = Number(msg.payload.X);
                                    let y = Number(msg.payload.Y);
                                xDiff = staticLeft + x - prevX;
                                yDiff = staticHeight + y - prevY - 50;
                                lowX = prevX + 10;
                                lowY = prevY + 10;
                                console.log('x=' + x);
                                console.log('y=' + y);
                                animateLineDrawing();

                                console.log('staticHeight=' + staticHeight);
                                console.log('staticLeft=' + staticLeft);

                                console.log('left=' + (staticLeft + x));
                                console.log('top=' + (staticHeight + y));

                                hand.style.left = staticLeft + x + 'px';
                                hand.style.top = staticHeight + y + 'px';

                                prevX = staticLeft + x;
                                prevY = staticHeight + y - 50;
                                lamp.style.backgroundColor = 'blue';
                            } else {
                                lamp.style.backgroundColor = 'red';
                            }
                            if (msg.payload.V == 1) {
                                hand.style.backgroundColor = 'green';
                            } else {
                                hand.style.backgroundColor = 'yellow';
                            }
                        }
                    });

                    resetButton.addEventListener('click', function () {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                    });
                    $scope.send = function (msg) {
                        $scope.send(msg);
                    };
                },

                beforeEmit: function (msg) {
                    return { msg };
                }
            });

        } catch (e) {
            console.log(e);
        }
        node.on("close", done);
    }

    RED.nodes.registerType('ui_manipulator_widget', ManipulatorWidget);
};
