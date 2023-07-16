var Point2D={
     x:0,
     y:0,
     speed:0,
     size:0,
     angle:0,
     collided:false,
     alpha:1

}

var Line2D={
     start:undefined,
     end:undefined,
     max:200,
     distance(){
        const deltaX = this.start.x - this.end.x;
        const deltaY = this.start.y - this.end.y;
        // Applying the Pythagorean theorem to calculate the distance
        return Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
     },
     getAngle(){
        return Math.atan2(this.start.y-this.end.y,this.end.x-this.start.x);
       },
     alpha(){
        return this.max/this.distance()-1;
     }

}

var LineTree={
    lines:[],
    createTree(points){
     for(let i=0;i<points.length;i++){
        for(let j=0;j<points.length;j++){
            if(i==j) continue;
            const a=points[i];
            const b=points[j];
            const line=Object.create(Line2D);
            line.start=a;
            line.end=b;
            this.lines.push(line);
        }
     }
    },

   
    clear(){
        this.lines.splice(0,this.lines.length);
    }
}

function mouseRepelAnimation(point){
     if(pointer2D.distance()<=pointer2D.max){
        point.angle=-pointer2D.getAngle();
        movePoint(point,Math.abs(pointer2D.distance()-pointer2D.max))
     } else
        movePoint(point,0);
}

function movePoint(point,offset){
    point.x += (point.speed+offset) * Math.cos(point.angle);
    point.y += (point.speed+offset) * Math.sin(point.angle);
}

function applyWave(point){
    
    let offset=point.size*4;
    pointer2D.end.x=point.x;
    pointer2D.end.y=point.y;
    mouseRepelAnimation(point);
  
    if((point.y+point.size)>=(ctx.canvas.height+offset)){
    //    point.y=0;
        point.angle=-Math.random()*Math.PI;
    }
        
    if((point.x+point.size)>=(ctx.canvas.width+offset)){
        // point.x=0;
         point.angle=-Math.random()*Math.PI;    
    }

    if((point.x-point.size)<=-offset){
     //   point.x=ctx.canvas.width;
        point.angle=Math.random()*Math.PI;  
    }
    if((point.y-point.size)<=-offset){
      //  point.y=ctx.canvas.height;
        point.angle=Math.random()*Math.PI;  
    }
}

var canvas=null;
var ctx=null;
var points=[];
var lineTree=null;
var n_time=0;
var o_time;
var tick=0;
var pointer2D= Object.create(Line2D)
const maxParticles=500;
window.onload=()=>{
   canvas= document.getElementById("canvas");
   ctx=canvas.getContext("2d");
   ctx.canvas.width  = window.innerWidth;
   ctx.canvas.height = window.innerHeight;
   
  initParticleList();
  pointer2D.start=Object.create(Point2D);
  pointer2D.end=Object.create(Point2D);
}

window.addEventListener("resize",()=>{
    ctx.canvas.width  = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
},false)

window.addEventListener("mousemove",(event)=>{
     console.log("X: "+event.x+" Y: "+event.y);
     pointer2D.start.x=event.x;
     pointer2D.start.y=event.y;
});

function initParticleList(){
    
    points.splice(0,points.length)
    const size=maxParticles*(parseFloat(document.getElementById("p1").value)/100.0);
    for(let i=0;i<size;i++){
        const point=Object.create(Point2D);
        point.x=Math.random()* ctx.canvas.width;
        point.y=Math.random()* ctx.canvas.height;
        point.size=5;
        point.speed=0.5+Math.random()*1.5;
        point.angle=Math.random()*Math.PI*2;
        points.push(point);
      }
      if(lineTree==null)
      lineTree= Object.create(LineTree);
       else
       lineTree.clear();
      lineTree.createTree(points);

}

function update(){
   
    if(canvas!=null){
    o_time = performance.now();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //draw lineTree
    lineTree.lines.forEach(line=>{
    if(line.distance()<=(line.max)){
        ctx.strokeStyle=`rgba(128, 128, 128, ${line.alpha()})`    
        ctx.beginPath()
        ctx.moveTo(line.start.x, line.start.y)
        ctx.lineTo(line.end.x, line.end.y)
        ctx.closePath();
        ctx.stroke()
        line.start.collided=true;
        line.end.collided=true;
        line.start.alpha=line.alpha();
        line.end.alpha=line.alpha();
     }
       
    })
   
    // Draw the point
    points.forEach(point=>{
        ctx.fillStyle = `rgb(${Math.min(50+255*(point.alpha),255)},255,255)`;
        ctx.beginPath();
        ctx.arc(point.x, point.y, point.size, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
      
    })

    // reset the point collision flag to false
     points.forEach(point=>{
        point.collided=false;
        point.alpha+=1*0.01;
        point.alpha=Math.min(point.alpha,1);
     })

    //update points
    points.forEach(point=>{
        applyWave(point)
    })
   
    updateFps();
    pointer2D.start.x=Number.POSITIVE_INFINITY;
    pointer2D.start.y=Number.POSITIVE_INFINITY;
    }
    requestAnimationFrame(update);
}

const updateFps=()=>{
    if(o_time>=n_time){
        n_time = performance.now()+1000;
        document.getElementById("fps").innerText=`FPS: ${tick}`;
        tick=0
    }else
        tick++;
}

update();