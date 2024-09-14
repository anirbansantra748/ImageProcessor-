const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");

// Path to your CSV file
const csvFilePath = path.join(__dirname, "controllers", "data", "train.csv");

// Function to process the CSV file and extract the image links
async function processCSV() {
  const links = [];

  // Read the CSV file
  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on("data", (row) => {
      // Extract the image link
      const imageUrl = row["image_link"];
      // Push the link to the array
      links.push(imageUrl);
    })
    .on("end", () => {
      // Once CSV is processed, log the links or write them to a file
      console.log("CSV file successfully processed. Image links stored.");

      // Option 1: Store the links in a text file
      fs.writeFileSync("image_links.txt", links.join("\n"), "utf-8");

      // Option 2: Just log the list of image URLs to the console
      // console.log(links);
    });
}

// Call the function to process the CSV file
// processCSV(); //work done
