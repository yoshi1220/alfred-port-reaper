function assert(condition, message) { if (!condition) throw new Error(message); }
function run() {
    var input = 'COMMAND PID USER FD TYPE DEVICE SIZE/OFF NODE NAME\n' +
        'node 42 user 1u IPv4 x 0t0 TCP 127.0.0.1:3001 (LISTEN)\n' +
        'node 42 user 2u IPv6 x 0t0 TCP [::1]:3000 (LISTEN)\n' +
        'node 42 user 3u IPv4 x 0t0 TCP *:3000 (LISTEN)\n' +
        'Google\\x20Chrome 7 user 1u IPv4 x 0t0 TCP *:9222 (LISTEN)\n';
    var processes = parseLsof(input);
    assert(processes.length === 2, 'group by PID');
    assert(processes[0].ports.join(',') === '3000,3001', 'sort and deduplicate ports');
    assert(processes[1].name === 'Google Chrome', 'decode spaces');
    var output = buildOutput(processes, 'query "\\');
    assert(output.rerun === 1 && output.items[0].arg === '42', 'output and refresh');
    assert(output.items[0].variables.pports === '3000 3001', 'carry ports for validation');
    assert(JSON.parse(JSON.stringify(output)).items[0].variables.q === 'query "\\', 'escape query');
    assert(buildOutput([], '').items[0].valid === false, 'empty placeholder');
    return 'List ports tests passed';
}
