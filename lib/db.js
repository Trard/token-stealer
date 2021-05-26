function db_get_collection(collection, sort, skip=0, limit=0) {
    return new Promise((resolve, reject) => {
        collection.find()
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray(function (err, results) {
            resolve(results);
        });
    });
};

function db_get_random(collection) {
    return new Promise((resolve, reject) => {
        collection.aggregate([{ $sample: { size: 1 } }]).toArray(function (err, results) {
            resolve(results);
        });
    });
};

function db_add(collection, addition) {
    return new Promise((resolve, reject) => {
        collection.insertOne(addition);
    });
};

function db_delete_collection(collection) {
    return new Promise((resolve, reject) => {
       collection.deleteMany({}); 
    });
};

function db_available_value(collection, value) {
    return new Promise((resolve, reject) => {
        collection.find(value).toArray(function (err, results) {
            resolve(results.length == 0)
        })
    });
};

function db_delete_value(collection, value) {
    return new Promise((resolve, reject) => {
        collection.deleteOne(value);
    });
};

module.exports = { db_get_collection, db_get_random, db_add, db_delete_collection, db_available_value, db_delete_value };