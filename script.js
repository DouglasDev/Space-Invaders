//setup canvas
const canvasSelector = document.querySelector("canvas");
const canvasContent = canvasSelector.getContext("2d");

const cavasWidth=500,cavasHeight=300;

canvasSelector.width = cavasWidth;
canvasSelector.height = cavasHeight;

//setup constant values

const frameRate=1000/30;

//all invaders have the same width but different heights
const invaderWidth=32,
	  invader1Height=16,
      invader2Height=20,
      invader3Height=16;

const defenderWidth=28,
	  defenderHeight=16;

const spriteSheet = new Image();
spriteSheet.src = "./space_invaders_sprite_sheet.png";
// spriteSheet.src = "https://image.ibb.co/hMnvKU/space-invaders-sprite-sheet.png";

//stores all data related to defender, invaders, bullets, score, and lives
let data={};

spriteSheet.onload = function(){

	data.currentFrame=1;

	data.score=0;

	//setup defender
	data.defender={
		x:cavasWidth/2-defenderWidth/2,
		y:cavasHeight-defenderHeight,
		direction:3
	};

	//bullets stored in:
	data.invadersBulletsArray=[];
	data.defenderBulletsArray=[];


	//coordinates of sprites for invaders
	//each invader type has two frames
	//Each sub array contains: Source x,Source y,Source width,Source height
	InvaderSprites1 =[[11, 5, 32, 16],[10, 33, 32, 16]];
	InvaderSprites2=[[73, 3, 32, 20],[72, 31, 32, 20]];
	InvaderSprites3=[[131, 5, 32, 16],[130, 33, 32, 16]];

	//setup invaders

	//direction to move invaders
	data.invaderDirection=1;
	//current animation frame
	data.invaderFrame=1;

	//all data on invaders
	data.invadersArray=[];


	//create 10 columns and 5 rows of invaders
	//1st row is type 1, 2nd and 3rd are type 2, 4th and 5th are type 3
	for (let x=0;x<11;x++){
		for (let y=0;y<5;y++){
			let invaderSprites,invaderHeight;

			//select type of invader depending on row
			if (y==0){ invaderSprites=InvaderSprites1;
					   invaderHeight=invader1Height;
					}
			if (y==1 || y==2){ invaderSprites=InvaderSprites2;
		 		  			   invaderHeight=invader2Height;
							}
			if (y==3 || y==4){ invaderSprites=InvaderSprites3;
							   invaderHeight=invader3Height;
							}

			data.invadersArray.push({
				x:x*36+10,
				y:y*20+30,
				width:invaderWidth,
				height:invaderHeight,
				sprites:invaderSprites,
				alive:true
			});
		}
	}

	document.addEventListener('keydown',function(e){
			if (e.key=='ArrowLeft'){data.invaderDirection=-1;}
			if (e.key=='ArrowRight'){data.invaderDirection=1;}
	});

	document.addEventListener('mousedown',function(e){
		let canvasPosition= canvasSelector.getBoundingClientRect();
		let mouseX=e.clientX-canvasPosition.x;
		let mouseY=e.clientY-canvasPosition.y;

		let CanvasPosX=(mouseX/700)*500
		let CanvasPosY=(mouseY/420)*300

		data.invadersArray.forEach(invader=>{
			if (collision(CanvasPosX,CanvasPosY,invader.x,invader.y,invader.width,invader.height))
			{
				data.invadersBulletsArray.push({
					x: invader.x+invader.width/2,
					y: invader.y+invader.height,
					alive: true
				})
			}
		})
	});

	setInterval(mainLoop,frameRate);
};

function mainLoop(){

	canvasContent.clearRect(0, 0, canvasSelector.width, canvasSelector.height);

	//draw defender
	canvasContent.drawImage(spriteSheet, 272, 33, 28, 16, data.defender.x, data.defender.y, defenderWidth,defenderHeight);
	//draw invaders
	data.invadersArray.forEach(invader=>{
		canvasContent.drawImage(spriteSheet, ...invader.sprites[data.invaderFrame], invader.x, invader.y,invaderWidth,invader1Height);
	})

	//draw invader bullets
	data.invadersBulletsArray.forEach(bullet=>{
		canvasContent.fillStyle='white';
		canvasContent.fillRect(bullet.x,bullet.y,2,4)

		if (collision(bullet.x+1,bullet.y+4,data.defender.x,data.defender.y,defenderWidth,defenderHeight)){
			data.score+=100;
			bullet.alive=false;
			}

		bullet.y+=5;
	})

	//delete invader bullets if hit or out of bounds
	data.invadersBulletsArray=data.invadersBulletsArray.filter(bullet=>
		bullet.alive==true && bullet.y<300)

	
	//draw defender bullets
	data.defenderBulletsArray.forEach(bullet=>{
		canvasContent.fillStyle='red';
		canvasContent.fillRect(bullet.x,bullet.y,2,4)

		data.invadersArray.forEach(invader=>{
			if (collision(bullet.x+1,bullet.y,invader.x,invader.y,invader.width,invader.height)){
				invader.alive=false;
				bullet.alive=false;
			}
		})

		bullet.y-=5;
	})

	//delete invader bullets if hit or out of bounds
	data.defenderBulletsArray=data.defenderBulletsArray.filter(bullet=>
	bullet.alive==true && bullet.y>-5)

	//delete invader if shot
	data.invadersArray=data.invadersArray.filter(invader=>invader.alive==true)


	//print score
	canvasContent.fillStyle='white';
	canvasContent.font='15pt Arial';
	canvasContent.fillText("score: "+data.score,10,20)


	//move defender
	//if in bounds
	if (data.defender.x+data.defender.direction<cavasWidth-defenderWidth&&data.defender.x+data.defender.direction>0){
		//one in thirty chance of changing direction and shooting
		if (Math.round(Math.random()*30)==1){
		 		data.defender.direction=-data.defender.direction;

		 		data.defenderBulletsArray.push({
					x: data.defender.x+defenderWidth/2,
					y: data.defender.y,
					alive: true
				})
		}
	}
	//if out of bounds, change direction
	else{
	 	data.defender.direction=-data.defender.direction;
	}

	data.defender.x+=data.defender.direction;

	//check all invaders for collision with sides and change direction if necessary
	data.invadersArray.forEach(invader=>{
		if (invader.x+data.invaderDirection>cavasWidth-invaderWidth){
			data.invaderDirection=-1;
		}
		if (invader.x+data.invaderDirection<0){
			data.invaderDirection=1;
		}
	});

	//move invaders
	data.invadersArray.forEach(invader=>{
		invader.x+=data.invaderDirection;
	});

	//animate invaders, change sprite every .5 seconds
	data.currentFrame+=1;
	if (data.currentFrame%30==0){data.invaderFrame=0;}
	if (data.currentFrame%30==15){data.invaderFrame=1;}
	//move invaders down once every 4 seconds
	if (data.currentFrame%120==119){
		data.invadersArray.forEach(invader=>invader.y+=5);
	}

}

function collision(x,y,x2,y2,x2Width,y2Height){
	if ((x>=x2&&x<=x2+x2Width)&&(y>=y2&&y<=y2+y2Height)){
		return true;
	}
		return false;
}