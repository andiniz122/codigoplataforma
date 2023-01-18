#!/usr/bin/env bash

npm run build;
#aws s3 sync . s3://medicao.eletricom.me/ --acl public-read --profile energia
rsync -rave "ssh -i ~/.ssh/energia.pem" --rsync-path="sudo rsync"  build/ ubuntu@18.228.110.226:/var/www/html/energia
cd ..;
