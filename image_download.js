const fs = require("fs");
const csv = require("csv-parser");
const axios = require("axios");
const path = require("path");

// Paths
const csvFilePath = path.join(__dirname, "controllers", "data", "train.csv");
const imageDirectory = path.join(__dirname, "images");
const linksFilePath = path.join(__dirname, "image_link.txt");

// Create the images directory if it doesn't exist
if (!fs.existsSync(imageDirectory)) {
  fs.mkdirSync(imageDirectory);
}

// Function to extract links from the CSV file and store in image_link.txt
async function extractLinks() {
  const links = [];

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on("data", (row) => {
      const imageUrl = row["image_link"];
      if (imageUrl) {
        links.push(imageUrl);
      }
    })
    .on("end", () => {
      // Write links to the image_link.txt file
      fs.writeFileSync(linksFilePath, links.join("\n"), "utf8");
      console.log(
        `Successfully extracted ${links.length} links and saved to image_link.txt`
      );
    });
}

// Function to download an image from a URL
async function downloadImage(url, index) {
  const filename = `${index}.jpg`;
  const filePath = path.join(imageDirectory, filename);
  const writer = fs.createWriteStream(filePath);

  try {
    const response = await axios({
      url,
      method: "GET",
      responseType: "stream",
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", () => {
        console.log(`Image downloaded: ${filename}`);
        resolve();
      });
      writer.on("error", (error) => {
        console.error(`Error writing the file: ${filename}`, error.message);
        reject(error);
      });
    });
  } catch (error) {
    console.error(`Error downloading ${url}:`, error.message);
  }
}

// Function to read links from image_link.txt and download a limited number of images
async function downloadImagesFromLinks() {
  const links = fs.readFileSync(linksFilePath, "utf8").split("\n");

  // Limit to 150 images (adjust this number as needed)
  const limit = 150;
  const limitedLinks = links.slice(0, limit);

  console.log(`Starting download of ${limitedLinks.length} images...`);

  for (let i = 0; i < limitedLinks.length; i++) {
    const imageUrl = limitedLinks[i].trim();
    if (imageUrl) {
      await downloadImage(imageUrl, i + 1); // Use index for filename
    }
  }

  console.log("Downloads completed.");
}

// Expose the functions for you to run when needed

module.exports = {
  extractLinks, // Function to extract links from CSV and save to image_link.txt
  downloadImagesFromLinks, // Function to download images from the image_link.txt file
};
