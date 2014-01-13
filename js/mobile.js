//host: "http://127.0.0.1:8080/",


$(document).ready(function() {init()});

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

function numberWithCommas(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function stringNumberWithCommas(n) {
    return n.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function buildURI(params) {
  var uri = '';
  for (key in params) 
    uri += key + '=' + params[key] + '&';
  return encodeURI(uri.substring(0, uri.length - 1));
};

var Map = {
  baseLayers: null,
  canvas: null,
  init: function() {
    var darkBlueStyle = [ { featureType: "all", elementType: "all", stylers: [ {visibility: "on" }, {saturation: -62}, {hue: "#00c3ff"}, {"gamma": 0.27}, {lightness: -55} ] } ];
    /* LOCAL var darkMap = new OpenLayers.Layer.Google("Dark", {type: 'styled'}, {isBaseLayer:true});*/
    var darkMap = new OpenLayers.Layer.Google("Dark", {type: 'styled'}, {isBaseLayer:true});
    var styledMapOptions = {
      name: "Dark"
    };
    /* LOCAL var styledMapType = new google.maps.StyledMapType(darkBlueStyle,styledMapOptions); */
    var styledMapType = new google.maps.StyledMapType(darkBlueStyle,styledMapOptions);
  var blankMap = new OpenLayers.Layer.OSM("Blank","data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=");
  //var blankMap = new OpenLayers.Layer("Blank",{isBaseLayer:true});

    //baseLayers = new Array(blankMap);
    // *LOCAL baseLayers = new Array(blankMap, darkMap, new OpenLayers.Layer.Google("Google Roadmap", {type: google.maps.MapTypeId.ROADMAP}, {isBaseLayer:true, transitionEffect: 'resize'}));
    baseLayers = new Array(blankMap, darkMap, new OpenLayers.Layer.Google("Google Roadmap", {type: google.maps.MapTypeId.ROADMAP}, {isBaseLayer:true, transitionEffect: 'resize'}));
    //baseLayers = new Array(blankMap, darkMap, new OpenLayers.Layer.Google("Google Roadmap", {type: google.maps.MapTypeId.ROADMAP}, {isBaseLayer:true, transitionEffect: 'resize'}));

    this.canvas = new OpenLayers.Map({
        div: "map",
        theme: null,
        controls: [
            //new OpenLayers.Control.Attribution(),
            new OpenLayers.Control.TouchNavigation({
                dragPanOptions: {
                    enableKinetic: true
                }
            }),
            new OpenLayers.Control.Zoom()
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
    //*LOCALdarkMap.mapObject.mapTypes.set('styled',styledMapType);
    //darkMap.mapObject.setMapTypeId('styled');
    $(".gmnoprint").hide();
  }
}

var Vars = {
    //selectedVar: "China Tweets",
    //selectedVar: "tweets",
    selectedVar: "Seattle Crime",
    datasets: {
        "Tweets": {
            host: "http://127.0.0.1:8080/",
            table: "tweets",
            time: "time",
            x: "goog_x",
            y: "goog_y",
            aux: {
                user: "sender_name",
                text: "tweet_text",
            },
            layer: "point",
            name: "tweets",
            bbox: "-19813026.92,-8523983.06, 19813026.92,12002425.38",

        },
        "China Tweets": {
            host: "http://127.0.0.1:8080/",
            table: "china_tweets",
            time: "time",
            x: "goog_x",
            y: "goog_y",
            aux: {
                user: "sender_name",
                text: "tweet_text",
            },
            layer: "point",
            name: "tweets",
            bbox: "6469208.0, 922951.4, 16375721.6, 8025431.0",

        },
        "Cell Records": {
            //host: "http://127.0.0.1:8080/",
            host: "http://192.168.1.104:8080/",
            table: "cdr",
            time: "epoch",
            x: "goog_x",
            y: "goog_y",
            aux: {
                //user: "user_id",
            },
            layer: "point",
            name: "records",
            //bbox: "-7920070,5210793,-7903215,5218035",
            bbox: "-8020070,5200793,-7803215,5228035",
            trange: {min: 1267310000, max: 1267402000}
        },
        "Boston Taxi Pickups": {
            host: "http://127.0.0.1:8080/",
            time: "pickuptime",
            x: "pickup_x",
            y: "pickup_y",
            table: "trips",
            aux: {
              text: "pickupaddress",
            },
            layer: "point",
            name: "pickups",
            bbox: "-7920070,5210793,-7903215,5218035"
        },
        "Boston Taxi Dropoffs": {
            host: "http://127.0.0.1:8080/",
            time: "droptime",
            x: "drop_x",
            y: "drop_y",
            table: "trips",
            aux: {
              text: "dropaddress",
            },
            layer: "point",
            name: "dropoffs",
            bbox: "-7920070,5210793,-7903215,5218035"
        },
        "Seattle Crime": {
            host: "http://127.0.0.1:8080/",
            time: "time",
            x: "goog_x",
            y: "goog_y",
            table: "seattle_police",
            aux: {
              text: "description",
            },
            layer: "point",
            name: "crimes",
            bbox: "-13683078.0,6004644.0, -13543059.0,6079018.0",
            trange: {min: 1268310000, max: 1388402000}
          }

      }
  };
 

var Settings = {
  mapD: MapD,
  baseOn: false,
  pointOn: false,
  heatOn: false,
  heatToggled: false,
  overlayVisible: false,
  overlayWidth:0,
  layerDiv: null,
  settingsOverlay: null,
  settingsButton: null,

  init: function(settingsOverlay, settingsButton) {
    this.layerSelector = $("#layerSelector");
    this.populateLayerSelector();
    this.settingsOverlay = settingsOverlay;
    this.settingsButton = settingsButton;
    this.resizeOverlay();

    $(settingsButton).click($.proxy(function() {
      this.overlayVisible = !this.overlayVisible;
      if (this.overlayVisible) {
        this.openOverlay();
        /*
        var overlayWidth = $(this.settingsOverlay).width();
        $(this.settingsButton).css({left: overlayWidth});
        */
        //$(this.settingsOverlay).show();
      }
      else {
        this.closeOverlay();
        //$(this.settingsButton).css({left: 0});
        //$(this.settingsOverlay).hide();
      }
    },this));

    $(".main-setting").click(function(e) {
      console.log("main setting");
      console.log(e);
      $(this).toggleClass("setting-on");
      var id = $(this).attr('id');
      if (id == "baseStatus") {
        Settings.baseOn = !Settings.baseOn;
        if (Settings.baseOn) {
          //$(".olTileImage").css('backround-color', '');
          //$('<style>.olTileImage {background: ""}</style>').appendTo('head');
          Map.canvas.setBaseLayer(Map.canvas.getLayersByName("Dark")[0]);
          Map.canvas.fractionalZoom = false;
        }
        else {
          //$('<style>.olTileImage {background: black}</style>').appendTo('head');


          Map.canvas.setBaseLayer(Map.canvas.getLayersByName("Blank")[0]);
        Map.canvas.fractionalZoom = true;
        }
      }
      else if (id == "pointStatus") {
        Settings.pointOn = !Settings.pointOn;
        if (Settings.pointOn) {
          MapD.services.pointMap.layer.setVisibility(true);
          $("#numPointsDisplay").show();
        }
        else {
          console.log ("point off")
          MapD.services.pointMap.layer.setVisibility(false);
          $("#numPointsDisplay").hide();
        }
      }
      else if (id == "heatStatus") {
        Settings.heatToggled = true;
        Settings.heatOn = !Settings.heatOn;
        if (Settings.heatOn) {

          MapD.services.heatMap.layer.setVisibility(true);
        }
        else {
          MapD.services.heatMap.layer.setVisibility(false);
        }
      }
      
      //console.log(e);

    });

  },
  populateLayerSelector: function() {
    for (key in Vars.datasets) {
      $(this.layerSelector).append($("<div class='layer-choice " + ((key == Vars.selectedVar) ? " layer-on" : "") + "'><span>"+key+"</span></div>"));
      }
    $(".layer-choice").click($.proxy(this.onLayerClick,this));
  },

  onLayerClick: function(e) {
    var layer = $(e.target).text();
    if (layer != Vars.selectedVar) {
      $(".layer-choice").removeClass("layer-on");
      $(e.target).addClass("layer-on");
      MapD.changeLayer(layer);
      e.preventDefault();
    }
  },
    

  getNumLayersVisible: function() {
    return (this.pointOn + this.heatOn);
  },

  openOverlay: function() {
    //$(this.settingsButton).css({left: this.overlayWidth});
    $(this.settingsButton).animate({left: this.overlayWidth}, {duration:200, queue:false});
    //$(this.settingsOverlay).show().animate({},{duration:200,queue:false});
    //$(this.settingsOverlay).slideDown(200);
    $(this.settingsOverlay).animate({
      width: this.overlayWidth + 'px'},
      {duration:200, queue: false});
    $(".settings-section").show();
    //$(".settings-group").show();
    //$(".settings-header").show();
      //width(this.overlayWidth);
  },

  closeOverlay: function() {
    $(this.settingsButton).animate({left: 0}, {duration:200, queue:false});
   ///$(this.settingsOverlay).slideUp(200);
    $(this.settingsOverlay).animate({
      width: "0px"},
      {duration:200})
    $(".settings-section").hide();
    //$(".settings-group").hide();
    //$(".settings-header").hide();

    //$(this.settingsOverlay).hide();
  },

  resizeOverlay: function() {
    var pageWidth = $("#mapView").width();
    this.overlayWidth = Math.min(pageWidth*0.5,500);
    //$(this.settingsOverlay).width(this.overlayWidth);
    if (this.overlayVisible)
      this.openOverlay();
    //console.log("Overlay: " + overlayWidth);
    //$(this.settingsOverlay).width(overlayWidth);
    /*
    if (this.overlayVisible)
        $(this.settingsButton).css({left: overlayWidth});
    */
  },

  toggleHeatmap: function(hasTermQuery) {
    if (this.heatToggled == false) {
      Settings.heatOn = hasTermQuery;
      if (hasTermQuery) {
          $("#heatStatus").addClass("setting-on");
          MapD.services.heatMap.layer.setVisibility(true);
        }
        else {
          $("#heatStatus").removeClass("setting-on");
          MapD.services.heatMap.layer.setVisibility(false);
        }
      }
  },


};

var MapD = {
  map: null,
  vars: null,
  curData: null,
  geoCoder: null,
  queryTerms: [],
  user: null,
  //host: "http://mapd2.csail.mit.edu:8080/",
  //host: "http://mapd2.csail.mit.edu:8080/",
  dataStart: null,
  dataEnd: null,
  timeStart: null,
  timeEnd: null,
  queryTerms: [],
  termsAndUserQuery: "",
  initted: false,
  services: {
    animation: null,
    settings: null,
    pointMap: null,
    heatMap: null,
    timeChart: null,
    search: null,
    click: null,
  },

  init: function () {
    $(window).resize($.proxy(this.resize,this));
      setTimeout(fixSize, 700);
      setTimeout(fixSize, 1500);
    this.vars = Vars;
    this.services.settings = Settings;
    this.services.settings.init($("#settingsOverlay"), $("#settingsButton"));
    this.curData = this.vars.datasets[this.vars.selectedVar];
    this.map = Map;
    this.map.init();
    this.resize();

    this.geoCoder = GeoCoder;
    this.geoCoder.init();
    // *LOCAL this.geoCoder.init();
    this.search = Search;
    this.search.init($("#curLoc"), this.geoCoder);
    this.services.pointMap = PointMap;
    this.services.heatMap = HeatMap;
    this.services.animation = Animation;
    this.services.timeChart = LineChart;
    this.getTimeBounds();
    //this.services.timeChart.reload();
    this.services.click = Click;
    this.services.click.init();

  },

  onMapMove: function() {
    this.services.timeChart.reload();
  },

  reloadByGraph: function(start, end) {
    this.timeStart = start;
    this.timeEnd = end;

    // check if animating

    this.services.pointMap.reload();
    this.services.heatMap.reload();
  },

  changeLayer: function(layer) {
    this.vars.selectedVar = layer;
    this.curData = this.vars.datasets[layer];
    this.getTimeBounds();//don't create new layers


  },

  setQueryTerms: function(queryTerms) {
    if (queryTerms[0] != '"' && this.queryTerms[this.queryTerms.length -1] != '"')
        this.queryTerms = queryTerms.trim().split(" ").filter(function(d) {return d});
    else {
        this.queryTerms = []
        this.queryTerms.push(queryTerms);
    }
  },

  setUser: function(user) {
    this.user = user;
  },

  resize: function () {
    var topBarWidth = $("#topBar").width() - 180; // for promo and search
    console.log ("top width: " + topBarWidth);
      $("#submit").show();
    if (topBarWidth > 600) {
      var inputWidth = topBarWidth / 3 - 80;
      $("input.search-input").width(inputWidth);
      $("#termsInput").show();
      $("#userInput").show();
      $("#zoomInput").show();
    }
    else if (topBarWidth > 400) {
      var inputWidth = topBarWidth / 2 - 52;
      $("#userInput").hide();
      $("input.search-input").width(inputWidth);
      $("#termsInput").show();
      $("#zoomInput").show();
    }
    else {
      var inputWidth = topBarWidth - 35;
      $("#userInput").hide();
      $("#zoomInput").hide();
      $("input.search-input").width(inputWidth);
      $("#termsInput").show();
    }
    var windowHeight = $(window).height();
    console.log("Window height: " + windowHeight);
    var timeBarHeight = Math.round(Math.min(windowHeight * 0.2, 70));
    //var timeBarHeight = 120; 
    console.log("Time Bar Height: " + timeBarHeight);
    $("#mapView").css({bottom:timeBarHeight});
    $("#timeGraph").css({height:timeBarHeight});

    MapD.map.canvas.updateSize();
    //$('div#timeGraph').empty();
    if (this.services.timeChart != null) {
      this.services.timeChart.init(d3.select($("#timeGraph").get(0)));
      this.services.timeChart.reload();
    }

    MapD.services.settings.resizeOverlay();
  },

  parseQueryExpression: function(str) {
    var numQuotes = 0;
    var numStartParens = 0;
    var numEndParens = 0;
    for (i in str) {
      if (str[i] == '"')
        numQuotes++;
      else if (str[i] == "(")
        numStartParens++;
      else if (str[i] == ")")
        numEndParens++;
    }
    if (numQuotes % 2 != 0 || numStartParens != numEndParens)
      return;

    var returnString = "(";
    str = str.replace(/'/g, "''").replace("/&/g", "");
    var queryTerms = str.split(/(AND|OR|"|\s+|NOT|\(|\))/);
    var expectOperand = true;
    var inQuote = false;
    var atNot = false;
    var searchString = "";
    for (var i = 0; i != queryTerms.length; i++) {
      var token = queryTerms[i];
      if (token == "" || token[0] == ' ')
        continue;
      if (token == "AND" || token == "OR") {
        if (expectOperand == true)  
          return null;
        expectOperand = true;
        returnString += " " + token + " ";  
      }
      else if (token == "NOT") {
        /*if (expectOperand == false)  
          return null;*/
        atNot = true;
        //returnString += " " + token + " ";  
      }
      else if (token == "(") {
        /*if (expectOperand == false)  
          return null; */
        returnString += " " + token + " ";  
      }
      else if (token == ")") {
        /*if (expectOperand == true)  
          return null;*/
        returnString += " " + token + " ";  
      }
      else if (token == '"') {
        if (expectOperand == false)  {
          returnString += " AND ";
          expectOperand = true;

          //return null;
        }
        inQuote = !inQuote;
        if (inQuote) {
          if (atNot) {
            searchString = this.curData.aux.text + " not ilike '"  
            atNot = false;
          }
          else
            searchString = this.curData.aux.text +" ilike '"  
        }
        else {
          //console.log("At end quote");
          expectOperand = false;
          if (searchString[searchString.length -1] == ' ') {
            searchString = searchString.substr(0,searchString.length-1) + "'";
          }
          else {
            searchString += "'";
          }
          returnString += searchString;
          searchString = "";
        }
      }
      else {
        if (inQuote) {
          searchString += token + " ";
        }
        else  {
          if (expectOperand == false) {
            returnString += " AND ";
            //return null;
          }
          if (atNot)  {
            returnString += this.curData.aux.text + " not ilike '" + token + "'";
            atNot = false;
          }
          else  {
            returnString += this.curData.aux.text + " like '" + token + "'";
          }
          expectOperand = false;
        }
     }
  }
  return returnString + ")";
  },

  getTimeQuery: function (timeStart, timeEnd) {
    var query = "";
    if (timeStart)
      query += this.curData.time + " >= " + timeStart + " and ";
    if (timeEnd)
      query += this.curData.time + " <= " + timeEnd + " and ";
    //console.log(query);
    return query;
  },

  setTermsAndUserQuery: function (queryTerms, user ) {
    var query = ""; 
    if (queryTerms.length) {
      //queryTerms = this.parseQueryTerms(queryTerms);
      //console.log("Now doing parse Expression: ");
      queryTerms = this.parseQueryExpression(queryTerms);
      //console.log(queryTerms);
      query += queryTerms + " and ";
    }
    if (user)
      query += "sender_name ilike '" + user + "' and ";
    this.termsAndUserQuery = query;
  },

  getWhere: function(options) {
    var timeStart = this.timeStart;
    var timeEnd = this.timeEnd;
    //console.log(timeStart);
    var queryTerms = this.queryTerms;
    var splitQuery = false;
    var queryTerms = this.queryTerms;
    var minId = null;
    if (options) {
      if (options.time) {
        timeStart = options.time.timeStart;
        timeEnd = options.time.timeEnd;
      }
      if ("queryTerms" in options)
        queryTerms = options.queryTerms;
      if ("user" in options) {
        user = options.user;
      }
      if ("splitQuery" in options) 
        splitQuery = options.splitQuery;
      if ("minId" in options)
        minId = options.minId; 
    }
    if (splitQuery) {
       var queryArray = new Array(2);
       queryArray[0] = this.termsAndUserQuery;
        if (queryArray[0] != "") {
          queryArray[0] = queryArray[0].substr(0, queryArray[0].length-5);
        }
        if ("noTime" in options)
          queryArray[1] = "";
        else {
          queryArray[1] = this.getTimeQuery(timeStart, timeEnd);
          if (queryArray[1])
            queryArray[1] = " where " + queryArray[1].substr(0, queryArray[1].length-5);
        }

        return queryArray;
    }
    else {
      var whereQuery ="";
      if (minId != null) {
        whereQuery = "id > " + minId + " and " + this.termsAndUserQuery;
      }
      else {
        whereQuery = this.getTimeQuery(timeStart, timeEnd) + this.termsAndUserQuery;
      }
      if (whereQuery)
        whereQuery = " where " + whereQuery.substr(0, whereQuery.length-5);
      return whereQuery;
    }
  },

  reload: function(e) {
    this.services.pointMap.reload();
    this.services.heatMap.reload();
    this.services.timeChart.reload();
  },

  getTimeRangeURL: function() {
    var params = {
      request: "GetFeatureInfo"
     }
    params.sql = "select min(" + this.curData.time + "), max(" + this.curData.time + ") from " + this.curData.table;
    //params.bbox = this.map.getExtent().toBBOX();
    var url = this.curData.host + '?' + buildURI(params);
    return url;
  },

  getTimeAndGeoRangeURL: function () {
    var params = {
      request: "GetFeatureInfo"
     };
    params.sql = "select min(" + this.curData.time + "), max(" + this.curData.time + "), min(" + this.curData.x + "),min(" + this.curData.y + "),max(" + this.curData.x + "), max(" + this.curData.y + ")from " + this.curData.table;
    //params.bbox = this.map.getExtent().toBBOX();
    var url = this.curData.host + '?' + buildURI(params);
    return url;
  },



  getTimeBounds: function() {
    if ("trange" in this.curData) {
      console.log(this.curData.trange);
      this.setTimeRange({results: [this.curData.trange]});
    }
    else {
      $.getJSON(this.getTimeRangeURL()).done($.proxy(this.setTimeRange, this));
    }
  },
  getTimeAndGeoBounds: function() {
    $.getJSON(this.getTimeAndGeoRangeURL()).done($.proxy(this.setTimeAndGeoRange, this));
  },

  setTimeRange: function(json) {
    this.dataStart = json.results[0].min;
    this.dataEnd = json.results[0].max;
    this.timeEnd = Math.round((this.dataEnd-this.dataStart)*0.98 + this.dataStart);
    this.timeStart = Math.round((this.dataEnd-this.dataStart)*.02 + this.dataStart);
    //this.timeEnd = this.dataEnd; 
    //this.timeStart = Math.max(this.dataEnd - 864000,  Math.round((this.dataEnd-this.dataStart)*.01 + this.dataStart));
    this.initMaps();
  },


  initMaps: function() {
    this.services.pointMap.init();
    this.services.heatMap.init();
    this.map.canvas.zoomToExtent(new OpenLayers.Bounds(this.curData.bbox.split(',')));
    this.services.timeChart.brushReset();
    this.services.timeChart.init(d3.select($("#timeGraph").get(0)));
    //$("#baseStatus").click();:w
    if (!this.initted) {
      $("#pointStatus").click();
      Map.canvas.fractionalZoom = true;
      this.map.canvas.events.register('moveend', this, this.onMapMove);
    this.services.animation.init(this.services.pointMap.layer, this.services.heatMap.layer, $("#playPauseButton"), $("#stopButton")); 
    }
    this.services.timeChart.reload();
    this.initted = true;
  },

};


var GeoCoder = {
  map: null,
  geocoder: new google.maps.Geocoder(),
  /* LOCAL geocoder: new google.maps.Geocoder(),*/
  address: null,
  status: null,

  init: function() {
    this.map = Map.canvas;
    $(document).on('geocodeend', $.proxy(this.onGeoCodeEnd, this));
  },

  geocode: function(address) {
   //console.log("at geocode");
    this.address = address;
    this._geocoder.geocode({'address': address}, $.proxy(this.onGeoCoding, this));
  },

  onGeoCoding: function(data, status) {
    //console.log('in onGeoCoding');
    this.status = status;
    if (status != google.maps.GeocoderStatus.OK) {
      this.bbox = null;
      //console.log('Geocoding service failed:', status);
      return;
    }
    if (data.length != 1)  {
      //console.log('Geocoding service returned', data.length);
    }
    var viewport = data[0].geometry.viewport;
    var ne = viewport.getNorthEast();
    var sw = viewport.getSouthWest();
    var bounds = new OpenLayers.Bounds(sw.lng(), sw.lat(), ne.lng(), ne.lat());
    //console.log(bounds);
    var proj = new OpenLayers.Projection("EPSG:4326");
    bounds.transform(proj, this.map.getProjectionObject());
    $(document).trigger({type: 'geocodeend', bounds: bounds});
  },

  onGeoCodeEnd: function(event) {
    var bounds = event.bounds;
    this.map.zoomToExtent(bounds);
  },
}

var Click = {
  mapD: MapD,
  pixelTolerance: 5,
  params: {
    request: "GetFeatureInfo",
    sql: null,
    bbox: null,
  },
  clickControl: null,
  popup: null,

  init:function() {
    OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {
      defaultHandlerOptions: {
        'single': true,
         'double': false,
         'pixelTolerance': 10,
         'stopSingle': false,
         'stopDouble': false
        },
        initialize: function (options) {
          this.handlerOptions = OpenLayers.Util.extend( {}, this.defaultHandlerOptions
          );
          this.handler = new OpenLayers.Handler.Click(
              this, {
                  'click': this.trigger
                }, this.handlerOptions
            );
        },
      trigger: function(e) {

          if (Settings.pointOn) {
            MapD.services.click.handleClick(e);
            //console.log(e);
            //$.getJSON(this.getURL()).done($.proxy(this.onTweet,this));
          }
        
        }
    });

    this.clickControl = new OpenLayers.Control.Click();
    this.mapD.map.canvas.addControl(this.clickControl);
    this.clickControl.activate();
  },
  handleClick: function(e) {
    //console.log("at handleclick");
    $.getJSON(this.getParams(e)).done($.proxy(this.onData,this));
  },
  getParams: function(e) {

    this.params.sql = "select " + MapD.curData.x + "," + MapD.curData.y + "," + MapD.curData.time;
    if ("user" in MapD.curData.aux)
      this.params.sql += "," + MapD.curData.aux.user;
    if ("text" in MapD.curData.aux)
      this.params.sql += "," + MapD.curData.aux.text;
    this.params.sql += " from " + MapD.curData.table + MapD.getWhere();
      var lonlat = this.mapD.map.canvas.getLonLatFromPixel(e.xy);
      this.params.sql += " ORDER BY orddist(point(" + MapD.curData.x + "," + MapD.curData.y +"), point(" + lonlat.lon +"," + lonlat.lat + ")) LIMIT 1";
      //console.log(this.params.sql);
      var pointBuffer = this.mapD.map.canvas.resolution * this.pixelTolerance;
      this.params.bbox = (lonlat.lon-pointBuffer).toString() + "," + (lonlat.lat-pointBuffer).toString() +"," + (lonlat.lon+pointBuffer).toString() + "," + (lonlat.lat+pointBuffer).toString(); 
      var url = MapD.curData.host + '?' + buildURI(this.params);
      return url;
  },
  onData: function(json) {
    if (json != null) {
      var clickData = json.results[0];
      this.addPopup(clickData[MapD.curData.x], clickData[MapD.curData.y], clickData);
    }
  },

    addPopup: function(x,y,clickData) {
      var container = $('<div></div>').addClass("click-popup");
      var header = $('<div></div>').addClass("click-header").appendTo(container);
      $('<div style="clear: both;"></div>');
      var content = $('<p></p>').addClass("click-content").appendTo(container);
      var profile = $('<a></a>').addClass("popup-profile").appendTo(header);
      var time = new Date(clickData[MapD.curData.time] * 1000);
      var timeText = $('<div></div>').addClass("popup-time").appendTo(header);
      timeText.html(time.toLocaleString());
      var user = null;
      var text = null
      if ("text" in MapD.curData.aux) 
        text = clickData[MapD.curData.aux.text];
      if ("user" in MapD.curData.aux) 
        user =  clickData[MapD.curData.aux.user];
      if (text != null)
        content.html(text);
      if (user != null)
        profile.html(user);

      if (this.popup != null)
        this.popup.destroy();
      this.popup = new OpenLayers.Popup.FramedCloud("clickData",
       new OpenLayers.LonLat(x, y),
       //new OpenLayers.Size(300,150),
       null,
       container.html(), 
       null,
       true);

      this.mapD.map.canvas.addPopup(this.popup);
      this.popup.updateSize();
    }
 };




var Search = {
    mapD: MapD,
    curLoc: null,
    geoCoder: null,
    termsInput: null,
    userInput: null,
    zoomInput: null,
    terms: '',
    user: '',
    zoomTo: null, 
    zoomToChanged: false,
    io: null,
    searchEmpty: true,

    init: function(curLoc, geoCoder) {
      this.curLoc = curLoc;
      this.geoCoder = geoCoder;
      this.curLoc.click($.proxy(this.getPosition, this));
      this.form = $("form#search");
      this.termsInput = $("#termsInput");
      this.userInput = $("#userInput");
      this.zoomInput = $("#zoomInput");

    $(document).on('propertychange keyup input paste', 'input.search-input', function() {
      var io = $(this).val().length ? 1: 0;
      //console.log("at icon clear");
      //console.log(io);

      $(this).next('.iconClear').stop().fadeTo(300,io);
      }).on('click', '.iconClear', function() {
        $(this).delay(300).fadeTo(300,0).prev('input').val('');

        Search.form.submit();
    })

    $(document).on('propertychange keyup input paste', 'input.adv-search-input', function() {
      var io = $(this).val().length ? 1: 0;

      $(this).next('.iconClear').stop().fadeTo(300,io);
      }).on('click', '.iconClear', function() {
        $(this).delay(300).fadeTo(300,0).prev('input').val('');

        Search.form.submit();
      });
      this.form.submit($.proxy(this.onSearch, this));
    },

    onSearch: function() {
    
      var terms = this.termsInput.val();
      var user = this.userInput.val(); 
      var zoomTo = this.zoomInput.val();
      this.zoomToChanged = zoomTo != "" && this.zoomTo != zoomTo;
      //this.mapD.setQueryTerms(terms);
      //this.mapD.setUser(user);
      this.mapD.setTermsAndUserQuery(terms,user);
      if (this.zoomToChanged) {
        this.zoomTo = zoomTo;
        //console.log("about to zoom");
        this.geoCoder.geocode(this.zoomTo);
        return false;
      }
      var hasQuery = terms != "" || user != "";
      this.mapD.services.settings.toggleHeatmap(terms != "");
      this.mapD.reload();
      return false;


  },

     getPosition: function() {
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(this.zoomToPosition);
      }
      else{ 
        //console.log("geolocation not supported!")
      }
     },

     zoomToPosition: function(position) {
      //console.log(position);
      var center = new OpenLayers.LonLat(position.coords.longitude, position.coords.latitude).transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));
      MapD.map.canvas.setCenter(center, 16);

     }

};


var HeatMap = {
  mapD: MapD,
  layer: null,
  params: {
    request: "GetMap",
    sql: null,
    bbox: null,
    width: null,
    height: null,
    layers: "heatmap",
    maxval: "auto", 
    min: 0.2,
    blur: 25,
    level: 50,
    colorramp: "green_red",
    format: "image/png",
    transparent: true
  },
  init: function () {
    if (this.mapD.initted == false) {
       this.layer = new OpenLayers.Layer.WMS("Heat Map", this.mapD.curData.host, this.getParams(), {singleTile: true, opacity: 0.55, ratio: 1.0, "displayInLayerSwitcher": false, removeBackBufferDelay: 0});
      if (this.mapD.services.settings.heatOn) {
        this.layer.setVisibility(true);
      }
      else {
        this.layer.setVisibility(false);
      }
      this.mapD.map.canvas.addLayer(this.layer);
    }
    else {
      this.reload();
    }
  },

  getParams: function(options) {
    if (options == undefined || options == null) 
      options = {splitQuery: true};
    else
      options.splitQuery = true;

    this.params.sql = "select " + MapD.curData.x + "," + MapD.curData.y;

    var queryArray = this.mapD.getWhere(options);
    if (queryArray[0])
      this.params.sql += "," + queryArray[0];
    this.params.sql += " from " + this.mapD.curData.table + queryArray[1];

    if (options.heatMax != undefined && options.heatMax != null && isNaN(options.heatMax) == false) 
      this.params.maxval = options.heatMax;
    else
      this.params.maxval = "auto"; 
    return this.params;
  },

  reload: function(options) {
    this.layer.mergeNewParams(this.getParams(options));
  }
};

var Animation = {
  mapD: MapD,
  pointLayer: null,
  heatLayer:null,
  playPauseButton: null,
  stopButton: null,
  heatMax: null,
  oldRadius: null,
  playing: false,
  numFrames: 60.0,
  animStart: null,
  animEnd: null,
  frameStep: null,
  frameWidth: null,
  prevTime: null,
  frameWait: 80, // milliseconds - minimum
  numLayersLoaded: 0,

  init: function(pointLayer, heatLayer, playPauseButton, stopButton) {
    this.pointLayer = pointLayer;
    this.heatLayer = heatLayer;
    this.pointLayer.events.register("loadend", this, this.layerLoadEnd);
    this.heatLayer.events.register("loadend", this, this.layerLoadEnd);
    this.playPauseButton = playPauseButton;
    this.stopButton = stopButton;
    $(this.playPauseButton).click($.proxy(this.playPauseFunc, this));
    $(this.stopButton).click($.proxy(this.stopFunc, this));
  },

  layerLoadEnd: function () {
    if (this.playing == true) {
      var numLayersVisible = this.mapD.services.settings.getNumLayersVisible(); 
      this.numLayersLoaded++;
      if (this.numLayersLoaded >= numLayersVisible) {
          var curTime = new Date().getTime();
          this.numLayersLoaded = 0;
          var timeDiff = curTime - this.prevTime;
          if (timeDiff <  this.frameWait) {
              var waitTime = this.frameWait - timeDiff;
              setTimeout($.proxy(this.animFunc,this),waitTime);
          }
          else
              this.animFunc();
      }
    }
  },

  isAnimating: function() {
    return (this.animStart != null);
  },

  animFunc: function() {
     if (this.frameEnd < this.animEnd) {
        this.prevTime = new Date().getTime();
        var options = {time: {timeStart: Math.floor(this.frameStart), timeEnd: Math.floor(this.frameEnd)}, heatMax: this.heatMax}; 
       //var graphOptions = {time: {timestart: Math.floor(this.frameStart), timeend: Math.floor(this.frameEnd)}, heatMax: this.heatMax}; 
      this.frameStart += this.frameStep;
      this.frameEnd += this.frameStep;
      this.mapD.services.timeChart.setBrushExtent([this.frameStart * 1000, this.frameEnd * 1000]);
      this.mapD.services.pointMap.reload(options);
      this.mapD.services.heatMap.reload(options);
    }
    else {
        this.stopFunc();
        //this.frameStart = this.animStart;
        //this.frameEnd = this.animStart + this.frameWidth;
    }
  },

  playPauseFunc: function () {
    if (this.playing == false) {
      this.playing = true;
      this.playPauseButton.removeClass("play-icon").addClass("pause-icon");
      if (this.animStart == null) { // won't trigger if paused
        this.animStart = this.mapD.dataStart;
        this.animEnd = this.mapD.dataEnd;
        this.frameStep = (this.animEnd - this.animStart) / this.numFrames;
        this.prevTime = 0;
        //this.frameWidth = this.frameStep * 4.0;
        this.frameWidth = this.mapD.timeEnd - this.mapD.timeStart;
        if (this.frameWidth > (this.animEnd-this.animStart)*0.5)
          this.frameWidth = (this.animEnd-this.animStart)*0.1; 
          //this.frameWidth = 21600;
        this.frameStart = this.animStart;
        this.frameEnd = this.animStart + this.frameWidth;
        this.heatMax = parseFloat($.cookie('max_value')) * 10.0;
        var numPoints = parseInt($.cookie('tweet_count'));
        this.oldRadius = this.mapD.services.pointMap.params.radius;
        if (this.oldRadius == -1) {
            var radius = 2;
            if (numPoints > 200000)
                radius = 0;
            else if (numPoints > 10000)
                radius = 1;
            this.mapD.services.pointMap.params.radius = radius;
        }
      }
      this.animFunc();

    }
    else {
      this.playing = false;
      this.playPauseButton.removeClass("pause-icon").addClass("play-icon");
    }
  },

  stopFunc: function() {
    console.log("at stop");
    if (this.animStart != null) { //meaning its stopped or playing
      this.animStart = null;
      this.animEnd = null;
      this.animStep = null;
      this.numLayersLoaded = 0;
      this.playing = false;
      this.playPauseButton.removeClass("pause-icon").addClass("play-icon");
      this.mapD.services.pointMap.params.radius = this.oldRadius;
      this.mapD.services.timeChart.setBrushExtent([this.mapD.timeStart * 1000, this.mapD.timeEnd * 1000]);
      this.mapD.services.pointMap.reload();
      this.mapD.services.heatMap.reload();
    }
  }
}


var PointMap = {
  mapD:MapD,
  layer: null,
  baseSql: null,
  numPointsSpan: null,
  params: {
    request: "GetMap",
    sql: null,
    bbox: null,
    width: null,
    height: null,
    layers: "point",
    r: 255,
    g: 131,
    b: 0,
    //r: 88,
    //g: 252,
    //b: 208,
    rand:0,
    //radius: -1 ,
    radius: 1 ,
    format: "image/png",
    transparent: true,
  },

  init: function (createNew) {
    this.baseSql = "select " + MapD.curData.x + "," + MapD.curData.y +" from " + MapD.curData.table;
    if (this.mapD.initted == false) {
      this.numPointsSpan = $("#numPointsSpan");
      this.layer = new OpenLayers.Layer.WMS("Point Map", this.mapD.curData.host, this.getParams(), {singleTile: true, ratio: 1.0, "displayInLayerSwitcher": false, removeBackBufferDelay: 0});
      if (this.mapD.services.settings.pointOn) {
        this.layer.setVisibility(true);
      }
      else {
        this.layer.setVisibility(false);
      }
      this.layer.events.register("loadend", this, this.getNumPoints);
      this.mapD.map.canvas.addLayer(this.layer);
    }
    else {
      this.reload();
    }
  },

  getNumPoints: function() {
    var commaNum = stringNumberWithCommas($.cookie('tweet_count'));
    console.log(commaNum);
    this.numPointsSpan.text(commaNum + " " + this.mapD.curData.name);
  },

  getParams: function(options) {
    this.params.sql = this.baseSql; 
    this.params.sql += this.mapD.getWhere(options);
    //console.log(this.params.sql);
    return this.params;
  },

  reload: function(options) {
    this.params.rand = Math.round(Math.random() * 10000);
    this.layer.mergeNewParams(this.getParams(options));
  }
};

var LineChart = 
{
  mapD:MapD,
  container: null,
  contWidth: null,
  contHeight: null,
  svg: null,
  series: [],
  margins: null,
  brushExtent: null,
  brush: null,
  initted: false,
  xScale: null,
  yScale: null,
  xAxis: null,
  yAxis: null,
  seriesId: 0,
  params: {
    request: "Graph",
    sql: null,
    bbox: null,
    histStart: null,
    histEnd:null,
    histBins: 100
  },

  colors: ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#3b3eac", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300"],
 
  brushReset: function() {
    this.brushExtent = null;
  },

  init: function(container) {
    this.initted = false;
    console.log("time init");
    this.container = container;
    var cont =  $($(container).get(0));
    this.margin = {top: 10, right: 15, bottom: 25, left: 45};
    this.contWidth = $("#timeBar").width() - 45 - this.margin.right ;//  cont.width();
    cont.width(this.contWidth);
    cont.empty();

    this.contHeight = cont.height();
    this.width = this.contWidth - this.margin.left - this.margin.right;
    this.height = this.contHeight - this.margin.top - this.margin.bottom;
    this.xScale = d3.time.scale().range([0, this.width]);
    this.yScale = d3.scale.linear().range([this.height,0]);

    this.brush=d3.svg.brush()
      .x(this.xScale)
      .on("brushend", $.proxy(this.brushdown,this));

    this.xAxis = d3.svg.axis()
        .scale(this.xScale)
        .orient("bottom")
        .tickPadding(6)
        .ticks(4);

    this.yAxis = d3.svg.axis()
        .scale(this.yScale)
        .orient("left")
        .tickSize(-this.width)
        .tickPadding(6)
        .ticks(2);


    this.svg= this.container
      .attr("class", "chart")
      .append("svg")
      .attr("width", this.contWidth - this.margin.right)
      .attr("height", this.contHeight)
      .attr("class", "line-chart")
      .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")"); 

      this.svg.append("g")
          .attr("class", "y axis");

      this.svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + this.height + ")");

  },

  brushdown: function() {
    var brushChanged = (+this.brush.extent()[0] != +this.brushExtent[0] || +this.brush.extent()[1] != +this.brushExtent[1]);
    if (brushChanged) {
      var start = (this.brush.extent()[0]/ 1000).toFixed(0);
    var end = (this.brush.extent()[1] / 1000).toFixed(0);
      this.mapD.reloadByGraph(start, end);
    }
  },

  setBrushExtent: function(extent) {
    //console.log(extent);
    this.brushExtent = extent;
    this.brush.extent(this.brushExtent);
    this.redrawBrush();
  },

  redrawBrush: function() {
    this.svg.select(".brush").call(this.brush);
  },


  getXDomain: function() {
    var xDomain = [d3.min(this.series, function(s) { return s.xDomain[0] }), 
                   d3.max(this.series, function(s) { return s.xDomain[1]})];
    //xDomain[1] = new Date(xDomain[1].getTime() + 60 *30000);
    return xDomain;
  },

  getYDomain: function() {
    var yDomain = [d3.min(this.series, function(s) { return s.yDomain[0] }), 
                   d3.max(this.series, function(s) { return s.yDomain[1] })];
    return yDomain;
  },


  addSeries: function(id,name,data,frameStart,frameEnd,dataFormat) {
    var xDomain = d3.extent(data, function(d) { return d.date; });
    var yDomain = d3.extent(data, function(d) { return d.value; });
    var abbrFormat = d3.format("1s");
    if (dataFormat == "percents")
      abbrFormat = d3.format(".2%"); 

    var xScale = this.xScale;
    var yScale = this.yScale;

    var line = d3.svg.line()
        .interpolate("monotone")
        .x(function(d) { return xScale(d.date); })
        .y(function(d) { return yScale(d.value); });

    var color = this.colors[0];
    this.series.push({id: id, name: name, xDomain: xDomain, yDomain: yDomain, data: data, line: line, color: color});
    this.xScale.domain(this.getXDomain());
    this.yScale.domain(this.getYDomain());
    //console.log(this.getYDomain());
    //console.log(data);
  
    if (this.brushExtent == null) {
      this.brushExtent = [frameStart *1000, frameEnd * 1000];
      this.brush.extent(this.brushExtent);
    }
      console.log("initted: " + this.initted);
      if (this.initted == false) {
        this.svg.append("g")
          .attr("class", "brush")
          .call(this.brush)
          .attr("transform", "translate(0,0)")
          .selectAll("rect")
          .attr("y", 0)
          .attr("height",this.height);
      }
      this.initted = true;


    this.svg.insert("path", "rect.pane")
        .attr("class", "line")
        .attr("id", "line" + id)
        .attr("clip-path", "url(#clip)")
        .style("stroke", color)
        .data([data]);
    this.yAxis.tickFormat(abbrFormat);
    this.draw();
  },

  draw: function() {
    var svg = this.svg;
    svg.select("g.x.axis").call(this.xAxis);
    svg.select("g.y.axis").call(this.yAxis);
    this.series.forEach(function(d) {svg.select("path.line#line" + d.id).attr("d", d.line)});
    //this.prevXDomain = this.xScale.domain().slice(0);
  },

  reload: function() {

    
    var options = {time: {timeStart: this.mapD.dataStart, timeEnd: this.mapD.dataEnd}};
    $.getJSON(this.getURL(options)).done($.proxy(this.onData, this, this.mapD.timeStart, this.mapD.timeEnd, this.mapD.queryTerms, true));
  },

  getURL: function(options) {
    this.params.sql = "select " + this.mapD.curData.time + " ";
    if (options == undefined || options == null) 
      options = {splitQuery: true, noTime: true};
    else  {
      options.splitQuery = true;
      options.noTime = true;
    }
    //debugger;
    var queryArray = this.mapD.getWhere(options);
    //console.log("query array");
    //console.log(queryArray);
    if (queryArray[0] != "")
      this.params.sql += "," + queryArray[0];
    this.params.sql += " from " + this.mapD.curData.table + queryArray[1];
    this.params.histStart = this.mapD.dataStart;
    this.params.histStart = this.mapD.dataEnd;
    if (options && options.time) {
      this.params.histStart = options.time.timeStart;
      this.params.histEnd = options.time.timeEnd;
    }
    this.params.bbox = this.mapD.map.canvas.getExtent().toBBOX();
    var url = this.mapD.curData.host + '?' + buildURI(this.params);
    return url;
 },

  removeAllSeries: function() {
    this.seriesId = 0;
    this.series = [];
    //this.colorUsed = {}; 
    //this.lastZoomTime = 0;
    this.svg.selectAll("path.line").data([]).exit().remove();
    //this.elems.svg.selectAll("g.focus").data([]).exit().remove();
    //this.elems.info.selectAll("g.legend").data([]).exit().remove();
    //this.elems.detailsDiv.selectAll("li.detail-container").data([]).exit().remove();
  },


   onData: function(frameStart, frameEnd, queryTerms, clear, json) {
    if (clear) {
      this.removeAllSeries();
    }
    var series = [];
    var dataFormat;
    if ("y" in json) { // means we have percent
      dataFormat = "percents";
      for (i in json.x) {
        var time  = json.x[i];
        var percent = json.y[i];
        if (json.count[i] > 0)
          series.push({date: new Date(time * 1000), value: percent});
      }
    }
    else {
      dataFormat = "counts";
      for (i in json.x) {
        var time  = json.x[i];
        //time = time - 4 * 60 * 60; // hack: original data set is ahead by 4 hours.
        var count = json.count[i];
        series.push({date: new Date(time * 1000), value: count});
      }
    }
    this.addSeries(this.seriesId, queryTerms, series, frameStart, frameEnd, dataFormat);
    this.seriesId += 1;
   }
}

function init() {
  MapD.init();
}

//var Choropleth = {

    


