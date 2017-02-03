var socket;
var localSquiggles = [];
var remoteSquiggles = new Map();
const TWO_PI = 2 * Math.PI;


function setup() {
    createCanvas(window.innerWidth,window.innerHeight);
    socket = io.connect('http://localhost:3000');
    socket.on('mouse',newRemotePoint);

    window.onresize = () => resizeCanvas(window.innerWidth, window.innerHeight);

}


function mouseDragged() {
    //console.log(`sending ${mouseX}, ${mouseY}`);

    socket.emit('mouse', {
        socketId: `${socket.id}`,
        mouse: {
            mouseX: `${mouseX}`,
            mouseXpercent: `${mouseX / window.innerWidth}`,
            mouseY: `${mouseY}`,
            mouseYpercent: `${mouseY / window.innerHeight}`,
        }
    });
    //fill(128);

    var data = {
        x: `${mouseX}`,
        y: `${mouseY}`
    };
    // const x = mouseX;
    // const y = mouseY;

    localSquiggles.push(() => {
        ellipse(`${data.x}`, data.y, 60,60)
    });

}


function draw() {
    background(120);

    fill(0,128,0);
    localSquiggles.forEach( f => f());

    fill(128,0,0);

    remoteSquiggles.forEach((value,key) => {
        value.forEach(f => f(window.innerWidth/2, window.innerHeight/2));
    });

    
}