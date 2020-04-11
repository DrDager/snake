import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {

  @ViewChild('snakeCanvas', {static: false})
  set snakeCanvasRef(ref: ElementRef) {
    this.gameCanvas = ref.nativeElement;
  }

  public gameLoop: any;
  public gameCanvas: any;

  public isGameStarted: boolean;
  public firstKeyPressed: boolean;

  public speed: number;
  public baseSpeed: number;

  public xv: number; // x velocity
  public yv: number; // y velocity

  public px: number; // x player position
  public py: number; // y player position

  public pWidth: number; // player width
  public pHeight: number; // player height

  public aWidth: number; // apple width
  public aHeight: number; // apple height

  public appleList: any[]; // apple list

  public trailList: any[]; // this.tailSize elements list

  public tailSize: number; // this.tailSize size

  public tailSafeZone: number; // self eating protection for head zone

  public isKeyCooldown: boolean; // is control key in cooldown

  public score: number; // current game score

  public get canvasContext(): any { return this.gameCanvas.getContext('2d'); }

  constructor() {
  }

  ngAfterViewInit() {
    this.setDefaultOptions();
    this.startGame();
  }

  public setDefaultOptions() {
    this.isGameStarted = this.firstKeyPressed = false;
    this.speed = this.baseSpeed = 3;
    this.xv = this.yv = 0;
    this.pWidth = this.pHeight = 20;
    this.aWidth = this.aHeight = 20;
    this.px = ~~(this.gameCanvas.width) / 2;
    this.py = ~~(this.gameCanvas.height) / 2;
    this.appleList = [];
    this.trailList = [];
    this.tailSize = 100;
    this.tailSafeZone = 20;
    this.isKeyCooldown = false;
    this.score = 0;
  }

  public startGame() {
    this.gameLoop = setInterval(this.loop.bind(this), 1000 / 60); // 60 FPS
  }

  public loop(): void {
    if (!this.gameCanvas || !this.canvasContext) {
      throw new Error('Game canvas in undefined');
    }

    // logic
    this.canvasContext.fillStyle = 'black';
    this.canvasContext.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);

    // force speed
    this.px += this.xv;
    this.py += this.yv;

    // teleports(when head zone out of game canvas)
    this.handleEndCanvas();

    // paint the snake itself with the tailSize elements
    this.drawSnake();

    // add nwe elements to trail
    this.trailList.push({ x: this.px, y: this.py, color: this.canvasContext.fillStyle });

    // limiter
    if (this.trailList.length > this.tailSize) {
      this.trailList.shift();
    }

    // eaten
    if (this.trailList.length > this.tailSize) {
      this.trailList.shift();
    }

    // self collisions
    this.handleSelfCollision();

    // draw appleList
    this.drawAppleList();

    // check for snake head collisions with appleList
    this.handleSnakeEatApple();
  }

  public handleSelfCollision(): void {
    if (this.trailList.length >= this.tailSize && this.isGameStarted) {
      for (let i = this.trailList.length - this.tailSafeZone; i >= 0; i--) {
        if (
          this.px < this.trailList[i].x + this.pWidth &&
          this.px + this.pWidth > this.trailList[i].x &&
          this.py < this.trailList[i].y + this.pHeight &&
          this.py + this.pHeight > this.trailList[i].y
        ) {
          // got collision
          this.tailSize = 10; // cut the tailSize
          this.speed = this.baseSpeed; // cut the speed (flash nomore lol xD)

          for (let t = 0; t < this.trailList.length; t++) {
            // highlight lossed area
            this.trailList[t].color = 'red';

            if (t >= this.trailList.length - this.tailSize) {
              break;
            }
          }
        }
      }
    }
  }

  public handleSnakeEatApple(): void {
    for (let a = 0; a < this.appleList.length; a++) {
      if (
        this.px < this.appleList[a].x + this.pWidth &&
        this.px + this.pWidth > this.appleList[a].x &&
        this.py < this.appleList[a].y + this.pHeight &&
        this.py + this.pHeight > this.appleList[a].y
      ) {
        // got collision with apple
        this.appleList.splice(a, 1); // remove this apple from the appleList list
        this.tailSize += 10; // add tailSize length
        this.speed += 0.1; // add some speed
        // spawnApple(); // spawn another apple(-s)
        break;
      }
    }
  }

  public handleEndCanvas(): void {
    if (this.px > this.gameCanvas.width) {
      this.px = 0;
    }

    if (this.px + this.pWidth < 0) {
      this.px = this.gameCanvas.width;
    }

    if (this.py + this.pHeight < 0) {
      this.py = this.gameCanvas.height;
    }

    if (this.py > this.gameCanvas.height) {
      this.py = 0;
    }
  }

  public drawAppleList(): void {
    for (let a = 0; a < this.appleList.length; a++) {
      this.canvasContext.fillStyle = this.appleList[a].color;
      this.canvasContext.fillRect(this.appleList[a].x, this.appleList[a].y, this.aWidth, this.aHeight);
    }
  }

  public drawSnake(): void {
    this.canvasContext.fillStyle = 'lime';
    for (let i = 0; i < this.trailList.length; i++) {
      this.canvasContext.fillStyle = this.trailList[i].color || 'lime';
      this.canvasContext.fillRect(this.trailList[i].x, this.trailList[i].y, this.pWidth, this.pHeight);
    }
  }
}
