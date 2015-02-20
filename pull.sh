 #!/bin/sh

 git pull origin master
 npm install
 pm2 restart prod-server

exit 0