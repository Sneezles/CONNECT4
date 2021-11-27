class createBoard {
  constructor(size){
    this.size = size
    this.board = Array(size).fill().map(() => Array(size).fill(null));
  }
  clear(){
    this.board = Array(this.size).fill().map(() => Array(this.size).fill(null));
  }

  inBounds(x, y) {
    return y >= 0 && y < this.board.length && x >= 0 && x < this.board[y].length;
  };

  numMatches(x, y, dx, dy){
    let i = 1;
    while (this.inBounds(x + i*dx, y + i*dy) &&
      this.board[y + i*dy][x + i*dx] === this.board[y][x]) {
      i++;
    }
    return i - 1;
  };

  isWinningTurn(x, y) {
    for (let dx = -1; dx < 2; dx++) {
      for (let dy = -1; dy < 2; dy++) {
        if (dx === 0 && dy === 0) {
          continue;
        }

        const count = this.numMatches(x, y, dx, dy) + this.numMatches(x, y, -dx, -dy) + 1;

        if (count >= 4  ) {
          return true;
        }
      }
    }

    return false;
  };

  makeTurn(x,y,color) {
    if(!this.board[y][x]){
      this.board[y][x] = color;
    }
    return this.isWinningTurn(x, y);
  }

  gravity(x,y){
    var realy = y
    var validmove = true
    if(!this.board[y][x] && y !=5) {
      for (let i = y; i <=4; i++) {
        if (!this.board[i+1][x]) {
          realy=i+1
        }
      }
    }   
    if(this.board[y][x]){
      console.log("alraedy taken")
      if(y!=0) {
        for(let i = y; i >0; i--){
          if (!this.board[i-1][x]){
            realy=i-1
            break;
          }
        }
      }
      if(y==0){
        validmove=false
      }
    }
    return [realy, validmove]
  }


}


module.exports = createBoard;
