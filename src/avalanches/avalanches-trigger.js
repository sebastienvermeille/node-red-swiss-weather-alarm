const proj4 = require("proj4");
module.exports = function(RED) {
    function AvalanchesTriggerNode(config) {
        RED.nodes.createNode(this,config);
        this.prefix = config.prefix; // TODO: check if usefull
        var node = this;
        node.warn("woops");

        // Retrieve the config node
        this.coordinates = RED.nodes.getNode(config.coordinates);

        if (this.coordinates) {


        } else {
            // No config node configured
            console.error("Should have coordinates")
        }

        node.on('input', function(msg) {

            if (this.coordinates) {

                var swissProjection = "+proj=somerc +lat_0=46.9524055555556 +lon_0=7.43958333333333 +k_0=1 +x_0=600000 +y_0=200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs +type=crs";

                let res = proj4(swissProjection,[
                    Number(this.coordinates.latitude),
                    Number(this.coordinates.longitude)
                ]);

                msg.payload = {
                    "coordinates": res
                };
                node.send(msg);


            } else {
                // No config node configured
                console.error("Should have coordinates")
            }
        });
    }
    RED.nodes.registerType("avalanches-trigger",AvalanchesTriggerNode);
}
