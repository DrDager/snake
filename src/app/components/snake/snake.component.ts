import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-snake',
  templateUrl: './snake.component.html',
  styleUrls: ['./snake.component.scss'],
})
export class SnakeComponent implements OnInit {
  @Input() isPause: boolean = false;

  constructor() {}

  ngOnInit(): void {}
}
