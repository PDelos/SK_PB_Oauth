/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3575880454")

  // update field
  collection.fields.addAt(8, new Field({
    "hidden": false,
    "id": "select3912345333",
    "maxSelect": 3,
    "name": "preferences",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "vegan",
      "peanut",
      "vegetarian",
      "gluten",
      "tomato"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3575880454")

  // update field
  collection.fields.addAt(8, new Field({
    "hidden": false,
    "id": "select3912345333",
    "maxSelect": 3,
    "name": "preferences",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "vegan",
      "vegetarian",
      "gluten free"
    ]
  }))

  return app.save(collection)
})
