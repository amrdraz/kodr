#!/bin/sh

BASEDIR=$(pwd)
SRV_PID=$BASEDIR/srv.pid

function usage {
    echo "install - to install requirements. You will need npm to do this. Please install npm if you don't have it."
    echo "start   - to serve compilation server. Default is port 3000"
    echo "  e.g. ./api.sh start"
    echo "  e.g. ./api.sh start 5000"
    echo "html    - to generate html"
    echo "  e.g. ./api.sh html"
}

function serve {
   local port=$1

    if [[ ${port} ]]; then
        aglio -i api.md -p $port -s
    else
        aglio -i api.md -s
    fi
}

function html {
    aglio -i api.md -o api.html
}

function install {
    npm -g install aglio
}

###
# Main
###

[[ ($# -eq 0) || ($# -gt 2) ]] && usage
port=''
[[ $# -eq 2 ]] && port=$2

if [[ $1 == "start" ]]; then
    serve ${port}
elif [[ $1 == "html" ]]; then
    html
elif [[ $1 == "install" ]]; then
    install
fi