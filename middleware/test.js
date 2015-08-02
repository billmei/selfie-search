var Q = require("q");

var oneA = function () {
    var d = Q.defer();
	var timeUntilResolve = Math.floor((Math.random()*2000)+1);
    console.log('1A Starting');

    setTimeout(function () {
  		console.log('1A Finished');
  		d.resolve('foobar');
    }, timeUntilResolve);

    return d.promise;
};

var oneB = function () {
	var d = Q.defer();
	var timeUntilResolve = Math.floor((Math.random()*2000)+1);
	console.log('1B Starting');
	setTimeout(function () {
		console.log('1B Finished');
		d.resolve('1BTime: ' + timeUntilResolve);
    }, timeUntilResolve);
	return d.promise;
};


var threeA = function () {
    var d = Q.defer();
    console.log('3A Starting');
    setTimeout(function () {
		console.log('3A Finished');
		d.resolve();
    }, Math.floor((Math.random()*2000)+1));
    return d.promise;
};

var threeB = function () {
    var d = Q.defer();
    console.log('3B Starting');
    setTimeout(function () {
		console.log('3B Finished');
		d.resolve();
    }, Math.floor((Math.random()*5000)+1));
    return d.promise;
};

var four = function () {
	console.log('Four is now done');
};

function main(callback) {
  Q.all(oneA())
  .done(callback);

}

main(function(){
  console.log("all done.");
});