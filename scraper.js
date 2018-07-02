var fs = require('fs');

// npm package to build csv file.
var csv = require('fast-csv');

// check for a folder called ‘data’.
if (!fs.existsSync('./data')) {
  // if there is no data folder, create one.
  fs.mkdirSync('data');
}

const rp = require('request-promise');

// npm package to help with scraping. lets you use syntax similar to jQeury from within node.
const cheerio = require('cheerio');

let links = [];
// in csv file column headers are in this order: Price, Title, ImageURL, URL, Time
let table = [["Price", "Title", "Image URL", "URL", "Time"]];

// visit http://shirts4mike.com and uses http://shirts4mike.com/shirts.php as single entry point to scrape information
const options = {
  url: `http://shirts4mike.com/shirts.php`,
  json: true
}

rp(options)
  // scrape information for 8 tee-shirts from the site, without using any hard-coded urls
  .then((html) => {
    let $ = cheerio.load(html);
    // urls are gathered and pushed into links array.
    $('.products a').each(function(i, anchor){
      links.push($(this).attr('href'));
    });
    
    // get the price, title, url and image url from the product page
    getShirtDetails();
  })
  .catch((err) => {
    // log a human-friendly error (not just the original error code) when it cannot connect to http://shirts4mike.com
    if(err.response.statusCode===404){
      console.log("There’s been a 404 error. Cannot connect to shirts4mike.com.");
      
    }else{
      var errorMsg = "There’s been a "+ err.response.statusCode +" error. "+err.response.statusMessage;
      console.log(errorMsg);
    }
  });

function getShirtDetails(){
  var i = 0;
  function next(){
    if(i<links.length){
      const url = `http://shirts4mike.com/` + links[i];
      var options = {
      url: url,
      transform: body => cheerio.load(body)
      }
      rp(options)
        .then(function($){
          // get the price, title, url and image url from the product page
          const title = $('.shirt-picture img').attr('alt');
          const price = $('.price').html();
          const imgUrl = `http://shirts4mike.com/` + $('.shirt-picture img').attr('src');
          const d = new Date();
          const time = d.getHours() +':'+ d.getMinutes() +':'+ d.getSeconds();
          // in csv file column headers are in this order: Price, Title, ImageURL, URL, Time
          table.push([price, title, url, imgUrl, time]);
          ++i;
          // keep running this function.
          return next();
        })
    } else {
      // once you ran through entire links array, print shirts' details in a csv file.
      saveData();
    }
  }
  return next();
};


saveData = () =>{
  // shirt details stored in an CSV file that is named for the date it was created, e.g. 2016-11-21.csv
  const d = new Date();
  const date = d.getFullYear() +'-'+ (d.getMonth()+1) +'-'+ d.getDate();
  // if the script is run twice, the program overwrites the data and the file contains the data from the second call.
  // this is because the file is written again with the same name.
  // the CSV file should be saved inside the ‘data’ folder.
  var ws = fs.createWriteStream('./data/'+date+'.csv');
  csv.
    write(table, {headers:true})
    .pipe(ws);
}