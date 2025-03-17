pid_websersocket=$(pgrep -f "websersocket_e731d80d-dbe2-4a17-a153-7ea90604a8a3.js")
watch -n 1 ps -p $pid_websersocket -o pid,etime,%cpu,%mem,cmd