// Jim Whitehead
// Created: 5/26/2024
// Phaser: 3.80.0
//
// Pathfinder demo
//
// An example of pathfinding in Phaser using the EasyStar.js pathfinder 
// https://github.com/prettymuchbryce/easystarjs
// 
// Assets from the following Kenney Asset packs
// Tiny Dungeon
// https://kenney.nl/assets/tiny-dungeon
//
// Tiny Town
// https://kenney.nl/assets/tiny-town
//

import { Game, Scene } from "phaser";
import { Load } from "./Scenes/Load";
import { Pathfinder } from "./Scenes/Pathfinder";

// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true  // prevent pixel art from getting blurred when scaled
    },
    width: 1280,
    height: 800,
    scene: [Load, Pathfinder]
}

export var cursors;
export const SCALE = 2.0;
export var my = {sprite: {}};

const game = new Game(config);

