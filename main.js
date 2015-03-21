var Game = function(scrWidth, scrHeight) {

    var Ball = function(elem, x, y, position) {
        var ball = this;
        var colors = ['#FFF', '#54F35E', '#B2B2B2', '#FDF518', '#E20F0F', '#E84ACD', '#914D25', '#0241E2'];
        this.color = colors[Math.round(Math.random() * 7)];
        this.cords = [x, y];
        var active = false;
        var ballDiv = document.createElement('div');
        ballDiv.className = 'ball';
        ballDiv.style.background = this.color;
        ballDiv.style.width = ballWidth + 'px';
        ballDiv.style.height = ballWidth + 'px';
        ballDiv.style.left  = y*ballWidth + 'px';
        ballDiv.style.top = (position || x*ballWidth - (ballWidth*6)) + 'px';
        elem.appendChild(ballDiv);

        this.delBallDiv = function() {
            elem.removeChild(ballDiv);
        };

        this.move = function(coords) {
            ballDiv.style.top = coords[0]*ballWidth +'px';
            ballDiv.style.left = coords[1]*ballWidth + 'px';
        };

        ballDiv.onclick = function() {
            if(active) ball.deactivate();
            else ball.activate();
        };

        this.activate = function() {
            if(animation) return;
            active = true;
            ballDiv.className += ' active';
            if(preBall)stepVerification(this);
            else preBall = this
        };

        this.deactivate = function() {
            active = false;
            ballDiv.className = 'ball';
            preBall = undefined;
        }
    };

    var wrapper = document.getElementById('wrapper');
    var controllers = document.getElementsByName('buttons');
    var board = document.getElementById('board');
    var menu = document.getElementById('menu');
    var view = {
        count:controllers[6],
        about:controllers[1],
        resume:controllers[2],
        newGame:controllers[0],
        name:controllers[4],
        mult:controllers[5],
        menu:controllers[3],
        bestName:controllers[7],
        bestCount:controllers[8],
        restart:controllers[9],
        endScore:controllers[10],
        gameOver:controllers[9].parentNode.parentNode,
        scoreWrap:controllers[3].parentNode
    };

    var ballWidth;
    if(!localStorage.brickScore) localStorage.brickScore = 0;
    view.bestCount.innerText = localStorage.brickScore ? parseFloat(localStorage.brickScore) : 0;

    view.restart.onclick = function() {
        view.gameOver.style.top = '-100%';
        setTimeout(function() {startNewGame();}, 500)
    };
    view.resume.onclick = function() {
        if(endGame) return;
        else toggleMenu();
    };
    view.menu.onclick = function() {
        if(!endGame) view.resume.className = 'scoreColor';
        toggleMenu()
    };
    view.newGame.onclick = function() {
        startNewGame();
        toggleMenu();
    };

    function responsiveBoard() {
        var maxWidth = innerHeight < innerWidth ? innerHeight: innerWidth;
        for (var i = maxWidth; i > 0; i--) {
            if(i % 7 === 0 && i+6 <= maxWidth) {
                ballWidth = i/7;
                break
            }
        }
        board.style.width = ballWidth*6+'px';
        board.style.height = ballWidth*6+'px';
        view.scoreWrap.style.width = ballWidth*6 + 2+'px';
        view.scoreWrap.style.height = ballWidth + 'px';
        view.scoreWrap.style.display = 'block';
        view.restart.style.height = ballWidth + 'px';
    }

    var ballsArray = [];
    var equalBalls = [];
    var endGame = true;
    var animation = false;
    var menuIsOpen = true;
    var scoreMULT;
    var preBall;
    var score;
    var stepScore = 0;
    var scoreColor;

    function gameOver(){
        view.gameOver.style.display = 'table';
        board.appendChild(view.gameOver);
        view.endScore.innerText = view.count.innerText;
        setTimeout(function() {view.gameOver.style.top = 0;}, 60)
    }

    function startNewGame() {
        responsiveBoard();
        endGame = false;
        stepScore = 0;
        score = 0;
        view.resume.className = '';
        board.innerHTML = '';
        ballsArray.length = 0;
        view.count.innerText = score;
        initBoard();
        mover();
        clearBoard(true);
    }

    function initBoard() {
        for(var i = 0; i < 6; i++) {
            var row = [];
            for(var j = 0; j < 6; j++) {
                row.push(addBalls(i, j));
            }
            ballsArray.push(row)
        }
    }

    function addBalls(x, y, position) {
        var ball = new Ball(document.getElementById('board'), x, y, position);
        return ball;
    }

    function movesVerification(balls) {
        var ballAr = balls.concat();
        for(var i=0;i<ballAr.length; i++) {
            for(var j=0;j<ballAr.length;j++) {
                var ballX = ballAr[i][j+1] ? ballAr[i][j+1] : ballAr[i][j];
                var ballY = ballAr[i+1] ? ballAr[i+1][j] : ballAr[i][j];
                if(twoStepsVerif(ballAr[i][j], ballX, ballAr) ||
                    twoStepsVerif(ballAr[i][j], ballY, ballAr)) return true;
            }
        }
        return false;

        function twoStepsVerif(ball1, ball2, array) {
            changeBalls(ball1, ball2);
            if(!newRooler(array) && !newRooler(changerYtoX(array))) {
                changeBalls(ball2, ball1);
                return false;
            } else {
                equalBalls.length = 0;
                changeBalls(ball2, ball1);
                return true;
            }
        }
    }

    function toggleMenu() {
        if(menuIsOpen) {
            menu.style.display = 'none';
            board.style.display = 'block';
            view.scoreWrap.style.display = 'block';
            setTimeout(function() {
                board.style.opacity = 1;
                menu.style.opacity = 0
            }, 30);
            menuIsOpen = false;
        } else {
            menu.style.display = 'block';
            setTimeout(function() {
                menu.style.opacity = 1;
                board.style.opacity = 0;
            }, 30);
            board.style.display = 'none';
            view.scoreWrap.style.display = 'none';
            menuIsOpen = true;
        }
    }

    function deactivateAll() {
        for (var i = 0; i < ballsArray.length; i++) {
            for (var j = 0; j < ballsArray.length; j++) {
                ballsArray[i][j].deactivate()
            }
        }
    }

    function stepVerification(ball) {
        if(steper(preBall, ball) || steper(ball, preBall)) {
            changeBalls(preBall, ball);
            if(newRooler(ballsArray) ||
                newRooler(changerYtoX(ballsArray))) {
                scoreMULT = 0;
                animation = true;
                setTimeout(mover, 30);
                setTimeout(clearBoard, 530);
            } else changeBalls(ball, preBall)
        }
        setTimeout(function() {
           deactivateAll()
        }, 500);
    }

    function steper(a, b) {
        var steps = [
            [a.cords[0], a.cords[1]+1], 
            [a.cords[0], a.cords[1]-1], 
            [a.cords[0]+1, a.cords[1]], 
            [a.cords[0]-1, a.cords[1]]
        ];
        for(var y=0;y<4;y++) {
            if(steps[y][0]===b.cords[0] && steps[y][1]===b.cords[1]) return true        
        } 
        return false
    }

    function changerYtoX(ballsArr) {
        var array = [];
        for(var i=0; i<ballsArr.length;i++) {
            var row = [];
            for(var j=0;j<ballsArr.length;j++) {
                row.push(ballsArr[j][i]);
            }
            array.push(row)
        }
        return array;
    }

    function newRooler(ballsArr) {
        top:
        for(var x=0;x<ballsArr.length;x++) {
            var count = 0;
            for(var s=0;s<4;s++) {
               if(equalChecker(ballsArr[x].slice(s, s+3))) count++;
            }
            if(count <= 1) continue top;
            for(var s=0;s<3;s++) {
                if(equalChecker(ballsArr[x].slice(s, s+4))) count++;
            }
            if(count < 3) continue top;
            for(var s=0;s<2;s++) {
                if(equalChecker(ballsArr[x].slice(s, s+5))) count++;
            }
            if(count < 4) continue top;
            equalChecker(ballsArr[x]);
        }
        if(equalBalls.length) return true;
        return false;

        function equalChecker(arr) {
            for(var w=1;w<arr.length;w++) {
                if(arr[0].color !== arr[w].color) return false;
            }
            for(var c=0;c<arr.length;c++) {
                if(equalBalls.indexOf(arr[c]) < 0) equalBalls.push(arr[c]);
            }
            return true;
        }
    }

    function scoreCount(stepScore, scoreMULT) {
        score = score + stepScore * scoreMULT;
        var bestScore = parseFloat(localStorage.brickScore);
        if(score <= bestScore) {
            view.count.innerText = score;
            view.count.style.color = scoreColor;
            view.name.style.color = scoreColor;
        } else {
            view.bestName.style.color = scoreColor;
            view.bestCount.style.color = scoreColor;
            localStorage.brickScore = score;
            view.bestCount.innerText = score;
            view.count.innerText = score
        }
    }

    function scoreMultiplication() {
        if(scoreMULT > 5) scoreMULT=5;
        if(scoreMULT >= 2) {
            debugger;
            view.mult.innerText = 'x' + scoreMULT;
            view.mult.style.color = scoreColor;
            setTimeout(function() {
                view.mult.innerText = '';
            }, 400)
        }
    }

    function delBalls(array) {
        for(var i=0;i<array.length; i++) {
            ballsArray[array[i].cords[0]][array[i].cords[1]].delBallDiv();
            ballsArray[array[i].cords[0]][array[i].cords[1]] = null;
        }
        equalBalls.length = 0;
    }

    function clearBoard(newGame) {
        if(!movesVerification(ballsArray) && newGame) {
            startNewGame();
            return;
        }
        animation = true;
        if(newRooler(ballsArray) ||
        newRooler(changerYtoX(ballsArray))) {
            if(newGame) {
                delBalls(equalBalls);
                slider();
                clearBoard(true);
                return;
            } else {
                scoreMULT++;
                scoreColor = equalBalls[equalBalls.length-1].color;
                stepScore += equalBalls.length;
                scoreMultiplication();
                delBalls(equalBalls);
                slider(30);
                setTimeout(clearBoard, 530);
                return;
            }
        } else {
            if(!newGame) scoreCount(stepScore, scoreMULT);
            animation = false;
            if(!movesVerification(ballsArray)) {
                endGame = true;
                gameOver();
            }
        }
        stepScore = 0;
    }

    function changeBalls(a, b) {
        var tmp = a;
        var tmpCords = b.cords;
        ballsArray[a.cords[0]][a.cords[1]] = b;
        ballsArray[b.cords[0]][b.cords[1]] = tmp;
        b.cords = tmp.cords;
        tmp.cords = tmpCords;
    }

    function slider(time) {
        var sliderBalls = [];
        for(var i=0;i<ballsArray.length;i++) {
            for(var j=0;j<ballsArray.length;j++) {
                if(ballsArray[j][i] !==null) {
                    sliderBalls.push(ballsArray[j][i])
                }
            }
            for(var k=ballsArray.length-1; k>=0;k--) {
                ballsArray[k][i]= sliderBalls.pop() || null;
                ballsArray[k][i] ? ballsArray[k][i].cords = [k, i]: undefined;
            }
        }
        fillBalls();
        if(time) setTimeout(mover, time);
        else mover();
    }

    function mover(){
        for(var z=0;z<ballsArray.length; z++) {
            for(var c=0;c<ballsArray.length;c++) {
                if(ballsArray[z][c] !== null) {
                    ballsArray[z][c].move([z, c]);
                }
            }
        }
    }

    function fillBalls() {
        var count;
        for(var g=0;g<ballsArray.length; g++) {
            count = 0;
            for(var p=ballsArray.length-1;p>=0;p--) {
                if(ballsArray[p][g] === null) {
                    count++;
                    ballsArray[p][g] = addBalls(p, g, ballWidth*(-count));
                }
            }
        }
    }
};

window.onload = function() {
    new Game();
};
