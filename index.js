var fluently = require('fluently');


var builder = function b(base, name) {
    //a quick dirty factory
    var glob = require('glob');

    var path = require('path').join(base, name);
    var constructor = require(path);

    var factory = function(a,b,c,d,e,f,g,h) {
        return new constructor(a,b,c,d,e,f,g,h);
    };

    var filelist = glob.sync(path + '/*.js');

    filelist.forEach(function(file) {
        var child = file.slice(base.length + name.length + 2, -3);
        factory[child] = b(path, child);
    });

    return factory;

}.bind(null, __dirname + '/modules');



module.exports = fluently()
    .defineObj({
        detect: builder('detect'),
        main: builder('main'),
        createDaemon: builder('daemon'),
        config: require('./lib/config')
    })

    .getTarget();

// module.exports = function($S) {

//  return $S.createDaemon()
//      .define
//          .name('lifesaver.core')
//          .detector(
//              $S.detect.http({
//                  uri: 'unix://' + $S.config.workspace + '/run/core.sock',
//                  method: 'HEAD'
//              })
//          )
//          .main(
//              $S.main.shell(__dirname + '/bin/daemon.js')
//          )
//          // .on('detector:down', 'boot')
//          // .on('boot:fail', 'retry', {
//          //  wait: 3000,
//          //  max_tries: 10
//          // })
//          // .on('boot:fail', 'panic')
//      .endDefine;
// };
