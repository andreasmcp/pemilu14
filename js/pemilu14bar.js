//// ============================================ LAYOUT ============================================ ////

var barwidth = parseInt(bardiv.style("width"));
var barheight = bottomHeight * 0.5;

var voteInfo = bardiv.append("text").attr("class", "voteinfo");

var bar = bardiv.append("svg")
    .attr("id", "bar")
    .attr("width", barwidth)
    .attr("height", barheight);

var locationName = bardiv.append("text").attr("class", "location");

//// ============================================ MAIN ============================================ ////

function drawBar(node) {
    // Prepare Data
    var data;
    if (!showNonVotes) {
        data = [{
            name: "Jokowi",
            value: node.jokowi,
            ratio: node.jokowi / (node.prabowo + node.jokowi),
            color: colorJok(0.15)
        }, {
            name: "Prabowo",
            value: node.prabowo,
            ratio: node.prabowo / (node.prabowo + node.jokowi),
            color: colorPra(0.15)
        }]
    } else {
        data = [{
            name: "Jokowi",
            value: node.jokowi,
            ratio: node.jokowi / node.total,
            color: colorJok(0.15)
        }, {
            name: "Non Voters",
            value: node.non,
            ratio: node.non / node.total,
            color: colorNon(0.15)
        }, {
            name: "Prabowo",
            value: node.prabowo,
            ratio: node.prabowo / node.total,
            color: colorPra(0.15)
        }]
    }

    // Draw Chart
    var accumulateRatio = 0;
    var chart = bar.selectAll("rect").data(data);

    chart.enter().append("rect")
        .merge(chart)
        .transition().duration(750)
        .attr("y", barheight * 0.15)
        .attr("x", function(d) {
            var position = accumulateRatio;
            accumulateRatio += d.ratio;
            return (position * 100) + "%";
        })
        .attr("height", barheight * 0.7)
        .attr("fill", function(d) {
            return d.color;
        })
        .attr("width", function(d) {
            return (d.ratio * 100) + "%";
        });

    chart.exit().remove();

    // Add Text
    var accumulateRatio = 0;
    var text = bar.selectAll("text").data(data);

    text.enter().append("text")
        .merge(text)
        .transition().duration(750)
        .attr("y", barheight / 2 + barheight / 20)
        .attr("x", function(d) {
            var position = accumulateRatio + d.ratio / 2;
            accumulateRatio += d.ratio;
            return (position * 100) + "%";
        })
        .attr("text-anchor", "middle")
        .text(function(d) {
            return formatPercentage(d.ratio);
        });

    text.exit().remove();

    // Add Interaction
    bardiv.selectAll("rect")
        .on("mousemove", function(d) {
            showToolTip((d.name) + "<br>" + (formatNumber(d.value)) + " votes");
        })
        .on("mouseout", function(d) {
            hideToolTip();
        });
}

//// ============================================ INTERACTION ============================================ ////

function changeBarInfo(node) {
    var info =
        "Jokowi: " + formatNumber(node.jokowi) + " | " +
        "Prabowo: " + formatNumber(node.prabowo) + " | " +
        "Non Voters: " + formatNumber(node.non) + " | " +
        "Total : " + formatNumber(node.non + node.jokowi + node.prabowo) + " (" + formatPercentage(node.x1 - node.x0) + ")";

    var location = node.data.name;
    while (node.parent != null) {
        node = node.parent;
        location = node.data.name + " > " + location;
    }

    locationName.text(location);
    voteInfo.text(info);
}