// initialize map when page ready
var map;
var baseLayers;

// Get rid of address bar on iphone/ipod
var fixSize = function() {
    window.scrollTo(0,0);
    document.body.style.height = '100%';
    if (!(/(iphone|ipod)/.test(navigator.userAgent.toLowerCase()))) {
        if (document.body.parentNode) {
            document.body.parentNode.style.height = '100%';
        }
    }
};
setTimeout(fixSize, 700);
setTimeout(fixSize, 1500);

function buildURI(params) {
  var uri = '';
  for (key in params) 
    uri += key + '=' + params[key] + '&';
  return encodeURI(uri.substring(0, uri.length - 1));
};

var Canvas = {
  baseLayers: null,
  canvas: null,


  init: function() {
  var darkBlueStyle = [ { featureType: "all", elementType: "all", stylers: [ {visibility: "on" }, {saturation: -62}, {hue: "#00c3ff"}, {"gamma": 0.27}, {lightness: -65} ] } ];
  var darkMap = new OpenLayers.Layer.Google("Dark", {type: 'styled'}, {isBaseLayer:true});
  var styledMapOptions = {
    name: "Dark Map"
  };
    var styledMapType = new google.maps.StyledMapType(darkBlueStyle,styledMapOptions);
    baseLayers = new Array(darkMap, new OpenLayers.Layer.Google("Google Roadmap", {type: google.maps.MapTypeId.ROADMAP}, {isBaseLayer:true, transitionEffect: 'resize'}), new OpenLayers.Layer.OSM("Blank","data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=") );

    this.map = new OpenLayers.Map({
        div: "map",
        theme: null,
        controls: [
            //new OpenLayers.Control.Attribution(),
            new OpenLayers.Control.TouchNavigation({
                dragPanOptions: {
                    enableKinetic: true
                }
            })
            //new OpenLayers.Control.Zoom()
        ],
        projection: "EPSG:900913",
        maxResolution:156543.0339,
        numZoomLevels:24,
        layers: baseLayers,
        center: new OpenLayers.LonLat(0, 0),
        zoom: 2
    });
    darkMap.mapObject.mapTypes.set('styled',styledMapType);
    darkMap.mapObject.setMapTypeId('styled');
    $(".gmnoprint").hide();
  }
}
var Vars = {
    selectedVar: "tweets",
    datasets: {
        tweets: {
            table: "tweets",
            time: "time",
            x: "goog_x",
            y: "goog_y",
            aux: {
                user: "sender_name",
                text: "tweet_text",
            },
            layer: "point"
        },
      }
  };
 


var MapD = {
  canvas: null,
  vars: null,
  curData: null,
  host: "http://mapd2.csail.mit.edu:8080/",
  dataStart: null,
  dataEnd: null,
  timeStart: null,
  timeEnd: null,
  queryTerms: [],
  services: {
    pointMap: null,
    heatMap: null,
    search: null,
  },

  init: function () {
    $(window).resize($.proxy(this.resize,this));
    this.canvas = Canvas;
    this.canvas.init();
    this.resize();
    this.vars = Vars;
    this.search = Search;
    this.curData = this.vars.datasets[this.vars.selectedVar];
    this.search.init($("#curLoc"));
    this.pointMap = PointMap;
    //this.heatMap = heatMap;
    this.pointMap.init();
  },


  resize: function () {
    var topBarWidth = $("#topBar").width() - 100; // for promo and search
    console.log ("top width: " + topBarWidth);
      $("#submit").show();
    if (topBarWidth > 800) {
      var inputWidth = topBarWidth / 3 - 20;
      $("text.search-input").width(inputWidth);
      $("#termsInput").show();
      $("#userInput").show();
      $("#zoomInput").show();
    }
    else if (topBarWidth > 440) {
      var inputWidth = topBarWidth / 2 - 40;
      $("#userInput").hide();
      $("text.search-input").width(inputWidth);
      $("#termsInput").show();
      $("#zoomInput").show();
    }
    else {
      var inputWidth = topBarWidth - 40;
      $("#userInput").hide();
      $("#zoomInput").hide();
      $("text.search-input").width(inputWidth);
      $("#termsInput").show();
    }
    MapD.canvas.map.updateSize();
  },



  getTimeRangeURL: function() {
    this.params.sql = "select min(" + this.curData.time + "), max(" + this.curData.time + ") from " + this.curData.table;
    this.params.bbox = this.map.getExtent().toBBOX();
    var url = this.mapd.host + '?' + buildURI(this.params);
    return url;
  },

  getTimeBounds: function() {
    $.getJSON(this.services.tweets.getTimeRangeURL()).done($.proxy(this.setTimeRange, this));
  },

  setTimeRange: function(json) {
    this.dataStart = json.results[0].min;
    this.dataEnd = json.results[0].max;
    this.timeEnd = Math.round((this.dataEnd-this.dataStart)*1.01 + this.dataStart);
    this.timeStart = Math.max(this.dataEnd - 864000,  Math.round((this.dataEnd-this.dataStart)*.01 + this.dataStart));
    this.initMaps();
  },

  initMaps: function() {
    this.pointMap.init();
  },

};

var Search = {
    mapD: MapD,
    curLoc: null,

    init: function(curLoc) {
      this.curLoc = curLoc;
      this.curLoc.click($.proxy(this.getPosition, this));
    },

    
     getPosition: function() {
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(this.zoomToPosition);
      }
      else{ 
        console.log("geolocation not supported!")
      }
     },

     zoomToPosition: function(position) {
      console.log(position);
      var center = new OpenLayers.LonLat(position.coords.longitude, position.coords.latitude).transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));
      MapD.canvas.map.setCenter(center, 16);

     },
};

var PointMap = {
  mapD:MapD,
  wms: null,
  layer: null,
  params: {
    request: "GetMap",
    sql: null,
    bbox: null,
    width: null,
    height: null,
    layers: "point",
    r: 88,
    g: 252,
    b: 208,
    rand:0,
    radius: -1 ,
    format: "image/png",
    transparent: true,
  },

  init: function () {
    this.layer = new OpenLayers.Layer.WMS("Point Map", this.mapD.host, this.getParams(), {singleTile: true, ratio: 1.0, "dispalyInLayerSwitcher": false, removeBackBufferDelay: 0});
    this.mapD.canvas.map.addLayer(this.layer);
    this.layer.setVisibility(true);
  },

  getParams: function() {
    this.params.sql = "select " + MapD.curData.x + "," + MapD.curData.y +" from " + MapD.curData.table;
    return this.params;
  },

  reload: function(options) {
    this.params.rand = Math.round(Math.random() * 10000);
    this.layer.mergeNewParams(this.getParams(options));
  }
};

function init() {
  MapD.init();
}



