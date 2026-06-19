import Phaser from 'phaser';

const GAME_WIDTH = 520;
const GAME_HEIGHT = 360;
const TARGET_LIFETIME = 1400;
const MAX_HITS = 10;

const audioFiles = {
  hitLight: '/audio/punch/hit-light.ogg',
  hitHeavy: '/audio/punch/hit-heavy.ogg',
  miss: '/audio/punch/miss.ogg',
  crack: '/audio/punch/crack.ogg',
  defeat: '/audio/punch/defeat.ogg',
  uiClick: '/audio/punch/ui-click.ogg',
  combo: '/audio/punch/combo.ogg',
};

const getDamageStage = (hits) => {
  if (hits >= 10) return 4;
  if (hits >= 6) return 3;
  if (hits >= 3) return 2;
  if (hits >= 1) return 1;
  return 0;
};

const targetPositions = [
  { x: 218, y: 142 },
  { x: 282, y: 136 },
  { x: 250, y: 196 },
  { x: 196, y: 220 },
  { x: 316, y: 220 },
  { x: 258, y: 262 },
];

class RobotPunchScene extends Phaser.Scene {
  constructor() {
    super('RobotPunchScene');
  }

  init(config) {
    this.robot = config.robot;
    this.callbacks = config.callbacks;
    this.isMuted = config.muted;
    this.reducedMotion = config.reducedMotion;
    this.hits = 0;
    this.combo = 0;
    this.workerRage = config.workerRage || 0;
    this.automationDelay = config.automationDelay || 0;
    this.isDestroyed = false;
    this.activeTarget = null;
    this.targetTimer = null;
    this.sparkGraphics = [];
  }

  preload() {
    this.load.svg('robot', this.robot.image, { width: 260, height: 260 });

    Object.entries(audioFiles).forEach(([key, url]) => {
      this.load.audio(key, url);
    });
  }

  create() {
    this.sound.mute = this.isMuted;
    this.cameras.main.setBackgroundColor('#fff8e8');
    this.createArena();
    this.createRobot();
    this.createTarget();

    this.input.on('pointerdown', (pointer) => {
      if (this.isDestroyed) return;

      if (this.activeTarget && Phaser.Math.Distance.Between(pointer.x, pointer.y, this.activeTarget.x, this.activeTarget.y) <= 40) {
        this.hitRobot(pointer.x, pointer.y);
        return;
      }

      this.missRobot(pointer.x, pointer.y);
    });

    this.input.keyboard.on('keydown-SPACE', () => this.punchActiveTarget());
    this.input.keyboard.on('keydown-ENTER', () => this.punchActiveTarget());

    this.callbacks.onReady?.();
  }

  createArena() {
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x2c2823, 0.1);

    for (let x = 0; x <= GAME_WIDTH; x += 26) {
      grid.lineBetween(x, 0, x, GAME_HEIGHT);
    }

    for (let y = 0; y <= GAME_HEIGHT; y += 26) {
      grid.lineBetween(0, y, GAME_WIDTH, y);
    }

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 34, 360, 34, 0xead9b9, 1).setStrokeStyle(3, 0x2c2823);
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 34, 'AUTHORIZED FRUSTRATION ZONE', {
      color: '#2c2823',
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
    }).setOrigin(0.5);
  }

  createRobot() {
    this.robotSprite = this.add.image(GAME_WIDTH / 2, 176, 'robot');
    this.robotSprite.setOrigin(0.5);
    this.robotSprite.setScale(0.86);
    this.robotSprite.setInteractive({ useHandCursor: true });

    this.damageGraphics = this.add.graphics();
  }

  createTarget() {
    if (this.isDestroyed) return;

    if (this.activeTarget) {
      this.activeTarget.destroy();
    }

    const position = Phaser.Utils.Array.GetRandom(targetPositions);
    const target = this.add.container(position.x, position.y);
    const outer = this.add.circle(0, 0, 38, 0xc63f35, 0.16).setStrokeStyle(4, 0xc63f35, 1);
    const inner = this.add.circle(0, 0, 15, 0xf0c75c, 0.9).setStrokeStyle(3, 0x2c2823, 1);
    const crossA = this.add.rectangle(0, 0, 54, 4, 0x2c2823, 0.9);
    const crossB = this.add.rectangle(0, 0, 4, 54, 0x2c2823, 0.9);

    target.add([outer, inner, crossA, crossB]);
    target.setSize(80, 80);
    target.setDepth(5);
    this.activeTarget = target;

    this.tweens.add({
      targets: target,
      scale: { from: 0.72, to: 1 },
      alpha: { from: 0.45, to: 1 },
      duration: this.reducedMotion ? 1 : 160,
      ease: 'Back.Out',
    });

    if (this.targetTimer) {
      this.targetTimer.remove(false);
    }

    this.targetTimer = this.time.delayedCall(TARGET_LIFETIME, () => {
      if (!this.isDestroyed) {
        this.missRobot(target.x, target.y);
      }
    });
  }

  punchActiveTarget() {
    if (this.isDestroyed || !this.activeTarget) return;
    this.hitRobot(this.activeTarget.x, this.activeTarget.y);
  }

  hitRobot(x, y) {
    if (this.targetTimer) {
      this.targetTimer.remove(false);
    }

    this.hits += 1;
    this.combo += 1;
    this.workerRage += 1 + Math.floor(this.combo / 3);
    this.automationDelay += this.workerRage;

    const stage = getDamageStage(this.hits);
    const line = Phaser.Utils.Array.GetRandom(this.robot.hitLines);
    const isHeavy = this.combo > 1 || stage >= 2;

    this.playSound(isHeavy ? 'hitHeavy' : 'hitLight', 0.75);

    if (this.combo > 1) {
      this.playSound('combo', 0.4);
    }

    if ([3, 6].includes(this.hits)) {
      this.playSound('crack', 0.55);
    }

    this.showHitEffects(x, y, stage);
    this.updateDamage(stage);

    if (this.hits >= MAX_HITS) {
      this.defeatRobot();
      return;
    }

    this.callbacks.onHit?.({
      hits: this.hits,
      workerRage: this.workerRage,
      automationDelay: this.automationDelay,
      stage,
      line,
    });
    this.createTarget();
  }

  missRobot(x, y) {
    this.combo = 0;
    this.playSound('miss', 0.45);
    this.callbacks.onMiss?.({
      hits: this.hits,
      workerRage: this.workerRage,
      automationDelay: this.automationDelay,
      stage: getDamageStage(this.hits),
      line: 'Punch missed. HR has categorized this as a skills gap.',
    });

    if (this.activeTarget) {
      this.tweens.add({
        targets: this.activeTarget,
        x: x + 12,
        alpha: 0,
        duration: this.reducedMotion ? 1 : 120,
        onComplete: () => this.createTarget(),
      });
    } else {
      this.createTarget();
    }
  }

  updateDamage(stage) {
    const rotations = [0, -2, 3, -7, 14];
    const scales = [0.86, 0.84, 0.82, 0.78, 0.62];
    const alphas = [1, 1, 0.92, 0.82, 0.42];

    this.robotSprite.setAngle(rotations[stage]);
    this.robotSprite.setScale(scales[stage]);
    this.robotSprite.setAlpha(alphas[stage]);

    this.damageGraphics.clear();

    if (stage >= 2) {
      this.drawCrack(194, 130, 58, 26);
    }

    if (stage >= 3) {
      this.drawCrack(304, 220, 66, -20);
    }
  }

  drawCrack(x, y, length, angle) {
    this.damageGraphics.lineStyle(4, 0x2c2823, 1);
    this.damageGraphics.save();
    this.damageGraphics.translateCanvas(x, y);
    this.damageGraphics.rotateCanvas(Phaser.Math.DegToRad(angle));
    this.damageGraphics.lineBetween(-length / 2, 0, length / 2, 0);
    this.damageGraphics.lineBetween(10, 0, 30, -18);
    this.damageGraphics.lineBetween(10, 0, 34, 18);
    this.damageGraphics.restore();
  }

  showHitEffects(x, y, stage) {
    if (!this.reducedMotion) {
      this.cameras.main.shake(90 + stage * 20, 0.004 + stage * 0.001);
    }

    const burst = this.add.graphics();
    burst.fillStyle(0xf0c75c, 1);

    for (let i = 0; i < 8; i += 1) {
      const angle = (Math.PI * 2 * i) / 8;
      burst.fillRect(x + Math.cos(angle) * 18, y + Math.sin(angle) * 18, 9, 9);
    }

    this.tweens.add({
      targets: burst,
      alpha: 0,
      scale: this.reducedMotion ? 1 : 1.5,
      duration: this.reducedMotion ? 80 : 260,
      onComplete: () => burst.destroy(),
    });

    if (this.activeTarget) {
      this.activeTarget.destroy();
      this.activeTarget = null;
    }
  }

  defeatRobot() {
    this.isDestroyed = true;
    this.playSound('defeat', 0.75);

    if (this.activeTarget) {
      this.activeTarget.destroy();
      this.activeTarget = null;
    }

    this.updateDamage(4);

    this.tweens.add({
      targets: this.robotSprite,
      y: this.robotSprite.y + 36,
      duration: this.reducedMotion ? 1 : 240,
      ease: 'Back.In',
    });

    this.callbacks.onDefeat?.({
      hits: this.hits,
      workerRage: this.workerRage,
      automationDelay: this.automationDelay,
      stage: 4,
      line: this.robot.defeatLine,
    });
  }

  playSound(key, volume = 0.5) {
    if (this.sound.mute || !this.cache.audio.exists(key)) return;

    try {
      this.sound.play(key, { volume });
    } catch {
      // The game should keep working if the browser refuses audio.
    }
  }

  setMuted(isMuted) {
    this.isMuted = isMuted;
    this.sound.mute = isMuted;
  }
}

export const createRobotPunchGame = async ({
  mount,
  robot,
  muted = true,
  reducedMotion = false,
  callbacks = {},
}) => {
  let scene = null;

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: mount,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#fff8e8',
    scene: RobotPunchScene,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    audio: {
      disableWebAudio: false,
    },
    callbacks: {
      postBoot: (bootedGame) => {
        scene = bootedGame.scene.getScene('RobotPunchScene');
      },
    },
  });

  game.scene.start('RobotPunchScene', {
    robot,
    muted,
    reducedMotion,
    callbacks,
  });

  return {
    destroy() {
      game.destroy(true);
    },
    reset(nextRobot = robot, totals = {}) {
      game.scene.stop('RobotPunchScene');
      game.scene.start('RobotPunchScene', {
        robot: nextRobot,
        muted,
        reducedMotion,
        workerRage: totals.workerRage || 0,
        automationDelay: totals.automationDelay || 0,
        callbacks,
      });
    },
    setMuted(isMuted) {
      muted = isMuted;
      scene?.setMuted(isMuted);
    },
    punch() {
      scene?.punchActiveTarget();
    },
    playUi() {
      scene?.playSound('uiClick', 0.45);
    },
  };
};
