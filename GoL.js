"use strict";

var Board = function Board(size) {
  this.size = size;
  this.nb_generation = 0;
  this.board = [];
};
Board.DEAD = 0;
Board.YOUNG = 1;
Board.ADULT = 2;

Board.prototype.create_board = function () {
  var m = [];
  for (var i = 0; i < this.size; i++) {
    m[i] = [];
    for (var j = 0; j < this.size; j++) {
      m[i][j] = Board.DEAD;
    }
  }
  this.board = m;
};
Board.prototype.randomize_board = function () {
  for (var i = 0; i < this.size; i++) {
    for (var j = 0; j < this.size; j++) {
      this.board[i][j] = Math.random() > 0.5 ? Board.YOUNG : Board.DEAD;
    }
  }
};

Board.prototype.reset_board = function () {
  for (var i = 0; i < this.size; i++) {
    for (var j = 0; j < this.size; j++) {
      this.board[i][j] = Board.DEAD;
    }
  }
};

Board.prototype.update_board = function () {
  var newBoard = [];
  for (var i = 0; i < this.size; i++) {
    newBoard[i] = [];
    for (var j = 0; j < this.size; j++) {
      newBoard[i][j] = Board.DEAD;
    }
  }

  for (var i = 0; i < this.size; i++) {
    for (var j = 0; j < this.size; j++) {
      //count how many living neighbors are there
      var nb_l = 0;
      for (var k = -1; k <= 1; k++) {
        for (var l = -1; l <= 1; l++) {
          if (this.board[(this.size + i + k) % this.size][(this.size + j + l) % this.size] != Board.DEAD) nb_l++;
        }
      }if (this.board[i][j] != Board.DEAD) nb_l--;
      //update the state of the current element according to the rules
      if (this.board[i][j] != Board.DEAD && (nb_l < 2 || nb_l > 3)) {
        newBoard[i][j] = Board.DEAD;
        //continue;
      }
      if (this.board[i][j] == Board.DEAD && nb_l == 3) {
        newBoard[i][j] = Board.YOUNG;
        // continue;
      }

      if (this.board[i][j] != Board.DEAD && (nb_l == 2 || nb_l == 3)) {
        newBoard[i][j] = Board.ADULT;
        // continue;
      }

      //if(this.board[i][j]==Board.ADULT && (nb_l==2 || nb_l==3))
      //this.board[i][j]=Board.ADULT;
    }
  }
  this.board = newBoard;
};

//the UI part
//var GRID_SIZE=10;
var Cell = React.createClass({
  displayName: "Cell",

  render: function render() {
    var color = this.props.color == 0 ? "black" : this.props.color == 1 ? "pink" : "red";
    return React.createElement("td", { className: "cell-div", style: { 'background-color': color, 'width': this.props.w, 'height': this.props.h }, onClick: this.props.onClick });
  }
});

var BoardView = React.createClass({
  displayName: "BoardView",

  getInitialState: function getInitialState() {
    return { board: this.props.board, height: 35, width: 35, nb_generation: 0, simSpeed: 1500 };
  },
  handleCellClick: function handleCellClick(c) {
    var newBoard = this.state.board;
    newBoard.board[c[0]][c[1]] = newBoard.board[c[0]][c[1]] == 0 ? 1 : 0;
    this.setState({ board: newBoard });
  },
  time: null,
  gameOn: false,
  componentDidMount: function componentDidMount() {
    var randB = this.state.board;
    randB.randomize_board();
    this.setState({ board: randB });
    this.play();
  },
  play: function play() {

    this.gameOn = true;
    var __this = this;
    this.time = setInterval(function () {
      var newS = __this.state.board;
      newS.update_board();
      __this.setState({ board: newS, nb_generation: __this.state.nb_generation + 1 });
    }, __this.state.simSpeed);
  },
  pause: function pause() {
    clearInterval(this.time);
  },
  clear: function clear() {
    clearInterval(this.time);
    this.gameOn = false;
    var clearB = this.state.board;
    clearB.reset_board();
    this.setState({ board: clearB, nb_generation: 0 });
  },
  setSpeed: function setSpeed(speed, e) {
    this.pause();
    this.setState({ simSpeed: speed });
    this.play();
  },
  setSize: function setSize(size, e) {
    this.clear();
    var board = new Board(size);
    board.create_board();
    board.randomize_board();
    this.setState({ board: board, height: size, width: size });
  },
  render: function render() {
    var cells = [];
    for (var i = 0; i < this.state.board.size; i++) {
      var row = [];
      for (var j = 0; j < this.state.board.size; j++) {
        row.push(React.createElement(Cell, { color: this.state.board.board[i][j], row: i, col: j, w: 700 / this.state.width, h: 700 / this.state.height, onClick: this.handleCellClick.bind(this, [i, j]) }));
      }

      cells.push(React.createElement(
        "tr",
        null,
        row
      ));
    }

    return React.createElement(
      "div",
      null,
      React.createElement(
        "h2",
        { className: "text-center" },
        " Game of Life "
      ),
      React.createElement(
        "div",
        { className: "game-controls center-block" },
        React.createElement(
          "button",
          { className: "btn btn-default", onClick: this.play },
          "Run"
        ),
        React.createElement(
          "button",
          { className: "btn btn-default", onClick: this.pause },
          "Pause"
        ),
        React.createElement(
          "button",
          { className: "btn btn-default", onClick: this.clear },
          "Clear"
        ),
        React.createElement(
          "label",
          { "for": "g-count" },
          "Generation : "
        ),
        React.createElement("input", { className: "text-right", type: "text", id: "g-count", value: this.state.nb_generation, readonly: true })
      ),
      React.createElement(
        "div",
        { className: "game-board center-block" },
        React.createElement(
          "table",
          { id: "game-table" },
          cells
        )
      ),
      React.createElement(
        "div",
        { className: "game-settings center-block" },
        "Board Size :  ",
        React.createElement(
          "button",
          { className: "btn btn-default", onClick: this.setSize.bind(this, 35) },
          "Size 35x35"
        ),
        React.createElement(
          "button",
          { className: "btn btn-default", onClick: this.setSize.bind(this, 70) },
          "Size 70x70"
        ),
        React.createElement(
          "button",
          { className: "btn btn-default", onClick: this.setSize.bind(this, 100) },
          "Size 100x100"
        ),
        React.createElement("br", null),
        "Sim Speed :  ",
        React.createElement(
          "button",
          { className: "btn btn-default", onClick: this.setSpeed.bind(this, 2500) },
          "Slow"
        ),
        React.createElement(
          "button",
          { className: "btn btn-default", onClick: this.setSpeed.bind(this, 1500) },
          "Medium"
        ),
        React.createElement(
          "button",
          { className: "btn btn-default", onClick: this.setSpeed.bind(this, 500) },
          "Fast"
        )
      )
    );
  }

});

var board = new Board(35);
board.create_board();
ReactDOM.render(React.createElement(BoardView, { board: board }), document.querySelector("#box"));
