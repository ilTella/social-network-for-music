function msToTime(duration) {
    seconds = Math.floor((duration / 1000) % 60);
    minutes = Math.floor((duration / (1000 * 60)) % 60);
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  
    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
  
    return hours + ":" + minutes + ":" + seconds;
}

function msToShortTime(duration) {
    seconds = Math.floor((duration / 1000) % 60);
    minutes = Math.floor((duration / (1000 * 60)) % 60);

    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
  
    return minutes + ":" + seconds;
}

function timeToMs(time) {
    var timeSplitted = time.split(":");
    var ms = 0;
    if (timeSplitted.length == 2) {
        ms += parseInt(timeSplitted[0]) * 60 * 1000;
        ms += parseInt(timeSplitted[1]) * 1000;
    } else if (timeSplitted.length == 3) {
        ms += parseInt(timeSplitted[0]) * 60 * 60 * 1000;
        ms += parseInt(timeSplitted[1]) * 60 * 1000;
        ms += parseInt(timeSplitted[2]) * 1000;
    }
    return ms;
}