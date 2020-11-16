'use strict';

import Phaser from '../lib/phaser.js';

import Gem from '../game/gem.js';

export default class Game extends Phaser.Scene {
  pointsCollected = 0;
  pointsCounterText;
  constructor() {
    super('game');
  }
  init() {
    this.pointsCollected = 0;
  }
  player;
  platforms;
  gems;
  cursors;

  preload() {
    this.load.image('background', 'assets/bg_layer1.png');

    // this.load.image('platform', 'assets/ground_grass.png');
    this.load.image('platform', 'assets/ground_stone.png');

    // this.load.image('player-stand', 'assets/bunny1_stand.png');
    this.load.image('player-stand', 'assets/alienGreen_swim2.png');

    this.load.image('player-jump', 'assets/alienGreen_jump.png');

    // this.load.image('gem', 'assets/carrot.png');
    this.load.image('gem', 'assets/ball_basket4.png');

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
    // const newCarrot = new Gem (this, 240, 320, 'gem');
    // this.add.existing(newCarrot);

    this.gems = this.physics.add.group({
      classType: Gem,
    });

    //TEST CARROT
    // this.gems.get(240, 320, 'gem');

    this.physics.add.collider(this.platforms, this.gems);

    this.physics.add.overlap(
      this.player,
      this.gems,
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

        this.addGem(platform);
        this.addGem(platform);
      }
    });

    const makeContact = this.player.body.touching.down;

    if (makeContact) {
      this.player.setVelocityY(-300);

      this.player.setTexture('player-jump');
    }

    const vy = this.player.body.velocity.y;

    if (vy > 0 && this.player.texture.key !== 'player-stand') {
      this.player.setTexture('player-stand');
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

    if (this.player.y > lastPlatform.y + 500) {
      // console.log('GAME OVER');
      this.scene.start('game-over');
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

  addGem(sprite) {
    const y = sprite.y - sprite.displayHeight;
    const gem = this.gems.get(sprite.x, y, 'gem');

    gem.setActive(true);
    gem.setVisible(true);

    this.add.existing(gem);

    // gem.body.setSize(gem.width, gem.height);

    this.physics.world.enable(gem);

    return gem;
  }

  addLetter(sprite) {
    const y = sprite.y - sprite.displayHeight;
    const gem = this.gems.get(sprite.x, y, handleCollect);

    gem.setActive(true);
    gem.setVisible(true);

    this.add.existing(gem);

    // gem.body.setSize(gem.width, gem.height);

    this.physics.world.enable(gem);

    return gem;
  }

  handleCollect(player, gem) {
    this.gems.killAndHide(gem);
    this.physics.world.disableBody(gem.body);

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

    for (let i = 0; i < this.platforms.length; i++) {
      const platform = this.platforms[i];

      if (this.platform.y < lastPlatform.y) {
        continue;
      }

      lastPlatform = this.platform;
    }
    return lastPlatform;
  }
}
