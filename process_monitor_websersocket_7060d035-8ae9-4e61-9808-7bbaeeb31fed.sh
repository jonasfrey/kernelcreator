pid_websersocket=$(pgrep -f "websersocket_7060d035-8ae9-4e61-9808-7bbaeeb31fed.js")
watch -n 1 ps -p $pid_websersocket -o pid,etime,%cpu,%mem,cmd