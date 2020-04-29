//// ============================================ LAYOUT ============================================ ////

var sunwidth = parseInt(sundiv.style("width"));
var sunheight = topHeight;
var sunpadding = 10;
var sunradius = (Math.min(sunwidth, sunheight) / 2) - sunpadding - 10;

var sun = sundiv.append("svg")
    .attr("id", "map")
    .attr("width", sunwidth)
    .attr("height", sunheight)
    .append("g")
    .attr("transform", "translate(" + (sunwidth / 2) + "," + (sunheight / 2) + ")");

//// ============================================ LEGEND SETUP ============================================ ////

sun.append("linearGradient")
    .attr("id", "linear-gradient-jok")
    .attr("x1", "0%")
    .attr("x2", "100%")
    .attr("y1", "0%")
    .attr("y2", "0%")
    .selectAll("stop")
    .data([{
        offset: "0%",
        color: colorJokVal0
    }, {
        offset: "100%",
        color: colorJokVal1
    }])
    .enter().append("stop")
    .attr("offset", function(d) {
        return d.offset;
    })
    .attr("stop-color", function(d) {
        return d.color;
    });

sun.append("linearGradient")
    .attr("id", "linear-gradient-pra")
    .attr("x1", "0%")
    .attr("x2", "100%")
    .attr("y1", "0%")
    .attr("y2", "0%")
    .selectAll("stop")
    .data([{
        offset: "0%",
        color: colorPraVal0
    }, {
        offset: "100%",
        color: colorPraVal1
    }])
    .enter().append("stop")
    .attr("offset", function(d) {
        return d.offset;
    })
    .attr("stop-color", function(d) {
        return d.color;
    });

sun.append("linearGradient")
    .attr("id", "linear-gradient-non")
    .attr("x1", "0%")
    .attr("x2", "100%")
    .attr("y1", "0%")
    .attr("y2", "0%")
    .selectAll("stop")
    .data([{
        offset: "0%",
        color: colorNonVal0
    }, {
        offset: "100%",
        color: colorNonVal1
    }])
    .enter().append("stop")
    .attr("offset", function(d) {
        return d.offset;
    })
    .attr("stop-color", function(d) {
        return d.color;
    });

sun.append("linearGradient")
    .attr("id", "linear-gradient-total")
    .attr("x1", "0%")
    .attr("x2", "100%")
    .attr("y1", "0%")
    .attr("y2", "0%")
    .selectAll("stop")
    .data([{
        offset: "0%",
        color: colorTotalVal0
    }, {
        offset: "100%",
        color: colorTotalVal1
    }])
    .enter().append("stop")
    .attr("offset", function(d) {
        return d.offset;
    })
    .attr("stop-color", function(d) {
        return d.color;
    });

sun.append("linearGradient")
    .attr("id", "linear-gradient-jok-pra")
    .attr("x1", "0%")
    .attr("x2", "0%")
    .attr("y1", "0%")
    .attr("y2", "100%")
    .selectAll("stop")
    .data([{
        offset: "0%",
        color: colorJokVal1
    }, {
        offset: "49%",
        color: colorJokVal0
    }, {
        offset: "51%",
        color: colorPraVal0
    }, {
        offset: "100%",
        color: colorPraVal1
    }])
    .enter().append("stop")
    .attr("offset", function(d) {
        return d.offset;
    })
    .attr("stop-color", function(d) {
        return d.color;
    });

var regionLevel = [{
    depth: 0,
    level: "Country"
}, {
    depth: 1,
    level: "Province"
}, {
    depth: 2,
    level: "Regency"
}, {
    depth: -1,
    level: "Total Voters"
}]

//// ============================================ COLORING ============================================ ////

function setSunColor(flag) {
    if (flag) {
        addVoteLegend();
        sun.selectAll("path")
            .style("fill", colorVote);
    } else {
        addRegionLegend();
        sun.selectAll("path")
            .style("fill", function(d) {
                return colorRegion(d.depth);
            });
    }
}

function addRegionLegend() {
    removeLegend();

    sun.selectAll("rect")
        .data(regionLevel)
        .enter().append("rect")
        .attr("id", "legend-bar")
        .attr("x", -sunwidth / 2 + sunpadding)
        .attr("y", function(d) {
            var dist = sunpadding + (sunheight / 2) * -1 + (d.depth + 1) * (sunheight / 24);
            if (d.depth != -1) dist += sunpadding / 2;
            return dist;
        })
        .attr("width", sunwidth / 30)
        .attr("height", sunheight / 24)
        .style("fill", function(d) {
            if (d.depth == -1) return "url(#linear-gradient-total)";
            return colorRegion(d.depth);
        });

    sun.selectAll("text")
        .data(regionLevel)
        .enter().append("text")
        .attr("id", "legend-text")
        .attr("x", -sunwidth / 2 + sunpadding + sunwidth / 30 + sunpadding / 2)
        .attr("y", function(d) {
            var dist = (sunheight / 2) * -1 + sunpadding + sunheight / 24 * (d.depth + 1) + sunheight / 48;
            if (d.depth != -1) dist += sunpadding / 2;
            return dist;
        })
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(function(d) {
            return d.level;
        });
}

function addVoteLegend() {
    removeLegend();

    if (showNonVotes) {
        sun.selectAll("rect")
            .data([{
                value: 0,
                url: "linear-gradient-jok"
            }, {
                value: 1,
                url: "linear-gradient-pra"
            }, {
                value: 2,
                url: "linear-gradient-non"
            }])
            .enter().append("rect")
            .attr("id", "legend-bar")
            .attr("x", -sunwidth / 2 + sunpadding)
            .attr("y", function(d) {
                return sunpadding + (sunheight / 2) * -1 + d.value * (sunheight / 24);
            })
            .attr("width", sunwidth / 30)
            .attr("height", sunheight / 24)
            .style("fill", function(d) {
                return "url(#" + d.url + ")";
            });

        sun.selectAll("text")
            .data([{
                name: "Jokowi"
            }, {
                name: "Prabowo"
            }, {
                name: "Non Voters"
            }])
            .enter().append("text")
            .attr("id", "legend-text")
            .attr("x", -sunwidth / 2 + sunpadding + sunwidth / 30 + sunpadding / 2)
            .attr("y", function(d, i) {
                return (sunheight / 2) * -1 + sunpadding + sunheight / 24 * i + sunheight / 48;
            })
            .attr("dy", ".35em")
            .style("text-anchor", "start")
            .text(function(d) {
                return d.name;
            });
    } else {
        sun.append("rect")
            .attr("id", "legend-bar")
            .attr("x", -sunwidth / 2 + sunpadding)
            .attr("y", (sunheight / 2) * -1 + sunpadding)
            .attr("width", sunwidth / 30)
            .attr("height", sunheight / 8)
            .style("fill", "url(#linear-gradient-jok-pra)");

        sun.selectAll("text")
            .data([{
                name: "Jokowi"
            }, {
                name: ""
            }, {
                name: "Prabowo"
            }])
            .enter().append("text")
            .attr("id", "legend-text")
            .attr("x", -sunwidth / 2 + sunpadding + sunwidth / 30 + sunpadding / 2)
            .attr("y", function(d, i) {
                return (sunheight / 2) * -1 + sunpadding + sunheight / 24 * i + sunheight / 48;
            })
            .attr("dy", ".35em")
            .style("text-anchor", "start")
            .text(function(d) {
                return d.name;
            });
    }
}

function removeLegend() {
    sun.selectAll("#legend-bar").remove();
    sun.selectAll("#legend-text").remove();
}

//// ============================================ ARC ============================================ ////
// Copied from http://bl.ocks.org/mbostock/4348373 (and converted from d3v3 to d3v4)

var x = d3.scaleLinear()
    .range([0, 2 * Math.PI]);

var y = d3.scaleSqrt()
    .range([0, sunradius]);

var arc = d3.arc()
    .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x0))); })
    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x1))); })
    .innerRadius(function(d) { return Math.max(0, y(d.y0)); })
    .outerRadius(function(d) { return Math.max(0, y(d.y1)); });

function zoomArc(d) {
    sun.transition().duration(750)
        .tween("scale", function() {
            var xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
                yd = d3.interpolate(y.domain(), [d.y0, 1]),
                yr = d3.interpolate(y.range(), [d.y0 ? 20 : 0, sunradius]);
            return function(t) {
                x.domain(xd(t));
                y.domain(yd(t)).range(yr(t));
            };
        })
        .selectAll("path")
        .attrTween("d", function(d) { return function() { return arc(d); }; });
}

//// ============================================ MAIN ============================================ ////

function drawSunBurst(idn) {

    // Create Partition
    var partition = d3.partition();
    var root = rootNode
        // Specify value shown
        .each(function(d) {
            d.value = d.total;
        })
        // Remove leaf nodes
        .each(function(d) {
            if (d.depth == 3) { delete d.parent.children; }
        })
        // Sort by total votes
        .sort(function(a, b) {
            return b.total - a.total;
        });

    // Draw Arc
    var chart = sun.selectAll("path")
        .data(partition(root).descendants())
        .enter().append("path")
        .attr("d", arc);

    // Add Interaction
    chart.on("click", function(d) {
            changeNode(d, idn);
            d3.event.stopPropagation();
        })
        .on("mouseover", function(d) {
            d3.select(this).style("opacity", 0.5);
            highlightProvince(d, idn);
        })
        .on("mouseout", function(d) {
            d3.select(this).style("opacity", 1);
            highlightProvince(currentNode, idn);
            hideToolTip();
        })
        .on("mousemove", function(d) {
            var text = d.data.name +
                "</br>" +
                "</br>Jokowi: " + formatNumber(d.jokowi) +
                "</br>Prabowo: " + formatNumber(d.prabowo) +
                "</br>Non Voters: " + formatNumber(d.non) +
                "</br>" +
                "</br>Total : " + formatNumber(d.non + d.jokowi + d.prabowo) + " (" + formatPercentage(d.x1 - d.x0) + ")";

            showToolTip(text);
        });
}