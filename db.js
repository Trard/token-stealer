function dbgetcollection(collection) {
    return new Promise((resolve, reject) => {
        collection.find().toArray(function (err, results) {
            resolve(results);
        });
    });
};

function dbgetrandom(collection) {
    return new Promise((resolve, reject) => {
        collection.aggregate([{ $sample: { size: 1 } }]).toArray(function (err, results) {
            resolve(results);
        });
    });
};

function dbadd(collection, additions) {
    return new Promise((resolve, reject) => {
        collection.insertMany(additions);
    });
};

function dbdeleteall(collection) {
    return new Promise((resolve, reject) => {
       collection.deleteMany({}); 
    });
};

module.exports = { dbgetcollection, dbgetrandom, dbadd, dbdeleteall };