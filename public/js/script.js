$(function () {

    class Connect4 {
        constructor(selector) {
          this.ROWS = 6;
          this.COLS = 7;
          this.player = 'red';
          this.selector = selector;
          this.isGameOver = false;
          this.onPlayerMove = function() {};
          this.createGrid();
          this.setupEventListeners();
          this.updateMove() 
          console.log("CONSTRUCTOR RUNS")
        }
      
        updateTurn(){
            $("#whoTurn").html(`It's ${this.player}'s turn`);
        }
    
        createGrid() {
          const $board = $(this.selector);
          $board.empty();
          this.isGameOver = false;
          this.player = 'red';
          for (let row = 0; row < this.ROWS; row++) {
            const $row = $('<div>')
              .addClass('row');
            for (let col = 0; col < this.COLS; col++) {
              const $col = $('<div>')
                .addClass('col empty')
                .attr('data-col', col)
                .attr('data-row', row);
              $row.append($col);
            }
            $board.append($row);
          }
    
        }
    
    
    
        //****
    
        updateMove (){
          // console.log("ARE WE HEREEEE")
          $.get("/updateMove", function(data) {
            var recentMove = $("#recent-move");
            recentMove.empty();
            // console.log("data HERE", data);
            // console.log("data.length: ", data.length)
            console.log("last data", data[data.length-1]);
            console.log("datafirst", data[0])
            
              for (var i = 1; i < 6; i++) {
                console.log("outside outside");
                // console.log("data[i]: ", data[i],  i)
                const {column, row, player} = data[data.length - i] ? data[data.length-i] : {column: '', row: '', player: ''};
                recentMove.append(`<li class="list-group-item" style="color: ${player};">${column + row}</li>`);
                // recentMove.append(createNewRow([data[i].column, data[i].row], data[i].player));
              }
          })
        }
    
        //****
    
    
    
    
        setupEventListeners() {
            const $board = $(this.selector);
            const that = this;
        
            function findLastEmptyCell(col) {
              const cells = $(`.col[data-col='${col}']`);
              for (let i = cells.length - 1; i >= 0; i--) {
                const $cell = $(cells[i]);
                if ($cell.hasClass('empty')) {
                  return $cell;
                }
              }
              return null;
            }
        
            $board.on('mouseenter', '.col.empty', function() {
              if (that.isGameOver) return;
              const col = $(this).data('col');
              const $lastEmptyCell = findLastEmptyCell(col);
              $lastEmptyCell.addClass(`next-${that.player}`);
            });
        
            $board.on('mouseleave', '.col', function() {
              $('.col').removeClass(`next-${that.player}`);
            });
        
            $board.on('click', '.col.empty', function() {
              if (that.isGameOver) return;
              const col = $(this).data('col');
              const $lastEmptyCell = findLastEmptyCell(col);
    
              //BEGIN CODY WORK
              // console.log($lastEmptyCell);
              // console.log("column: ", $lastEmptyCell[0].dataset.col);
              // console.log("row: ", $lastEmptyCell[0].dataset.row);
    
              var columnMap = {
                0: "A",
                1: "B",
                2: "C",
                3: "D",
                4: "E",
                5: "F",
                6: "G"
              }
    
              var rowMap = {
                0: 1,
                1: 2,
                2: 3,
                3: 4,
                4: 5,
                5: 6,
                6: 7
              }
    
              var postColumn = columnMap[$lastEmptyCell[0].dataset.col];
              var postRow = rowMap[$lastEmptyCell[0].dataset.row];
    
              
                $.post("/move", {
                  column: postColumn,
                  row: postRow,
                  player: that.player
                })
                .then((res) => {
                  $.get("/updateMove", function(data) {
                    var recentMove = $("#recent-move");
                    recentMove.empty();
                    // console.log("data HERE", data);
                    // console.log("data.length: ", data.length)
                    
                      for (var i = 1; i < 6; i++) {
                        console.log("inside inside");
                        // console.log("data[i]: ", data[i],  i)
                        const {column, row, player} = data[data.length - i] ? data[data.length-i] : {column: '.', row: '', player: 'white'};
                        // console.log("column issue here: ", column)
                        recentMove.append(`<li class="list-group-item" style="color: ${player};">${column + row}</li>`);
                        // recentMove.append(createNewRow([data[i].column, data[i].row], data[i].player));
                      }
                  })
                })
              
              
    
              // function createNewRow(post, color) {
              //   var newPostRow = $("<li>");
              //   newPostRow.addClass("list-group-item");
              //   newPostRow.text(post[0] + post[1]).css({'color': color})
              //   newPostRow.append("</li>")
              //   return newPostRow
              // }
              //END CODY WORK
    
              $lastEmptyCell.removeClass(`empty next-${that.player}`);
              $lastEmptyCell.addClass(that.player);
              $lastEmptyCell.data('player', that.player);
        
              const winner = that.checkForWinner(
                $lastEmptyCell.data('row'), 
                $lastEmptyCell.data('col')
              )
    
    
              var blackWins = $("#black-wins");
              var redWins = $("#red-wins")
              updateResults();
    
              if (winner) {
                that.isGameOver = true;
                // swal("Game Over!", `Player ${that.player} has won!\nWould you like to play again?`);
                // Swal.fire({
                //   icon: 'success',
                //   title: `Player ${that.player} has won!`,
                //   text: 'Would you like to play again?',
                // })
    
    
                const swalWithBootstrapButtons = Swal.mixin({
                  customClass: {
                    confirmButton: 'btn btn-success',
                    cancelButton: 'btn btn-danger'
                  },
                  buttonsStyling: false
                })
                
                swalWithBootstrapButtons.fire({
                  title: `Player ${that.player} has won!`,
                  text: 'Would you like to play again?',
                  icon: 'question',
                  showCancelButton: true,
                  confirmButtonText: 'Yes!',
                  cancelButtonText: 'No',
                }).then((result) => {
                  if (result.value) {
                    location.reload();
                  } else if (
                    /* Read more about handling dismissals below */
                    result.dismiss === Swal.DismissReason.cancel
                  ) {
                    // function() {
                      window.location = "/";
                  // };
                  }
                })
                
                
                //CODY WORK BELOW
                
    
                postResult({
                  winner: that.player
                })
                function postResult(resultData) {
                  // console.log("did we get here?");
                  $.post("/result", resultData)
                    .then(updateResults(
                      
                    )
                    .then(function() {
                        $('.col.empty').removeClass('empty');
                        return;
                      })
                    )
                }
                
              }
                
                function updateResults() {
                  $.get("/updateResults", function(data) {
                    var redTally = 0;
                    var blackTally = 0;
                    for (var i = 0; i < data.length; i++) {
                      console.log(data[i]);
                      if (data[i].winner === "red") {
                        redTally++;
                      } else if (data[i].winner === "black") {
                        blackTally++;
                      }
                    }
                    redWins.empty().append(redTally);
                    blackWins.empty().append(blackTally);
                  })
                    
                  return;
    
                }
    
                //END CODY WORK
    
              
        
              that.player = (that.player === 'red') ? 'black' : 'red';
              that.onPlayerMove();
              $(this).trigger('mouseenter');
            });
          }
        
          checkForWinner(row, col) {
            const that = this;
        
            function $getCell(i, j) {
              return $(`.col[data-row='${i}'][data-col='${j}']`);
            }
        
            function checkDirection(direction) {
              let total = 0;
              let i = row + direction.i;
              let j = col + direction.j;
              let $next = $getCell(i, j);
              while (i >= 0 &&
                i < that.ROWS &&
                j >= 0 &&
                j < that.COLS && 
                $next.data('player') === that.player
              ) {
                total++;
                i += direction.i;
                j += direction.j;
                $next = $getCell(i, j);
              }
              return total;
            }
        
            function checkWin(directionA, directionB) {
              const total = 1 +
                checkDirection(directionA) +
                checkDirection(directionB);
              if (total >= 4) {
                return that.player;
              } else {
                return null;
              }
            }
        
            function checkDiagonalBLtoTR() {
              return checkWin({i: 1, j: -1}, {i: 1, j: 1});
            }
        
            function checkDiagonalTLtoBR() {
              return checkWin({i: 1, j: 1}, {i: -1, j: -1});
            }
        
            function checkVerticals() {
              return checkWin({i: -1, j: 0}, {i: 1, j: 0});
            }
        
            function checkHorizontals() {
              return checkWin({i: 0, j: -1}, {i: 0, j: 1});
            }
        
            return checkVerticals() || 
              checkHorizontals() || 
              checkDiagonalBLtoTR() ||
              checkDiagonalTLtoBR();
          }
        
          restart () {
            this.createGrid();
            this.onPlayerMove();
          }
    }

    var socket = io.connect(),
        player = {},
        playerOne = $('.your_color'),
        playerTwo = $('.opponent_color'),
        your_turn = false,
        url = window.location.href.split('/'),
        room = url[url.length - 1];

    init();

    socket.on('assign', function (data) {
        player.pid = data.pid;
        player.hash = data.hash;
        if (player.pid == "1") {
            playerOne.addClass('red');
            playerTwo.addClass('black');
            player.color = 'red';
            player.oponend = 'black';
        } else {
            $('.status').html(text.nyt);
            playerOne.addClass('black');
            playerTwo.addClass('red');
            playerTwo.addClass('show');
            player.color = 'black';
            player.oponend = 'red';
        }
    });

    socket.on('winner', function (data) {
        playerTwo.removeClass('show');
        playerOne.removeClass('show');
        change_turn(false);
        for (var i = 0; i < 4; i++) {
            $('.cols .col .coin#coin_' + data.winner.winner_coins[i]).addClass('winner_coin');
        }

        if (data.winner.winner == player.pid) {

        } else {

        }

    });


    socket.on('draw', function () {
        playerTwo.removeClass('show');
        playerOne.removeClass('show');
        change_turn(false);
    });

    socket.on('start', function (data) {
        change_turn(true);
        playerOne.addClass('show');
    });

    socket.on('stop', function (data) {
        init();
        reset_board();
    });

    socket.on('move_made', function (data) {
        make_move(data.col + 1, true);
        change_turn(true);
        playerOne.addClass('show');
        playerTwo.removeClass('show');
    });

    socket.on('opponent_move', function (data) {
        if (!your_turn) {
            playerTwo.css('left', parseInt(data.col) * 100);
        }
        console.debug(data);
    });

    $('.cols > .col').mouseenter(function () {
        if (your_turn) {
            playerOne.css('left', $(this).index() * 100);
            socket.emit('my_move', {
                col: $(this).index()
            });
        }
    });

    $('.cols > .col').click(function () {
        if (parseInt($(this).attr('data-in-col')) < 6) {
            if (your_turn) {
                var col = $(this).index() + 1;
                make_move(col);
                socket.emit('makeMove', {
                    col: col - 1,
                    hash: player.hash
                });
                change_turn(false);
                playerOne.removeClass('show');
                playerTwo.addClass('show');
            }
        }
    });

    function make_move(col, other) {
        if (!other) other = false;
        var col_elm = $('.cols > .col#col_' + col);
        var current_in_col = parseInt(col_elm.attr('data-in-col'));
        col_elm.attr('data-in-col', current_in_col + 1);
        var color = (other) ? player.oponend : player.color;
        var new_coin = $('<div class="coin ' + color + '" id="coin_' + (5 - current_in_col) + '' + (col - 1) + '"></div>');
        col_elm.append(new_coin);
        new_coin.animate({
            top: 100 * (4 - current_in_col + 1),
        }, 400);
    }

    function init() {
        socket.emit('join', {
            room: room
        });
        $('.status').html('');
        var connect4 = new Connect4('.game');
    }

    function reset_board() {
        $('.cols .col').attr('data-in-col', '0').html('');
        playerOne.removeClass('black red');
        playerTwo.removeClass('black red');
        playerOne.removeClass('show');
        playerTwo.removeClass('show');
    }

    function change_turn(yt) {
        if (yt) {
            your_turn = true;
            $('.status').html(text.yt);
        } else {
            your_turn = false;
            $('.status').html(text.nyt);
        }
    }

});