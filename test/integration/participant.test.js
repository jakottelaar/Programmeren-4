const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../app");
const { logger } = require("../../src/util/utils");

chai.use(chaiHttp);
const expect = chai.expect;

let testMealId = 0;
let testToken = 0;
let testUserId = 0;

let testToken2 = 0;
let testUserId2 = 0;

describe("UC-401 Aanmelden voor maaltijd", () => {
  before((done) => {
    const testUser1 = {
      firstName: "participateTest",
      lastName: "participateTester",
      emailAddress: "t.estmanParticipate@mail.com",
      password: "Password123",
      street: "123 Main St",
      city: "Anytown",
      phoneNumber: "0612345678",
    };

    const testUser2 = {
      firstName: "participateTest2",
      lastName: "participateTester2",
      emailAddress: "t.estmanParticipate2@mail.com",
      password: "Password123",
      street: "456 Oak Ave",
      city: "Newtown",
      phoneNumber: "0676543210",
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
          logger.info(`Participate test user created with id ${testUserId}`);

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
                logger.info(`Second test user created with id ${testUserId2}`);

                chai
                  .request(server)
                  .post("/api/login")
                  .send({
                    emailAddress: "t.estmanParticipate@mail.com",
                    password: "Password123",
                  })
                  .end((loginErr, loginRes) => {
                    if (loginErr) {
                      logger.error(loginErr);
                      done(loginErr);
                    } else {
                      logger.info(loginRes.body);
                      testToken = loginRes.body.data.token;
                      logger.info(`Token created: ${testToken}`);

                      chai
                        .request(server)
                        .post("/api/login")
                        .send({
                          emailAddress: "t.estmanParticipate2@mail.com",
                          password: "Password123",
                        })
                        .end((loginErr, loginRes) => {
                          if (loginErr) {
                            logger.error(loginErr);
                            done(loginErr);
                          } else {
                            testToken2 = loginRes.body.data.token;
                            logger.info(`Second token created: ${testToken2}`);

                            // Create a test meal
                            const testMeal = {
                              name: "Test Meal",
                              description: "A delicious test meal",
                              price: 9.99,
                              maxAmountOfParticipants: 10,
                              imageUrl: "https://example.com/test-meal.jpg",
                              allergenes: "gluten",
                            };

                            chai
                              .request(server)
                              .post("/api/meal")
                              .set("Authorization", `Bearer ${testToken}`)
                              .send(testMeal)
                              .end((mealErr, mealRes) => {
                                if (mealErr) {
                                  logger.error(mealErr);
                                  done(mealErr);
                                } else {
                                  testMealId = mealRes.body.data.id;
                                  logger.info(
                                    `Test meal created with ID: ${testMealId}`
                                  );
                                  done();
                                }
                              });
                          }
                        });
                    }
                  });
              }
            });
        }
      });
  });

  it.only("TC-401-1 Niet ingelogd", (done) => {
    chai
      .request(server)
      .post(`/api/meal/${testMealId}/participate`)
      .end((err, res) => {
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("status").to.equal(401);
        expect(res.body)
          .to.have.property("message")
          .to.equal("Unauthorized: Missing or invalid token");
        expect(res.body).to.have.property("data").to.be.empty;

        done();
      });
  });

  it.only("TC-401-2 Maaltijd bestaat niet", (done) => {
    const nonExistentMealId = testMealId + 1; // ID of a non-existent meal

    chai
      .request(server)
      .post(`/api/meal/${nonExistentMealId}/participate`)
      .set("Authorization", `Bearer ${testToken}`)
      .end((err, res) => {
        if (err) {
          logger.error(err);
        } else {
          logger.info(res.body);
          expect(res.body).to.be.an("object");
          expect(res.body.status).to.equal(404);
          expect(res.body.message).to.equal(
            `No meal with ID ${nonExistentMealId} found`
          );
          expect(res.body.data).to.be.an("object").that.is.empty;

          done();
        }
      });
  });

  it.only("TC-401-3 Succesvol aangemeld", (done) => {
    chai
      .request(server)
      .post(`/api/meal/${testMealId}/participate`)
      .set("Authorization", `Bearer ${testToken}`)
      .end((err, res) => {
        if (err) {
          logger.error(err);
        } else {
          logger.info(res.body);
          expect(res.body).to.be.an("object");
          expect(res.body).to.have.property("status").to.equal(200);
          expect(res.body)
            .to.have.property("message")
            .to.equal(
              `User with ID ${testUserId} has been signed up for meal with ID ${testMealId}`
            );
          expect(res.body).to.have.property("data").to.be.an("object").that.is
            .not.empty;

          done();
        }
      });
  });
});

describe("UC-402 Afmelden voor maaltijd", (done) => {
  it.only("TC-402-1 Niet ingelogd", (done) => {
    chai
      .request(server)
      .post(`/api/meal/${testMealId}/participate`)
      .end((err, res) => {
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("status").to.equal(401);
        expect(res.body)
          .to.have.property("message")
          .to.equal("Unauthorized: Missing or invalid token");
        expect(res.body).to.have.property("data").to.be.empty;

        done();
      });
  });

  it.only("TC-402-2 Maaltijd bestaat niet", (done) => {
    const nonExistentMealId = testMealId + 1;

    chai
      .request(server)
      .post(`/api/meal/${nonExistentMealId}/participate`)
      .set("Authorization", `Bearer ${testToken}`)
      .end((err, res) => {
        if (err) {
          logger.error(err);
        } else {
          logger.info(res.body);
          expect(res.body).to.be.an("object");
          expect(res.body.status).to.equal(404);
          expect(res.body.message).to.equal(
            `No meal with ID ${nonExistentMealId} found`
          );
          expect(res.body.data).to.be.an("object").that.is.empty;

          done();
        }
      });
  });

  it.only("TC-402-3 Aanmelding bestaat niet", (done) => {
    logger.info(`Participate for meal with id ${testMealId}`);
    chai
      .request(server)
      .delete(`/api/meal/${testMealId}/participate`)
      .set("Authorization", `Bearer ${testToken2}`)
      .end((err, res) => {
        if (err) {
          logger.error(err);
        } else {
          logger.info(res.body);
          expect(res.body).to.be.an("object");
          expect(res.body.status).to.equal(404);
          expect(res.body.message).to.equal(
            `No participation for user with ID ${testUserId2} found for meal ${testMealId}`
          );
          expect(res.body.data).to.be.an("object").that.is.empty;

          done();
        }
      });
  });

  it("TC-402-4 should successfully cancel registration for a meal", (done) => {
    chai
      .request(server)
      .delete(`/api/participate/${testMealId}`)
      .set("Authorization", `Bearer ${testToken}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("status", 200);
        expect(res.body)
          .to.have.property("message")
          .equal(
            `User with ID ${testUserId} has been unregistered for meal with ID ${testMealId}`
          );
        expect(res.body.data).to.deep.equal({});
        done();
      });
  });
});

after((done) => {
  chai
    .request(server)
    .delete(`/api/meal/${testMealId}`)
    .set("Authorization", `Bearer ${testToken}`)
    .end((mealErr, mealRes) => {
      if (mealErr) {
        logger.error(mealErr);
      }

      chai
        .request(server)
        .delete(`/api/user/${testUserId}`)
        .end((userErr, userRes) => {
          if (userErr) {
            logger.error(userErr);
          }

          chai
            .request(server)
            .delete(`/api/user/${testUserId2}`)
            .end((userErr2, userRes2) => {
              if (userErr2) {
                logger.error(userErr2);
              }

              done();
            });
        });
    });
});
