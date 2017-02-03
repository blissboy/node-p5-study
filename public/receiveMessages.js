/**
 * Created by patwheaton on 1/23/17.
 */

const default_ellipse_size = 60;
const MAX_SQUIGGLES = 20;
const NEG_MAX_SQUIGGLES = -1 * MAX_SQUIGGLES;
var remotePoints = [];

function remotePointToPolar(msg) {
    var theta = msg.mouse.mouseXpercent * TWO_PI;
    var r = msg.mouse.mouseYpercent;
    var x = (r * 2 * Math.cos(theta));
    var y = (r * 2 * Math.sin(theta));
    //console.log(`theta=${theta}`);
    if (remoteSquiggles.has(msg.socketId)) {
        remoteSquiggles.get(msg.socketId).push(
            (offsetX, offsetY) => {
                const ellipseX = offsetX * (x + 1);
                const ellipseY = offsetY * (y + 1);
                //console.log(`ellipseX: ${ellipseX}, ellipseY: ${ellipseY}, offsetX: ${offsetX}, offsetY: ${offsetY}, x:${x}, y:${y}`);
                ellipse(ellipseX, ellipseY, default_ellipse_size, default_ellipse_size);
            }
        );
        if (remoteSquiggles.get(msg.socketId).length > MAX_SQUIGGLES) {

            remoteSquiggles.set(
                msg.socketId,
                remoteSquiggles.get(msg.socketId).slice(NEG_MAX_SQUIGGLES));
        }
    } else {
        remoteSquiggles.set(msg.socketId,
            [
                (offsetX, offsetY) => {
                    const ellipseX = offsetX * (x + 1);
                    const ellipseY = offsetY * (y + 1);
                    //console.log(`ellipseX: ${ellipseX}, ellipseY: ${ellipseY}, offsetX: ${offsetX}, offsetY: ${offsetY}, x:${x}, y:${y}`);
                    ellipse(ellipseX, ellipseY, default_ellipse_size, default_ellipse_size);
                }
            ]
        );
    }
}

function remotePointToStars(msg) {
    // add this point to remote points
    addNewRemotePoint(msg.mouse.mouseXpercent, msg.mouse.mouseYpercent);

    // create star drawing functions for the all the points we have
    remoteSquiggles.set(msg.socketId,
        createStarFunctionsFromNormalizedPoints(remotePoints));

}

function drawStar(pointA, pointB, pointC) {
    console.log(`a.x=${pointA.x}, b.x=${pointB.x}, c.x=${pointC.x}`);
    const radius1 = Math.sqrt(Math.pow(pointA.x - pointB.x,2) + Math.pow(pointA.y - pointB.y,2));
    const radius2 = Math.sqrt(Math.pow(pointB.x - pointC.x,2) + Math.pow(pointB.y - pointC.y,2));
    star(pointA.x, pointA.y, radius1, radius2, 8);
}

/**
 * Draw a star with numpoints. pointA and pointB are the
 * @param numPoints
 * @param pointA the tip of a point
 * @param pointB the base of a point
 * @param pointC distance between pointB and pointC is the inner radius of the star
 */
function star(x, y, radius1, radius2, npoints) {
    var angle = TWO_PI / npoints;
    var halfAngle = angle / 2.0;
    beginShape();
    for (var a = 0; a < TWO_PI; a += angle) {
        var sx = x + cos(a) * radius2;
        var sy = y + sin(a) * radius2;
        vertex(sx, sy);
        sx = x + cos(a + halfAngle) * radius1;
        sy = y + sin(a + halfAngle) * radius1;
        vertex(sx, sy);
    }
    endShape(CLOSE);
}
function addNewRemotePoint(xPct, yPct) {
    remotePoints.push(
        {
            x: `${xPct}`,
            y: `${yPct}`
        }
    );
    if (remotePoints.length > MAX_SQUIGGLES) {
        remotePoints = remotePoints.slice(NEG_MAX_SQUIGGLES);
    }

}

function slidingWindowThatRestartsAtZero(uhrray, startingIndex, windowSize) {
    let retArray = [];
    if (!(uhrray.length < windowSize || uhrray.length <= startingIndex)) {
        retArray.push(uhrray[startingIndex]);
        for (step = 1; step < windowSize; step++) {
            retArray.push(
                uhrray[(startingIndex + step) % uhrray.length]
            );
        }
    }
    return retArray;
}


function createStarFunctionsFromNormalizedPoints(points) {
    const windowSize = 3;
    let functionList = [];

    // denormalize points to windows coords
    let coordPoints = points.map(p => {
        return {
            x: p.x * window.innerWidth,
            y: p.y * window.innerHeight
        }
    });
    let windowPoints = [];
    for (i = 0; i < coordPoints.length; i++) {
        windowPoints = slidingWindowThatRestartsAtZero(coordPoints, i, windowSize);
        //console.log(`windowPoints=${windowPoints}`);
        if ( windowPoints.length > 2) {
            functionList.push((foo, bar) => {
                //console.log('here I am');
                drawStar(
                    {x: `${windowPoints[0].x}`, y: `${windowPoints[0].y}`},
                    {x: `${windowPoints[1].x}`, y: `${windowPoints[1].y}`},
                    {x: `${windowPoints[2].x}`, y: `${windowPoints[2].y}`});
            });
        }
    }

    return functionList;
}

function newRemotePoint(msg) {
    console.log(msg);
    //remotePointToPolar(msg);
    remotePointToStars(msg);
}

