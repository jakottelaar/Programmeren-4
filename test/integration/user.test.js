const assert = require("assert");
const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../app");
const exp = require("constants");
let userId = 0; //This userId will get the id assignment from the first create user test and use it throughout all the tests up and until it's deleted;

chai.use(chaiHttp);
const expect = chai.expect;

describe("UC-201 Registreren als een nieuwe gebruiker", () => {
  it.skip("TC-201-1 Verplicht veld ontbreekt", (done) => {
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

  it.skip("TC-201-2 Niet-valide emailadres", (done) => {
    const newUser = {
      firstName: "Test",
      lastName: "Tester",
      emailAddress: "invalidemail",
      password: "Password123",
      street: "123 Main St",
      city: "Anytown",
      phoneNumber: "0612345678",
    };

    chai
      .request(server)
      .post("/api/user")
      .send(newUser)
      .end((err, res) => {
        let { status, message } = res.body;

        expect(status).to.equal(400);
        expect(res.body).to.be.an("object");
        expect(message).to.equal("Email address is not valid");

        done();
      });
  });

  it.skip("TC-201-3 Niet-valide wachtwoord", (done) => {
    const newUser = {
      firstName: "Test",
      lastName: "Tester",
      emailAddress: "t.man@example.com",
      password: "password",
      street: "123 Main St",
      city: "Anytown",
      phoneNumber: "0612345678",
    };

    chai
      .request(server)
      .post("/api/user")
      .send(newUser)
      .end((err, res) => {
        let { status, message } = res.body;
        expect(status).to.equal(400);
        expect(res.body).to.be.an("object");
        expect(message).to.equal(
          "Password is not valid. It should be at least 8 characters and contain at least one uppercase letter and one digit."
        );

        done();
      });
  });

  it.skip("TC-201-5 User succesvol geregistreer", (done) => {
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

  it.skip("TC-201-4 gebruiker bestaat al", (done) => {
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
  it.skip("TC-202-1 Toon alle gebruikers (minimaal 2)", (done) => {
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
          .and.to.have.length.of.at.least(2)
          .and.to.satisfy((users) => {
            return users.every((user) => {
              return typeof user === "object";
            });
          });

        done();
      });
  });

  it.skip("TC-202-2 Toon gebruikers met zoekterm op niet-bestaande velden", (done) => {
    const searchParams = {
      nonExistingField: "value",
    };

    chai
      .request(server)
      .get("/api/user")
      .query(searchParams)
      .timeout(5000)
      .end((err, res) => {
        expect(err).to.be.null;

        console.log(res.body);
        expect(res.body).to.be.an("object");
        let { status, message, data } = res.body;

        expect(status).to.equal(200);
        expect(message).to.contain("Users retrieved successfully.");
        expect(data).to.be.an("array");

        done();
      });
  });

  describe("UC-202 Opvragen van overzicht van users", () => {
    it.skip("TC-202-3 Toon gebruikers met gebruik van de zoekterm op het veld 'isActive'=false", (done) => {
      const searchParams = {
        isActive: 0,
      };

      chai
        .request(server)
        .get("/api/user")
        .query(searchParams)
        .timeout(5000)
        .end((err, res) => {
          expect(err).to.be.null;

          console.log(res.body);
          expect(res.body).to.be.an("object");
          let { status, message, data } = res.body;

          expect(status).to.equal(200);
          expect(message).to.contain("Users retrieved successfully.");
          expect(data)
            .to.be.an("array")
            .and.to.satisfy((users) => {
              return users.every((user) => {
                return user.isActive === 0;
              });
            });

          done();
        });
    });
  });

  it.skip("TC-202-4 Toon gebruikers met gebruik van de zoekterm op het veld 'isActive' = true", (done) => {
    const filters = {
      isActive: 1,
    };

    chai
      .request(server)
      .get("/api/user")
      .query(filters)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("object");

        const { status, message, data } = res.body;

        expect(status).to.equal(200);
        expect(message).to.equal("Users retrieved successfully.");
        expect(data)
          .to.be.an("array")
          .and.to.satisfy((users) => {
            return users.every((user) => {
              return user.isActive === 1;
            });
          });

        done();
      });
  });

  it.skip("TC-202-5 Toon gebruikers met zoektermen op bestaande velden (max op 2 velden filteren)", (done) => {
    const filters = {
      firstName: "John",
      lastName: "Doe",
    };

    chai
      .request(server)
      .get("/api/user")
      .query(filters)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("object");

        const { status, message, data } = res.body;

        expect(status).to.equal(200);
        expect(message).to.equal("Users retrieved successfully.");
        expect(data).to.be.an("array");

        // Assert that all users in the response match the filter criteria
        data.forEach((user) => {
          expect(user.firstName).to.equal(filters.firstName);
          expect(user.lastName).to.equal(filters.lastName);
        });

        done();
      });
  });
});

describe("UC-203 Opvragen van gebruikersprofiel", () => {
  it.skip("TC-203-2 Gebruiker is ingelogd met geldig token. (Niet getest op een token, er wordt alleen een fictief profiel geretouneerd)", (done) => {
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
  it.skip("TC-204-2 Gebruiker-ID bestaat niet", (done) => {
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

  it.skip("TC-204-3 Gebruiker-ID bestaat(De user met het gegeven id wordt geretourneerd)", (done) => {
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
  it.skip("TC-205-1 Verplicht veld 'emailAddress' ontbreekt", (done) => {
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

  it.skip("TC-205-4 Gebruiker bestaat niet", (done) => {
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

  it.skip("TC-205-6 Gebruiker succesvol gewijzigd", (done) => {
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
  it.skip("TC-206-1 Gebruiker bestaat niet", (done) => {
    const nonExistentUserId = userId + 1;

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

  it.skip("TC-206-4 Gebruiker succesvol verwijderd", (done) => {
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
