ObjC.import('Foundation');

function parseLsof(output) {
    var processes = {};
    output.split('\n').forEach(function (line) {
        var fields = line.trim().split(/\s+/);
        if (fields.length < 9 || fields[0] === 'COMMAND') return;
        var address = fields[fields.length - (fields[fields.length - 1] === '(LISTEN)' ? 2 : 1)];
        var port = address.slice(address.lastIndexOf(':') + 1);
        if (!/^\d+$/.test(port) || !/^\d+$/.test(fields[1])) return;
        var pid = fields[1];
        if (!processes[pid]) processes[pid] = {name: fields[0].replace(/\\x20/g, ' '), pid: pid, user: fields[2], ports: []};
        if (processes[pid].ports.indexOf(port) === -1) processes[pid].ports.push(port);
    });
    return Object.keys(processes).map(function (pid) {
        var process = processes[pid];
        process.ports.sort(function (a, b) { return Number(a) - Number(b); });
        return process;
    }).sort(function (a, b) { return Number(a.ports[0]) - Number(b.ports[0]); });
}

function buildOutput(processes, query) {
    var items = processes.map(function (process) {
        var ports = process.ports.map(function (port) { return ':' + port; }).join(', ');
        return {
            title: process.name + ' — ' + ports,
            subtitle: 'PID ' + process.pid + ' · ' + process.user + ' · ↩ copy PID  ⌘↩ kill  ⌥↩ kill -9',
            arg: process.pid,
            match: process.name + ' ' + process.ports.join(' ') + ' ' + process.pid,
            variables: {q: query, pname: process.name, pports: process.ports.join(' ')},
            mods: {
                cmd: {subtitle: 'Kill ' + process.name + ' (SIGTERM), then reshow the list'},
                alt: {subtitle: 'Force kill ' + process.name + ' (SIGKILL), then reshow the list'}
            }
        };
    });
    if (!items.length) items = [{title: 'No open ports', subtitle: 'No TCP ports are listening', valid: false}];
    return {rerun: 1.0, items: items};
}

function run(argv) {
    try {
        var task = $.NSTask.alloc.init;
        task.launchPath = '/usr/sbin/lsof';
        task.arguments = ['-nP', '-iTCP', '-sTCP:LISTEN', '+c', '0'];
        var pipe = $.NSPipe.pipe;
        task.standardOutput = pipe;
        task.standardError = $.NSFileHandle.fileHandleWithNullDevice;
        task.launch;
        var data = pipe.fileHandleForReading.readDataToEndOfFile;
        task.waitUntilExit;
        var output = ObjC.unwrap($.NSString.alloc.initWithDataEncoding(data, $.NSUTF8StringEncoding)) || '';
        if (!output && task.terminationStatus > 1) throw new Error('lsof exited with code ' + task.terminationStatus);
        return JSON.stringify(buildOutput(parseLsof(output), argv[0] || ''));
    } catch (error) {
        return JSON.stringify({items: [{title: 'Failed to run lsof', subtitle: String(error), valid: false}]});
    }
}
