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
                    var prevY = 0;  
                    var staticHeight = 215;
                    var staticLeft = 100;
                    var hand = document.getElementById('circle');
                    var resetButton = document.getElementById('resetButton');
                    var lamp = document.getElementById('cube');
                    var canvas = document.getElementById('myCanvas');
                    var ctx = canvas.getContext('2d');
                    
                    $scope.$watch('msg', function (msg) {
                        if (msg) {
                            if(msg.payload.X!= null && msg.payload.Y!=null && msg.payload.X<=350 &&
                                 msg.payload.X>=0 && msg.payload.Y<=150 && msg.payload.Y>=-150){
                                    ctx.beginPath();
                                    ctx.moveTo(prevX+10, prevY+10);
                                    ctx.lineTo(staticLeft+msg.payload.X+10, staticHeight+msg.payload.Y-40);
                                    ctx.strokeStyle = 'red'; 
                                    ctx.stroke();
                                
                                hand.style.left = staticLeft+msg.payload.X +'px';
                                hand.style.top = staticHeight+msg.payload.Y + 'px';
                                
                                prevX = staticLeft+msg.payload.X;
                                prevY = staticHeight+msg.payload.Y - 50;
                                lamp.style.backgroundColor = 'blue';      
                            } else{
                                lamp.style.backgroundColor='red';
                            }
                            if(msg.payload.V==1){
                                hand.style.backgroundColor='green';
                            }else{
                                hand.style.backgroundColor='yellow';
                            }
                        }
                    });
                    
                    resetButton.addEventListener('click', function() {
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
