OpenLayers.Layer.Grid.prototype.setTileSize = function (size) {
    if (this.singleTile) {
        size = this.map.getSize();
        var curWidth = parseInt(size.w * this.ratio);
        var targetWidth = curWidth + (16 - (curWidth % 16));
        this.newRatio = targetWidth / size.w; 
        size.h = parseInt(Math.round(size.h * this.newRatio));
        size.w = parseInt(Math.round(size.w * this.newRatio));
    }
    OpenLayers.Layer.HTTPRequest.prototype.setTileSize.apply(this, [size]);
};

OpenLayers.Layer.Grid.prototype.initSingleTile = function (bounds) {
    this.events.triggerEvent("retile");

    //determine new tile bounds
    var center = bounds.getCenterLonLat();
    var tileWidth = bounds.getWidth() * this.newRatio;
    var tileHeight = bounds.getHeight() * this.newRatio;
    
    var tileBounds =
    new OpenLayers.Bounds(center.lon - (tileWidth / 2),
                          center.lat - (tileHeight / 2),
                          center.lon + (tileWidth / 2),
                          center.lat + (tileHeight / 2));

    var px = this.map.getLayerPxFromLonLat({
        lon:tileBounds.left,
        lat:tileBounds.top
    });

    if (!this.grid.length) {
        this.grid[0] = [];
    }

    var tile = this.grid[0][0];
    if (!tile) {
        tile = this.addTile(tileBounds, px);

        this.addTileMonitoringHooks(tile);
        tile.draw();
        this.grid[0][0] = tile;
    } else {
        tile.moveTo(tileBounds, px);
    }

    //remove all but our single tile
    this.removeExcessTiles(1, 1);

    // store the resolution of the grid
    this.gridResolution = this.getServerResolution();
};
