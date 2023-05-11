const assert = require("assert");
const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../app");
const exp = require("constants");
let userId = 0; //This userId will get the id assignment from the first create user test and use it throughout all the tests up and until it's deleted;

chai.use(chaiHttp);
const expect = chai.expect;

describe("UC-201 Registreren als een nieuwe gebruiker", () => {
  it("TC-201-1 Verplicht veld ontbreekt", (done) => {
    const requestBody = {
      firstName: "",
      lastName: "Testter",
      street: "123 Test St",
      city: "Test city",
      emailAddress: "t.estman@mail.com",
      password: "Password123",
      phoneNumber: "0612345678",
    };

    chai
      .request(server)
      .post("/api/user")
      .send(requestBody)
      .end((err, res) => {
        console.log(res.body);
        expect(err).to.be.null;
        let { status, message } = res.body;

        expect(status).to.equal(400);
        expect(res.body).to.be.an("object");
        expect(message)
          .to.be.a("string")
          .that.contains('"firstName" is not allowed to be empty');

        done();
      });
  });

  it("TC-201-5 User succesvol geregistreer", (done) => {
    const newUser = {
      firstName: "Test",
      lastName: "Testter",
      street: "123 Test St",
      city: "Test city",
      emailAddress: "t.estman@mail.com",
      password: "Password123",
      phoneNumber: "0612345678",
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

        userId = data.id;
        console.log(data.id);

        done();
      });
  });

  it("TC-201-4 gebruiker bestaat al", (done) => {
    const existingUser = {
      firstName: "Test",
      lastName: "Testter",
      street: "123 Test St",
      city: "Test city",
      emailAddress: "t.estman@mail.com",
      password: "Password123",
      phoneNumber: "0612345678",
    };

    chai
      .request(server)
      .post("/api/user")
      .send(existingUser)
      .end((err, res) => {
        console.log(res.body);
        expect(err).to.be.null;
        let { status, message } = res.body;

        expect(status).to.equal(403);
        expect(res.body).to.be.an("object");
        expect(message).to.be.a("string").that.contains("Email already exists");

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
  it("TC-204-2 Gebruiker-ID bestaat niet", (done) => {
    const invalidUserId = userId + 1;

    chai
      .request(server)
      .get(`/api/user/${invalidUserId}`)
      .end((err, res) => {
        expect(err).to.be.null;
        let { status, message } = res.body;

        expect(status).to.equal(404);
        expect(res.body).to.be.an("object");
        expect(message).to.equal(`No user with ID ${invalidUserId}`);

        done();
      });
  });

  it("TC-204-3 Gebruiker-ID bestaat(De user met het gegeven id wordt geretourneerd)", (done) => {
    chai
      .request(server)
      .get(`/api/user/${userId}`)
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

describe("UC-205 Gebruiker wijzingen", () => {
  it("TC-205-1 Verplicht veld 'emailAddress' ontbreekt", (done) => {
    const newUser = {
      firstName: "Test",
      lastName: "Testter",
      street: "123 Test St",
      city: "Test city",
      password: "Password123",
      phoneNumber: "0612345678",
    };

    chai
      .request(server)
      .post("/api/user")
      .send(newUser)
      .end((err, res) => {
        expect(err).to.be.null;
        let { status, message } = res.body;
        console.log(res.body);

        expect(status).to.equal(400);
        expect(res.body).to.be.an("object");
        expect(message).to.equal('"emailAddress" is required');

        done();
      });
  });

  it("TC-205-4 Gebruiker bestaat niet", (done) => {
    const nonExistentUserId = userId + 1;
    chai
      .request(server)
      .put(`/api/user/${nonExistentUserId}`)
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
        let { status, message } = res.body;
        console.log(res.body);

        expect(status).to.equal(404);
        expect(res.body).to.be.an("object");
        expect(message).to.equal(`No user with ID ${nonExistentUserId}`);

        done();
      });
  });

  it("TC-205-6 Gebruiker succesvol gewijzigd", (done) => {
    const updatedUser = {
      firstName: "Testie",
      lastName: "man",
      emailAddress: "t.estman@example.com",
      password: "Newpassword123",
      street: "456 Elm St",
      city: "Othertown",
      phoneNumber: "0612345678",
    };

    chai
      .request(server)
      .put(`/api/user/${userId}`)
      .send(updatedUser)
      .end((err, res) => {
        let { status, message, data } = res.body;
        console.log(res.body);

        expect(status).to.equal(200);
        expect(res.body).to.be.an("object");
        expect(message).to.equal("Updated user");

        expect(data).to.be.an("object");
        expect(data.firstName).to.equal(updatedUser.firstName);
        expect(data.lastName).to.equal(updatedUser.lastName);
        expect(data.emailAddress).to.equal(updatedUser.emailAddress);
        expect(data.street).to.equal(updatedUser.street);
        expect(data.city).to.equal(updatedUser.city);
        expect(data.phoneNumber).to.equal(updatedUser.phoneNumber);

        done();
      });
  });
});

describe("UC-206 Verwijderen van user", () => {
  it("TC-206-1 Gebruiker bestaat niet", (done) => {
    const nonExistentUserId = 89 + 1;

    chai
      .request(server)
      .delete(`/api/user/${nonExistentUserId}`)
      .end((err, res) => {
        let { status, message } = res.body;
        expect(status).to.equal(404);
        expect(res.body).to.be.an("object");
        expect(message).to.equal(`No user with ID ${nonExistentUserId}`);

        done();
      });
  });

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
