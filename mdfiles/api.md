
# Prepare
```
export SERVER=http://odf.micloud.tw
```

# Dataset Query API
## [GET]/odf/datasets
* Deacription: 取出所有既存Dataset名稱
* Example: curl $SERVER/odf/datasets
```
curl $SERVER/odf/datasets
[
  "GetAnimals",
  "TPEFree",
  "TaipeiMonitor"
]
```
* Body:
  * detail (option): true | false
* Description: 取出所有寄存Dataset含內容描述
* Example: curl $SERVER/odf/datasets -X GET -d detail=true
```
curl $SERVER/odf/datasets -X GET -d detail=true
{
  "GetAnimals": {
    "name": "GetAnimals",
    "keyword": [
      "animal",
      "dog",
      "cat"
    ],
    "description": "animal database, include many animal data",
    "owner": "http://micloud.tw"
  },
…
}
```

# Data Query API
## [GET]/odf/:ds_name/:type
* Param:
  * ds_name: 資料檔名稱
  * type: page | json | download | field
* Body:
  * fields (option): 資料欄位列表
* Description: 取出資料
  * Example: curl $SERVER/odf/GetAnimals/json -X GET -d fields=Name,Sex,Age

```
$ curl $SERVER/odf/GetAnimals/json -X GET -d fields=Name,Sex,Age | more
{
  "name": "GetAnimals",
  "keyword": [
    "animal",
    "dog",
    "cat"
  ],
  "description": "animal database, include many animal data",
  "owner": "http://micloud.tw",
  "title": "Open Data Framework - GetAnimals",
  "data": [
    {
      "Name": "豪豪",
      "Sex": "雄",
      "Age": "成年"
    },
    {
      "Name": "歐古",
      "Sex": "雄",
      "Age": "幼齡"
    },
…
}
```

# Data Upload API
## [POST] /odf/upload/:datasetname, body: the upload file path
* Param: 
  * datasetname: 資料檔名稱/命名
  * Description: 上傳全新一筆資料
* Example: curl $SERVER/odf/upload/Test -T data/GetAnimals/data.json -X POST -H 'Content-Type:application/json' -H "Authorization:demo"

```
$ curl $SERVER/odf/upload/Test -T data/GetAnimals/data.json -X POST -H 'Content-Type:application/json' -H "Authorization:demo"
{
  "status": 200,
  "msg": "done"
}
```


