const express = require("express");
const app = express();

const port = 3000;

app.use(express.json()); // This middleware is necessary to parse JSON data in the request body

// Hard-coded registration data
const users = [
  {
    id: 0,
    firstName: "Jarno",
    lastName: "Kottelaar",
    email: "jarno@gmail.com",
    street: "Teststreet 123",
    city: "TestCity",
    isActive: true,
    emailAddress: "jarno@mail.com",
    password: "password123",
    phoneNumber: "06 123456789",
  },
  {
    id: 0,
    firstName: "John",
    lastName: "Guy",
    street: "Teststreet 456",
    city: "TestCity",
    isActive: true,
    emailAddress: "j.doe@server.com",
    password: "secret",
    phoneNumber: "06 987654321",
  },
];

// POST route for registering a new user
app.post("/api/register", (req, res) => {
  // You can extract the user details from the request body like this
  const { name, email, password } = req.body;

  // Create a new user object with the details
  const newUser = { name, email, password };

  // Add the new user to the array of users
  users.push(newUser);

  // Send a response back to the client
  res.status(201).json({
    message: "User registered successfully",
    user: newUser,
  });
});

app.get("/api/user", (req, res) => {
  const { field1, field2 } = req.query;
  let filteredUsers = users;

  if (field1 || field2) {
    filteredUsers = users.filter((user) => {
      if (field1 && field1 !== "" && field2 && field2 !== "") {
        return user.name === field1 && user.email === field2;
      } else if (field1 && field1 !== "") {
        return user.name === field1;
      } else if (field2 && field2 !== "") {
        return user.email === field2;
      }
    });
  }

  res.json(filteredUsers);
});

app.get("/api/user/profile", (req, res) => {
  const testuser = users[0];

  res.json(testuser);
});

app.get("/api/user/:userid", (req, res) => {
  const testuserId = req.params.userid;

  res.json(users[testuserId]);
});

app.put("/api/user/:userid", (req, res) => {
  res.send("PUT request called for changing account info");
});

app.delete("/api/users/:userid");

// GET route for retrieving all registered users
app.get("/api/user", (req, res) => {
  // Send the array of users as a JSON response
  res.json(users);
});

// Start the server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
