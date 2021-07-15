export {}
import * as fs from 'fs'


function randomNumber(number = 20) {
    return Math.floor(Math.random() * number);
}

function randomDate(start = new Date(2018, 0, 1), end = new Date()) {
    return  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function dateToISO(date) {
    return date.toISOString().split('T')[0];
}

function genRandomData(rows = 100) {
    [...Array(rows)].forEach(function() {

        const employeeId = randomNumber();
        const projectId = randomNumber();

        const dateFrom = randomDate();
        const dateTo = Math.random() > 0.8 ? 'NULL' : dateToISO(randomDate(dateFrom));

        const csvLine = `${employeeId}, ${projectId}, ${dateToISO(dateFrom)}, ${dateTo}\n`
        fs.appendFile('test.csv', csvLine, function(error) {
            if (error) console.log(error);
        })
    })
}


genRandomData();