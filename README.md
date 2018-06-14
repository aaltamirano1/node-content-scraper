This node.js program  visits the website http://shirts4mike.com and uses http://shirts4mike.com/shirts.php as single entry point to scrape information for 8 tee-shirts from the site. Details for each tshirt are gathered and saved to a CSV file include the t-shirt's Title, Price, ImageURL, URL as well as the time the information was gathered. The time is in Coordinated Universal Time. The CSV file is saved to a 'data' folder and named for the day it was gathered. If no data folder exists, one is created. The program uses the npm packages Fast-CSV to create the file and Cheerio which lets you use syntax similar to jQeury from within node to scrape the data.

## Getting Started
* run npm install
* run npm start