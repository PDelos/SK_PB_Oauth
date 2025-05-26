/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update field
  collection.fields.addAt(7, new Field({
    "cascadeDelete": true,
    "collectionId": "pbc_3575880454",
    "hidden": false,
    "id": "relation3414765911",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "info",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update field
  collection.fields.addAt(7, new Field({
    "cascadeDelete": true,
    "collectionId": "pbc_3575880454",
    "hidden": false,
    "id": "relation3414765911",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "info",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
