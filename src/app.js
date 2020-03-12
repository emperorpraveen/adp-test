const path = require('path')
const express = require('express')
const rp = require('request-promise')

const app = express()

app.set('view engine', 'hbs')

const businessUrl = 'https://api.yelp.com/v3/businesses/search?term=ice cream shop&location=alpharetta';
const auth = 'Bearer rErCfgwsaBSSBoDtZYPx5m3kXj_R7mwLcQ3dU2a_nf2VFYFlO_jkX9lYyxuiydHYvXS1hRyD90ur5c_7mVpMNBiQWt0YtYWP_SXD4t22QyTCxOCDXp0NF-gWkWJmXnYx';

app.get('', (req, res) => {
    let topFiveArr = [];

    const businessOptions = {
        url: businessUrl,
        headers: { 'Authorization': auth },
        json: true
    };

    rp(businessOptions)
        .then((businessBody) => {
            topFive(businessBody, (topFive) => {
                topFiveArr = topFive
            })

            return topFiveArr;
        })
        .then((topFiveArr) => {
            getFinalResult(topFiveArr).then((finalResult) => {
                res.render('index', { data: finalResult });
            });
        })
        .catch(function (err) {
            throw err;
        });
})


function getFinalResult(topFiveArr) {
    const promises = topFiveArr.map(function (e) {
        const reqGenre = {
            url: 'https://api.yelp.com/v3/businesses/' + e.id + '/reviews',
            headers: { 'Authorization': auth },
            json: true
        };

        return rp(reqGenre)
            .then(function (body) {
                return body
            })
            .catch(function (err) {
                console.log('couldnt get genres', err);
                throw err
            });
    });

    return Promise.all(promises).then(function (results) {
        const finalArray = topFiveArr.map((item, i) => Object.assign({}, item, results[i]));
        return finalArray
    });
}

function topFive(body, callback) {
    const topFive = body.businesses
        .sort((a, b) => {
            if (b.rating > a.rating) return 1;
            if (a.rating > b.rating) return -1;
            if (b.review_count > a.review_count) return 1;
            if (a.review_count > b.review_count) return -1;
        })
        .slice(0, 5)

    callback(topFive);
}

app.listen(3000, () => {
    console.log("Server is up and running.")
})
