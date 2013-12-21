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


  var darkBlueStyle = [ { featureType: "all", elementType: "all", stylers: [ {visibility: "on" }, {saturation: -62}, {hue: "#00c3ff"}, {"gamma": 0.27}, {lightness: -65} ] } ];
  var darkMap = new OpenLayers.Layer.Google("Dark", {type: 'styled'}, {isBaseLayer:true});
  var styledMapOptions = {
    name: "Dark Map"
  };
    var styledMapType = new google.maps.StyledMapType(darkBlueStyle,styledMapOptions);
  var blankMap = new OpenLayers.Layer.OSM("Blank","data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=")
    baseLayers = new Array(darkMap, blankMap, new OpenLayers.Layer.Google("Google Roadmap", {type: google.maps.MapTypeId.ROADMAP}, {isBaseLayer:true, transitionEffect: 'resize'}));

    this.canvas = new OpenLayers.Map({
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
 

var Settings = {
  pointOn: true,
  heatOn: false,
  overlayVisible: false,
  settingsOverlay: null,
  settingsButton: null,

  init: function(settingsOverlay, settingsButton) {
    this.settingsOverlay = settingsOverlay;
    this.settingsButton = settingsButton;

    $(settingsButton).click($.proxy(function() {
      this.overlayVisible = !this.overlayVisible;
      if (this.overlayVisible) {
        var overlayWidth = $(this.settingsOverlay).width();
        $(this.settingsButton).css({left: overlayWidth});
        $(this.settingsOverlay).show();
      }
      else {
        $(this.settingsButton).css({left: 0});
        $(this.settingsOverlay).hide();
      }
    },this));
  },

  resizeOverlay: function() {
    var pageWidth = $("#mapView").width();
    var overlayWidth = Math.min(pageWidth*0.5,500);
    console.log("Overlay: " + overlayWidth);
    $(this.settingsOverlay).width(overlayWidth);
    if (this.overlayVisible)
        $(this.settingsButton).css({left: overlayWidth});
  }

  


};

var MapD = {
  map: null,
  vars: null,
  curData: null,
  geoCoder: null,
  queryTerms: [],
  user: null,
  host: "http://mapd2.csail.mit.edu:8080/",
  dataStart: null,
  dataEnd: null,
  timeStart: null,
  timeEnd: null,
  queryTerms: [],
  termsAndUserQuery: "",
  services: {
    settings: null,
    pointMap: null,
    heatMap: null,
    search: null,
    click: null,
  },

  init: function () {
    $(window).resize($.proxy(this.resize,this));
      setTimeout(fixSize, 700);
      setTimeout(fixSize, 1500);
    this.vars = Vars;
    this.settings = Settings;
    this.settings.init($("#settingsOverlay"), $("#settingsButton"));
    this.curData = this.vars.datasets[this.vars.selectedVar];
    this.map = Map;
    this.map.init();
    this.resize();

    /*
  $("#menuLeft").buildMbExtruder({
    positionFixed:true,
    width:150,
    sensibility:800,
    position:"left", // left, right, bottom
    extruderOpacity:1.0,
    flapDim:300,
    textOrientation:"bt", // or "tb" (top-bottom or bottom-top)
              onExtOpen:function(){},
    onExtContentLoad:function(){},
    onExtClose:function(){},
    hidePanelsOnClose:true,
    autoCloseTime:0, // 0=never
    slideTimer:300
  });
  */


    this.geoCoder = GeoCoder;
    this.geoCoder.init();
    this.search = Search;
    this.search.init($("#curLoc"), this.geoCoder);
    this.services.pointMap = PointMap;
    this.getTimeBounds();
    this.services.click = Click;
    this.services.click.init();
    //this.heatMap = heatMap;
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
    var topBarWidth = $("#topBar").width() - 130; // for promo and search
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
    MapD.map.canvas.updateSize();
    MapD.settings.resizeOverlay();
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
            searchString = "tweet_text not ilike '"  
            atNot = false;
          }
          else
            searchString = "tweet_text ilike '"  
        }
        else {
          console.log("At end quote");
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
          if (atNot) {
            returnString += "tweet_text not ilike '" + token + "'";
            atNot = false;
          }
          else  {
            returnString += "tweet_text ilike '" + token + "'";
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
    console.log(query);
    return query;
  },

  setTermsAndUserQuery: function (queryTerms, user ) {
    var query = ""; 
    if (queryTerms.length) {
      //queryTerms = this.parseQueryTerms(queryTerms);
      console.log("Now doing parse Expression: ");
      queryTerms = this.parseQueryExpression(queryTerms);
      console.log(queryTerms);
      query += queryTerms + " and ";
    }
    if (user)
      query += "sender_name ilike '" + user + "' and ";
    this.termsAndUserQuery = query;
  },

  getWhere: function(options) {
    var timeStart = this.timeStart;
    var timeEnd = this.timeEnd;
    console.log(timeStart);
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
  },

  getTimeRangeURL: function() {
    var params = {
      request: "GetFeatureInfo"
     }
    params.sql = "select min(" + this.curData.time + "), max(" + this.curData.time + ") from " + this.curData.table;
    //params.bbox = this.map.getExtent().toBBOX();
    var url = this.host + '?' + buildURI(params);
    return url;
  },

  getTimeBounds: function() {
    $.getJSON(this.getTimeRangeURL()).done($.proxy(this.setTimeRange, this));
  },

  setTimeRange: function(json) {
    this.dataStart = json.results[0].min;
    this.dataEnd = json.results[0].max;
    this.timeEnd = Math.round((this.dataEnd-this.dataStart)*1.01 + this.dataStart);
    this.timeStart = Math.max(this.dataEnd - 864000,  Math.round((this.dataEnd-this.dataStart)*.01 + this.dataStart));
    this.initMaps();
  },

  initMaps: function() {
    this.services.pointMap.init();
  },

};


var GeoCoder = {
  map: null,
  _geocoder: new google.maps.Geocoder(),
  address: null,
  status: null,

  init: function() {
    this.map = Map.canvas;
    $(document).on('geocodeend', $.proxy(this.onGeoCodeEnd, this));
  },

  geocode: function(address) {
   console.log("at geocode");
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
    console.log(bounds);
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
    console.log("at handleclick");
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
      console.log(this.params.sql);
      var pointBuffer = this.mapD.map.canvas.resolution * this.pixelTolerance;
      this.params.bbox = (lonlat.lon-pointBuffer).toString() + "," + (lonlat.lat-pointBuffer).toString() +"," + (lonlat.lon+pointBuffer).toString() + "," + (lonlat.lat+pointBuffer).toString(); 
      var url = MapD.host + '?' + buildURI(this.params);
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
      console.log("at icon clear");
      console.log(io);

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
      this.zoomToChanged = this.zoomTo != zoomTo;
      //this.mapD.setQueryTerms(terms);
      //this.mapD.setUser(user);
      this.mapD.setTermsAndUserQuery(terms,user);
      if (this.zoomToChanged) {
        this.zoomTo = zoomTo;
        console.log("about to zoom");
        this.geoCoder.geocode(this.zoomTo);
        return false;
      }
      this.mapD.reload();
      return false;


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
      MapD.map.canvas.setCenter(center, 16);

     }




};

var PointMap = {
  mapD:MapD,
  wms: null,
  layer: null,
  baseSql: null,
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
    this.baseSql = "select " + MapD.curData.x + "," + MapD.curData.y +" from " + MapD.curData.table;
    this.layer = new OpenLayers.Layer.WMS("Point Map", this.mapD.host, this.getParams(), {singleTile: true, ratio: 1.0, "dispalyInLayerSwitcher": false, removeBackBufferDelay: 0});
    this.mapD.map.canvas.addLayer(this.layer);
    this.layer.setVisibility(true);
  },

  getParams: function(options) {
    this.params.sql = this.baseSql; 
    this.params.sql += this.mapD.getWhere(options);
    console.log(this.params.sql);
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



