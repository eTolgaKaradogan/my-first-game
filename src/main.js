/** @type {import("../typings/phaser")} */

var game;
var gameOptions={
    bounceHeight:300,
    ballGravity:1200,
    ballPower:1200,
    barrierSpaces:[100,250],
    barrierSpeed:250,
    localStorageName:'bestScore',
    bonusPercent: 20,
}

window.onload = function(){
    let gameConfig={
        type: Phaser.AUTO,
        backgroundColor:'#bacace',
        scale:{
            mode:Phaser.Scale.FIT,
            autoCenter:Phaser.Scale.CENTER_BOTH,
            width:750,
            height:500,
            parent:'thegame'
        },
        physics:{
            default:'arcade',
            arcade:{
                debug:false,
            }
        },
        scene:playGame
    }

    game=new Phaser.Game(gameConfig);
    window.focus();
   }

   class playGame extends Phaser.Scene{
       constructor(){
           super('PlayGame');
       }

       preload(){
            this.load.image('floor','assets/floor.png');
            this.load.image('ball','assets/ball.png');
            this.load.spritesheet('barrier','assets/barrier.png',{
                frameWidth:20, frameHeight:40
            })
       }

       create(){
            this.firstJump=0;
            this.barrierGroup=this.physics.add.group();
            this.floor=this.physics.add.sprite(game.config.width/2,game.config.height/4*3,'floor');
            this.ball=this.physics.add.sprite(game.config.width/10*2, game.config.height/4*3-gameOptions.bounceHeight,'ball');
            this.ball.setBounce(1);

            this.ball.body.gravity.y=gameOptions.ballGravity;

            this.floor.setImmovable(true);
            this.ball.setCircle(25);
            this.ball.setTint(0x651600);
            this.floor.setTint(0x133337);
            this.input.on('pointerdown',this.bounceFast,this);

            let barrierX=game.config.width;
            for(let i=0; i < 10; i++) {
                let barrier=this.barrierGroup.create(barrierX,this.floor.getBounds().top,'barrier');
                barrier.setOrigin(0.5,1);
                barrier.setImmovable(true);
                barrierX=barrierX+Phaser.Math.Between(gameOptions.barrierSpaces[0],gameOptions.barrierSpaces[1]);
                barrier.setFrame((Phaser.Math.Between(0,99)<gameOptions.bonusPercent)?0:1);
            }
            this.barrierGroup.setVelocityX(-gameOptions.barrierSpeed);

            this.score = 0;
            let storage = localStorage.getItem(gameOptions.localStorageName);
            if(storage == null || storage == 'NaN'){
                this.highScore = 0;
            }
            else{
                this.highScore = localStorage.getItem(gameOptions.localStorageName);
            }

            this.scoreText = this.add.text(10, 10, '');
            this.updateScore(this.score);
       }

       bounceFast(){
           if(this.firstJump!=0){
               this.ball.body.velocity.y=gameOptions.ballPower;
           }
       }

        createBarrier(){
            let lastBarrier = 0;
            this.barrierGroup.getChildren().forEach(function(barrier){
                lastBarrier = Math.max(lastBarrier, barrier.x);
            });
            return lastBarrier;
        }

        updateScore(value){
            this.score += value;
            this.scoreText.text = 'Score: ' + this.score + '\nBest Score: ' + this.highScore;
        }

        updateBarrier(barrier){
            this.updateScore(1);
            barrier.x = this.createBarrier()+Phaser.Math.Between(gameOptions.barrierSpaces[0], gameOptions.barrierSpaces[1]);
            barrier.setFrame((Phaser.Math.Between(0,99)<gameOptions.bonusPercent)?0:1);
        }

       update(){
             this.physics.world.collide(this.floor,this.ball,function(){
                 if(this.firstJump==0){
                     this.firstJump=this.ball.body.velocity.y;
                 }
                 else{
                     this.ball.body.velocity.y=this.firstJump;
                 }
             },null,this);

             this.barrierGroup.getChildren().forEach(function(barrier){
                if(barrier.getBounds().right < 0){
                    if(barrier.frame.name == 0){
                        localStorage.setItem(gameOptions.localStorageName,Math.max(this.score,this.highScore));
                        this.scene.start('PlayGame');
                    }
                    else{
                        this.updateBarrier(barrier);
                    }
                }
             },this);

             this.physics.world.overlap(this.ball,this.barrierGroup,function(ball, barrier){

                if(barrier.frame.name == 1){
                    localStorage.setItem(gameOptions.localStorageName,Math.max(this.score,this.highScore));
                    this.scene.start('PlayGame');
                }
                else{
                    this.updateBarrier(barrier);
                }
                 
             }, null, this);
       }
   }