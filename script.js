const fs = require("fs");
const parse = require("csv-parse");
const sqlite3 = require("sqlite3").verbose();

/**
 * Parses a CSV file with format EmployeeID, ProjectID, DateFrom, DateTo
 * Loads the data into a SQLite in-memory db table
 * Performs a self join to return table in format EmployeeID1, EmployeeID2, ProjectID, DaysWorked
 * @param {File} inputFile CSV file to be parsed
 * @returns List of employees that worked on common project and how much time they worked together for
 */

function getEmployeeData(inputFile) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(inputFile)) {
      reject(error);
    }

    const db = new sqlite3.Database(":memory:", (error) => {
      if (error) {
        reject(error);
      }

      console.log("In-memory SQLite Database Connection Opened");
    });

    db.serialize(() => {
      db.run("DROP TABLE IF EXISTS Employees").run(
        "CREATE TABLE Employees(EmpID INTEGER, ProjectID INTEGER, DateFrom TEXT, DateTo TEXT)",
        function (error) {
          if (error) {
            reject(error);
          }
          console.log("Employees Table Created Successfully");
        }
      );

      db.serialize(() => {
        fs.createReadStream(inputFile)
          .pipe(
            parse({
              delimiter: ",",
            })
          )
          .on("data", function (csvrow) {
            db.serialize(() => {
              csvrow = csvrow.map((col) => col.trim());

              try {
                csvrow[2] = new Date(Date.parse(csvrow[2]))
                  .toISOString()
                  .split("T")[0];

                if (csvrow[3] === "NULL") {
                  csvrow[3] = new Date().toISOString().split("T")[0];
                } else {
                  csvrow[3] = new Date(Date.parse(csvrow[3]))
                    .toISOString()
                    .split("T")[0];
                }
              } catch (error) {}

              db.run(
                `INSERT INTO Employees(EmpID, ProjectID, DateFrom, DateTo) values(?, ?, ?, ?)`,
                csvrow,
                function (error) {
                  if (error) {
                    console.log(csvrow);
                    reject(error);
                  }
                }
              );
            });
          })
          .on("end", function () {
            /* e1.datefrom <= e2.dateto AND e1.dateto >= e2.datefrom AND */
            db.all(
              `SELECT 
                e1.empid AS EmpID1, 
                e2.empid AS EmpID2, 
                e1.projectid AS ProjectID,
                MAX(JULIANDAY(MIN(e1.dateto, e2.dateto)) - JULIANDAY(MAX(e1.datefrom, e2.datefrom)), 0) AS DaysWorked
              FROM employees AS e1 INNER JOIN employees AS e2 
              ON e1.projectid = e2.projectid AND 
                EmpID1 > EmpID2
              WHERE e1.empid != e2.empid
              ORDER BY DaysWorked DESC;`,
              [],

              (error, rows) => {
                if (error) {
                  console.log(error);
                  reject(error);
                }

                console.log("Table populated from file successfully");
                resolve(rows);
              }
            );
          })
          .on("error", function (error) {
            console.log(error);
            reject("Error parsing file");
          });
      });
    });
  });
}

async function main() {
  if (process.argv.length < 3) {
    console.log("Usage node Employees.ts [filename]");
    process.exit();
  }

  const filePath = process.argv[2];

  try {
    const results = await getEmployeeData(filePath, true);
    const map = {};
    const highest = {
      firstEmployeeId: -1,
      secondEmployeeId: -1,
      daysWorked: -1,
    };

    for (const row of results) {
      const mapKey = `${row.EmpID1}-${row.EmpID2}`;
      if (!map[mapKey]) {
        map[mapKey] = 0;
      }
      map[mapKey] += row.DaysWorked;
      if (map[mapKey] > highest.daysWorked) {
        highest.firstEmployeeId = row.EmpID1;
        highest.secondEmployeeId = row.EmpID2;
        highest.daysWorked = map[mapKey];
      }
    }

    console.log(highest);
    return highest;
  } catch (error) {
    console.log(error);
  }
}

if (require.main === module) {
  main();
}

exports.getEmployeeData = getEmployeeData;
