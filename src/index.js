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
    }
}

function applyWave(point){
    
    let offset=point.size*4;
    point.x += point.speed * Math.cos(point.angle);
    point.y += point.speed * Math.sin(point.angle);

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
window.onload=()=>{
   canvas= document.getElementById("canvas");
   ctx=canvas.getContext("2d");
   ctx.canvas.width  = window.innerWidth;
   ctx.canvas.height = window.innerHeight;

   for(let i=0;i<100;i++){
     const point=Object.create(Point2D);
     point.x=Math.random()* ctx.canvas.width;
     point.y=Math.random()* ctx.canvas.height;
     point.size=5;
     point.speed=0.5+Math.random()*1.5;
     point.angle=Math.random()*Math.PI*2;
     points.push(point);
   }
   lineTree= Object.create(LineTree);

   lineTree.createTree(points);
   
}

window.addEventListener("resize",()=>{
    ctx.canvas.width  = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
},false)


function update(){
   
    if(canvas!=null){
    o_time = performance.now();
    ctx.fillStyle="black";
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