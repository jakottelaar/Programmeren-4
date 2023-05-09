const assert = require("assert");
const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../app");
const exp = require("constants");
let userId = 0;

chai.use(chaiHttp);
const expect = chai.expect;

describe("UC-201 Registreren als een nieuwe gebruiker", () => {
  it("TC-201-5 User succesvol geregistreer", (done) => {
    const newUser = {
      firstName: "Test",
      lastName: "Testter",
      street: "123 Test St",
      city: "Test city",
      email: "test7@mail.com",
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
        let { status, message, data } = res.body;

        expect(status).to.equal(200);
        expect(message)
          .to.be.a("string")
          .that.contains("User created successfully.");
        expect(data).to.be.an("object");

        userId = data.insertId;
        console.log(userId);

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
        let { status, message, data } = res.body;

        expect(status).to.equal(200);
        expect(message).to.contain("user: get all users endpoint");
        expect(data)
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
        expect(user).to.be.an("null");

        done();
      });
  });
});

describe("UC-204 Opvragen van usergegevens bij ID", () => {
  it("TC-204-3 Gebruiker-ID bestaat(De user met het gegeven id wordt geretourneerd)", (done) => {
    chai
      .request(server)
      .get(`/api/user/${2}`)
      .end((err, res) => {
        expect(err).to.be.null;

        console.log(res.body);
        expect(res.body).to.be.an("object");
        let { status, message, data } = res.body;

        expect(status).to.equal(200);
        expect(message).to.equal("User retrieved by id successfully.");
        expect(data).to.be.an("array");

        done();
      });
  });
});

describe("UC-206 Verwijderen van user", () => {
  it("TC-206-4 Gebruiker succesvol verwijderd", (done) => {
    chai
      .request(server)
      .delete(`/api/user/${userId}`)
      .end((err, res) => {
        expect(err).to.be.null;

        console.log(res.body);
        let { status, message } = res.body;

        expect(status).to.equal(200);
        expect(message).to.equal(`User deleted by id ${userId}`);
        done();
      });
  });
});