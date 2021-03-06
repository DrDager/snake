import { Component, ElementRef, ViewChild, AfterViewInit, HostListener } from '@angular/core';
import { CONTROL_TYPE } from './models/contols.enum';
import { timer, interval, BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  @ViewChild('snakeCanvas', { static: false })
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

  readonly isPause$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public get canvasContext(): any {
    return this.gameCanvas.getContext('2d');
  }

  @HostListener('body:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    this.handleKeyPress(event.key as CONTROL_TYPE);
  }

  constructor() {}

  ngAfterViewInit() {
    this.setDefaultOptions();
    this.startGame();
  }

  public setDefaultOptions() {
    this.isGameStarted = this.firstKeyPressed = false;
    this.speed = this.baseSpeed = 3;
    this.xv = this.yv = 0;
    this.pWidth = this.pHeight = 25;
    this.aWidth = this.aHeight = 25;
    this.px = ~~this.gameCanvas.width / 2;
    this.py = ~~this.gameCanvas.height / 2;
    this.appleList = [];
    this.trailList = [];
    this.tailSize = 30;
    this.tailSafeZone = 20;
    this.isKeyCooldown = false;
    this.score = 0;
  }

  public startGame() {
    this.gameLoop = interval(1000 / 60)
      .pipe(filter(() => !this.isPause))
      .subscribe(this.loop.bind(this)); // 60 FPS
  }

  public loop(): void {
    if (!this.gameCanvas || !this.canvasContext) {
      throw new Error('Game canvas in undefined');
    }

    // reset canvas
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
    this.trailList.push({
      x: this.px,
      y: this.py,
      color: this.canvasContext.fillStyle,
    });

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
          this.score = 0; // reset score
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
        // increase score
        this.score++;
        this.appleList.splice(a, 1); // remove this apple from the appleList list
        this.tailSize += 10; // add tailSize length
        this.speed += 0.1; // add some speed
        this.spawnApple(); // spawn another apple(-s)
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
      this.canvasContext.fillRect(
        this.appleList[a].x,
        this.appleList[a].y,
        this.aWidth,
        this.aHeight
      );
    }
  }

  public drawSnake(): void {
    this.canvasContext.fillStyle = 'lime';
    for (let i = 0; i < this.trailList.length; i++) {
      this.canvasContext.fillStyle = this.trailList[i].color || 'lime';
      this.canvasContext.fillRect(
        this.trailList[i].x,
        this.trailList[i].y,
        this.pWidth,
        this.pHeight
      );
    }
  }

  public spawnApple(): void {
    const newApple = {
      x: ~~(Math.random() * this.gameCanvas.width),
      y: ~~(Math.random() * this.gameCanvas.height),
      color: this.generateRandomColor(),
    };

    // forbid to spawn near the edges
    if (
      newApple.x < this.aWidth ||
      newApple.x > this.gameCanvas.width - this.aWidth ||
      newApple.y < this.aHeight ||
      newApple.y > this.gameCanvas.height - this.aHeight
    ) {
      this.spawnApple();
      return;
    }

    // check for collisions with tail element, so no apple will be spawned in it
    for (let i = 0; i < this.trailList.length; i++) {
      if (
        newApple.x < this.trailList[i].x + this.pWidth &&
        newApple.x + this.aWidth > this.trailList[i].x &&
        newApple.y < this.trailList[i].y + this.pHeight &&
        newApple.y + this.aHeight > this.trailList[i].y
      ) {
        // got collision
        this.spawnApple();
        return;
      }
    }

    this.appleList.push(newApple);

    if (this.appleList.length < 3 && ~~(Math.random() * 1000) > 700) {
      // 30% chance to spawn one more apple
      this.spawnApple();
    }
  }

  public generateRandomColor() {
    return '#' + (
         (~~(Math.random() * 255)).toString(16))
      + ((~~(Math.random() * 255)).toString(16))
      + ((~~(Math.random() * 255)).toString(16)
    );
  }

  public handleKeyPress(key: CONTROL_TYPE) {
    if (key === CONTROL_TYPE.PAUSE) {
      this.isPause$.next(!this.isPause);
      return false;
    }

    if (!this.firstKeyPressed &&  Object.values(CONTROL_TYPE).includes(key)) {
      timer(1000).subscribe(() => { this.isGameStarted = true; });
      this.firstKeyPressed = true;
      this.spawnApple();
    }

    if ( this.isKeyCooldown ) {
      return false;
    }

    if ((key === CONTROL_TYPE.LEFT || key === CONTROL_TYPE.LEFT_ARROW) && !(this.xv > 0) ) {
      this.xv = - this.speed; this.yv = 0;
    }

    if ((key === CONTROL_TYPE.UP || key === CONTROL_TYPE.UP_ARROW) && !(this.yv > 0) ) {
      this.xv = 0; this.yv = -this.speed;
    }

    if ((key === CONTROL_TYPE.RIGHT || key === CONTROL_TYPE.RIGHT_ARROW) && !(this.xv < 0) ) {
      this.xv = this.speed; this.yv = 0;
    }

    if ((key === CONTROL_TYPE.DOWN || key === CONTROL_TYPE.DOWN_ARROW) && !(this.yv < 0) ) {
      this.xv = 0; this.yv = this.speed;
    }

    this.isKeyCooldown = true;

    timer(100).subscribe(() => { this.isKeyCooldown = false; });
  }

  public get isPause() {
    return this.isPause$.getValue();
  }
}
