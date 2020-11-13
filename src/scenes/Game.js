'use strict';

import Phaser from '../lib/phaser.js';

import Carrot from '../game/Carrot.js';

export default class Game extends Phaser.Scene {
  pointsCollected = 0;
  pointsCounterText; 
  constructor() {
    super('game');
  }
  player;
  platforms;
  carrots;
  cursors;

  preload() {
    this.load.image('background', 'assets/bg_layer1.png');

    // this.load.image('platform', 'assets/ground_grass.png');
    this.load.image('platform', 'assets/ground_stone.png');

    // this.load.image('player-stand', 'assets/bunny1_stand.png');
    this.load.image('player-stand', 'assets/alienGreen_swim2.png');

    // this.load.image('carrot', 'assets/carrot.png');
    this.load.image('carrot', 'assets/ball_basket4.png');

    //May move to create()??
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  create() {
    this.add.image(240, 220, 'background').setScrollFactor(1, 0);

    this.platforms = this.physics.add.staticGroup();

    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(80, 400);
      x;
      const y = 150 * i;
      const platform = this.platforms.create(x, y, 'platform');

      platform.scale = 0.5;

      const body = platform.body;
      body.updateFromGameObject();
    }

    this.player = this.physics.add.sprite(240, 320, 'player-stand');
    // .setScale(0.5);

    this.physics.add.collider(this.platforms, this.player);

    this.player.body.checkCollision.up = false;
    this.player.body.checkCollision.left = false;
    this.player.body.checkCollision.right = false;

    this.cameras.main.startFollow(this.player);

    this.cameras.main.setDeadzone(this.scale.width * 1.5);

    //THIS CODE JUST ADDS ONE CARROT TO GAME (MIDDLE OF SCREEN)
    // const newCarrot = new Carrot (this, 240, 320, 'carrot');
    // this.add.existing(newCarrot);

    this.carrots = this.physics.add.group({
      classType: Carrot,
    });

    //TEST CARROT
    // this.carrots.get(240, 320, 'carrot');

    this.physics.add.collider(this.platforms, this.carrots);

    this.physics.add.overlap(
      this.player,
      this.carrots,
      this.handleCollect,
      undefined,
      this
    );

    const style = { color: '#000', fontSize: 24 };
    this.pointsCounterText = this.add
      .text(240, 600, 'Points: 0', style)
      .setScrollFactor(0)
      .setOrigin(0.5, 0);
  }

  update() {
    this.platforms.children.iterate((child) => {
      const platform = child;
      const scrollY = this.cameras.main.scrollY;

      if (platform.y >= scrollY + 700) {
        platform.y = scrollY - Phaser.Math.Between(50, 100);
        platform.body.updateFromGameObject();

        this.addCarrotAbove(platform);
      }
    });

    const makeContact = this.player.body.touching.down;

    if (makeContact) {
      this.player.setVelocityY(-300);
    }

    if (this.cursors.left.isDown && !makeContact) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown && !makeContact) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    this.horizontalWrap(this.player);

    const lastPlatform = this.gameOver();

    if(this.player.y > lastPlatform.y + 500) {
      console.log('GAME OVER');
    }
  }

  horizontalWrap(sprite) {
    const halfWidth = sprite.displayWidth * 0.5;
    const gameWidth = this.scale.width;
    const addWidth = gameWidth + halfWidth;

    if (sprite.x < -halfWidth) {
      sprite.x = addWidth;
    } else if (sprite.x > addWidth) {
      sprite.x = -halfWidth;
    }
  }

  addCarrotAbove(sprite) {
    const y = sprite.y - sprite.displayHeight;
    const carrot = this.carrots.get(sprite.x, y, 'carrot');

    carrot.setActive(true);
    carrot.setVisible(true);

    this.add.existing(carrot);

    // carrot.body.setSize(carrot.width, carrot.height);

    this.physics.world.enable(carrot);

    return carrot;
  }

  handleCollect(player, carrot) {
    this.carrots.killAndHide(carrot);
    this.physics.world.disableBody(carrot.body);

    this.pointsCollected++;
    // console.log(this.pointsCollected);

    const value = `Points: ${this.pointsCollected}`;
    // console.log('VALUE', value);
    // console.log('POINTS', this.pointsCollected);

    this.pointsCounterText.text = value;
  }

  gameOver() {
    const platform = this.platforms.getChildren();
    let lastPlatform = platform[0];

    for(let i = 0; i < this.platforms.length; i++) {
      const platform = this.platforms[i];

      if(this.platform.y < lastPlatform.y) {
        continue;
      }

      lastPlatform = this.platform
    }
    return lastPlatform;
  }
}
