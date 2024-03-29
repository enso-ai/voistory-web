#!/bin/sh
npm run build

aws s3 cp ./build s3://voistory-web-prototype --recursive

aws cloudfront create-invalidation --distribution-id EQNMYQD1JGEG9 --paths "/*"

