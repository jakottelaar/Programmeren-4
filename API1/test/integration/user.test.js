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
        let { status, message } = res.body;

        expect(status).to.equal(200);
        expect(message).to.be.a("string").that.contains("registered");

        done();
      });
  });
});

describe("UC-202 Opvragen van overzicht van users", () => {
  it("TC-202-1 Toon alle gebruikers (minimaal 2)", (done) => {
    chai
      .request(server)
      .get("/api/user")
      .end((err, res) => {
        expect(err).to.be.null;

        console.log(res.body);
        expect(res.body).to.be.an("array");
        let { status, result } = res.body;

        expect(res.status).to.equal(200);

        done();
      });
  });
});
