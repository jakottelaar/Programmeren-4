const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../app");
const { logger } = require("../../src/util/utils");

let mealId = 0;

chai.use(chaiHttp);
const expect = chai.expect;

describe("UC-301 Toevoegen van maaltijd", function () {
  before((done) => {
    const userData = {
      firstName: "Test",
      lastName: "Tester",
      emailAddress: "t.estman@mail.com",
      password: "Password123",
      street: "123 Main St",
      city: "Anytown",
      phoneNumber: "0612345678",
    };

    chai
      .request(server)
      .post("/api/user")
      .send(userData)
      .end((err, res) => {
        if (err) {
          logger.error(err);
          done();
        } else {
          userId = res.body.data.id; // Store the created user's ID for later use
          done();
        }
      });
  });

  // Delete the user after the test case
  after((done) => {
    chai
      .request(server)
      .delete(`/api/user/${userId}`)
      .end((err, res) => {
        if (err) {
          logger.error(err);
        }
        done();
      });
  });

  it.only("TC-301-1 Verplicht veld ontbreekt", (done) => {
    const mealData = {
      // Missing required field(s)
      // Add other necessary fields as needed
      name: "Delicious Meal",
      description: "A tasty and nutritious meal",
      price: 10.99,
      maxAmountOfParticipants: 20,
      imageUrl: "https://example.com/meal-image.jpg",
      allergenes: "gluten",
    };

    chai
      .request(server)
      .post("/api/meal")
      .set("userid", userId)
      .send(mealData)
      .end((err, res) => {
        if (err) {
          logger.error(err);
          done();
        } else {
          logger.info(res.body);
          expect(res.body).to.be.an("object");
          expect(res.body).to.have.property("status").to.equal(201);
          expect(res.body)
            .to.have.property("message")
            .to.equal("Missing required field(s)");
          expect(res.body).to.have.property("data");

          const { data, message } = res.body;

          expect(data).to.be.an("object");

          mealId = data.id;

          done();
        }
      });
  });
});
