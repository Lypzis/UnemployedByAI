const gallery = document.querySelector('[data-games-gallery]');
const stage = document.querySelector('[data-game-stage]');
const gameCard = document.querySelector('[data-game-id]');
const backButton = document.querySelector('[data-games-back]');
const mount = document.querySelector('[data-game-mount]');
const status = document.querySelector('[data-game-status]');

const GAME_WIDTH = 760;
const GAME_HEIGHT = 430;
const message = "You're not supposed to be here yet, come back later.";

let game = null;

const createComingSoonScene = (Phaser) =>
  class extends Phaser.Scene {
    constructor() {
      super('ComingSoonScene');
    }

    preload() {
      this.load.svg('mascot', '/robots/mascot.svg', { width: 230, height: 230 });
    }

    create() {
      this.cameras.main.setBackgroundColor('#fff8e8');
      this.drawGrid();
      this.drawFloor();
      this.drawSpeechBubble();
      this.add.image(292, 240, 'mascot').setScale(0.86).setOrigin(0.5);
      this.add.text(380, 378, 'ACCESS DENIED: FUN PENDING APPROVAL', {
        color: '#2c2823',
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px',
        fontStyle: 'bold',
      }).setOrigin(0.5);
    }

    drawGrid() {
      const grid = this.add.graphics();
      grid.lineStyle(1, 0x2c2823, 0.12);

      for (let x = 0; x <= GAME_WIDTH; x += 38) {
        grid.lineBetween(x, 0, x, GAME_HEIGHT);
      }

      for (let y = 0; y <= GAME_HEIGHT; y += 38) {
        grid.lineBetween(0, y, GAME_WIDTH, y);
      }
    }

    drawFloor() {
      const floor = this.add.graphics();
      floor.fillStyle(0xead9b9, 1);
      floor.fillRect(0, 320, GAME_WIDTH, 110);
      floor.lineStyle(4, 0x2c2823, 1);
      floor.lineBetween(0, 320, GAME_WIDTH, 320);
    }

    drawSpeechBubble() {
      const bubble = this.add.graphics();
      bubble.fillStyle(0xdce8f0, 1);
      bubble.lineStyle(5, 0x2c2823, 1);
      bubble.fillRoundedRect(360, 72, 318, 146, 14);
      bubble.strokeRoundedRect(360, 72, 318, 146, 14);
      bubble.fillTriangle(406, 214, 350, 244, 386, 198);
      bubble.lineBetween(406, 214, 350, 244);
      bubble.lineBetween(350, 244, 386, 198);

      this.add.text(388, 104, message, {
        color: '#2c2823',
        fontFamily: 'Arial, sans-serif',
        fontSize: '24px',
        fontStyle: 'bold',
        lineSpacing: 7,
        wordWrap: { width: 250 },
      });
    }
  };

const destroyGame = () => {
  if (!game) return;

  game.destroy(true);
  game = null;
};

const showGallery = () => {
  destroyGame();
  stage.hidden = true;
  gallery.hidden = false;
  status.textContent = 'Phaser cabinet warming up. Please do not submit a ticket.';
  gameCard.focus();
};

const showStage = async () => {
  gallery.hidden = true;
  stage.hidden = false;
  status.textContent = 'Loading forbidden cabinet...';
  mount.innerHTML = '';

  const PhaserModule = await import('phaser');
  const Phaser = PhaserModule.default || PhaserModule;
  const Scene = createComingSoonScene(Phaser);

  destroyGame();
  game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: mount,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#fff8e8',
    scene: Scene,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
  });

  status.textContent = 'Cabinet loaded. The robot remains professionally unavailable.';
  window.setTimeout(() => mount.focus(), 0);
};

gameCard.addEventListener('click', () => {
  showStage().catch(() => {
    gallery.hidden = false;
    stage.hidden = true;
    status.textContent = 'The arcade failed to boot. Management has called this innovation.';
  });
});

backButton.addEventListener('click', showGallery);
