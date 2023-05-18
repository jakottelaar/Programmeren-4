const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../app");
const { logger } = require("../../src/util/utils");
const { after } = require("mocha");

let testEmailAddress = "";
let testPassword = "";
let testUserId = 0;

chai.use(chaiHttp);
const expect = chai.expect;

describe("UC-101 inloggen", function () {
  before((done) => {
    chai
      .request(server)
      .post("/api/user")
      .send({
        firstName: "Test",
        lastName: "Tester",
        emailAddress: "t.estman@mail.com",
        password: "Password123",
        street: "123 Main St",
        city: "Anytown",
        phoneNumber: "0612345678",
      })
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
            .to.equal("User created successfully.");
          expect(res.body).to.have.property("data");

          const { data } = res.body;
          expect(data).to.be.an("object");

          testEmailAddress = data.emailAddress;
          testPassword = data.password;
          testUserId = data.id;

          done();
        }
      });
  });

  it("TC-101-1 Verplicht veld ontbreekt", (done) => {
    chai
      .request(server)
      .post("/api/login")
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
            .to.equal("Email address is required");
          expect(res.body).to.have.property("data");

          const { data, message } = res.body;

          expect(data).to.be.an("object");

          done();
        }
      });
  });

  it("TC-101-2 Niet-valide wachtwoord", (done) => {
    chai
      .request(server)
      .post("/api/login")
      .send({
        emailAddress: testEmailAddress,
        password: "invalidpassword",
      })
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
            .to.equal("Invalid password");
          expect(res.body).to.have.property("data");

          const { data, message } = res.body;

          expect(data).to.be.an("object");

          done();
        }
      });
  });

  it("TC-101-3 Gebruiker bestaat niet", (done) => {
    chai
      .request(server)
      .post("/api/login")
      .send({
        emailAddress: "nonexistentuser@example.com",
        password: "password123",
      })
      .end((err, res) => {
        if (err) {
          logger.error(err);
          done();
        } else {
          logger.info(res.body);
          expect(res.body).to.be.an("object");
          expect(res.body).to.have.property("status").to.equal(404);
          expect(res.body)
            .to.have.property("message")
            .to.equal("User not found");
          expect(res.body).to.have.property("data");

          const { data, message } = res.body;

          expect(data).to.be.an("object");

          done();
        }
      });
  });

  it("TC-101-4 Gebruiker succesvol ingelogd", (done) => {
    chai
      .request(server)
      .post("/api/login")
      .send({
        emailAddress: testEmailAddress,
        password: testPassword,
      })
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
            .to.equal("Login successful");
          expect(res.body).to.have.property("data");

          const { data, message } = res.body;

          expect(data).to.be.an("object");
          expect(data).to.have.property("results");
          expect(data).to.have.property("token");

          done();
        }
      });
  });

  after((done) => {
    chai
      .request(server)
      .delete(`/api/user/${testUserId}`)
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
            .to.equal(`User met ID ${testUserId} is verwijderd`);

          done();
        }
      });
  });
});
