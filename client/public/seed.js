const mongoose = require("mongoose");
const Content = require("./models/content.model"); // Adjust the path as necessary

const seedData = [
  {
    name: "Exercise 1",
    description: "Description for exercise 1.",
    image: "https://example.com/image1.jpg", // Replace with a valid image URL
  },
  {
    name: "Exercise 2",
    description: "Description for exercise 2.",
    image: "https://example.com/image2.jpg", // Replace with a valid image URL
  },
  {
    name: "Exercise 3",
    description: "Description for exercise 3.",
    image: "https://example.com/image3.jpg", // Replace with a valid image URL
  },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect("YOUR_MONGODB _URI", { useNewUrlParser: true, useUnifiedTopology: true }); // Replace with your MongoDB URI
    await Content.deleteMany(); // Clear existing data
    await Content.insertMany(seedData); // Insert the temporary data
    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error.message);
  } finally {
    mongoose.connection.close(); // Close the connection
  }
};

seedDatabase();