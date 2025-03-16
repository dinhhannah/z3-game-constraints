import EasyStar from "easystarjs"
import { my } from "../main"
import { find } from "../z3"

// Area of top fence
const fence1_area= {
    left: 34,
    right: 38,
    bottom: 6,
    top: 2,
};

// Area of bottom fence
const fence2_area = {
    left: 21,
    right: 29,
    bottom: 20,
    top: 17,
};

const forest_area = {
    left: 11,
    right: 23,
    bottom: 12,
    top: 1,
};

// var in_fence1 = await find([], fence1_area);
// var in_fence2 = await find([], fence2_area);
// var in_forest = await find([], forest_area);
// var tiles_put = [];

// console.log("Fence 1 Tiles:", in_fence1);
// console.log("Fence 2 Tiles:", in_fence2);
// console.log("Forest Tiles:", in_forest);

export class Pathfinder extends Phaser.Scene{
    constructor() {
        super("pathfinderScene");
        // this.in_fence1 = [];
        // this.in_fence2 = [];
        // this.in_forest = [];
    }

    preload() {
    }

    init() {
        this.my = {sprite:{}}
        this.TILESIZE = 16;
        this.SCALE = 2.0;
        this.TILEWIDTH = 40;
        this.TILEHEIGHT = 25;
    }

    async create(){
        // var in_fence1 = await find([], fence1_area);
        // var in_fence2 = await find([], fence2_area);
        // var in_forest = await find([], forest_area);
        // var tiles_put = [];

        // console.log("Fence 1 Tiles:", in_fence1);
        // console.log("Fence 2 Tiles:", in_fence2);
        // console.log("Forest Tiles:", in_forest);
        
        // Create a new tilemap which uses 16x16 tiles, and is 40 tiles wide and 25 tiles tall
        this.map = this.add.tilemap("three-farmhouses", this.TILESIZE, this.TILESIZE, this.TILEHEIGHT, this.TILEWIDTH);

        // Add a tileset to the map
        this.tileset = this.map.addTilesetImage("kenney-tiny-town", "tilemap_tiles");

        // Create the layers
        this.groundLayer = this.map.createLayer("Ground-n-Walkways", this.tileset, 0, 0);
        this.treesLayer = this.map.createLayer("Trees-n-Bushes", this.tileset, 0, 0);
        this.housesLayer = this.map.createLayer("Houses-n-Fences", this.tileset, 0, 0);

        // Create townsfolk sprite
        // Use setOrigin() to ensure the tile space computations work well
        this.my.sprite.purpleTownie = this.add.sprite(this.tileXtoWorld(5), this.tileYtoWorld(5), "purple").setOrigin(0,0);
        
        // Camera settings
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.setZoom(this.SCALE);

        // Create grid of visible tiles for use with path planning
        let tinyTownGrid = this.layersToGrid([this.groundLayer, this.treesLayer, this.housesLayer]);

        let walkables = [1, 2, 3, 30, 40, 41, 42, 43, 44, 95, 13, 14, 15, 25, 26, 27, 37, 38, 39, 70, 84];

        // Initialize EasyStar pathfinder
        this.finder = new EasyStar.js();

        // Pass grid information to EasyStar
        // EasyStar doesn't natively understand what is currently on-screen,
        // so, you need to provide it that information
        this.finder.setGrid(tinyTownGrid);

        // Tell EasyStar which tiles can be walked on
        this.finder.setAcceptableTiles(walkables);

        this.activeCharacter = this.my.sprite.purpleTownie;

        // Handle mouse clicks
        // Handles the clicks on the map to make the character move
        // The this parameter passes the current "this" context to the
        // function this.handleClick()
        this.input.on('pointerup', this.handleClick, this);

        this.cKey = this.input.keyboard.addKey('C');
        this.pKey = this.input.keyboard.addKey('P');
        this.eKey = this.input.keyboard.addKey('E');

        this.lowCost = false;
    }


    update() {

        if (Phaser.Input.Keyboard.JustDown(this.cKey)) {
            if (!this.lowCost) {
                // Make the path low cost with respect to grassy areas
                this.setCost(this.tileset);
                this.lowCost = true;
            } else {
                // Restore everything to same cost
                this.resetCost(this.tileset);
                this.lowCost = false;
            }
        }
        
        // Press P to place assets
        if (Phaser.Input.Keyboard.JustDown(this.pKey)) {
            console.log("Placed"); // Debugging
            this.put(this.in_fence1, 58);
            this.put(this.in_fence2, 58);
            this.put(this.in_forest, 30);
            this.map.render;
        }

        // Press E to erase assets that were placed
        if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
            console.log("Erased"); // Debugging
            this.clear();
            this.map.render;
        }
    }

    avoid(values) {
        const layer = this.map.getLayer("Trees-n-Bushes").tilemapLayer;
        const updatedVals = values.filter(({ xVal, yVal }) => {
            const tile = layer.getTileAt(xVal, yVal);
            if (tile) {
                return false;
            }
        
            return true;
        });
        
        return updatedVals;
      }

    put(values, tile_id) {
        if (values.length == 0) {
            console.log("No valid tile positions available.");
            return;
        }

        values = this.avoid(values);
        console.log("Available tiles after avoid:", values); // Debugging

        if (values.length === 0) {
            console.log("No tiles left after filtering.");
            return;
        }

        let random = Phaser.Math.Between(0, values.length - 1);
        var tile = values.splice(random, 1)[0];

        console.log("Placing tile at:", tile.xVal, tile.yVal); // Debugging

        const layer = this.map.getLayer("Houses-n-Fences").tilemapLayer;
        const { xVal, yVal } = tile;
        tiles_put.push(tile);
        return layer.putTileAt(tile_id, xVal, yVal);
    }

    clear() {
        console.log(tiles_put);

        const layer = this.map.getLayer("Houses-n-Fences").tilemapLayer;
        tiles_put.forEach(({ xVal, yVal }) => {
          layer.removeTileAt(xVal, yVal);
        });
    
        tiles_put = [];
    }

    resetCost(tileset) {
        for (let tileID = tileset.firstgid; tileID < tileset.total; tileID++) {
            let props = tileset.getTileProperties(tileID);
            if (props != null) {
                if (props.cost != null) {
                    this.finder.setTileCost(tileID, 1);
                }
            }
        }
    }

    tileXtoWorld(tileX) {
        return tileX * this.TILESIZE;
    }

    tileYtoWorld(tileY) {
        return tileY * this.TILESIZE;
    }

    // layersToGrid
    //
    // Uses the tile layer information in this.map and outputs
    // an array which contains the tile ids of the visible tiles on screen.
    // This array can then be given to Easystar for use in path finding.
    layersToGrid() {
        let grid = [];
        for (let y = 0; y < this.TILEHEIGHT; y++) {
            grid[y] = [];
            for (let x = 0; x < this.TILEWIDTH; x++) {
                // Get the tile ID from the ground layer (or any other layer)
                let tile = this.groundLayer.getTileAt(x, y);
                grid[y][x] = tile ? tile.index : 0; // Use 0 or any default value for empty tiles
            }
        }
        return grid;
    }


    handleClick(pointer) {
        let x = pointer.x / this.SCALE;
        let y = pointer.y / this.SCALE;
        let toX = Math.floor(x/this.TILESIZE);
        var toY = Math.floor(y/this.TILESIZE);
        var fromX = Math.floor(this.activeCharacter.x/this.TILESIZE);
        var fromY = Math.floor(this.activeCharacter.y/this.TILESIZE);
        console.log('going from ('+fromX+','+fromY+') to ('+toX+','+toY+')');
    
        this.finder.findPath(fromX, fromY, toX, toY, (path) => {
            if (path === null) {
                console.warn("Path was not found.");
            } else {
                console.log(path);
                this.moveCharacter(path, this.activeCharacter);
            }
        });
        this.finder.calculate(); // ask EasyStar to compute the path
        // When the path computing is done, the arrow function given with
        // this.finder.findPath() will be called.
    }
    
    moveCharacter(path, character) {
        // Sets up a list of tweens, one for each tile to walk, that will be chained by the timeline
        var tweens = [];
        for(var i = 0; i < path.length-1; i++){
            var ex = path[i+1].x;
            var ey = path[i+1].y;
            tweens.push({
                x: ex*this.map.tileWidth,
                y: ey*this.map.tileHeight,
                duration: 200
            });
        }
    
        this.tweens.chain({
            targets: character,
            tweens: tweens
        });

    }

    // A function which takes as input a tileset and then iterates through all
    // of the tiles in the tileset to retrieve the cost property, and then 
    // uses the value of the cost property to inform EasyStar, using EasyStar's
    // setTileCost(tileID, tileCost) function.
    setCost(tileset) {
        for (let tileID = tileset.firstgid; tileID < tileset.total; tileID++) {
            let props = tileset.getTileProperties(tileID);
            if (props && props.cost != null) {
                this.finder.setTileCost(tileID, props.cost);
            }
        }
    }
}
