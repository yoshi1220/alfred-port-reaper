# PortReaper

Search listening TCP ports and stop their processes from Alfred.

## Installation

Download `PortReaper.alfredworkflow` from the [releases page](https://github.com/yoshi1220/alfred-port-reaper/releases), double-click it, and import it into Alfred. Alternatively, build it locally using the instructions below.

Requires macOS and Alfred 5 with the Powerpack. PortReaper uses macOS tools, including JavaScript for Automation and `lsof`; Python and third-party packages are not required to run or build it.

## Usage

Search listening TCP ports and their processes via the `portreaper` keyword. Type a process name, port, or PID to filter the list.

* <kbd>↩</kbd> Copy the PID to the clipboard.
* <kbd>⌘</kbd><kbd>↩</kbd> Send SIGTERM to the process and reopen the list.
* <kbd>⌥</kbd><kbd>↩</kbd> Send SIGKILL to the process and reopen the list.
* <kbd>→</kbd> Open the action panel to choose a termination action.
* <kbd>esc</kbd> Close the list.

The list refreshes every second. After termination it reopens with the current query, so you can stop processes one after another without starting over. Alfred may briefly close its window. A notification appears if sending a signal fails. Processes owned by another user may not be stoppable.

SIGKILL stops a process immediately and may cause data loss. When an action is selected from the list, PortReaper checks that the PID still listens on a previously displayed port before sending the signal. This reduces stale selections but cannot eliminate races or guarantee process identity. The Universal Actions also accept a PID as text outside the list and cannot perform that port check; verify the PID before using them.

## Development

```bash
./build.sh             # run tests and create PortReaper.alfredworkflow
./build.sh --install   # build, then open the import dialog
./tests/run_tests.sh   # tests only
```

The workflow uses a native Call External Trigger to reopen its Script Filter after a termination action. `src/info.plist` contains the workflow configuration.

PortReaper was developed with assistance from AI tools, including OpenAI Codex.

## License

MIT
