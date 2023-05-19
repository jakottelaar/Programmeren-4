const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../app");
const { logger } = require("../../src/util/utils");

let mealId = 0;
let testToken = 0;
let testUserId = 0;

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
          done(err);
        } else {
          testUserId = res.body.data.id;

          chai
            .request(server)
            .post("/api/login")
            .send({
              emailAddress: "t.estman@mail.com",
              password: "Password123",
            })
            .end((loginErr, loginRes) => {
              if (loginErr) {
                logger.error(loginErr);
                done(loginErr);
              } else {
                testToken = loginRes.body.data.token;
                logger.info(`Token created: ${testToken}`);
                done();
              }
            });
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
      .set("userid", testUserId)
      .set("Authorization", `Bearer ${testToken}`)
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
      .set("userid", testUserId)
      .set("Authorization", `Bearer ${testToken}`)
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
          expect(data).to.have.property("cookId").to.equal(testUserId); // AssumingtestUserId is the ID of the cook
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

describe("UC-304 Verwijderen van maaltijde", function () {
  it.only("TC-305-4 Maaltijd succesvol verwijderd", (done) => {
    chai
      .request(server)
      .delete(`/api/meal/${mealId}`)
      .set("Authorization", `Bearer ${testToken}`)
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
});

after((done) => {
  chai
    .request(server)
    .delete(`/api/user/${testUserId}`)
    .end((err, res) => {
      if (err) {
        logger.error(err);
      }
      done();
    });
});
