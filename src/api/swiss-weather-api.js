const proj4 = require("proj4");

export function getSwissCoordinates(){
    var swissProjection = "+proj=somerc +lat_0=46.9524055555556 +lon_0=7.43958333333333 +k_0=1 +x_0=600000 +y_0=200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs +type=crs";

    return proj4(swissProjection,[
        Number(this.coordinates.latitude),
        Number(this.coordinates.longitude)
    ]);
}


function toSwissCoordinate(latitude, longitude){
    var coordinate = [
        longitude,
        latitude
    ];

    var swissEpsg = "+proj=somerc +lat_0=46.9524055555556 +lon_0=7.43958333333333 +k_0=1 +x_0=600000 +y_0=200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs +type=crs";
    proj4.defs("EPSG:21781", swissEpsg);

// var esri = proj4('EPSG:4326', 'EPSG:21781').forward(coordinate, true);
    var swissCoordinates = proj4('EPSG:21781').forward(coordinate, true);

    console.log(swissCoordinates);
    return swissCoordinates;
}

async function fetchDataAsync(url) {
    const response = await fetch(url);
    return await response.json();
}

async function getAreaId(latitude, longitude){
    var coords = toSwissCoordinate(latitude, longitude);
    var apiEndpoint = "https://api3.geo.admin.ch/rest/services/all/MapServer/identify?geometry="+coords[0]+","+coords[1]+"&geometryFormat=geojson&geometryType=esriGeometryPoint&imageDisplay=1391,1070,96&lang=en&layers=all:ch.bafu.gefahren-waldbrand_warnung&mapExtent=312250,-77500,1007750,457500&returnGeometry=true&tolerance=0"
    console.log(apiEndpoint);
    let response = await fetchDataAsync(apiEndpoint);
    let results = response.results;
    if(results.length > 0){
        // has results
        var props = results[0].properties;
        return props["label"];

    } else {
        // no results
        console.log("No info")
        return null;
    }
}

function findWarning(arrayResults, areaId) {
    for(let item of arrayResults){

        var areas = item.areas;

        if(areas.indexOf(areaId) >= 0){
            // found
            var warnLevel = item["warnlevel"];
            var expireAt = item["expires"]; // timestamp
            var createdAt = item["onset"]; // timestamp
            var warnType = item["warn_type"]; // timestamp
            return {
                "severity": warnLevel,
                "expireAt": expireAt,
                "createdAt": createdAt,
                "type": warnType
            }
        }
    }

    return null;
}

async function getLatestDangerVersion(){
    var apiEndpoint = "https://www.meteosuisse.admin.ch/product/output/versions.json";
    let response = await fetchDataAsync(apiEndpoint);

    return response.danger;
}

async function getAlarmsForArea(areaId){

    var dangerVersion = await getLatestDangerVersion();

    var apiEndpoint = "https://www.meteosuisse.admin.ch/product/output/danger/version__"+dangerVersion+"/fr/dangers.json";
    let response = await fetchDataAsync(apiEndpoint);

    let avalanches = response.hazards.avalanches;
    let forestfire = response.hazards.forestfire;
    // to be completed with wind, snow, rain, etc
    let warningsCategories = [
        avalanches,
        forestfire
    ];


    var warnings = [];

    for(cat of warningsCategories){
        var res = findWarning(cat, areaId);
        if(res != null){
            warnings.push(res);
        }
    }
    return warnings;
}

async function main(){

    var latitude = 46.355610;
    var longitude = 7.612880;

    var areaId = await getAreaId(latitude, longitude);
    var alarms = await getAlarmsForArea(areaId);
    console.log(alarms);

}

main();