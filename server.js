'use strict'

const port = process.env.PORT
require('dotenv').config();
const express = require("express")
const cors = require('cors')
const methodOverride = require("method-override")
const ejs = require("ejs")
const superagent = require("superagent")
const pg = require("pg")
const app = express()



app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('./public'));
app.set('view engine', 'ejs');
//const client = new pg.Client(process.env.DATABASE_URL);
const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });


app.get("/", home)
app.get("/allCountries", allCountries)

app.get("/myRecords", myRecords)

app.post("/", getCountryResult)
app.post("/myRecords", saveRecords)

app.delete("/myRecords", deleteRecord)


function Country(val) {
    this.country = val.Country
    this.totalConfirmed = val.TotalConfirmed
    this.totalDeaths = val.TotalDeaths
    this.totalRecovered = val.TotalRecovered
    this.date = val.Date

}

function home(req, res, next) {
    let url = `https://api.covid19api.com/world/total`
    superagent.get(url).then((result) => {
        res.render("pages/index.ejs", { totals: [result.body] })
    })
}
function allCountries(req, res, next) {

    let url = `https://api.covid19api.com/summary`

    superagent.get(url).then((result) => {

        let countriesData = result.body.Countries.map(val =>
            new Country(val)
        )


        res.render("pages/allCountries.ejs", { countries: countriesData })
    })

}

function myRecords(req, res, next) {
    let sql = `select * from myRecords`

    client.query(sql).then(result => {

        res.render("pages/myRecords.ejs", { countries: result.rows })
    })


}


function saveRecords(req, res, next) {
    let { country, totalConfirmed, totalDeaths, totalRecovered, date } = req.body
    let sql = `insert into myRecords(country,total_confirmed_cases,total_deaths_cases,total_recovered_cases,the_date) values($1,$2,$3,$4,$5)`
    let safe = [country, totalConfirmed, totalDeaths, totalRecovered, date]
    console.log(safe)
    client.query(sql, safe)
    res.redirect("/myRecords")

}

function deleteRecord(req, res, next) {
    let id = req.body.id
    let query = `delete from myRecords where id=$1`
    let safe = [id]
    client.query(query, safe)
    res.redirect("/myRecords")
}

function getCountryResult(req, res, next) {
    let { country, startDate, endDate } = req.body
    let url = `https://api.covid19api.com/country/${country}/status/confirmed?from=${startDate}&to=${endDate}`
    superagent.get(url).then((result) => {

        let countriesData = result.body.Countries.map(val =>
            new Country(val)
        )


        res.render("pages/getCountryResult.ejs", { countries: countriesData })
    })

}

client.connect().then(() => {
    app.listen(port || 3000)
    console.log(`http://localhost:${port}`)

})