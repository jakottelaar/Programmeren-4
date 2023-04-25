const assert = require("assert");
const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../app");
const exp = require("constants");

chai.use(chaiHttp);
const expect = chai.expect;

describe("UC-201 Registreren als een nieuwe gebruiker", () => {
  it("TC-201-5 User succesvol geregistreer", (done) => {
    const newUser = {
      firstName: "Test",
      lastName: "Testter",
      street: "123 Test St",
      city: "Test city",
      email: "test@mail.com",
      password: "password123",
      phoneNumber: "1234567890",
    };

    chai
      .request(server)
      .post("/api/user")
      .send(newUser)
      .end((err, res) => {
        expect(err).to.be.null;

        console.log(res.body);
        expect(res.body).to.be.an("object");
        let { status, message, user } = res.body;

        expect(status).to.equal(200);
        expect(message)
          .to.be.a("string")
          .that.contains("User registered successfully");
        expect(user).to.be.an("object");

        done();
      });
  });
});

describe("UC-202 Opvragen van overzicht van users", () => {
  it("TC-202-1 Toon alle gebruikers (minimaal 2)", (done) => {
    chai
      .request(server)
      .get("/api/user")
      .timeout(5000)
      .end((err, res) => {
        expect(err).to.be.null;

        console.log(res.body);
        expect(res.body).to.be.an("object");
        let { status, result } = res.body;

        expect(status).to.equal(200);
        expect(result)
          .to.be.an("array")
          .and.to.satisfy((users) => {
            return users.every((user) => {
              return typeof user === "object";
            });
          });

        done();
      });
  });
});

describe("UC-203 Opvragen van gebruikersprofiel", () => {
  it("TC-203-2 Gebruiker is ingelogd met geldig token. (Niet getest op een token, er wordt alleen een fictief profiel geretouneerd)", (done) => {
    chai
      .request(server)
      .get("/api/user/profile")
      .end((err, res) => {
        expect(err).to.be.null;

        console.log(res.body);
        expect(res.body).to.be.an("object");
        let { status, message, user } = res.body;
        expect(status).to.equal(200);
        expect(message).to.equal(
          "GET Request for profile info is not yet implemented!"
        );
        expect(user).to.be.an("object");

        done();
      });
  });
});

describe("UC-204 Opvragen van usergegevens bij ID", () => {
  it("TC-204-3 Gebruiker-ID bestaat(De user met het gegeven id wordt geretourneerd)", (done) => {
    const testId = "0";

    chai
      .request(server)
      .get(`/api/user/${testId}`)
      .end((err, res) => {
        expect(err).to.be.null;

        console.log(res.body);
        expect(res.body).to.be.an("object");
        let { status, user } = res.body;

        expect(status).to.equal(200);
        expect(user).to.be.an("object");

        done();
      });
  });
});

describe("UC-206 Verwijderen van user", () => {
  it("TC-206-4 Gebruiker succesvol verwijderd", (done) => {
    const testId = 1;

    chai
      .request(server)
      .delete(`/api/user/${testId}`)
      .end((err, res) => {
        expect(err).to.be.null;

        console.log(res.body);
        let { status, message } = res.body;

        expect(status).to.equal(200);
        expect(message).to.equal(`Deleted users by id ${testId}`);

        done();
      });
  });
});
