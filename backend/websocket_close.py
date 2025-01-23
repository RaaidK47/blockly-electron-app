import psutil

def get_netstat_output(port):
    """Get network connections using psutil."""
    output = ""
    pids_to_kill = []
    for conn in psutil.net_connections():
        if conn.laddr.port == port:
            output += f"Proto: {conn.type}\n"
            output += f"Local Address: {conn.laddr}\n"
            output += f"Remote Address: {conn.raddr}\n"
            output += f"Status: {conn.status}\n"
            output += f"PID: {conn.pid}\n\n"
            pids_to_kill.append(conn.pid)
    return output, pids_to_kill

def kill_processes(pids):
    """Kill the processes with the given PIDs."""
    for pid in pids:
        try:
            proc = psutil.Process(pid)
            proc.terminate()
            print(f"Process {pid} terminated.")
        except psutil.NoSuchProcess:
            print(f"Process {pid} not found.")
        except Exception as e:
            print(f"Error killing process {pid}: {e}")

port = 8765
output, pids_to_kill = get_netstat_output(port)
# print(output)
kill_processes(pids_to_kill)