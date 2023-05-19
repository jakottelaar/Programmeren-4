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

  it.only("TC-301-1 Verplicht veld ontbreekt", (done) => {
    const mealData = {
      // Missing required field(s)
      // Add other necessary fields as needed
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
          expect(res.body).to.have.property("status").to.equal(400);
          expect(res.body)
            .to.have.property("message")
            .to.equal(`"name" is required`);
          expect(res.body).to.have.property("data");

          const { data, message } = res.body;

          expect(data).to.be.an("object");

          done();
        }
      });
  });

  it.only("TC-301-3 Maaltijd succesvol toegevoegd", (done) => {
    const meal = {
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
      .send(meal)
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
            .to.equal("Meal created successfully");
          expect(res.body).to.have.property("data");
          const { data } = res.body;
          expect(data).to.be.an("object");
          expect(data).to.have.property("id");
          expect(data).to.have.property("isActive").to.equal(true);
          expect(data).to.have.property("isVega").to.equal(false);
          expect(data).to.have.property("isVegan").to.equal(false);
          expect(data).to.have.property("isToTakeHome").to.equal(false);
          expect(data).to.have.property("dateTime");
          expect(data).to.have.property("maxAmountOfParticipants").to.equal(20);
          expect(data).to.have.property("price").to.equal("10.99");
          expect(data)
            .to.have.property("imageUrl")
            .to.equal("https://example.com/meal-image.jpg");
          expect(data).to.have.property("cookId").to.equal(userId); // Assuming userId is the ID of the cook
          expect(data).to.have.property("createDate");
          expect(data).to.have.property("updateDate");
          expect(data).to.have.property("name").to.equal("Delicious Meal");
          expect(data)
            .to.have.property("description")
            .to.equal("A tasty and nutritious meal");
          expect(data).to.have.property("allergenes").to.equal("gluten");

          mealId = data.id;

          done();
        }
      });
  });
});

describe("UC-301 Toevoegen van maaltijd", function () {
  it.only("TC-305-4 Maaltijd succesvol verwijderd", (done) => {
    chai
      .request(server)
      .delete(`/api/meal/${mealId}`)
      .end((err, res) => {
        if (err) {
          logger.error(err);
          done();
        } else {
          logger.info(res.body);
          expect(res.body).to.be.an("object");
          expect(res.body).to.have.property("status").to.equal(200);
          expect(res.body)
            .to.have.property("message")
            .to.equal(`Maaltijd met ID ${mealId} is verwijderd`);
          expect(res.body).to.have.property("data");

          const { data, message } = res.body;

          expect(data).to.be.an("object");

          done();
        }
      });
  });
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
});
