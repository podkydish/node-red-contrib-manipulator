module.exports = function (RED) {
    var generateHTML = function () {
        var HTML = String.raw`<div style="width: 200px; height: 200px; position: relative;" id="circleLineWidgetContainer">`;
        HTML += String.raw`
        <div id="circle" style="width: 20px; 
        height: 20px; border-radius: 50%; 
        background-color: yellow; 
        position: absolute; 
        top: 90px; 
        left: 90px;">
        </div>
        <div class="line" id="line" style="
        height: 30px;
        position: absolute;
        top: 70px; 
        left: 100px;
        background: #000;
        transform-origin: bottom center;
        width: 2px;
        "></div>
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

                initController: function ($scope, events) {
                    var line = document.getElementById('line');
                    var circle = document.getElementById('circle');
                    const parentContainer = document.getElementById('circleLineWidgetContainer');
                    $scope.$watch('msg', function (msg) {
                        if (msg) {
                            if(msg.payload.X!= null &&msg.payload.Y!=null){
                            var point1 = { x: parentContainer.offsetWidth / 2, y: parentContainer.offsetHeight / 2 };
                            var point2 = { x: msg.payload.X, y: msg.payload.Y }; // Вторая точка
                            var angle = Math.atan2(point2.y - point1.y, point2.x - point1.x);
                            line.style.transform = 'rotate(' + angle + 'rad)';
                            }
                            if(msg.payload.V==1){
                                console.log('green');
                                circle.style.backgroundColor='green';
                            }else{
                                console.log('yellow');
                                circle.style.backgroundColor='yellow';

                            }
                        }
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
