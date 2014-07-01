#!/bin/bash
#export SERVER="http://odf.micloud.tw"
export SERVER="http://localhost:3000"
echo $SERVER
if [ "$1" == 'map' ] ; then # 取一各檔案，並自製map function過濾資料
curl -sS $SERVER/odf/map/GetAnimals -X POST -T map.json -H 'Content-Type:application/json'
elif [ "$1" == 'getpage' ] ; then # 取一各檔案，完整顯示其json格式
curl -sS $SERVER/odf/GetAnimals/page -X GET
elif [ "$1" == 'getfield' ] ; then # 取一各檔案，完整顯示其json格式
curl -sS $SERVER/odf/GetAnimals/field -X GET
elif [ "$1" == 'getdownload' ] ; then # 取一各檔案，完整顯示其json格式
curl -sS $SERVER/odf/GetAnimals/download -X GET
elif [ "$1" == 'getjson' ] ; then # 取一各檔案，完整顯示其json格式
curl -sS $SERVER/odf/GetAnimals/json -X GET
elif [ "$1" == 'getbyfilter' ] ; then # 取一各檔案，顯示json格式，並過濾輸出欄位
curl -sS $SERVER/odf/GetAnimals/json -X GET -d fields=Name,Sex,Age
elif [ "$1" == 'getfield' ] ; then # 取一各檔案，並輸出其array中第一個物件的keys
curl -sS $SERVER/odf/GetAnimals/field -X GET
elif [ "$1" == 'getdatasets' ] ; then # 取一各檔案，並輸出其array中第一個物件的keys
curl -sS $SERVER/odf/datasets -X GET
elif [ "$1" == 'getdsdetail' ] ; then # 取一各檔案，並輸出其array中第一個物件的keys
curl -sS $SERVER/odf/datasets -X GET -d detail=true
else
echo 'No suitable input...'
fi
