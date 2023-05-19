const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../app");
const { logger } = require("../../src/util/utils");

let mealId = 0;
let testToken = 0;
let testUserId = 0;

let test2Token = 0;
let testUserId2 = 0;

chai.use(chaiHttp);
const expect = chai.expect;

describe("UC-301 Toevoegen van maaltijd", function () {
  before((done) => {
    const testUser1 = {
      firstName: "mealTest",
      lastName: "mealTester",
      emailAddress: "t.estmanMeal@mail.com",
      password: "Password123",
      street: "123 Main St",
      city: "Anytown",
      phoneNumber: "0612345678",
    };

    chai
      .request(server)
      .post("/api/user")
      .send(testUser1)
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
              emailAddress: "t.estmanMeal@mail.com",
              password: "Password123",
            })
            .end((loginErr, loginRes) => {
              if (loginErr) {
                logger.error(loginErr);
                done(loginErr);
              } else {
                testToken = loginRes.body.data.token;
                logger.info(`Token created: ${testToken}`);
              }
            });
        }
      });

    const testUser2 = {
      firstName: "mealTest2",
      lastName: "mealTester2",
      emailAddress: "t.estmanMeal2@mail.com",
      password: "Password123",
      street: "123 Main St",
      city: "Anytown",
      phoneNumber: "0612345678",
    };

    chai
      .request(server)
      .post("/api/user")
      .send(testUser2)
      .end((err, res) => {
        if (err) {
          logger.error(err);
          done(err);
        } else {
          testUserId2 = res.body.data.id;

          chai
            .request(server)
            .post("/api/login")
            .send({
              emailAddress: "t.estmanMeal2@mail.com",
              password: "Password123",
            })
            .end((loginErr, loginRes) => {
              if (loginErr) {
                logger.error(loginErr);
                done(loginErr);
              } else {
                testToken2 = loginRes.body.data.token;
                logger.info(`Token created: ${testToken2}`);
                done();
              }
            });
        }
      });
  });

  it("TC-301-1 Verplicht veld ontbreekt", (done) => {
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

  it("TC-301-2 Niet ingelogd", (done) => {
    const mealData = {
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
      .send(mealData)
      .end((err, res) => {
        if (err) {
          logger.error(err);
          done();
        } else {
          logger.info(res.body);
          expect(res.body).to.be.an("object");
          expect(res.body).to.have.property("status").to.equal(401);
          expect(res.body)
            .to.have.property("message")
            .to.equal("Unauthorized: Missing or invalid token");
          expect(res.body).to.have.property("data").to.be.empty;

          done();
        }
      });
  });

  it("TC-301-3 Maaltijd succesvol toegevoegd", (done) => {
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

describe("UC-302 Wijzigen van maaltijdsgegevens", function () {
  it("TC-302-1 Verplicht velden 'name' en/of 'price' en/of 'maxAmountOfParticipants' ontbreken", (done) => {
    const updatedMeal = {
      description: "Updated meal description",
      price: 10.99,
      maxAmountOfParticipants: 20,
      imageUrl: "https://example.com/meal-image.jpg",
      allergenes: "gluten",
    };

    chai
      .request(server)
      .put(`/api/meal/${mealId}`)
      .set("Authorization", `Bearer ${testToken}`)
      .send(updatedMeal)
      .end((err, res) => {
        if (err) {
          logger.error(err);
          done();
        } else {
          logger.info(res.body);
          expect(res).to.have.status(400);
          expect(res.body).to.be.an("object");
          expect(res.body).to.have.property("status").to.equal(400);
          expect(res.body)
            .to.have.property("message")
            .to.equal("Invalid input");
          expect(res.body).to.have.property("data");
          expect(res.body.data)
            .to.have.property("error")
            .to.equal("Name is a required field");
          done();
        }
      });
  });

  it("TC-302-2 Niet ingelogd", (done) => {
    const updatedMeal = {
      name: "Delicious Meal",
      description: "Updated meal description",
      price: 10.99,
      maxAmountOfParticipants: 20,
      imageUrl: "https://example.com/meal-image.jpg",
      allergenes: "gluten",
    };
    chai
      .request(server)
      .put(`/api/meal/${mealId}`)
      .send(updatedMeal)
      .end((err, res) => {
        if (err) {
          logger.error(err);
          done();
        } else {
          logger.info(res.body);
          expect(res.body).to.be.an("object");
          expect(res.body).to.have.property("status").to.equal(401);
          expect(res.body)
            .to.have.property("message")
            .to.equal("Unauthorized: Missing or invalid token");
          expect(res.body).to.have.property("data").to.be.empty;
          done();
        }
      });
  });

  it("TC-302-3 Niet de eigenaar van de data", (done) => {
    const mealData = {
      name: "Delicious Meal",
      description: "A tasty and nutritious meal",
      price: 10.99,
      maxAmountOfParticipants: 20,
      imageUrl: "https://example.com/meal-image.jpg",
      allergenes: "gluten",
    };

    chai
      .request(server)
      .put(`/api/meal/${mealId}`)
      .set("Authorization", `Bearer ${testToken2}`)
      .send(mealData)
      .end((err, res) => {
        if (err) {
          logger.error(err);
          done();
        } else {
          logger.info(res.body);
          expect(res).to.have.status(403);
          expect(res.body).to.be.an("object");
          expect(res.body).to.have.property("status").to.equal(403);
          expect(res.body)
            .to.have.property("message")
            .to.equal(`Not authorized to update meal with ID ${mealId}`);
          done();
        }
      });
  });

  it("TC-302-4 Maaltijd bestaat niet", (done) => {
    const nonExistentMealId = mealId + 1; // ID of a non-existent meal

    const mealData = {
      name: "Delicious Meal",
      description: "A tasty and nutritious meal",
      price: 10.99,
      maxAmountOfParticipants: 20,
      imageUrl: "https://example.com/meal-image.jpg",
      allergenes: "gluten",
    };

    chai
      .request(server)
      .put(`/api/meal/${nonExistentMealId}`)
      .set("Authorization", `Bearer ${testToken}`)
      .send(mealData)
      .end((err, res) => {
        expect(res.body).to.be.an("object");
        expect(res.body.status).to.equal(404);
        expect(res.body.message).to.equal(
          `No meal with ID ${nonExistentMealId} found`
        );
        expect(res.body.data).to.be.an("object").that.is.empty;

        done();
      });
  });

  it("TC-302-5 Maaltijd succesvol gewijzigd", (done) => {
    const updatedMeal = {
      name: "Updated Meal",
      description: "A tasty and nutritious meal",
      price: 10.99,
      maxAmountOfParticipants: 20,
      imageUrl: "https://example.com/meal-image.jpg",
      allergenes: "gluten",
    };

    chai
      .request(server)
      .put(`/api/meal/${mealId}`)
      .set("Authorization", `Bearer ${testToken}`)
      .send(updatedMeal)
      .end((err, res) => {
        expect(res.body).to.be.an("object");
        expect(res.body.status).to.equal(200);
        expect(res.body.message).to.equal("Updated meal");
        expect(res.body.data).to.be.an("object");

        done();
      });
  });
});

describe("UC-303 Opvragen van alle maaltijden", function () {
  it("TC-303-1 Lijst van maaltijden geretourneerd", (done) => {
    chai
      .request(server)
      .get("/api/meal")
      .set("Authorization", `Bearer ${testToken}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("status", 200);
        expect(res.body).to.have.property(
          "message",
          "Successfully fetched all meals."
        );
        expect(res.body).to.have.property("data").to.be.an("array");

        const data = res.body.data;

        // Check if each meal has the correct structure
        data.forEach((mealWithParticipants) => {
          expect(mealWithParticipants).to.be.an("object");
          expect(mealWithParticipants).to.have.property("meal");
          expect(mealWithParticipants).to.have.property("cook");
          expect(mealWithParticipants)
            .to.have.property("participants")
            .that.is.an("array");
        });

        done();
      });
  });
});

describe("UC-304 Verwijderen van maaltijde", function () {
  it("TC-305-4 Maaltijd succesvol verwijderd", (done) => {
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
    });

  chai
    .request(server)
    .delete(`/api/user/${testUserId2}`)
    .end((err, res) => {
      if (err) {
        logger.error(err);
      }
      done();
    });
});
