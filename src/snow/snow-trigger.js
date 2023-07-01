const {getSwissCoordinates} = require("../api/swiss-weather-api");
module.exports = function(RED) {
    function SnowTriggerNode(config) {
        RED.nodes.createNode(this,config);

        this.coordinates = RED.nodes.getNode(config.coordinates);

        var node = this;
        node.on('input', function(msg) {


            var coords = getSwissCoordinates(this.coordinates);

            msg.payload = {
                "coordss": coords
            }
            node.send(msg);
        });
    }
    RED.nodes.registerType("snow-trigger",SnowTriggerNode);
}
