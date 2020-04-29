//// ============================================ LAYOUT ============================================ ////

var mapwidth = parseInt(mapdiv.style("width"));
var mapheight = topHeight;

var map = mapdiv.append("svg")
    .attr("id", "mapsvg")
    .attr("width", "100%")
    .attr("height", mapheight);

//// ============================================ MAIN ============================================ ////
// Modified from http://bl.ocks.org/junwatu/ac08d962f07d770aba99 

// Setup Map
var projection = d3.geoEquirectangular()
    .scale(mapwidth * 1.1)
    .rotate([-120, 0])
    .translate([mapwidth / 2 + mapwidth / 40, mapheight / 2 - mapheight / 15]);

var path = d3.geoPath().projection(projection);

// Chloropeth
function drawChloropeth(idn) {

    // Draw Map
    var provinces = topojson.feature(idn, idn.objects.states_provinces);

    map.append("g").attr("class", "map")
        .selectAll(".province")
        .data(provinces.features)
        .enter().append("path")
        .attr("class", "province")
        .attr("id", function(d) {
            var name = d.properties.name;
            if (name == null) name = "null";
            return name.toUpperCase();
        })
        .attr("d", path);

    map.append("g").attr("class", "map")
        .append("path")
        .datum(topojson.mesh(idn, idn.objects.states_provinces, function(a, b) {
            return a !== b;
        }))
        .attr("class", "province-border")
        .attr("d", path);

    // Add interaction
    map.selectAll(".province")
        .on("mouseover", function(d) {
            d3.select(this).style("opacity", 0.5);
        })
        .on("mouseout", function(d) {
            d3.select(this).style("opacity", 1);
            highlightProvince(currentNode, idn);
            hideToolTip();
        })
        .on("mousemove", function(d) {
            if (d.properties.name == null) return "";

            var index = d.properties.name.toUpperCase();
            var node = nameToNode.get(index);
            var text = node.data.name +
                "</br>" +
                "</br>Jokowi: " + formatNumber(node.jokowi) +
                "</br>Prabowo: " + formatNumber(node.prabowo) +
                "</br>Non Voters: " + formatNumber(node.non) +
                "</br>" +
                "</br>Total : " + formatNumber(node.non + node.jokowi + node.prabowo) + " (" + formatPercentage(node.x1 - node.x0) + ")";

            showToolTip(text);
        })
        .on("click", function(d) {
            var name = d.properties.name;
            if (name == null) name = "null";

            var node = nameToNode.get(name.toUpperCase());
            if (node.data.name == currentNode.data.name) changeNode(rootNode, idn);
            else changeNode(node, idn);

            d3.event.stopPropagation();
        });
}

//// ============================================ INTERACTION ============================================ ////

function setMapColor(flag) {
    map.selectAll(".province")
        .style("fill", function(d) {
            if (d.properties.name == null) return "white";
            var index = d.properties.name.toUpperCase();
            var node = nameToNode.get(index);

            if (flag) { return colorVote(node); }
            return colorTotal((node.total - minTotalVote) / (maxTotalVote - minTotalVote));
        });
}

function highlightProvince(node, idn) {
    var provinces = topojson.feature(idn, idn.objects.states_provinces);
    if (node.depth == 2) { node = node.parent; }

    drawHiglight(provinces.features[nameToPathIndex.get(node.data.name)], idn);
}

function drawHiglight(province) {
    map.selectAll(".highlight").remove();
    map.append("path")
        .attr("class", "highlight")
        .attr("fill", "none")
        .attr("stroke", "dimgrey")
        .attr("stroke-width", 2)
        .attr("stroke-linejoin", "round")
        .attr("d", path(province));
}