//// ============================================ SETUP ============================================ ////

// Layout Vars
var viewWidth = window.innerWidth;
var viewHeight = viewWidth * 9 / 16; // Keep 16:9 ratio

var top = d3.select("#top");
var bottom = d3.select("#bottom");

var topHeight = viewHeight * 0.35;
var middleHeight = viewHeight * 0.05;
var bottomHeight = viewHeight * 0.15;

var mapdiv = d3.select("#map");
var sundiv = d3.select("#sun");
var bardiv = d3.select("#bar");

var topdiv = d3.select("#top");
var middiv = d3.select("#middle");
var bottomdiv = d3.select("#bottom");

// General Settings
var formatNumber = d3.format(",d");
var formatPercentage = d3.format(",.2%");

//// ============================================ COLOR SELECTION ============================================ ////

var colorJokVal0 = d3.rgb("#fdd0a2");
var colorJokVal1 = d3.rgb("#e6550d");
var colorPraVal0 = d3.rgb("#c6dbef");
var colorPraVal1 = d3.rgb("#3182bd");
var colorNonVal0 = d3.rgb("#d9d9d9");
var colorNonVal1 = d3.rgb("#636363");

var colorTotalVal0 = d3.rgb("#c7e9c0");
var colorTotalVal1 = d3.rgb("#31a354");
var colorRegionVal0 = d3.rgb("#dadaeb");
var colorRegionVal1 = d3.rgb("#756bb1");

var colorRegion = d3.scaleLinear()
    .domain([0, 2])
    .range([colorRegionVal1, colorRegionVal0]);

var colorTotal = d3.scaleSqrt()
    .domain([1, 0])
    .interpolate(d3.interpolateHsl)
    .range([colorTotalVal1, colorTotalVal0]);

var colorJok = d3.scaleSqrt()
    .domain([1, 0.5, 0])
    .interpolate(d3.interpolateHsl)
    .range([colorJokVal1, colorJokVal1, colorJokVal0]);

var colorPra = d3.scaleSqrt()
    .domain([1, 0.5, 0])
    .interpolate(d3.interpolateHsl)
    .range([colorPraVal1, colorPraVal1, colorPraVal0]);

var colorNon = d3.scaleSqrt()
    .domain([1, 0.5, 0])
    .interpolate(d3.interpolateHsl)
    .range([colorNonVal1, colorNonVal1, colorNonVal0]);

function colorVote(node) {
    if (showNonVotes) {
        var ratioJok = node.jokowi / node.total;
        var ratioPra = node.prabowo / node.total;
        var ratioNon = node.non / node.total;

        if (ratioJok > ratioPra && ratioJok > ratioNon) {
            return colorJok(node.jokowi / node.total - 1 / 3)
        } else if (ratioPra > ratioNon) {
            return colorPra(node.prabowo / node.total - 1 / 3)
        } else {
            return colorNon(node.non / node.total - 1 / 3)
        };
    } else {
        if (node.jokowi > node.prabowo) {
            return colorJok(node.jokowi / (node.jokowi + node.prabowo) - 1 / 2)
        } else {
            return colorPra(node.prabowo / (node.jokowi + node.prabowo) - 1 / 2)
        };
    }
}

//// ============================================ DATA PREPARATION ============================================ ////

// Shared Vars
var currentNode = null;
var rootNode = null;
var maxTotalVote = 0;
var minTotalVote = Infinity;

var nameToNode = new Map();
var nameToPathIndex = new Map();

function initVoteData(data) {
    rootNode = d3.hierarchy(data)
        // Accumulate vote for Jokowi
        .sum(function(d) {
            if (d.name == "JOKOWI") { return d.vote; }
        })
        .each(function(d) {
            d.jokowi = d.value
        })
        // Accumulate vote for Prabowo
        .sum(function(d) {
            if (d.name == "PRABOWO") { return d.vote; }
        })
        .each(function(d) {
            d.prabowo = d.value
        })
        // Accumulate non votes + total votes
        .sum(function(d) {
            if (d.name == "NON VOTERS") { return d.vote; }
        })
        .each(function(d) {
            d.non = d.value;
            d.total = d.non + d.prabowo + d.jokowi;

            if (d.depth != 0 && d.total > maxTotalVote) maxTotalVote = d.total;
            if (d.depth != 0 && d.total < minTotalVote) minTotalVote = d.total;
        })
        // Remove main value (avoid misuse)
        .each(function(d) {
            delete d.value;
        });
}

// For linking data of map to vote data
function initnameToNode(idn) {
    for (var provinceIndex in rootNode.children) {

        var province = rootNode.children[provinceIndex];
        var indexName = province.data.name.toUpperCase();
        nameToNode.set(indexName, province);

        // Add alternative names
        if (indexName == "DKI JAKARTA") { nameToNode.set("JAKARTA RAYA", province) }
        if (indexName == "DAERAH ISTIMEWA YOGYAKARTA") { nameToNode.set("YOGYAKARTA", province) }
        if (indexName == "KEPULAUAN BANGKA BELITUNG") { nameToNode.set("BANGKA-BELITUNG", province) }
        if (indexName == "PAPUA BARAT") { nameToNode.set("IRIAN JAYA BARAT", province) }
    }

    var provinces = topojson.feature(idn, idn.objects.states_provinces);
    for (var provinceIndex in provinces.features) {
        var province = provinces.features[provinceIndex].properties.name;
        if (province != null) {
            var indexName = nameToNode.get(province.toUpperCase()).data.name;
            nameToPathIndex.set(indexName, provinceIndex);

            // Add alternative names
            if (indexName == "DKI JAKARTA") { nameToPathIndex.set("JAKARTA RAYA", province) }
            if (indexName == "DAERAH ISTIMEWA YOGYAKARTA") { nameToPathIndex.set("YOGYAKARTA", province) }
            if (indexName == "KEPULAUAN BANGKA BELITUNG") { nameToPathIndex.set("BANGKA-BELITUNG", province) }
            if (indexName == "PAPUA BARAT") { nameToPathIndex.set("IRIAN JAYA BARAT", province) }
        }
    }
}

//// ============================================ BUTTONS ============================================ ////

var showNonVotes = null;
var showVoteColor = null;

var switchColorButton = middiv.append("input")
    .attr("type", "button")
    .attr("class", "button")
    .attr("height", middleHeight)
    .on("click", switchColor);

var switchNonVotesButton = middiv.append("input")
    .attr("type", "button")
    .attr("class", "button")
    .attr("height", middleHeight)
    .on("click", switchNonVotes);

function switchColor() {
    if (showVoteColor == true | showVoteColor == null) {
        showVoteColor = false;
        switchColorButton.attr("value", "Show Vote Color");
    } else {
        showVoteColor = true;
        switchColorButton.attr("value", "Hide Vote Color");
    }

    setSunColor(showVoteColor);
    setMapColor(showVoteColor);
}

function switchNonVotes() {
    if (showNonVotes == false | showNonVotes == null) {
        showNonVotes = true;
        switchNonVotesButton.attr("value", "Hide Non Voters");
    } else {
        showNonVotes = false;
        switchNonVotesButton.attr("value", "Show Non Voters");
    }

    drawBar(currentNode);
    if (showVoteColor) {
        setSunColor(showVoteColor);
        setMapColor(showVoteColor);
    }
}

//// ============================================ TOOLTIP ============================================ ////

var toolTip = d3.select("body").append("div").attr("class", "toolTip");

function showToolTip(texthtml) {
    toolTip.style("left", d3.event.pageX + 10 + "px");
    toolTip.style("top", d3.event.pageY - 25 + "px");
    toolTip.style("display", "inline-block");
    toolTip.html(texthtml);
}

function hideToolTip() {
    toolTip.style("display", "none");
}

//// ============================================ MAIN ============================================ ////

// Initialize Visualization
function main(error, idn, data) {
    if (error) return console.error(error);

    initVoteData(data);
    initnameToNode(idn);
    currentNode = rootNode;

    switchNonVotes();
    drawChloropeth(idn);
    drawSunBurst(idn);
    switchColor();

    changeNode(currentNode, idn);

    // Global Interaction
    topdiv.on("click", function() {
        changeNode(rootNode, idn);
    });
}

// Update Visualization
function changeNode(node, idn) {
    currentNode = node;

    zoomArc(currentNode);
    highlightProvince(currentNode, idn);

    drawBar(currentNode);
    changeBarInfo(currentNode);
}

// Loader
d3.queue()
    .defer(d3.json, "https://raw.githubusercontent.com/junwatu/indonesia.json/master/indonesia.json") //idn map
    .defer(d3.json, "https://raw.githubusercontent.com/andreasmcp/pemilu14/master/data/pemilu14.json") //data
    .await(main);