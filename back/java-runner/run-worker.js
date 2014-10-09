var cp = require('child_process');
process.on('message', function(data) {
    var stoutBuffer = '',
        sterrBuffer = '';
    var proc = cp.spawn('java', data.args, {
        cwd: data.cwd
    });
    proc.stdout.on('data', function(data) {
        stoutBuffer += data;
    });
    proc.stderr.on('data', function(data) {
        sterrBuffer += data;
    });
    proc.on('close', function(code) {
        if (code === null) {
            process.send({
                error: code,
                stout: sterrBuffer,
                sterr: sterrBuffer
            });
        } else {
            process.send({
                error: null,
                stout: sterrBuffer,
                sterr: sterrBuffer
            });
        }
    });
});
