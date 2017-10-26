const express = require('express')
const router = express.Router()
const parseString = require('xml2js').parseString;
const request = require("request");
const rp = require('request-promise')
const GEOKEY = require('../config/GEOcodingAPI')
const RESSRCKEY = require('../config/RESSRCAPI')
const PLCsrcKey = require('../config/PlacesrcAPI')



const mongoose = require('mongoose')
if (!mongoose.connection.db) {
    mongoose.connect('mongodb://localhost/cs591')
}
const db = mongoose.connection
const Schema = mongoose.Schema
const personSchema = new Schema({
    name: String,
    UID: String,
    department: String,
    // longi: String,
    // lati: String
})
const people = mongoose.model('people', personSchema)


// POST Create a new user (only available to logged-in users)
router.post('/db', function (req, res, next) {
    aPerson = new people(
        req.body
    )
    aPerson.save(function (err) {
        if (err) {
            res.send(err)
        }
        //send back the new person
        else {
            res.send(aPerson)
        }
    })
})




// getting the geo coordinates throughout the Google GEOcode API
router.get('/geocode/:name', function (req, res, next) {

    let str = req.params.name
    let georesult = {}
    var options = { method: 'GET',
        url: 'https://maps.googleapis.com/maps/api/geocode/json',
        qs:
            { address: str,
                key: GEOKEY.key },
  };

    //parse the JSON file to get only the geo coordinates
    rp(options)
        .then(function(response, error) {
            if (error) {
                throw new Error(error)
            } else {
                georesult = response
                // console.log(response);
                myJSONResult= JSON.parse(georesult)


                mygeodata=[]
                for (i = 0; i < myJSONResult.results.length; i++) {
                    mygeodata[i] = myJSONResult.results[i].geometry.location;
                }
                res.json(mygeodata[0])


                flagLAT=mygeodata[0].lat
                flagLNG=mygeodata[0].lng


            }
        })
    })

//doing search for restaurants within 1000meters
router.get('/ressrc/:name', function (req, res, next) {

    let str = req.params.name
    let resresult = {}
    var options = { method: 'GET',
        url: 'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
        qs:
            { location: str,
                rankby: 'distance',
                types: 'restaurant',
                key: RESSRCKEY.key },
         };

    //parse the JSON file to get only the restaurant info
    rp(options)
        .then(function(response, error) {
            if (error) {
                throw new Error(error)
            } else {
                resresult = response
                console.log(str)
                // console.log(response);
                myJSONResult= JSON.parse(resresult)



                res.json(myJSONResult)





            }
        })
})


// getting all restaurant's name and coords through database api
router.get('/plcsrc/:name', function (req, res, next) {
    let str = req.params.name
    let plcsrcresult = {}
    var options = { method: 'GET',
        url: 'https://maps.googleapis.com/maps/api/place/textsearch/json',
        qs: { query: str, key: PLCsrcKey.key },
        headers:
            { 'postman-token': '9cf1af44-c5e4-655b-4f3f-cb7b104e0df3',
                'cache-control': 'no-cache' } };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        plcsrcresult = body
        res.json(JSON.parse(plcsrcresult))
    });
})



//getting a googlesearch api feature
const googlesearch = require("google")
googlesearch.resultsPerPage = 20;

router.get('/googlesearch/:name', function(req, res, err) {
    let search = req.params.name
    googlesearch(search, function (error, response) {
        // console.log(response)
        if(error) {res.send(error)}
        // else(res.json(response))
        else{
            reresult = response


            res.json(reresult)
        }
    });
})

//GET Fetch all users
router.get('/db', function (req, res, next) {
    people.find({}, function (err, results) {
        res.json(results)
    })

})



router.get('/db/:name', function (req, res, next) {
    findByName(req.params.name)
        .then(function (status) {
            res.json(status)
        })
        .catch(function (status) {
            res.json(status)

        })
})

//PUT Update the specified user's name
router.put('/db/:_id', function (req, res, next) {
    people.findByIdAndUpdate(req.params._id, req.body, {'upsert': 'true'}, function (err, result) {
        if (err) {
            res.json({message: 'Error updating'})
        }
        else {
            console.log('updated')
            res.json({message: 'success'})
        }

    })

})


//DELETE Delete the specified user
router.delete('/db/:_id', function (req, res, next) {
    people.findByIdAndRemove(req.params._id, function (err, result) {
        if (err) {
            res.json({message: 'Error deleting'})
        }
        else {
            res.json({message: 'success'})
        }
    })
})


let findByName = function (checkName) {
    return new Promise(function (resolve, reject) {
        people.find({name: checkName}, function (err, results) {
            console.log(results, results.length)
            if (results.length > 0) {
                resolve({found: results})
            }
            else {
                reject({found: false})
            }
//    return ( (results.length  > 0) ? results : false)
        })
    })
}

module.exports = router

//TODO Route to log out (req.logout())