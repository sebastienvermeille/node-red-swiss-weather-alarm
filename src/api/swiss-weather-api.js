const proj4 = require("proj4");

export function getSwissCoordinates(){
    var swissProjection = "+proj=somerc +lat_0=46.9524055555556 +lon_0=7.43958333333333 +k_0=1 +x_0=600000 +y_0=200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs +type=crs";

    return proj4(swissProjection,[
        Number(this.coordinates.latitude),
        Number(this.coordinates.longitude)
    ]);
}
